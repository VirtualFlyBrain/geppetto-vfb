var locationCypherQuery = ( instances, hops ) => ({
  "statements": [
    {
      "statement" : "WITH [" + instances + "] AS neurons" 
      + " MATCH p=(x:Class)-[:synapsed_to*.." + hops.toString() + "]->(y:Class)"
      + " WHERE x.short_form in neurons and y.short_form in neurons" 
      + " RETURN p, neurons",
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
  },
  // Minimum amount of hops allowed
  minHops : 1,
  // Maximum amount of hops allowed
  maxHops : 6,
  // Minimum amount of neurons allowed
  minNeurons : 2,
  // Maximum amount of neurons allowed
  maxNeurons : 5
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
    "DataSet" : "#b700b5",
    "Anatomy" : "#00a2aa",
    "Synaptic_neuropil" : "#00a2aa",
    "_Class" : "#0164d8",
    "License" : "#0164d8",
    "Person" : "#023f00",
    "Neuron" : "#7f2100",
    "Neuron_projection_bundle" : "#d6007d",
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
    "Property" : "#005f1d",
    "Resource" : "#005f1d",
    "Site" : "#005f1d",
    "Expression_pattern" : "#534700",
    "Split" : "#e012e3"
  },
  controlIcons : {
    home : "fa fa-home",
    zoomIn : "fa fa-search-plus",
    zoomOut : "fa fa-search-minus"
  }
}

/**
 * SOLR data source configuration
 */
var datasourceConfiguration = {
  "url": "https://solr.virtualflybrain.org/solr/ontology/select",
  "query_settings":
    {
      "q": "$SEARCH_TERM$ OR $SEARCH_TERM$* OR *$SEARCH_TERM$*",
      "defType": "edismax",
      "qf": "label synonym label_autosuggest_ws label_autosuggest_e label_autosuggest synonym_autosuggest_ws synonym_autosuggest_e synonym_autosuggest shortform_autosuggest has_narrow_synonym_annotation has_broad_synonym_annotation",
      "indent": "true",
      "fl": "short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation,facets_annotation",
      "start": "0",
      "fq": [
        "type:class OR type:individual OR type:property",
        "ontology_name:(vfb)",
        "shortform_autosuggest:VFB* OR shortform_autosuggest:FB* OR is_defining_ontology:true"
      ],
      "rows": "100",
      "wt": "json",
      "bq": "is_obsolete:false^100.0 shortform_autosuggest:VFB*^110.0 shortform_autosuggest:FBbt*^100.0 is_defining_ontology:true^100.0 label_s:\"\"^2 synonym_s:\"\" in_subset_annotation:BRAINNAME^3 short_form:FBbt_00003982^2"
    }
};

var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

module.exports = { 
  configuration,
  styling,
  restPostConfig,
  locationCypherQuery,
  datasourceConfiguration
};
