var locationCypherQuery = ( instances, hops, weight ) => ({
  "statements": [
    {
      "statement" : "WITH [" + instances + "] AS neurons"
      + " WITH neurons[0] as root, neurons[1..] AS neurons"
      + " MATCH p=(x:Neuron {short_form: root})-[:synapsed_to*.." + hops.toString() + "]->(y:Neuron)"
      + " WHERE y.short_form IN neurons AND"
      + " ALL(rel in relationships(p) WHERE exists(rel.weight) AND rel.weight[0] > " + weight.toString() + ")"
      + " AND none(rel in relationships(p) WHERE endNode(rel) = x OR startNode(rel) = y)"
      + " WITH root, relationships(p) as fu, p AS pp"
      + " UNWIND fu as r"
      + " WITH root, startNode(r) AS a, endNode(r) AS b, pp, id(r) as id"
      + " MATCH p=(a)<-[:synapsed_to]-(b)"
      + " RETURN root, collect(distinct pp) as pp, collect(distinct p) as p, collect(distinct id) as fr",
      "resultDataContents": ["row", "graph"]
    
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
      "weight" : "weight",
      "visible" : true,
      "tooltip" : "label"
    }
  },
  // Minimum amount of hops allowed
  minHops : 1,
  // Maximum amount of hops allowed
  maxHops : 6,
  // Minimum amount of neurons allowed
  minNeurons : 2,
  // Maximum amount of neurons allowed
  maxNeurons : 2
}

var styling = {
  // Background color for canvas
  canvasColor : "black",
  // Color for links between nodes
  defaultLinkColor : "white",
  // Color apply to links while hovering over them 
  defaultLinkHoverColor : "#11bffe",
  // Color apply to target and source nodes when hovering over a link or a node.
  defaultNeighborNodesHoverColor : "orange",
  // Font used for text in nodes
  defaultNodeFont : "5px sans-serif",
  // Color of font in node's text
  defaultNodeFontColor : "black",
  // Node border color
  defaultBorderColor : "black",
  // When hovering over a node, the node's border color changes to create a halo effect
  defaultNodeHoverBoderColor : "red", 
  // Title bar (in node) background color
  defaultNodeTitleBackgroundColor : "#11bffe",
  // Description area (in node) background color
  defaultNodeDescriptionBackgroundColor : "white",
  nodeColorsByLabel : {
    "Template" : "#ff6cc8",
    "Ganglion" : "#d6007d",
    "Neuromere" : "#d6007d",
    "GABAergic" : "#9551ff",
    "Dopaminergic" : "#9551ff",
    "Cholinergic" : "#9551ff",
    "Glutamatergic" : "#9551ff",
    "Octopaminergic" : "#9551ff",
    "Serotonergic" : "#9551ff",
    "Motor_neuron" : "#ff6a3a",
    "Sensory_neuron" : "#ff6a3a",
    "Peptidergic_neuron" : "#ff6a3a",
    "Glial_cell" : "#ff6a3a",
    "Cell" : "#ff6a3a",
    "Clone" : "#d6007d",
    "Synaptic_neuropil" : "#00a2aa",
    "License" : "#0164d8",
    "Person" : "#023f00",
    "Neuron" : "#7f2100",
    "Neuron_projection_bundle" : "#d6007d",
    "Resource" : "#005f1d",
    "Site" : "#005f1d",
    "Expression_pattern" : "#534700",
    "Split" : "#e012e3",
    "DataSet" : "#b700b5",
    "Anatomy" : "#00a2aa",
    "Property" : "#005f1d",
    "_Class" : "#0164d8"
  },
  controlIcons : {
    home : "fa fa-home",
    zoomIn : "fa fa-search-plus",
    zoomOut : "fa fa-search-minus"
  }
}

var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/neo4j/tx/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  locationCypherQuery
};
