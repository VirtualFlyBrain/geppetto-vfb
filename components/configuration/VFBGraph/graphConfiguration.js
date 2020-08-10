var whatIsCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH p=(n:Entity)-[:INSTANCEOF|:SUBCLASSOF*..]->(x) "
      + "WHERE n.short_form = '" + instance + "' " 
      + "AND 'Anatomy' IN  labels(x) " 
      + "RETURN  p, n.short_form as root",
      "resultDataContents": ["graph"]
    }
  ]
});

var whereIsCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH p=(Entity)-[:INSTANCEOF:part_of|has_synaptic_terminal_in|has_presynaptic_terminal_in|has_postsynaptic_terminal_in|overlaps*..]->(x) "
      + "WHERE n.short_form = '" + instance + "' " 
      + "RETURN  p, n.short_form as root",
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
  dropDownQueries : [
    {
      label : instance => "What is " + instance ,
      query : instance => whatIsCypherQuery(instance)
    },
    {
      label : instance => "Where is " + instance ,
      query : instance => whereIsCypherQuery(instance)
    }
  ],
  dropDownHoverBackgroundColor : "#11bffe",
  dropDownHoverTextColor : "black",
  dropDownBackgroundColor : "#4f4f4f",
  dropDownTextColor : "white"
}

var restPostConfig = {
  url: "https://pdb-alpha.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  whatIsCypherQuery,
  whereIsCypherQuery
};
