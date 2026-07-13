/*
 * VFBLoadManager -- single owner of term loading.
 *
 * The webapp used to drive loading from several places at once (addVfbId, the
 * resolve3D callback, instance.select, and the idsMap/idsLoaded counter in the
 * reducer). Those disagreed under out-of-order completion, slow/hung terms, and
 * rapid clicks, which is what produced the "Loading N/M" freezes. This class is
 * the single owner: everything that wants a term loaded calls request(); the
 * manager decides what to fetch, how many at once, which one drives the display,
 * and keeps a live status for the progress overlay.
 *
 * It is deliberately framework-agnostic -- geppetto/Redux specifics are injected
 * as callbacks -- so it can be reasoned about (and unit-tested) on its own.
 *
 * Design points that map to explicit requirements:
 *  - Robust to a single instance taking a very long time (up to ~20 min): a slow
 *    term releases its concurrency slot after a short bootstrap window and keeps
 *    loading in the background, so terms requested around it still load. The hard
 *    give-up is 30 min, so a genuinely slow (not dead) instance is not killed.
 *  - Idempotent per id: if a term is requested again while already in flight, no
 *    second fetch is issued -- the repeat only re-points focus and waits on the
 *    outstanding request.
 *  - Out-of-order safe: focus/selection is applied only for the id that is the
 *    current focus target at the moment it resolves, so a newer click supersedes
 *    an older in-flight one instead of them fighting.
 */

export const LOAD_STATUS = {
  QUEUED: 'queued',
  FETCHING: 'fetching',
  BACKGROUND: 'background',
  RENDERING: 'rendering',
  LOADED: 'loaded',
  FAILED: 'failed'
};

export default class VFBLoadManager {
  constructor (opts = {}) {
    // Max terms counting against the concurrency cap at once.
    this.concurrency = opts.concurrency || 3;
    /*
     * After this long a still-unresolved term stops counting against the cap and
     * continues loading in the background, freeing a slot for the next queued
     * term. Normal terms resolve well inside this window; only genuinely slow
     * ones get "backgrounded", which is what lets neighbours load around a slow
     * instance.
     */
    this.backgroundAfterMs = opts.backgroundAfterMs || 45000;
    // Hard give-up: only after this do we treat a term as failed and drain it.
    this.itemTimeoutMs = opts.itemTimeoutMs || 1800000; // 30 min
    /*
     * A visual term is only "loaded" once its viewer paints the mesh
     * (noteComponentLoaded). If no viewer reports within this grace window we
     * count it done anyway rather than hold the bar open -- so a missing/absent
     * mesh can never freeze loading.
     */
    this.renderGraceMs = opts.renderGraceMs || 90000;

    // Injected side-effects (all optional; guarded at call sites).
    this._fetch = opts.fetch; // (id, { onResolved, onFailed }) => void
    this._onFocus = opts.onFocus; // (id) => void  -- apply term-info/selection
    this._onFailed = opts.onFailed; // (id, error) => void -- drain loader entry
    this._publish = opts.publish; // (snapshot) => void  -- push status to the UI
    this._isLoaded = opts.isLoaded; // (id) => bool -- already present in the model/scene

    this.items = new Map(); // id -> { status, label, startedAt, bootstrapTimer, hardTimer, renderTimer, error }
    this._queryLoad = null; // { loaded } while a progressive query load-all streams; drives the overlay
    this.queue = []; // ids awaiting a counting slot
    this.loaded = new Set(); // ids already loaded this session (re-request => re-focus only)
    this.focusId = undefined;

    // Feedback counters for the current active batch.
    this._total = 0;
    this._settled = 0;
  }

  /* Public: request a term. display:true marks it the one to show. */
  request (id, { display = true, label } = {}) {
    if (!id) {
      return;
    }
    if (display) {
      this.focusId = id;
    }

    var existing = this.items.get(id);

    /*
     * Already loaded -- the model has it (window[id], set by any loader), this
     * manager finished it (its entry may not be pruned yet), or we recorded it
     * earlier. A re-request (a click to view it) must just re-focus: no reload,
     * no counter increment. This has to run even when a finished entry is still
     * in `items` -- entries are only pruned when the whole batch goes idle, which
     * flicking between loaded terms prevents -- otherwise the re-click falls
     * through to the in-flight branch below and never re-displays (the "flick
     * between loaded terms a few times then it stops showing in Term Info" bug).
     */
    if ((existing && existing.status === LOAD_STATUS.LOADED)
        || this.loaded.has(id)
        || (this._isLoaded && this._isLoaded(id))) {
      this.loaded.add(id);
      if (display) {
        this._applyFocus(id);
      }
      this._publishSnapshot();
      return;
    }

    if (existing && existing.status !== LOAD_STATUS.FAILED) {
      /*
       * Currently loading (queued/fetching/background/rendering): do NOT issue a
       * second request. focusId is set above, so focus is applied when it
       * resolves; a repeat with display just waits.
       */
      this._publishSnapshot();
      return;
    }

    this.items.set(id, {
      status: LOAD_STATUS.QUEUED,
      label: label || id,
      startedAt: Date.now(),
      bootstrapTimer: null,
      hardTimer: null,
      renderTimer: null,
      error: null
    });
    this.queue.push(id);
    this._total++;
    this._publishSnapshot();
    this._pump();
  }

