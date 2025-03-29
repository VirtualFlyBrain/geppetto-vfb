var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
var QueryLinkComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryLinkComponent");
var QueryLinkArrayComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryLinkArrayComponent");
var SlideshowImageComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/slideshowImageComponent");
var QueryResultsControlsComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryResultsControlsComponent");

var queryResultsColMeta = [
  {
    "columnName": "id",
    "order": 1,
    "locked": false,
    "visible": true,
    "displayName": "ID"
  },
  {
    "columnName": "name",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 0,
    "entityDelimiter": "----",
    "displayName": "Name",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "cluster",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 0,
    "entityDelimiter": "----",
    "displayName": "Cluster",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "gene",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 0,
    "entityDelimiter": "----",
    "displayName": "Gene",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "neuron_A",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 0,
    "entityDelimiter": "----",
    "displayName": "Neuron_A",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "type",
    "order": 3,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Type",
    "cssClassName": "query-results-type-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "cell_type",
    "order": 3,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Cell type",
    "cssClassName": "query-results-type-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "parent",
    "order": 3,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Parent",
    "cssClassName": "query-results-type-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "expressed_in",
    "order": 3,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Expressed_in",
    "cssClassName": "query-results-expressed_in-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "dataset",
    "order": 4,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 3,
    "entityDelimiter": "----",
    "displayName": "Dataset",
    "cssClassName": "query-results-dataset-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "description",
    "order": 4,
    "locked": false,
    "visible": true,
    "displayName": "Definition",
    "cssClassName": "query-results-description-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "reference",
    "order": 5,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkArrayComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 2,
    "entityDelimiter": "----",
    "stringDelimiter": ";",
    "displayName": "Reference",
    "cssClassName": "query-results-reference-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "gross_type",
    "order": 6,
    "locked": false,
    "visible": true,
    "displayName": "Gross_Type",
    "cssClassName": "query-results-grosstype-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "stage",
    "order": 7,
    "locked": false,
    "visible": true,
    "displayName": "Stage",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "level",
    "order": 7,
    "locked": false,
    "visible": true,
    "displayName": "Level",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "extent",
    "order": 8,
    "locked": false,
    "visible": true,
    "displayName": "Extent",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "downstream",
    "order": 7,
    "locked": false,
    "visible": true,
    "displayName": "Outputs",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "tbars",
    "order": 8,
    "locked": false,
    "visible": true,
    "displayName": "Outputs (Tbars)",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "upstream",
    "order": 9,
    "locked": false,
    "visible": true,
    "displayName": "Inputs",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "weight",
    "order": 10,
    "locked": false,
    "visible": true,
    "displayName": "Weight",
    "cssClassName": "query-results-stage-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "neuron_B",
    "order": 1,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 2,
    "entityDelimiter": "----",
    "displayName": "Partner_Neuron",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "region",
    "order": 2,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Region",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "traget",
    "order": 11,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "Target",
    "cssClassName": "query-results-name-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "license",
    "order": 8,
    "locked": false,
    "visible": true,
    "customComponent": QueryLinkComponent,
    "actions": "window.addVfbId('$entity$');",
    "entityIndex": 1,
    "entityDelimiter": "----",
    "displayName": "License",
    "cssClassName": "query-results-license-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "template",
    "order": 9,
    "locked": false,
    "visible": true,
    "displayName": "Template_Space",
    "cssClassName": "query-results-template-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "technique",
    "order": 10,
    "locked": false,
    "visible": true,
    "displayName": "Imaging_Technique",
    "cssClassName": "query-results-technique-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "controls",
    "order": 11,
    "locked": false,
    "visible": false,
    "customComponent": QueryResultsControlsComponent,
    "displayName": "Controls",
    "actions": "",
    "cssClassName": "query-results-controls-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "images",
    "order": 12,
    "locked": false,
    "visible": true,
    "customComponent": SlideshowImageComponent,
    "displayName": "Images",
    "actions": { addInstance : "window.addVfbId('$entity$');" , deleteInstance : '$entity$.delete()' },
    "cssClassName": "query-results-images-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "score",
    "order": 13,
    "locked": false,
    "visible": true,
    "displayName": "Score",
    "cssClassName": "query-results-score-column",
    "sortDirectionCycle": ['desc', 'asc', null]
  },
  {
    "columnName": "function",
    "order": 13,
    "locked": false,
    "visible": true,
    "displayName": "Function",
    "cssClassName": "query-results-score-column",
    "sortDirectionCycle": ['asc', 'desc', null]
  },
  {
    "columnName": "image_count",
    "order": 14,
    "locked": false,
    "visible": true,
    "displayName": "Image_count",
    "cssClassName": "query-results-image_count-column",
    "sortDirectionCycle": ['desc', 'asc', null]
  }
];

// which columns to display in the results
var queryResultsColumns = ['name', 'cluster', 'gene', 'neuron_A', 'type', 'cell_type', 'downstream', 'tbars', 'upstream', 'level', 'extent', 'function', 'weight', 'neuron_B', 'region', 'target', 'parent', 'expressed_in', 'dataset', 'description', 'reference', 'gross_type', 'stage', 'license', 'template', 'technique', 'controls', 'images', 'score', 'image_count'];

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
  },
  enableLongQueryMessage: true,
  longQueryTimeout: 5000, // Time in ms (5 seconds) before showing the message
  longQueryMessage: "Large query (~2 min). Click anywhere to run in background."
};

var queryBuilderDatasourceConfig = {
  VFB: {
    url: 'https://solr.virtualflybrain.org/solr/ontology/select?q=$SEARCH_TERM$+OR+$SEARCH_TERM$*+OR+*$SEARCH_TERM$*&defType=edismax&qf=label^100+synonym^100+label_autosuggest_ws+label_autosuggest_e+label_autosuggest+synonym_autosuggest_ws+synonym_autosuggest+shortform_autosuggest&indent=true&fl=short_form+label+synonym+id+facets_annotation+type:"class"&start=0&pf=true&rows=100&wt=json&bq=shortform_autosuggest:VFB*^110.0+shortform_autosuggest:FBbt*^100.0+label_s:""^2+synonym_s:""+short_form=FBbt_00003982^2+facets_annotation:Deprecated^0.001',
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

var sorterColumns = [
  {
    column: "downstream",
    order: "DESC"
  },
  {
    column: "score",
    order: "DESC"
  },
  {
    column: "image_count",
    order: "DESC"
  },
  {
    column: "images",
    order: "DESC"
  },
  {
    column: "name",
    order: "ASC"
  }
];

module.exports = {
  queryResultsColMeta,
  queryResultsColumns,
  queryResultsControlConfig,
  queryBuilderDatasourceConfig,
  sorterColumns
};
