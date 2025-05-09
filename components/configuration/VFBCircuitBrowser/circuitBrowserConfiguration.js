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
      + " OPTIONAL MATCH (x)-[xio:INSTANCEOF]->(xpc:Class) OPTIONAL MATCH (y)-[yio:INSTANCEOF]->(ypc:Class) WITH *,'\"'+ x.short_form+'\":{\"'+xpc.short_form+'\":\"' + coalesce(xpc.symbol[0], xpc.label) + '\"},\"'+ y.short_form+'\":{\"'+ypc.short_form+'\":\"' + coalesce(ypc.symbol[0], ypc.label) + '\"}' as Class"
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
  defaultNodeFont : "sans-serif",
  // Font size in pixels used for text in nodes
  nodeTitleFontSize : 8,
  // Percentage of node for title area to take in node, as decimal. Default 45%
  nodeTitleHeight : .45,
  // Pixel font size for description text of node
  nodeDescriptionFontSize : 8,
  // Max pixel font size for description text of node
  nodeMaxFontSize : 36,
  // percentage of node description area to take in node, as decimal. Default 45%
  nodeDescriptionHeight : .45,
  // percentage of node color bar area to take in node, as decimal. Default 10%
  nodeColorAreaHeight : .1,
  // Max amount of lines to display for title and description 
  linesText : 3,
  // Color of font in node's text
  defaultNodeFontColor : "black",
  // Node border color
  defaultBorderColor : "black",
  // When hovering over a node, the node's border color changes to create a halo effect
  defaultNodeHoverBoderColor : "red",
  // Title bar (in node) background color
  defaultNodeTitleBackgroundColor : "grey",
  // Description area (in node) background color
  defaultNodeDescriptionBackgroundColor : "white",
  nodeColorsByLabel : {
    "API": "#000000",
    "Neuron" : "#b15928",
    "Expression_pattern_fragment" : "#6a3d9a",
    "Visual_system" : "#0000aa",
    "GABAergic" : "#1f78b4",
    "Cholinergic" : "#bebada",
    "Olfactory_system" : "#00aa00",
    "Glutamatergic" : "#b2df8a",
    "Neuron_projection_bundle" : "#bc80bd",
    "Synaptic_neuropil_subdomain" : "#88ffb3",
    "Sensory_neuron" : "#fb9a99",
    "Mechanosensory_system": "#00aaaa",
    "Peptidergic" : "#80b1d3",
    "Thermosensory_system" : "#aa0000",
    "Muscle" : "#a6cee3",
    "Serotonergic" : "#d9d9d9",
    "Dopaminergic" : "#fdbf6f",
    "Auditory_system" : "#aa00aa",
    "Gustatory_system" : "#aaaa00",
    "Proprioceptive_system" : "#00aaaa",
    "Octopaminergic" : "#ffff99",
    "Motor_neuron" : "#e31a1c",
    "Chemosensory_system" : "#ea9e24",
    "Synaptic_neuropil_domain" : "#fb8072",
    "Glial_cell" : "#ff6a3a",
    "Hygrosensory_system" : "#0000ff",
    "Clone" : "#cab2d6",
    "Ganglion" : "#ff7f00",
    "Neuromere" : "#8dd3c7",
    "Expression_pattern" : "#b3de69",
    "Split" : "#e012e3",
    "Synaptic_neuropil_block" : "#fccde5",
    "Deprecated" : "#ff0000",
    "Larva" : "#ccebc5",
    "Nociceptive_system" : "#ffa500",
    "Neuroblast" : "#8df8f9",
    "Synaptic_neuropil" : "#00a2aa",
    "GMC" : "#ecf7f7",
    "Transgenic_Construct" : "#F8BBD0",
    "Gene" : "#ffcdd2",
    "Insertion" : "#D1C4E9",
    "Allele" : "#DCEDC8",
    "DataSet" : "#b700b5",
    "Site" : "#005f1d",
    "Person" : "#023f00",
    "pub" : "#0164d8",
    "License" : "#0164d8",
    "Cluster" : "#ffed6f"
  },
  controlIcons : {
    home : "fa fa-home",
    zoomIn : "fa fa-search-plus",
    zoomOut : "fa fa-search-minus"
  }
}

var restPostConfig = {
  url: "https://pdb.v4.virtualflybrain.org/db/neo4j/tx/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  locationCypherQuery,
  Neo4jLabels
};
