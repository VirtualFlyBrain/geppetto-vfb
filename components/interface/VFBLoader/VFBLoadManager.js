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

    // Injected side-effects (all optional; guarded at call sites).
    this._fetch = opts.fetch; // (id, { onResolved, onFailed }) => void
    this._onFocus = opts.onFocus; // (id) => void  -- apply term-info/selection
    this._onFailed = opts.onFailed; // (id, error) => void -- drain loader entry
    this._publish = opts.publish; // (snapshot) => void  -- push status to the UI

    this.items = new Map(); // id -> { status, label, startedAt, bootstrapTimer, hardTimer, error }
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

    // Already loaded earlier: nothing to fetch, just move focus.
    if (this.loaded.has(id) && !this.items.has(id)) {
      if (display) {
        this._applyFocus(id);
      }
      this._publishSnapshot();
      return;
    }

    var existing = this.items.get(id);
    if (existing && existing.status !== LOAD_STATUS.FAILED) {
      /*
       * Already queued/fetching/background: do NOT issue a second request. The
       * outstanding one will resolve; a repeat with display only re-points focus.
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
        onResolved: function () {
          self._resolved(id);
        },
        onFailed: function (err) {
          self._fail(id, err || new Error('load failed'));
        }
      });
    } catch (e) {
      this._fail(id, e);
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
  }

  _active () {
    if (this.queue.length > 0) {
      return true;
    }
    var active = false;
    this.items.forEach(function (it) {
      if (it.status === LOAD_STATUS.FETCHING || it.status === LOAD_STATUS.BACKGROUND) {
        active = true;
      }
    });
    return active;
  }

  _currentLabel () {
    if (this.focusId) {
      var f = this.items.get(this.focusId);
      if (f && (f.status === LOAD_STATUS.FETCHING || f.status === LOAD_STATUS.BACKGROUND)) {
        return f.label;
      }
    }
    var label = '';
    this.items.forEach(function (it) {
      if (!label && it.status === LOAD_STATUS.FETCHING) {
        label = it.label;
      }
    });
    if (!label) {
      this.items.forEach(function (it) {
        if (!label && it.status === LOAD_STATUS.BACKGROUND) {
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
      return { active: false, total: this._total, settled: this._settled, failed: failed, message: '' };
    }
    var label = this._currentLabel();
    return {
      active: true,
      total: this._total,
      settled: this._settled,
      failed: failed,
      message: 'Loading ' + this._settled + '/' + this._total + (label ? ' — ' + label : '')
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
