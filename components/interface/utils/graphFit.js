import ReactDOM from 'react-dom';

/*
 * Fits a GeppettoGraphVisualization (react-force-graph 2D) to its panel once
 * the fit can be right.
 *
 * Fitting on fixed timers left the Term Context and Circuit Browser graphs
 * off-centre the first time they were opened: the panel was still hidden or
 * not yet measured (the wrapper only measures its parent when it re-renders,
 * and on a size change it calls centerAt(0, 0) rather than fitting), and the
 * first fit ran before the layout had given the nodes positions, which left
 * the zoom NaN until the user pressed Reset View. GraphFitter waits until the canvas matches a real, stable panel size
 * and the nodes have positions, fits then, and fits once more when the layout
 * settles (onEngineStop) unless the user has already zoomed or panned.
 */

const POLL_MS = 150;
const GIVE_UP_MS = 10000;
const MIN_SIZE = 50;
const FIT_MS = 400;
const FIT_PADDING = 20;
// Padding round a drawing fitted to its extent, and the closest such a fit zooms in
const EXTENT_PADDING = 24;
const MAX_FIT_ZOOM = 2.5;
// A free area is used only if the fit in it is at least this share of a whole-panel fit
const MIN_FREE_SHARE = 0.6;

export default class GraphFitter {
  /*
   * options.getExtent: () => { minX, maxX, minY, maxY } of the drawing in graph
   * units, to fit that rather than the node positions. options.getObstacles:
   * () => elements laid over the graph, to fit the drawing clear of them
   * where there is room. options.onResize: (width, height) => called when the
   * panel gets a new usable size, before the fit.
   */
  constructor (getWrapper, getNodes, options) {
    this.getWrapper = getWrapper;
    this.getNodes = getNodes;
    this.options = options || {};
    this.pending = false;
    this.timer = null;
    this.deadline = 0;
    this.userMoved = false;
    this.listening = null;
    this.observed = null;
    this.observer = null;
    this.lastSize = '';
    this.onUserMove = event => {
      // Only moves made on the graph itself, not clicks on controls laid over it
      if (!event || !event.target || event.target.tagName === 'CANVAS') {
        this.userMoved = true;
      }
    };
    this.engineStopped = this.engineStopped.bind(this);
  }

  /* A new graph, or the panel was shown or resized: fit again when ready. */
  request () {
    this.pending = true;
    this.userMoved = false;
    this.deadline = Date.now() + GIVE_UP_MS;
    this.schedule();
  }

  /* Pass as onEngineStop: the layout has settled. */
  engineStopped () {
    if (this.pending && !this.userMoved && this.fit()) {
      this.pending = false;
    }
  }

  /* Something laid over the graph changed size: fit again, unless the user has set their own view. */
  refit () {
    if (!this.userMoved) {
      this.fit();
    }
  }

  /* Reset View button: fit straight away. */
  fitNow () {
    this.fit();
  }

  cancel () {
    clearTimeout(this.timer);
    this.timer = null;
    this.pending = false;
  }

  /* The viewer is unmounting: stop watching its panel. */
  dispose () {
    this.cancel();
    this.unlisten();
    this.unobserve();
  }

