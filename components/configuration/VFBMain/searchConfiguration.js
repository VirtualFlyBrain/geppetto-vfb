var datasourceConfiguration = {
  "url": "https://solr.virtualflybrain.org/solr/ontology/select",
  "query_settings":
    {
      "q": "$SEARCH_TERM$ OR $SEARCH_TERM$* OR *$SEARCH_TERM$*",
      "defType": "edismax",
      "qf": "label synonym label_autosuggest_ws label_autosuggest_e label_autosuggest synonym_autosuggest_ws synonym_autosuggest shortform_autosuggest",
      "indent": "true",
      "fl": "short_form,label,synonym,id,facets_annotation",
      "start": "0",
      "fq": [
        "shortform_autosuggest:VFB* OR shortform_autosuggest:FB*"
      ],
      "rows": "100",
      "wt": "json",
      "bq": "shortform_autosuggest:VFB*^110.0 shortform_autosuggest:FBbt*^100.0 label_s:\"\"^2 synonym_s:\"\" short_form:FBbt_00003982^2"
    }
};

// searchedObject define what to take from

var searchConfiguration = {
  "resultsMapping":
      {
        "name": "label",
        "id": "short_form"
      },
  "filters": [
    {
      "key": "label",
      "filter_name": "Label",
      "type": "string",
      "enabled": true,
    },
    {
      "key": "short_form",
      "filter_name": "ID",
      "type": "string",
      "enabled": true,
    },
    {
      "key": "facets_annotation",
      "filter_name": "Type",
      "type": "array",
      "values": [
        {
          "key": "Adult",
          "filter_name": "Adult",
          "enabled": false,
        },
        {
          "key": "Larval",
          "filter_name": "Larval",
          "enabled": false,
        },
        {
          "key": "Nervous_system",
          "filter_name": "Nervous System",
          "enabled": false,
        },
        {
          "key": "Anatomy",
          "filter_name": "Anatomy",
          "enabled": false,
        },
        {
          "key": "Expression_pattern",
          "filter_name": "Expression Pattern",
          "enabled": false,
        },
        {
          "key": "Individual",
          "filter_name": "Image",
          "enabled": false,
        },
        {
          "key": "Synaptic_neuropil_domain",
          "filter_name": "Synaptic Neuropil",
          "enabled": false,
        },
        {
          "key": "Neuron",
          "filter_name": "Neuron",
          "enabled": false,
        }
      ]
    },
  ],
  "sorter": function (a, b) {
    var InputString = window.spotlightString;
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
    // close match without case matching
    if (InputString.toLowerCase() == a.label.toLowerCase()) {
      return -1;
    }
    if (InputString.toLowerCase() == b.label.toLowerCase()) {
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
  datasourceConfiguration,
  searchConfiguration
};
