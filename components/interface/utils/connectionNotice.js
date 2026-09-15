/*
 * A small non-blocking notice for connection state, shown top-centre over
 * the page. Deliberately plain DOM rather than a React component: it has to
 * work whatever state the React tree is in, including mid-load, and it must
 * never take focus or block input the way the old modal dialog did.
 */

var NOTICE_ID = 'vfb-connection-notice';
var hideTimer = null;

function ensureStyles () {
  if (document.getElementById(NOTICE_ID + '-style')) {
    return;
  }
  var style = document.createElement('style');
  style.id = NOTICE_ID + '-style';
  style.textContent = [
    '#' + NOTICE_ID + ' {',
    '  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);',
    '  z-index: 100000; max-width: 90vw; padding: 8px 14px; border-radius: 4px;',
    '  font: 13px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #fff;',
    '  background: rgba(40, 40, 40, 0.92); box-shadow: 0 2px 8px rgba(0,0,0,0.4);',
    '  display: flex; align-items: center; gap: 12px; pointer-events: auto;',
    '}',
    '#' + NOTICE_ID + '.vfb-notice-warn { background: rgba(140, 80, 0, 0.94); }',
    '#' + NOTICE_ID + '.vfb-notice-error { background: rgba(150, 30, 30, 0.94); }',
    '#' + NOTICE_ID + '.vfb-notice-ok { background: rgba(30, 110, 50, 0.94); }',
    '#' + NOTICE_ID + ' button {',
    '  font: inherit; color: #fff; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.5);',
    '  border-radius: 3px; padding: 3px 10px; cursor: pointer;',
    '}',
    '#' + NOTICE_ID + ' button:hover { background: rgba(255,255,255,0.3); }'
  ].join('\n');
  document.head.appendChild(style);
}

function element () {
  ensureStyles();
  var el = document.getElementById(NOTICE_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = NOTICE_ID;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  return el;
}

/**
 * @param message  text to show
 * @param options  { level: 'info'|'warn'|'error'|'ok', autoHideMs, action: { label, onClick } }
 */
export function showConnectionNotice (message, options) {
  options = options || {};
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  var el = element();
  el.className = 'vfb-notice-' + (options.level || 'info');
  el.textContent = '';
  var text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);
  if (options.action) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = options.action.label;
    button.onclick = options.action.onClick;
    el.appendChild(button);
  }
  el.style.display = 'flex';
  if (options.autoHideMs) {
    hideTimer = setTimeout(hideConnectionNotice, options.autoHideMs);
  }
}

export function hideConnectionNotice () {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  var el = document.getElementById(NOTICE_ID);
  if (el) {
    el.style.display = 'none';
  }
}