  /* Public: request several ids; the last is the display/focus target. */
  requestMany (ids, { displayLast = true, labels } = {}) {
    var list = Array.from(new Set((ids || []).filter(Boolean)));
    for (var i = 0; i < list.length; i++) {
      this.request(list[i], {
        display: displayLast && i === list.length - 1,
        label: labels && labels[list[i]]
      });
    }
  }

  /*
   * Public: progressive query load-all status; keeps the overlay up while result
   * pages stream in and clears it when done.
   */
  setQueryLoadStatus (loaded, done) {
    this._queryLoad = done ? null : { loaded: loaded };
    this._publishSnapshot();
  }

  /* Public: give a term a human label once known (drives the status line). */
  setLabel (id, label) {
    var it = this.items.get(id);
    if (it && label) {
      it.label = label;
      this._publishSnapshot();
    }
  }

  /* Number of terms currently counting against the concurrency cap. */
  _countingSlots () {
    var n = 0;
    this.items.forEach(function (it) {
      if (it.status === LOAD_STATUS.FETCHING) {
        n++;
      }
    });
    return n;
  }

  _pump () {
    while (this._countingSlots() < this.concurrency && this.queue.length > 0) {
      var id = this.queue.shift();
      var it = this.items.get(id);
      if (!it || it.status !== LOAD_STATUS.QUEUED) {
        continue;
      }
      this._start(id);
    }
  }

  _start (id) {
    var self = this;
    var it = this.items.get(id);
    it.status = LOAD_STATUS.FETCHING;

    /* Release the slot if this one turns out to be slow, so neighbours load. */
    it.bootstrapTimer = setTimeout(function () {
      var cur = self.items.get(id);
      if (cur && cur.status === LOAD_STATUS.FETCHING) {
        cur.status = LOAD_STATUS.BACKGROUND;
        cur.bootstrapTimer = null;
        self._publishSnapshot();
        self._pump();
      }
    }, this.backgroundAfterMs);

    /* Hard give-up so a dead (not merely slow) term cannot stick forever. */
    it.hardTimer = setTimeout(function () {
      self._fail(id, new Error('timed out after ' + Math.round(self.itemTimeoutMs / 60000) + ' min'));
    }, this.itemTimeoutMs);

    this._publishSnapshot();

    try {
      this._fetch(id, {
        /* Non-visual term: nothing to paint, so it is done once fetched. */
        onResolved: function () {
          self._resolved(id);
        },
        /* Visual term: fetched, now wait for the viewer to paint the mesh. */
        onFetched: function () {
          self._rendering(id);
        },
        onFailed: function (err) {
          self._fail(id, err || new Error('load failed'));
        }
      });
    } catch (e) {
      this._fail(id, e);
    }
  }

  /*
   * A visual term whose fetch has completed: free its concurrency slot (the
   * fetch is done) and wait for a viewer to report the mesh painted, keeping the
   * item active so the overlay reflects "still rendering". A grace timer settles
   * it regardless, so an absent mesh can never hold the bar open.
   */
  _rendering (id) {
    var self = this;
    var it = this.items.get(id);
    if (!it || it.status === LOAD_STATUS.LOADED || it.status === LOAD_STATUS.FAILED) {
      return;
    }
    if (it.bootstrapTimer) {
      clearTimeout(it.bootstrapTimer);
      it.bootstrapTimer = null;
    }
    if (it.hardTimer) {
      clearTimeout(it.hardTimer);
      it.hardTimer = null;
    }
    it.status = LOAD_STATUS.RENDERING;
    it.renderTimer = setTimeout(function () {
      self._resolved(id);
    }, this.renderGraceMs);
    this._publishSnapshot();
    this._pump();
  }

  /* A viewer has painted a component for this id -- treat the term as loaded. */
  noteComponentLoaded (id) {
    var it = this.items.get(id);
    if (it && (it.status === LOAD_STATUS.FETCHING
        || it.status === LOAD_STATUS.BACKGROUND
        || it.status === LOAD_STATUS.RENDERING)) {
      this._resolved(id);
    }
  }

