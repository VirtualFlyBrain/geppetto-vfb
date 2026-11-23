/*
 * The views offered in the View menu. A view is an arrangement of the windows
 * in the FlexLayout model; it never changes what is loaded.
 *
 * "v2" (V2 default) is the original three-column arrangement and is the view
 * the page starts in (defaultView below) unless the URL or the user's own
 * start view names another.
 * "v3" (V3 default) is whatever layoutModel.js defines, so changing the layout
 * there changes the V3 default view with it and nothing here needs to follow.
 * It is hidden from the menu while it is the same arrangement as V2 default.
 *
 * Every other view gives only the windows it shows, as a FlexLayout "layout"
 * tree whose tabs are component names. Windows a view leaves out are parked in
 * the bottom bar (still running, one click to bring back), so a new window
 * added to layoutModel.js needs no change here either. A component name the
 * default layout does not have is skipped, which lets a view name an optional
 * window such as the Neuroglass viewer before every build ships it.
 */

var v2Layout = {
  "type": "row",
  "weight": 100,
  "children": [
    {
      "type": "row",
      "weight": 40,
      "children": [
        { "type": "tabset", "weight": 40, "children": ["sliceViewer"] },
        { "type": "tabset", "weight": 60, "children": ["canvas"] }
      ]
    },
    {
      "type": "row",
      "weight": 30,
      "children": [
        { "type": "tabset", "weight": 60, "selected": 0, "children": ["treeBrowser", "vfbCircuitBrowser", "vfbGraph"] },
        { "type": "tabset", "weight": 40, "children": ["vfbListViewer"] }
      ]
    },
    { "type": "tabset", "weight": 30, "children": ["termInfo"] }
  ]
};

var termInfoLayout = {
  "type": "row",
  "weight": 100,
  "children": [
    { "type": "tabset", "weight": 100, "children": ["termInfo"] }
  ]
};

var viewersLayout = {
  "type": "row",
  "weight": 100,
  "children": [
    { "type": "tabset", "weight": 60, "selected": 0, "children": ["canvas", "vfbNeuroglassViewer"] },
    {
      "type": "row",
      "weight": 40,
      "children": [
        { "type": "tabset", "weight": 60, "children": ["sliceViewer"] },
        { "type": "tabset", "weight": 40, "children": ["vfbListViewer"] }
      ]
    }
  ]
};

var circuitLayout = {
  "type": "row",
  "weight": 100,
  "children": [
    { "type": "tabset", "weight": 45, "selected": 0, "children": ["vfbCircuitBrowser", "vfbGraph", "treeBrowser"] },
    {
      "type": "row",
      "weight": 25,
      "children": [
        { "type": "tabset", "weight": 60, "children": ["canvas"] },
        { "type": "tabset", "weight": 40, "children": ["vfbListViewer"] }
      ]
    },
    { "type": "tabset", "weight": 30, "children": ["termInfo"] }
  ]
};

/*
 * id: used in the ?view= URL parameter and in local storage, so keep it short,
 *     lower case and stable.
 * label: the menu text.
 * layout: omitted for "v3", which uses layoutModel.js as it stands.
 */
var layoutViews = [
  { id: "v2", label: "V2 default", layout: v2Layout },
  { id: "v3", label: "V3 default" },
  { id: "term", label: "Term Info only", layout: termInfoLayout },
  { id: "viewers", label: "Viewers", layout: viewersLayout },
  { id: "circuit", label: "Circuit", layout: circuitLayout }
];

/* The view the page starts in when neither the URL nor the user names one. */
var defaultView = "v2";

/*
 * Old view ids, still accepted from links and local storage: "classic" was the
 * V2 arrangement and "default" the layoutModel.js one before the rename.
 */
var viewAliases = { classic: "v2", "default": "v3" };

/*
 * Windows that must exist from startup even while hidden: VFBMain drives the
 * 3D canvas as terms load and the slice viewer reads its scene, so a view that
 * parks them still has to render them.
 */
var alwaysRendered = ["canvas", "sliceViewer"];

/* The state flag VFBMain keeps for each window (true while its tab exists). */
var componentStateFlags = {
  termInfo: "termInfoVisible",
  canvas: "canvasVisible",
  sliceViewer: "sliceViewerVisible",
  treeBrowser: "treeBrowserVisible",
  vfbGraph: "graphVisible",
  vfbCircuitBrowser: "circuitBrowserVisible",
  vfbListViewer: "listViewerVisible",
  vfbNeuroglassViewer: "neuroglassViewerVisible"
};

module.exports = { layoutViews, defaultView, viewAliases, alwaysRendered, componentStateFlags };
