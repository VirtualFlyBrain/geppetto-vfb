/*
 * Helpers for the View menu: build the FlexLayout model JSON for a view, tell
 * which view the current arrangement matches, and keep the user's saved view,
 * start view and the ?view= URL parameter.
 *
 * Everything here works on plain model JSON (FlexLayout's Model.toJson() /
 * Model.fromJson() shape), so none of it touches Geppetto or React.
 */

export const VIEW_PARAM = "view";
export const MY_VIEW = "my";
const SAVED_KEY = "vfb_view_saved";
const START_KEY = "vfb_view_start";
// Bump when the saved shape changes; an older save is then ignored.
const SAVED_VERSION = 1;

const clone = json => JSON.parse(JSON.stringify(json));

/*
 * One id per window, derived from its component name. Tabs are React-keyed by
 * id, so a window that is in both the old and the new model keeps its mounted
 * component (and its state: the 3D scene, the loaded term...) across a switch.
 */
export const tabId = component => "vfb_" + component;

/* Every tab in a model JSON: the layout tree first, then the borders. */
export function tabsOf (json) {
  var tabs = [];
  var walk = function (node) {
    if (!node) {
      return;
    }
    if (node.type === "tab") {
      tabs.push(node);
    }
    (node.children || []).forEach(walk);
  };
  walk(json.layout);
  (json.borders || []).forEach(walk);
  return tabs;
}

export const componentsOf = json => tabsOf(json).map(tab => tab.component);

/* The bottom border of a model JSON, added if the model has none. */
function bottomBorder (json) {
  json.borders = json.borders || [];
  var border = json.borders.find(b => b.location === "bottom");
  if (!border) {
    border = { type: "border", location: "bottom", size: 100, barSize: 35, children: [] };
    json.borders.push(border);
  }
  border.children = border.children || [];
  return border;
}

/*
 * Give every tab its window id and drop every other id: tabsets and rows get
 * fresh ones from FlexLayout, which would otherwise clash with ids saved from
 * an earlier model. A tab whose component is not in `known`, or that repeats
 * one already seen, is removed.
 */
function normalise (json, known) {
  var seen = {};
  var walk = function (node) {
    delete node.id;
    if (node.children) {
      node.children = node.children.filter(child => {
        if (child.type !== "tab") {
          return true;
        }
        if (known.indexOf(child.component) === -1 || seen[child.component]) {
          return false;
        }
        seen[child.component] = true;
        return true;
      });
      node.children.forEach(walk);
      // A tabset's selected index may now point past its last tab.
      if (node.selected !== undefined && node.selected >= node.children.length) {
        node.selected = 0;
      }
    }
    if (node.type === "tab") {
      node.id = tabId(node.component);
    }
  };
  walk(json.layout);
  (json.borders || []).forEach(walk);
  return json;
}

/* Rows and tabsets left with nothing in them, removed from the bottom up. */
function prune (node) {
  if (node.type === "tab") {
    return node;
  }
  node.children = (node.children || []).map(prune).filter(Boolean);
  return node.children.length > 0 ? node : undefined;
}

/*
 * The model JSON for a view (see configuration/VFBMain/layoutViews.js).
 *
 * defaultJson is layoutModel.js's model: it supplies the global settings, the
 * borders and the tab definition (name, attributes) of every window. Windows
 * the view does not place are parked in the bottom border.
 */
export function buildView (view, defaultJson, alwaysRendered) {
  var known = componentsOf(defaultJson);
  var json = clone(defaultJson);
  if (view.layout) {
    var definitions = {};
    tabsOf(json).forEach(tab => {
      definitions[tab.component] = tab;
    });
    var placed = [];
    var expand = function (node) {
      if (typeof node === "string") {
        if (!definitions[node] || placed.indexOf(node) > -1) {
          return undefined;
        }
        placed.push(node);
        return clone(definitions[node]);
      }
      var copy = Object.assign({}, node);
      copy.children = (node.children || []).map(expand).filter(Boolean);
      return copy;
    };
    var layout = prune(expand(view.layout));
    if (!layout) {
      return normalise(json, known);
    }
    // Start from empty borders, then park whatever the view left out.
    json.borders = (json.borders || []).map(border => Object.assign({}, border, { children: [] }));
    json.layout = layout;
    var parked = bottomBorder(json);
    known.forEach(component => {
      if (placed.indexOf(component) === -1) {
        parked.children.push(clone(definitions[component]));
      }
    });
    keepRendered(json, alwaysRendered);
  }
  return normalise(json, known);
}