  _resolved (id) {
    var it = this.items.get(id);
    if (!it || it.status === LOAD_STATUS.LOADED || it.status === LOAD_STATUS.FAILED) {
      return;
    }
    this._clearTimers(it);
    it.status = LOAD_STATUS.LOADED;
    this.loaded.add(id);
    this._settled++;
    if (id === this.focusId) {
      this._applyFocus(id);
    }
    this._publishSnapshot();
    this._pump();
  }

  _fail (id, err) {
    var it = this.items.get(id);
    if (!it || it.status === LOAD_STATUS.LOADED || it.status === LOAD_STATUS.FAILED) {
      return;
    }
    this._clearTimers(it);
    it.status = LOAD_STATUS.FAILED;
    it.error = (err && err.message) || String(err);
    this._settled++;
    console.warn('VFBLoadManager: giving up on ' + id + ' (' + it.error + '); draining so the rest can finish');
    try {
      if (this._onFailed) {
        this._onFailed(id, it.error);
      }
    } catch (e) {
      // best-effort drain; ignore
    }
    this._publishSnapshot();
    this._pump();
  }

  _applyFocus (id) {
    try {
      if (this._onFocus) {
        this._onFocus(id);
      }
    } catch (e) {
      // ignore focus errors
    }
  }

  _clearTimers (it) {
    if (it.bootstrapTimer) {
      clearTimeout(it.bootstrapTimer);
      it.bootstrapTimer = null;
    }
    if (it.hardTimer) {
      clearTimeout(it.hardTimer);
      it.hardTimer = null;
    }
    if (it.renderTimer) {
      clearTimeout(it.renderTimer);
      it.renderTimer = null;
    }
  }

  _isActiveStatus (status) {
    return status === LOAD_STATUS.FETCHING
      || status === LOAD_STATUS.BACKGROUND
      || status === LOAD_STATUS.RENDERING;
  }

  _active () {
    if (this.queue.length > 0) {
      return true;
    }
    var self = this;
    var active = false;
    this.items.forEach(function (it) {
      if (self._isActiveStatus(it.status)) {
        active = true;
      }
    });
    return active;
  }

  _currentLabel () {
    if (this.focusId) {
      var f = this.items.get(this.focusId);
      if (f && this._isActiveStatus(f.status)) {
        return f.label;
      }
    }
    /* Otherwise prefer whatever is actively fetching, then longer-running work. */
    var label = '';
    var order = [LOAD_STATUS.FETCHING, LOAD_STATUS.RENDERING, LOAD_STATUS.BACKGROUND];
    for (var i = 0; i < order.length && !label; i++) {
      var wanted = order[i];
      this.items.forEach(function (it) {
        if (!label && it.status === wanted) {
          label = it.label;
        }
      });
    }
    return label;
  }

  snapshot () {
    var failed = [];
    this.items.forEach(function (it, id) {
      if (it.status === LOAD_STATUS.FAILED) {
        failed.push(id);
      }
    });
    if (!this._active()) {
      /*
       * No term/component load active, but a progressive query load-all may be
       * streaming result pages -- keep the overlay up and report progress.
       */
      if (this._queryLoad) {
        return { active: true, total: 0, settled: 0, failed: failed, message: 'Loading results \u2014 ' + this._queryLoad.loaded + ' loaded' };
      }
      return { active: false, total: this._total, settled: this._settled, failed: failed, message: '' };
    }
    var label = this._currentLabel();
    /*
     * If only long-running (background/rendering) work remains -- nothing queued
     * or actively fetching -- say so, so the user knows a slow instance is still
     * coming rather than the bar being stuck.
     */
    var foreground = this.queue.length > 0;
    this.items.forEach(function (it) {
      if (it.status === LOAD_STATUS.FETCHING) {
        foreground = true;
      }
    });
    var verb = foreground ? 'Loading ' : 'Still loading ';
    return {
      active: true,
      total: this._total,
      settled: this._settled,
      failed: failed,
      message: verb + this._settled + '/' + this._total + (label ? ' — ' + label : '')
    };
  }

  _publishSnapshot () {
    var snap = this.snapshot();
    if (!snap.active) {
      // Batch finished: prune terminal entries and reset counters for the next one.
      var self = this;
      var toDelete = [];
      this.items.forEach(function (it, id) {
        if (it.status === LOAD_STATUS.LOADED || it.status === LOAD_STATUS.FAILED) {
          self._clearTimers(it);
          toDelete.push(id);
        }
      });
      toDelete.forEach(function (id) {
        self.items.delete(id);
      });
      this.queue = [];
      this._total = 0;
      this._settled = 0;
    }
    if (this._publish) {
      this._publish(snap);
    }
  }
}