  schedule () {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.tryFit(), POLL_MS);
  }

  tryFit () {
    this.timer = null;
    if (!this.pending) {
      return;
    }
    if (this.userMoved) {
      this.pending = false;
      return;
    }
    /*
     * Keep pending after a successful fit so the fit is repeated when the
     * layout settles; stop polling once one fit has landed.
     */
    if (!this.fit() && Date.now() < this.deadline) {
      this.schedule();
    }
  }

  /* Fit if the panel and the nodes are ready; returns whether it fitted. */
  fit () {
    const wrapper = this.getWrapper();
    const graph = wrapper && wrapper.ggv && wrapper.ggv.current;
    if (!graph) {
      return false;
    }
    let host;
    try {
      host = ReactDOM.findDOMNode(wrapper);
    } catch (e) {
      return false;
    }
    if (!host || !host.parentNode) {
      return false;
    }
    this.observe(host.parentNode);
    const panel = host.parentNode.getBoundingClientRect();
    const dims = wrapper.dimensions || {};
    /*
     * The wrapper sizes the canvas from dimensions it measured on its last
     * render. Until they match the panel it is about to resize (and re-centre)
     * the canvas, so a fit now would be undone.
     */
    if (panel.width < MIN_SIZE || panel.height < MIN_SIZE
      || Math.abs(panel.width - dims.width) > 1 || Math.abs(panel.height - dims.height) > 1) {
      if (typeof wrapper.forceUpdate === 'function' && panel.width >= MIN_SIZE && panel.height >= MIN_SIZE) {
        wrapper.forceUpdate();
      }
      return false;
    }
    /*
     * zoomToFit measures every node, so one node the layout has not placed yet
     * gives a NaN zoom that leaves the view broken: wait for all of them.
     */
    const nodes = this.getNodes() || [];
    if (nodes.length === 0 || !nodes.every(n => Number.isFinite(n.x) && Number.isFinite(n.y))) {
      return false;
    }
    this.listen(host);
    const extent = this.options.getExtent && this.options.getExtent();
    if (extent && Number.isFinite(extent.minX) && this.fitExtent(graph, host, extent)) {
      return true;
    }
    if (nodes.length === 1) {
      graph.centerAt(nodes[0].x, nodes[0].y, FIT_MS);
    } else {
      graph.zoomToFit(FIT_MS, FIT_PADDING);
    }
    return true;
  }

  /*
   * Fit a drawing's extent into the largest part of the canvas that the
   * obstacles leave free. If that part is too small to be worth it (the fit
   * would be much smaller than one using the whole canvas), use the whole
   * canvas and let the obstacles overlap the drawing.
   */
  fitExtent (graph, host, extent) {
    const canvas = host.querySelector('canvas');
    if (!canvas || typeof graph.zoom !== 'function') {
      return false;
    }
    const area = canvas.getBoundingClientRect();
    const drawingWidth = Math.max(1, extent.maxX - extent.minX);
    const drawingHeight = Math.max(1, extent.maxY - extent.minY);
    const zoomFor = rect => Math.min((rect.right - rect.left - 2 * EXTENT_PADDING) / drawingWidth, (rect.bottom - rect.top - 2 * EXTENT_PADDING) / drawingHeight);
    const whole = { left: 0, top: 0, right: area.width, bottom: area.height };
    if (zoomFor(whole) <= 0) {
      return false;
    }
    const obstacles = ((this.options.getObstacles && this.options.getObstacles()) || [])
      .map(element => element.getBoundingClientRect())
      .map(box => ({
        left: Math.max(0, box.left - area.left), top: Math.max(0, box.top - area.top),
        right: Math.min(area.width, box.right - area.left), bottom: Math.min(area.height, box.bottom - area.top)
      }))
      .filter(box => box.right > box.left && box.bottom > box.top);
    let best = whole;
    if (obstacles.length) {
      // Every rectangle whose sides lie on the canvas or an obstacle's edge and that holds no obstacle
      const xs = [0, area.width].concat(...obstacles.map(o => [o.left, o.right]));
      const ys = [0, area.height].concat(...obstacles.map(o => [o.top, o.bottom]));
      let free = null;
      xs.forEach(left => xs.forEach(right => ys.forEach(top => ys.forEach(bottom => {
        if (right <= left || bottom <= top) {
          return;
        }
        const rect = { left, top, right, bottom };
        if (obstacles.some(o => o.left < right && o.right > left && o.top < bottom && o.bottom > top)) {
          return;
        }
        if (!free || zoomFor(rect) > zoomFor(free)) {
          free = rect;
        }
      }))));
      if (free && zoomFor(free) >= MIN_FREE_SHARE * zoomFor(whole)) {
        best = free;
      }
    }
    const zoom = Math.min(MAX_FIT_ZOOM, zoomFor(best));
    if (!(zoom > 0)) {
      return false;
    }
    // centerAt puts a graph point at the middle of the canvas: offset it so the drawing's middle lands in the free area's
    const x = (extent.minX + extent.maxX) / 2 - ((best.left + best.right) / 2 - area.width / 2) / zoom;
    const y = (extent.minY + extent.maxY) / 2 - ((best.top + best.bottom) / 2 - area.height / 2) / zoom;
    graph.zoom(zoom, FIT_MS);
    graph.centerAt(x, y, FIT_MS);
    return true;
  }

  /*
   * Watch the panel's size. The viewers' own "visible" prop stays true while
   * their tab is hidden behind another, so a hidden tab being shown (and any
   * resize) is only visible here: when the panel gets a usable new size, ask
   * for a fit.
   */
  observe (panel) {
    if (this.observed === panel || typeof window.ResizeObserver !== 'function') {
      return;
    }
    this.unobserve();
    this.observer = new window.ResizeObserver(entries => {
      const box = entries[entries.length - 1].contentRect;
      const size = Math.round(box.width) + 'x' + Math.round(box.height);
      if (box.width >= MIN_SIZE && box.height >= MIN_SIZE && size !== this.lastSize) {
        this.lastSize = size;
        if (this.options.onResize) {
          this.options.onResize(box.width, box.height);
        }
        this.request();
      } else if (box.width < MIN_SIZE || box.height < MIN_SIZE) {
        this.lastSize = '';
      }
    });
    this.observer.observe(panel);
    this.observed = panel;
  }

  unobserve () {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = null;
    this.observed = null;
    this.lastSize = '';
  }

  /* Notice the user zooming or panning, so a settle-time fit doesn't undo it. */
  listen (host) {
    if (this.listening === host) {
      return;
    }
    this.unlisten();
    host.addEventListener('wheel', this.onUserMove, { passive: true });
    host.addEventListener('mousedown', this.onUserMove);
    host.addEventListener('touchstart', this.onUserMove, { passive: true });
    this.listening = host;
  }

  unlisten () {
    if (this.listening) {
      this.listening.removeEventListener('wheel', this.onUserMove);
      this.listening.removeEventListener('mousedown', this.onUserMove);
      this.listening.removeEventListener('touchstart', this.onUserMove);
      this.listening = null;
    }
  }
}
