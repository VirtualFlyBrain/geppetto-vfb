/*
 * Paths come from VFBquery's /circuit_paths (VirtualFlyBrain/VFBquery#114),
 * through the v3-cached proxy like the other VFBquery calls. It searches the
 * class graphs built with each release, separately in each connectome, and
 * takes neuron types (FBbt classes) or individual neurons (VFB ids) at either
 * end. This replaces the Cypher query that ran Yen's paths on the cb_<site>
 * GDS projections in pdb.
 */
var circuitPathsConfig = {
  url: "https://v3-cached.virtualflybrain.org/circuit_paths",
  // Example neurons for class paths (instance_graph) can take 10-25s
  timeout: 90000,
  // Example neuron paths fetched for each class path
  instanceK: 2
};

/**
 * Query parameters for /circuit_paths.
 * ends: [{ id }, { id }], the first is the source and the last the target.
 * When either end is an individual neuron, every dataset is searched: the
 * endpoint leaves out hemibrain and FAFB by default because newer connectomes
 * cover the same cells, which is right for classes but would leave a hemibrain
 * neuron with nothing to search.
 */
var circuitPathsParams = ( ends, paths, weight, showNeurons ) => {
  const ids = ends.map(end => end.id);
  const params = {
    source: ids[0],
    target: ids[ids.length - 1],
    k: paths,
    min_synapses: weight
  };
  if ( ids.some(id => !/^FBbt_\d{8}$/.test(id)) ) {
    params.exclude_dbs = "";
  } else if ( showNeurons ) {
    params.instance_graph = true;
    params.instance_k = circuitPathsConfig.instanceK;
  }
  return params;
};

/*
 * Labels and facets (for the node colours) of the nodes on the paths. The
 * paths name each neuron's class but not the neuron itself.
 */
var termLookupConfig = {
  url: "https://solr.virtualflybrain.org/solr/ontology/select",
  fields: "short_form,label,facets_annotation"
};

var configuration = {
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
  // Max pixel font size a one-line title is enlarged to (36 made short symbols huge)
  nodeMaxFontSize : 16,
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

module.exports = { 
  configuration,
  styling,
  circuitPathsConfig,
  circuitPathsParams,
  termLookupConfig
};
