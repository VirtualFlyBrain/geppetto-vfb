/*
 * Connection state indicator. Routine states (reconnecting, restoring,
 * reconnected) are shown quietly by recolouring the Geppetto logo in the
 * top-left corner, with the message in a small float that appears only while
 * the pointer is over the logo - no banner over the page. Only a state that
 * needs the user to act (an action button, e.g. Retry after giving up) still
 * shows the top-centre notice.
 *
 * Deliberately plain DOM rather than React: it has to work whatever state the
 * React tree is in, including mid-load. The logo's own spinner is toggled by
 * geppetto-client with jQuery add/removeClass and title, so the state lives
 * in a data attribute that those calls leave alone.
 */

var NOTICE_ID = 'vfb-connection-notice';
var FLOAT_ID = 'vfb-connection-float';
var LOGO_ID = 'geppettologo';
var STATE_ATTR = 'data-vfb-connection';
var hideTimer = null;
var floatText = '';

function ensureStyles () {
  if (document.getElementById(NOTICE_ID + '-style')) {
    return;
  }
  var style = document.createElement('style');
  style.id = NOTICE_ID + '-style';
  style.textContent = [
    '#' + LOGO_ID + '[' + STATE_ATTR + '="warn"], #' + LOGO_ID + '[' + STATE_ATTR + '="info"] { color: #ffb300 !important; cursor: help; }',
    '#' + LOGO_ID + '[' + STATE_ATTR + '="error"] { color: #ff4d4d !important; cursor: help; }',
    '#' + LOGO_ID + '[' + STATE_ATTR + '="ok"] { color: #4caf50 !important; cursor: help; }',
    '#' + FLOAT_ID + ' {',
    '  position: fixed; z-index: 100000; display: none; max-width: 320px; padding: 6px 10px;',
    '  border-radius: 4px; font: 12px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #fff;',
    '  background: rgba(40, 40, 40, 0.95); box-shadow: 0 2px 8px rgba(0,0,0,0.4); pointer-events: none;',
    '}',
    '#' + NOTICE_ID + ' {',
    '  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);',
    '  z-index: 100000; max-width: 90vw; padding: 8px 14px; border-radius: 4px;',
    '  font: 13px/1.4 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #fff;',
    '  background: rgba(150, 30, 30, 0.94); box-shadow: 0 2px 8px rgba(0,0,0,0.4);',
    '  display: flex; align-items: center; gap: 12px; pointer-events: auto;',
    '}',
    '#' + NOTICE_ID + ' button {',
    '  font: inherit; color: #fff; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.5);',
    '  border-radius: 3px; padding: 3px 10px; cursor: pointer;',
    '}',
    '#' + NOTICE_ID + ' button:hover { background: rgba(255,255,255,0.3); }'
  ].join('\n');
  document.head.appendChild(style);
}

function floatElement () {
  var el = document.getElementById(FLOAT_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = FLOAT_ID;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  return el;
}

function showFloat (logo) {
  if (!floatText) {
    return;
  }
  var el = floatElement();
  var rect = logo.getBoundingClientRect();
  el.textContent = floatText;
  el.style.left = Math.round(rect.right + 8) + 'px';
  el.style.top = Math.round(rect.top) + 'px';
  el.style.display = 'block';
}

function hideFloat () {
  var el = document.getElementById(FLOAT_ID);
  if (el) {
    el.style.display = 'none';
  }
}

function logoElement () {
  var logo = document.getElementById(LOGO_ID);
  if (logo && !logo.vfbConnectionHover) {
    logo.vfbConnectionHover = true;
    logo.addEventListener('mouseenter', function () {
      showFloat(logo);
    });
    logo.addEventListener('mouseleave', hideFloat);
  }
  return logo;
}

function clearIndicator () {
  floatText = '';
  hideFloat();
  var logo = document.getElementById(LOGO_ID);
  if (logo) {
    logo.removeAttribute(STATE_ATTR);
  }
}

function hideBanner () {
  var el = document.getElementById(NOTICE_ID);
  if (el) {
    el.style.display = 'none';
  }
}

function showBanner (message, action) {
  var el = document.getElementById(NOTICE_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = NOTICE_ID;
    el.setAttribute('role', 'alert');
    document.body.appendChild(el);
  }
  el.textContent = '';
  var text = document.createElement('span');
  text.textContent = message;
  el.appendChild(text);
  var button = document.createElement('button');
  button.type = 'button';
  button.textContent = action.label;
  button.onclick = action.onClick;
  el.appendChild(button);
  el.style.display = 'flex';
}

/**
 * @param message  text to show
 * @param options  { level: 'info'|'warn'|'error'|'ok', autoHideMs, action: { label, onClick } }
 */
export function showConnectionNotice (message, options) {
  options = options || {};
  ensureStyles();
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  var level = options.level || 'info';

  var logo = logoElement();
  floatText = message;
  if (logo) {
    logo.setAttribute(STATE_ATTR, level);
    // Keep an already-open float in step with the latest message
    var open = document.getElementById(FLOAT_ID);
    if (open && open.style.display === 'block') {
      showFloat(logo);
    }
  }

  if (options.action) {
    // Needs the user to do something, so it has to be seen without hovering
    showBanner(message, options.action);
  } else {
    hideBanner();
  }

  if (options.autoHideMs) {
    hideTimer = setTimeout(hideConnectionNotice, options.autoHideMs);
  }
}

export function hideConnectionNotice () {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  clearIndicator();
  hideBanner();
}
