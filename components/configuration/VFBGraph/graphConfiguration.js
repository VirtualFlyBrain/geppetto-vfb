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
  nodeDescriptionBackgroundColor : "white"
}

var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

var cypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH p=(n:Entity)-[r:INSTANCEOF|part_of|has_synaptic_terminal_in|has_presynaptic_terminal_in"
      + "has_postsynaptic_terminal_in|overlaps*..]->(x)"
      + "WHERE n.short_form = '" + instance + "' return distinct n,r,x,n.short_form as root",
      "resultDataContents": ["graph"]
    }
  ]
});

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  cypherQuery
};
