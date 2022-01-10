var locationCypherQuery = ( instances, paths, weight ) => ({
  "statements": [
    {
      "statement" : "WITH [" + instances + "] AS neurons"
      + " WITH neurons[0] as a, neurons[1] AS b"
      + " MATCH (source:Neuron:has_neuron_connectivity {short_form: a}), (target:Neuron:has_neuron_connectivity {short_form: b})"
      + " CALL gds.beta.shortestPath.yens.stream({"
      + "  nodeQuery: 'MATCH (n:Neuron:has_neuron_connectivity) RETURN id(n) AS id',"
      + "  relationshipQuery: 'MATCH (a:Neuron:has_neuron_connectivity)-[r:synapsed_to]->(b:Neuron:has_neuron_connectivity) WHERE exists(r.weight) AND r.weight[0] >= "
      + weight?.toString() + " RETURN id(a) AS source, id(b) AS target, type(r) as type, 5000-r.weight[0] as weight_p',"
      + "  sourceNode: id(source),"
      + "  targetNode: id(target),"
      + "  k: " + paths?.toString() + ","
      + "  relationshipWeightProperty: 'weight_p',"
      + "  relationshipTypes: ['*'],"
      + "  path: true"
      + "})"
      + " YIELD index, sourceNode, targetNode, nodeIds, path"
      + " WITH * ORDER BY index DESC"
      + " UNWIND relationships(path) as sr"
      + " OPTIONAL MATCH cp=(x:Neuron:has_neuron_connectivity)-[:synapsed_to]-(y:Neuron:has_neuron_connectivity) WHERE x=apoc.rel.startNode(sr) AND y=apoc.rel.endNode(sr) OPTIONAL MATCH fp=(x)-[r:synapsed_to]->(y) WHERE r.weight[0] >= " + weight?.toString()
      + " OPTIONAL MATCH (x)-[xio:INSTANCEOF]->(xpc:Class) OPTIONAL MATCH (y)-[yio:INSTANCEOF]->(ypc:Class) WITH *,'\"'+ x.short_form+'\":{\"'+xpc.short_form+'\":\"' + xpc.label + '\"},\"'+ y.short_form+'\":{\"'+ypc.short_form+'\":\"' + ypc.label + '\"}' as Class"
      + " RETURN distinct a as root, collect(distinct fp) as pp, collect(distinct cp) as p, collect(distinct id(r)) as fr, sourceNode as source, targetNode as target, max(length(path)) as maxHops, collect(distinct toString(id(r))+':'+toString(index)) as relationshipY, "
      + " apoc.convert.fromJsonMap('{' + apoc.text.join(collect(Class),',') + '}') as class ",
      "resultDataContents": ["row", "graph"]
    }
  ]
});

var Neo4jLabels = {
  FAFB : "FAFB",
  L1EM : "L1EM",
  FlyEM_HB : "FlyEM_HB"
}

// See query explanation on https://github.com/VirtualFlyBrain/graph_queries/blob/main/weighted_path.md 

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
  // Minimum amount of paths allowed
  minPaths : 1,
  // Maximum amount of paths allowed
  maxPaths : 6,
  // Minimum amount of neurons allowed
  minNeurons : 2,
  // Maximum amount of neurons allowed
  maxNeurons : 2,
  // Curvature of lines, 0 is a straight line
  linkCurvature : 0
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
  url: "https://pdb-dev.virtualflybrain.org/db/neo4j/tx/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  locationCypherQuery,
  Neo4jLabels
};
