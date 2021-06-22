var locationCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH (n:Entity {short_form:'" + instance + "'}) OPTIONAL MATCH p=(n)-[r:INSTANCEOF|part_of|has_synaptic_terminal_in|has_presynaptic_terminal_in|"
      + "has_postsynaptic_terminal_in|overlaps*..]->(x) "
      + "RETURN distinct n,r,x,n.short_form as root",
      "resultDataContents": ["graph"]
    }
  ]
});

var whatCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH (n:Entity {short_form:'" + instance + "'}) OPTIONAL MATCH p=(n)-[:INSTANCEOF|SUBCLASSOF*..]->(x) "
      + "WHERE ('Anatomy' IN  labels(x)) OR (('Cell' IN  labels(x)) OR ('synaptic neuropil' IN labels(x))) "
      + " OR (('Ganglion' IN  labels(x)) OR ('Neuron_projection_bundle' IN labels(x))) "
      + "RETURN  n,p, n.short_form as root",
      "resultDataContents": ["graph"]
    }
  ]
});

var configuration = {
  resultsMapping:
  {
    "node": { 
      "title" : "short_form",
      "label" : "label",
      "tooltip" : "id"
    },
    "link" : {
      "label" : "label",
      "visible" : true,
      "tooltip" : "label"
    }
  }
}

var styling = {
  // Background color for canvas
  canvasColor : "black",
  // Color for links between nodes
  linkColor : "white",
  // Color apply to links while hovering over them 
  linkHoverColor : "#11bffe",
  // Color apply to target and source nodes when hovering over a link or a node.
  neighborNodesHoverColor : "orange",
  // Font used for text in nodes
  nodeFont : "5px sans-serif",
  // Color of font in node's text
  nodeFontColor : "black",
  // Node border color
  nodeBorderColor : "black",
  // When hovering over a node, the node's border color changes to create a halo effect
  nodeHoverBoderColor : "red", 
  // Title bar (in node) background color
  nodeTitleBackgroundColor : "#11bffe",
  // Description area (in node) background color
  nodeDescriptionBackgroundColor : "white",
  icons : {
    home : "fa fa-home",
    zoomIn : "fa fa-search-plus",
    zoomOut : "fa fa-search-minus",
    sync : "fa fa-refresh",
    dropdown : "fa fa-bars",
  },
  defaultRefreshIconColor : "white",
  outOfSyncIconColor : "red",
  dropDownQueries : [
    {
      label : instance => "Show location of " + instance ,
      query : instance => locationCypherQuery(instance)
    },
    {
      label : instance => "Show classification of " + instance,
      query : instance => whatCypherQuery(instance)
    }
  ],
  dropDownHoverBackgroundColor : "#11bffe",
  dropDownHoverTextColor : "black",
  dropDownBackgroundColor : "#4f4f4f",
  dropDownTextColor : "white"
}

var restPostConfig = {
  url: "https://pdb-dev.virtualflybrain.org/db/neo4j/tx/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  locationCypherQuery,
  whatCypherQuery
};
