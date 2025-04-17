var searchStyle = {
  inputWrapper: {
    "position": "absolute",
    "height": "100%",
    "width": "100%",
    "top": "10%"
  },
  searchText: {
    "width": "100vh",
    "zIndex": "6",
    "fontSize": "22px",
    "color": "black",
    "backgroundColor": "white",
    "padding": "7px 20px 7px 20px",
    "border": "3px solid #11bffe",
  },
  filterIcon: {
    "right": "25px",
    "bottom": "15px",
    "zIndex": "6",
    "cursor": "pointer",
    "fontSize": "25px",
    "position": "absolute",
    "color": "black",
  },
  closeIcon: {
    "position": "relative",
    "color": "#11bffe",
    "bottom": "50px",
    "right": "14px",
    "fontWeight": "bold",
    "fontSize": "20px",
    "cursor": "pointer",
  },
  paperResults: {
    "left": "14%",
    "height": "50%",
    "width": "70%",
    "position": "absolute",
    "textAlign": "center",
    "backgroundColor": "#333333",
    "padding": "12px 20px 12px 20px",
    "overflow": "scroll",
    "zIndex": "5",
  },
  paperFilters: {
    "minHeight": "280px",
    "minWidth": "240px",
    "position": "absolute",
    "backgroundColor": "#141313",
    "color": "white",
    "overflow": "scroll",
    "zIndex": "6",
    "border": "3px solid #11bffe",
    "fontFamily": "Barlow, Khand, sans-serif",
    "fontSize": "16px",
    "top": "58px",
    "right": "0px",
  },
  singleResult: {
    "color": "white",
    "fontSize": "18px",
    "whiteSpace" : "normal",
    ":hover": {
      "color": "#11bffe",
      "background-color": "#252323",
    },
  },
  main: {
    "position": "absolute",
    "top": "0px",
    "left": "0px",
    "width": "100%",
    "height": "100%",
    "margin": "0",
    "padding": "0",
    "zIndex": "3",
    "backgroundColor": "rgba(51, 51, 51, 0.7)",
    "textAlign": "center",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
  }
};

var datasourceConfiguration = {
  "url": "https://solr.virtualflybrain.org/solr/ontology/select",
  "query_settings":
    {
      "q": "$SEARCH_TERM$",
      "q.op": "OR",
      "defType": "edismax",
      "mm": "45%",
      "qf": "label^110 synonym^100 label_autosuggest synonym_autosuggest shortform_autosuggest",
      "indent": "true",
      "fl": "short_form,label,synonym,id,facets_annotation,unique_facets",
      "start": "0",
      "pf":"true",
      "fq": [
        "(short_form:VFB* OR short_form:FB* OR facets_annotation:DataSet OR facets_annotation:pub) AND NOT short_form:VFBc_*"
      ],
      "rows": "150",
      "wt": "json",
      "bq": "short_form:VFBexp*^10.0 short_form:VFB*^100.0 short_form:FBbt*^100.0 short_form:FBbt_00003982^2 facets_annotation:Deprecated^0.001 facets_annotation:DataSet^500.0 facets_annotation:pub^100.0",
    }
};

