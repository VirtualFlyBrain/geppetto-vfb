var locationCypherQuery = ( instances, hops, weight ) => ({
  "statements": [
    {
      "statement" : "WITH [" + instances + "] AS neurons"
      + " WITH neurons[0] as a, neurons[1] AS b"
      + " MATCH (source:has_neuron_connectivity {short_form: a}), (target:Neuron {short_form: b})"
      + " CALL gds.beta.shortestPath.yens.stream({"
      + "  nodeQuery: 'MATCH (n:has_neuron_connectivity) RETURN id(n) AS id',"
      + "  relationshipQuery: 'MATCH (a:has_neuron_connectivity)-[r:synapsed_to]->(b:has_neuron_connectivity) WHERE exists(r.weight) AND r.weight[0] >= "
      + weight.toString() + " RETURN id(a) AS source, id(b) AS target, type(r) as type, 5000-r.weight[0] as weight_p',"
      + "  sourceNode: id(source),"
      + "  targetNode: id(target),"
     + "  k: " + hops.toString() + ","
      + "  relationshipWeightProperty: 'weight_p',"
      + "  relationshipTypes: ['*'],"
      + "  path: true"
      + "})"
      + " YIELD index, sourceNode, targetNode, nodeIds, path"
      + " WITH * ORDER BY index DESC"
     + " OPTIONAL MATCH fp=(source)-[r:synapsed_to*..]->(target) WHERE ALL(n in nodes(fp) WHERE id(n) IN nodeIds)"
      + " UNWIND r as sr WITH *, collect(id(sr)) as ids, toString(id(sr))+':'+toString(index) as relY OPTIONAL MATCH cp=(source)-[r:synapsed_to*..]-(target)"
      + " WHERE ALL(n in nodes(cp) WHERE id(n) IN nodeIds) UNWIND ids as id"
      + " RETURN distinct a as root, collect(distinct fp) as pp, collect(distinct cp) as p, collect(distinct id) as fr, sourceNode as source, targetNode as target, max(length(fp)) as maxHops, collect(distinct relY) as relationshipY ",
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
    "GABAergic" : "#9551ff",
    "Dopaminergic" : "#3551ff",
    "Cholinergic" : "#95515f",
    "Glutamatergic" : "#95f1ff",
    "Octopaminergic" : "#f3511f",
    "Serotonergic" : "#9501f0",
    "Motor_neuron" : "#fffa30",
    "Sensory_neuron" : "#ff3a3a",
    "Peptidergic_neuron" : "#5f6a3a",
    "Glial_cell" : "#ff3a6a",
    "Clone" : "#d6007d",
    "Synaptic_neuropil" : "#00a2aa",
    "License" : "#0164d8",
    "Person" : "#023f00",
    "Neuron" : "#7f2100",
    "Neuron_projection_bundle" : "#d6327d",
    "Resource" : "#005f1d",
    "Site" : "#005f1d",
    "Expression_pattern" : "#534700",
    "Split" : "#e012e3",
    "DataSet" : "#b700b5",
    "Ganglion" : "#d6007d",
    "Neuromere" : "#d6507d",
    "Cell" : "#ff6a3a",
    "Property" : "#005f1d",
    "Anatomy" : "#00a2aa",
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
