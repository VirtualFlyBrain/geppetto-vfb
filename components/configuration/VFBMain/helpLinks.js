import React from 'react';

/*
 * Single source of truth for the in-app "?" help links.
 *
 * Every help affordance in the UI -- the button on each tab window's header,
 * the one on the query builder / query results, and the per-row links in the
 * Term Info query panel -- resolves its target here, so the docs URL for a
 * feature lives in exactly one place. Keys for the tab windows are the
 * FlexLayout `component` names from layoutModel.js; the rest are named for
 * the feature they describe.
 *
 * Every target is a page under /docs/website-features/ on the public site.
 * Section anchors are Hugo heading ids -- explicit `{#Handle}` ids where the
 * docs define them (the Queries Reference has one per VFBquery query name),
 * otherwise Hugo's slug of the heading text.
 */
export const DOCS_BASE = "https://virtualflybrain.org/docs/website-features/";

export const HELP_PAGES = {
  // FlexLayout tab windows (layoutModel.js `component` names)
  termInfo: "terminfo/",
  canvas: "3dviewer/",
  sliceViewer: "sliceviewer/",
  vfbGraph: "termcontext/",
  vfbCircuitBrowser: "circuitbrowser/",
  treeBrowser: "roibrowser/",
  vfbListViewer: "layers/",
  // Search and query tool (geppetto-client components, injected by id)
  search: "search_query/#the-search-tool",
  queryBuilder: "search_query/#the-query-tool",
  queryResults: "search_query/#query-results",
  // Term Info query panel rows
  query: "queries/#", // + VFBquery query name
  graphLocation: "termcontext/#location",
  graphClassification: "termcontext/#classification",
  circuitBrowserAdd: "circuitbrowser/#add-a-neuron-from-term-info",
  // Fallback
  index: ""
};

/* Graph rows are indexed by their position in graphConfiguration.dropDownQueries. */
export const GRAPH_HELP_KEYS = ["graphLocation", "graphClassification"];

export function helpUrl (key, anchor) {
  var page = HELP_PAGES[key];
  if (page === undefined) {
    page = HELP_PAGES.index;
  }
  return DOCS_BASE + page + (anchor ? encodeURIComponent(anchor) : "");
}

export function helpTitle (label) {
  return "About " + (label || "this") + " (opens the documentation)";
}

function escapeAttr (s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* HTML-string form, for content assembled as markup (e.g. the term-info panel). */
export function helpLinkHtml (url, label, extraClass) {
  var title = escapeAttr(helpTitle(label));
  return "<a class=\"vfb-help" + (extraClass ? " " + extraClass : "") + "\" href=\"" + url + "\""
    + " target=\"_blank\" rel=\"noopener\" title=\"" + title + "\" aria-label=\"" + title + "\">?</a>";
}

/* React form. Clicks never reach the parent (tab headers select/drag on click). */
export function HelpLink (props) {
  var title = helpTitle(props.label);
  return (
    <a className={"vfb-help" + (props.className ? " " + props.className : "")}
      href={props.url || helpUrl(props.helpKey, props.anchor)}
      target="_blank" rel="noopener" title={title} aria-label={title}
      onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>?</a>
  );
}

/*
 * Keep a help button on geppetto-client containers we do not render ourselves
 * (query builder, query results). They are mounted and torn down as the user
 * switches views, so watch the document and (re)insert next to the close
 * button whenever a container appears without one. Idempotent; safe to call
 * once at startup.
 */
export function watchInjectedHelpButtons () {
  if (typeof MutationObserver === "undefined" || window._vfbHelpObserver) {
    return;
  }
  var targets = [
    { id: "query-builder-container", key: "queryBuilder", label: "the query tool" },
    { id: "query-results-container", key: "queryResults", label: "query results" }
  ];
  var ensure = function () {
    targets.forEach(function (t) {
      var el = document.getElementById(t.id);
      if (el && !el.querySelector(":scope > .vfb-help")) {
        el.insertAdjacentHTML("afterbegin", helpLinkHtml(helpUrl(t.key), t.label, "vfb-help-panel"));
      }
    });
  };
  // Coalesce bursts of mutations into one check per frame.
  var scheduled = false;
  window._vfbHelpObserver = new MutationObserver(function () {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        ensure();
      });
    }
  });
  window._vfbHelpObserver.observe(document.body, { childList: true, subtree: true });
  ensure();
}
