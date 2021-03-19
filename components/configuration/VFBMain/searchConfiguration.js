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
      "q": "$SEARCH_TERM$ OR $SEARCH_TERM$* OR *$SEARCH_TERM$*",
      "defType": "edismax",
      "qf": "label^100 synonym^100 label_autosuggest_ws label_autosuggest_e label_autosuggest synonym_autosuggest_ws synonym_autosuggest shortform_autosuggest",
      "indent": "true",
      "fl": "short_form,label,synonym,id,facets_annotation",
      "start": "0",
      "pf":"true",
      "fq": [
        "shortform_autosuggest:VFB* OR shortform_autosuggest:FB*"
      ],
      "rows": "100",
      "wt": "json",
      "bq": "shortform_autosuggest:VFB*^110.0 shortform_autosuggest:FBbt*^100.0 label_s:\"\"^2 synonym_s:\"\" short_form:FBbt_00003982^2 facets_annotation:Deprecated^0.001"
    }
};

var searchConfiguration = {
  "resultsMapping":
    {
      "name": "label",
      "id": "short_form"
    },
  "filters_expanded": true,
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
          "key": "Expression_pattern",
          "filter_name": "Expression Pattern",
          "enabled": "disabled",
        },
        {
          "key": "has_image",
          "filter_name": "Image",
          "enabled": "disabled",
        },
        {
          "key": "Synaptic_neuropil_domain",
          "filter_name": "Synaptic Neuropil",
          "enabled": "disabled",
        },
        {
          "key": "Neuron",
          "filter_name": "Neuron",
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
    var scoreA = 0;
    var scoreB = 0;
    // Remove label/ID from synonyms for ordering
    split = a.split(' (');
    split.pop(split.length);
    a = split.join(' (');
    split = b.split(' (');
    split.pop(split.length);
    b = split.join(' (');
    // move down results with no label
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
    // move exact matches to top ['XX ('ID/Label)]
    if (a.label.indexOf(InputString ) == 0) {
      return -1;
    }
    if (b.label.indexOf(InputString) == 0) {
      return 1;
    }
    // close match without case matching
    if (InputString.toLowerCase() == a.label.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.label.toLowerCase()) {
      return 1;
    }
    if (InputString.toLowerCase().indexOf(' ') > -1) {
      var lcInputStingFac = InputString.toLowerCase().split(' ');
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var cA = compare(lcInputStingFac, a.label.toLowerCase().split(/\W+/).join(' ').split(' '));
      var cB = compare(lcInputStingFac, b.label.toLowerCase().split(/\W+/).join(' ').split(' '));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
        // if (a.label.length < b.label.length) {
        //   return -1;
        // }
        // if (a.label.length > b.label.length) {
        //   return 1;
        // }
      }
    }
    // close match without case matching ['xx ('ID/Label)]
    if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) == 0) {
      return -1;
    }
    if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) == 0) {
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
    if (a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0 && b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0 && a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1) {
      return -1;
    }
    // also with underscores ignored
    if (a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0 && b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0 && a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return -1;
    }
    // pick up any match without non alpha numeric join character match
    if (a.label.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ')) < 0 && b.label.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ')) > -1) {
      return 1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ')) < 0 && a.label.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace(/[\W_]+/g,' ')) > -1) {
      return -1;
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
  }
};

module.exports = {
  searchStyle,
  searchConfiguration,
  datasourceConfiguration,
};