/* Mark the windows that must render even while hidden. */
function keepRendered (json, alwaysRendered) {
  tabsOf(json).forEach(tab => {
    if ((alwaysRendered || []).indexOf(tab.component) > -1) {
      tab.enableRenderOnDemand = false;
    }
  });
}

/*
 * A saved view made safe to load on this build: windows this build does not
 * have are dropped, and the windows that must always exist are parked in the
 * bottom bar if the save had them closed. Returns undefined if the save is
 * unusable.
 */
export function restoreSaved (saved, defaultJson, alwaysRendered) {
  if (!saved || !saved.layout || saved.layout.type !== "row") {
    return undefined;
  }
  var known = componentsOf(defaultJson);
  var json = normalise(clone(saved), known);
  json.layout = prune(json.layout);
  if (!json.layout) {
    return undefined;
  }
  var present = componentsOf(json);
  var definitions = tabsOf(defaultJson);
  (alwaysRendered || []).forEach(component => {
    var definition = definitions.find(tab => tab.component === component);
    if (definition && present.indexOf(component) === -1) {
      var tab = clone(definition);
      tab.id = tabId(component);
      bottomBorder(json).children.push(tab);
    }
  });
  keepRendered(json, alwaysRendered);
  return json;
}

/*
 * The shape of an arrangement: which windows sit together and how the groups
 * nest, plus which are parked. Sizes, the selected tab and the order of parked
 * windows are left out, so resizing a panel does not make a view "different".
 * Compare signatures of JSON that has been through a FlexLayout Model, which
 * tidies both sides the same way.
 */
export function viewSignature (json) {
  var walk = function (node) {
    if (node.type === "tab") {
      return node.component;
    }
    var children = (node.children || []).map(walk).join(",");
    return (node.type === "tabset" ? "t" : "r") + "(" + children + ")";
  };
  var parked = (json.borders || []).map(border => (
    border.location + ":" + (border.children || []).map(tab => tab.component).sort().join(",")
  )).sort().join(";");
  return walk(json.layout) + "|" + parked;
}

/* Local storage can be unavailable (private mode, blocked): fail quietly. */
function read (key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function write (key, value) {
  try {
    if (value === undefined || value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
    return true;
  } catch (e) {
    console.warn("View menu: could not write to local storage", e);
    return false;
  }
}

/* The model JSON the user saved as "My view", or undefined. */
export function loadSavedView () {
  var raw = read(SAVED_KEY);
  if (!raw) {
    return undefined;
  }
  try {
    var saved = JSON.parse(raw);
    return saved && saved.version === SAVED_VERSION ? saved.model : undefined;
  } catch (e) {
    write(SAVED_KEY, null);
    return undefined;
  }
}

export const saveView = json => write(SAVED_KEY, JSON.stringify({ version: SAVED_VERSION, model: json }));

/* The id of the view the user asked to start in, or undefined for the default. */
export const getStartView = () => read(START_KEY) || undefined;

export const setStartView = id => write(START_KEY, id && id !== "default" ? id : null);

const validId = id => (typeof id === "string" && /^[a-z0-9-]{1,32}$/.test(id) ? id : undefined);

/* The view named in the URL, if any. */
export const viewFromUrl = () => validId(new URLSearchParams(window.location.search).get(VIEW_PARAM));

/*
 * "&view=<id>" when the URL names a view, else "". The code that rewrites the
 * URL as terms load rebuilds it from id= and i= only; appending this keeps the
 * view through those rewrites.
 */
export function viewUrlSuffix () {
  var id = viewFromUrl();
  return id ? "&" + VIEW_PARAM + "=" + id : "";
}

/* Put the view in the URL (or take it out) without adding a history entry. */
export function setViewInUrl (id) {
  try {
    var params = new URLSearchParams(window.location.search);
    if (validId(id)) {
      params.set(VIEW_PARAM, id);
    } else {
      params.delete(VIEW_PARAM);
    }
    // Keep the commas in i= readable, as the rest of the app writes them.
    var search = params.toString().replace(/%2C/g, ",");
    search = search ? "?" + search : "";
    var state = window.history.state;
    if (state && state.u !== undefined) {
      // state.u is the search string a pending load writes back: keep it in step.
      state = Object.assign({}, state, { u: search });
    }
    window.history.replaceState(state, document.title, window.location.pathname + search + window.location.hash);
  } catch (e) {
    console.warn("View menu: could not update the URL", e);
  }
}
