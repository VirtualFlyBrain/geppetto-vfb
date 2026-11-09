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

export default class GraphFitter {
  constructor (getWrapper, getNodes) {
    this.getWrapper = getWrapper;
    this.getNodes = getNodes;
    this.pending = false;
    this.timer = null;
    this.deadline = 0;
    this.userMoved = false;
    this.listening = null;
    this.onUserMove = () => {
      this.userMoved = true;
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

  /* Reset View button: fit straight away. */
  fitNow () {
    this.fit();
  }

  cancel () {
    clearTimeout(this.timer);
    this.timer = null;
    this.pending = false;
    this.unlisten();
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
    if (nodes.length === 1) {
      graph.centerAt(nodes[0].x, nodes[0].y, FIT_MS);
    } else {
      graph.zoomToFit(FIT_MS, FIT_PADDING);
    }
    return true;
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
