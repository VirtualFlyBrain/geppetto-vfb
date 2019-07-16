var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
var QueryLinkComponent = require("geppetto-client/js/components/interface/query/customComponents/queryLinkComponent");
var SlideshowImageComponent = require("geppetto-client/js/components/interface/query/customComponents/slideshowImageComponent");
var QueryResultsControlsComponent = require("geppetto-client/js/components/interface/query/customComponents/queryResultsControlsComponent");

var queryResultsColMeta = [
  {
    "columnName": "id",
    "order": 1,
    "locked": false,
    "visible": true,
    "displayName": "ID",
  },
  {
    "columnName": "name",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$'.split(';')[0]);",
    "displayName": "Name",
    "cssClassName": "query-results-name-column",
  },
  {
    "columnName": "expressed_in",
    "order": 3,
    "locked": false,
    "visible": true,
    "displayName": "Expressed_in",
    "cssClassName": "query-results-expressed_in-column"
  },
  {
    "columnName": "description",
    "order": 4,
    "locked": false,
    "visible": true,
    "displayName": "Definition",
    "cssClassName": "query-results-description-column"
  },
  {
    "columnName": "reference",
    "order": 5,
    "locked": false,
    "visible": true,
    "displayName": "Reference",
    "cssClassName": "query-results-reference-column"
  },
  {
    "columnName": "type",
    "order": 6,
    "locked": false,
    "visible": true,
    "displayName": "Type",
    "cssClassName": "query-results-type-column"
  },
  {
    "columnName": "stage",
    "order": 7,
    "locked": false,
    "visible": true,
    "displayName": "Stage",
    "cssClassName": "query-results-stage-column"
  },
  {
    "columnName": "controls",
    "order": 8,
    "locked": false,
    "visible": false,
    "customComponent": QueryResultsControlsComponent,
    "displayName": "Controls",
    "actions": "",
    "cssClassName": "query-results-controls-column"
  },
  {
    "columnName": "images",
    "order": 9,
    "locked": false,
    "visible": true,
    "customComponent": SlideshowImageComponent,
    "displayName": "Images",
    "actions": "window.addVfbId('$entity$');",
    "cssClassName": "query-results-images-column"
  },
  {
    "columnName": "score",
    "order": 10,
    "locked": false,
    "visible": true,
    "displayName": "Score",
    "cssClassName": "query-results-score-column"
  }
];

// which columns to display in the results
var queryResultsColumns = ['name', 'expressed_in', 'description', 'reference', 'type', 'stage', 'images', 'score'];

var queryResultsControlConfig = {
  "Common": {
    "info": {
      "id": "info",
      "actions": [
        "window.addVfbId('$ID$');"
      ],
      "icon": "fa-info-circle",
      "label": "Info",
      "tooltip": "Info"
    },
    "flybase": {
      "showCondition": "'$ID$'.startsWith('FBbt')",
      "id": "flybase",
      "actions": [
        "window.open('http://flybase.org/cgi-bin/cvreport.html?rel=is_a&id=' + '$ID$'.replace(/_/g, ':'), '_blank').focus()"
      ],
      "icon": "gpt-fly",
      "label": "FlyBase",
      "tooltip": "FlyBase Term"
    }
  }
};

var queryBuilderDatasourceConfig = {
  VFB: {
    url: "https://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&fq=shortform_autosuggest:VFB*%20OR%20shortform_autosuggest:FBbt_*&rows=250&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E100.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=$SEARCH_TERM$%20OR%20$SEARCH_TERM$*%20OR%20*$SEARCH_TERM$*&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", 
    crossDomain: true,
    id: "short_form",
    label: { field: "label", formatting: "$VALUE$" },
    explode_fields: [{ field: "short_form", formatting: "$VALUE$ ($LABEL$)" }],
    explode_arrays: [{ field: "synonym", formatting: "$VALUE$ ($LABEL$)" }],
    type: {
      class: {
        actions: ["window.fetchVariableThenRun('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); });"],
        icon: "fa-dot-circle-o"
      },
      individual: {
        actions: ["window.fetchVariableThenRun('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); });"],
        icon: "fa-square-o"
      }
    },
    queryNameToken: '$NAME',
    resultsFilters: {
      getItem: function (record, header, field) {
        var recordIndex = header.indexOf(field);
        return record[recordIndex]
      },
      getId: function (record) {
        return record[0]
      },
      getName: function (record) {
        return record[1]
      },
      getDescription: function (record) {
        return record[2]
      },
      getType: function (record) {
        return record[3]
      },
      getImageData: function (record) {
        return record[4]
      },
      getScore: function (record) {
        return record[5]
      },
      getRecords: function (payload) {
        return payload.results.map(function (item) {
          return item.values
        })
      },
      getHeaders: function (payload) {
        return payload.header;
      }
    },
    bloodhoundConfig: {
      datumTokenizer: function (d) {
        return Bloodhound.tokenizers.nonword(d.label.replace('_', ' '));
      },
      queryTokenizer: function (q) {
        return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
      },
      sorter: function (a, b) {
        var InputString = $("#query-typeahead").val();
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
        Bloodhound.tokenizers.nonword("test thing-here12 34f").join(' ');
        if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ')) {
          return -1;
        }
        if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ')) {
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
        if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
          return 1;
        }
        if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
          return -1;
        }
        // also with underscores ignored
        if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
          return 1;
        }
        if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
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
      }
    }
  }
};

module.exports = {
  queryResultsColMeta,
  queryResultsColumns,
  queryResultsControlConfig,
  queryBuilderDatasourceConfig
};