var searchConfiguration = {
  "resultsMapping":
    {
      "name": "label",
      "id": "short_form",
      "labels" : "unique_facets"
    },
  "label_manipulation" : label => label,
  "filters_expanded": true,
  "filter_positive" : "^100",
  "filter_negative" : "^0.001",
  "filters": [
    {
      "key": "facets_annotation",
      "filter_name": "Filters",
      "type": "array",
      "enabled": "disabled",
      "disableGlobal": true,
      "values": [
        {
          "key": "Adult",
          "filter_name": "Adult",
          "enabled": "disabled",
        },
        {
          "key": "Larva",
          "filter_name": "Larva",
          "enabled": "disabled",
        },
        {
          "key": "Nervous_system",
          "filter_name": "Nervous System",
          "enabled": "disabled",
        },
        {
          "key": "Anatomy",
          "filter_name": "Anatomy",
          "enabled": "disabled",
        },
        {
          "key": "Neuron",
          "filter_name": "Neuron",
          "enabled": "disabled",
        },
        {
          "key": "Class",
          "filter_name": "Type",
          "enabled": "disabled",
        },
        {
          "key": "has_image",
          "filter_name": "Image",
          "enabled": "disabled",
        },
        {
          "key": "Split",
          "filter_name": "Split Expression",
          "enabled": "disabled",
        },
        {
          "key": "Expression_pattern",
          "filter_name": "Expression Pattern",
          "enabled": "disabled",
        },
        {
          "key": "Expression_pattern_fragment",
          "filter_name": "Expression Pattern Fragment",
          "enabled": "disabled",
        },
        {
          "key": "has_neuron_connectivity",
          "filter_name": "Neuron with Connectivity",
          "enabled": "disabled",
        },
        {
          "key": "NBLAST",
          "filter_name": "Neuron Similarity (NBLAST)",
          "enabled": "disabled",
        },
        {
          "key": "NBLASTexp",
          "filter_name": "Expression Similarity (NBLAST)",
          "enabled": "disabled",
        },
        {
          "key": "Synaptic_neuropil_domain",
          "filter_name": "Synaptic Neuropil",
          "enabled": "disabled",
        },
        {
          "key": "hasScRNAseq",
          "filter_name": "Has scRNAseq data",
          "enabled": "disabled",
        },
        {
          "key": "DataSet",
          "filter_name": "Dataset",
          "enabled": "disabled",
        },
        {
          "key": "Deprecated",
          "filter_name": "Deprecated",
          "enabled": "negative",
        }
      ]
    },
  ],
  "sorter": function (a, b) {
    var InputString = window.spotlightString;
    if (a.label == undefined) {
      return 1;
    }
    if (b.label == undefined) {
      return -1;
    }
    // move exact matches to top
    if (InputString == a.label) {
      return -1;
    }
    if (InputString == b.label) {
      return 1;
    }
    // close match without case matching
    if (InputString.toLowerCase() == a.label.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.label.toLowerCase()) {
      return 1;
    }
    // split out the [Name (Other)] bracketed part.
    if (InputString == a.label.split(' (')[0]) {
      return -1;
    }
    if (InputString == b.label.split(' (')[0]) {
      return 1;
    }
    // close match without case matching
    if (InputString.toLowerCase() == a.label.split(' (')[0].toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.label.split(' (')[0].toLowerCase()) {
      return 1;
    }
    // match ignoring joinging nonwords
    if (InputString.toLowerCase().split(/\W+/).join(' ') == a.label.toLowerCase().split(/\W+/).join(' ')) {
      return -1;
    }
    if (InputString.toLowerCase().split(/\W+/).join(' ') == b.label.toLowerCase().split(/\W+/).join(' ')) {
      return 1;
    }
    // match against id
    if (InputString.toLowerCase() == a.id.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.id.toLowerCase()) {
      return 1;
    }
    // pick up any match without nonword join character match
    if (a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1 && (a.label.split(' (')[0].length < b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0)) {
      return -1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1 && (a.label.split(' (')[0].length > b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0)) {
      return 1;
    }
    // also with underscores ignored
    if ((a.label.split(' (')[0].length < b.label.split(' (')[0].length || b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0) && a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return -1;
    }
    if ((a.label.split(' (')[0].length > b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0) && b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return 1;
    }
    // find all matching spaced words
    if (InputString.toLowerCase().indexOf(' ') > -1) {
      var lcInputStingFac = InputString.toLowerCase().split(' ');
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var cA = compare(lcInputStingFac, a.label.toLowerCase().split(' '));
      var cB = compare(lcInputStingFac, b.label.toLowerCase().split(' '));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
    }
    // find all tokenised word matches
    if (InputString.split(/\W+/).length > 1) {
      var lcInputStingFac = InputString.toLowerCase().split(/\W+/);
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var cA = compare(lcInputStingFac, a.label.toLowerCase().split(/\W+/));
      var cB = compare(lcInputStingFac, b.label.toLowerCase().split(/\W+/));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
    }
    // prioritise matches in the primary label
    if (InputString.split(/\W+/).length > 1) {
      var lcInputStingFac = InputString.toLowerCase().split(/\W+/);
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var aLabel = a.label.split(' (');
      var aEnd = aLabel.pop(aLabel.length);
      aLabel = aLabel.join(' (');
      var bLabel = b.label.split(' (');
      var bEnd = bLabel.pop(bLabel.length);
      bLabel = bLabel.join(' (');
      var cA = compare(lcInputStingFac, aLabel.toLowerCase().split(/\W+/));
      var cB = compare(lcInputStingFac, bLabel.toLowerCase().split(/\W+/));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
    }
    // if not found in one then advance the other
    if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
      return -1;
    }
    // if the match is closer to start than the other move up
    if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) < b.label.toLowerCase().indexOf(InputString.toLowerCase())) {
      return -1;
    }
    if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) < a.label.toLowerCase().indexOf(InputString.toLowerCase())) {
      return 1;
    }
    // move up expression (VFBexp) terms
    if (a.id.indexOf("VFBexp") > -1 && b.id.indexOf("VFBexp") < 0) {
      return -1;
    }
    if (b.id.indexOf("VFBexp") > -1 && a.id.indexOf("VFBexp") < 0) {
      return 1;
    }
    // if the match in the id is closer to start then move up
    if (a.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.id.toLowerCase().indexOf(InputString.toLowerCase()) < b.id.toLowerCase().indexOf(InputString.toLowerCase())) {
      return -1;
    }
    if (b.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.id.toLowerCase().indexOf(InputString.toLowerCase()) < a.id.toLowerCase().indexOf(InputString.toLowerCase())) {
      return 1;
    }
    // move the shorter synonyms to the top
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    } else {
      return 0;
    } // if nothing found then do nothing.
  },
  "clickHandler": function (id) {
    window.addVfbId(id);
  },
  "Neo4jLabels" : {
    "FAFB" : "FAFB",
    "L1EM" : "L1EM",
    "FlyEM_HB" : "FlyEM_HB"
  }
};

module.exports = {
  searchStyle,
  searchConfiguration,
  datasourceConfiguration
};
