// Template ROI Browser data source.
//
// Was: direct POST to pdb.virtualflybrain.org/db/neo4j/tx/commit with
// a multi-step Cypher (Basic neo4j:vfb baked into VFBTree.js), plus three
// hardcoded dev-shortcut tree queries. The Cypher used an
// UNWIND nodes(p) AS n UNWIND nodes(p) AS m pair-cartesian which timed
// out at ~40s on JFRC2 in production; the frontend then had to rebuild
// the tree from pairwise edges using ~150 LOC of helper code.
//
// Now: a single GET against the VFBquery TemplateROIBrowser endpoint
// (introduced in VFBquery v1.13.2). The response is a self-describing
// nested tree with FBbt labels, FBbt IDs, painted-domain Individual IDs,
// and per-node markdown summaries for tooltips. The frontend no longer
// runs Cypher, holds DB credentials, or reconstructs paths.

const VFBQUERY_BASE = "https://vfbquery.virtualflybrain.org";

var treeQueryUrl = templateShortForm =>
  `${VFBQUERY_BASE}/run_query?query_type=TemplateROIBrowser&id=${encodeURIComponent(templateShortForm)}`;

var styling = {
  // Font Awesome icon used as the refresh control. The hamburger
  // drop-down icon and the three hardcoded dev-shortcut queries
  // (adult protocerebrum / adult brain template JFRC2 / Adult Cerebrum)
  // have been removed — production loads the tree from the active
  // template directly.
  icons: {
    sync: "fa fa-refresh"
  },
  dropDownQueries: [],
  dropDownHoverBackgroundColor: "#11bffe",
  dropDownHoverTextColor: "black",
  dropDownBackgroundColor: "#4f4f4f",
  dropDownTextColor: "white"
};

module.exports = {
  treeQueryUrl,
  styling
};
