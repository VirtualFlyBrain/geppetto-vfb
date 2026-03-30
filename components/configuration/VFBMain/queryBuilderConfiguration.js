var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
var QueryLinkComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryLinkComponent");
var QueryLinkArrayComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryLinkArrayComponent");
var SlideshowImageComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/slideshowImageComponent");
var QueryResultsControlsComponent = require("@geppettoengine/geppetto-client/components/interface/query/customComponents/queryResultsControlsComponent");
var GrossTypeLabelsComponent = require('../../interface/utils/GrossTypeLabelsComponent');

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
    "customComponent": GrossTypeLabelsComponent,
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
  }
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
        // Normalize user input so ranking comparisons stay aligned with query tokenization
        var InputString = ($("#query-typeahead").val() || "").trim();
        if (a.label == undefined) {
          return 1;
        }
        if (b.label == undefined) {
          return -1;
        }

        // Helper functions
        var aIsClass = a.id.indexOf("FBbt") > -1 || a.id.indexOf("FBgn") > -1;
        var bIsClass = b.id.indexOf("FBbt") > -1 || b.id.indexOf("FBgn") > -1;

        // Extract short form (part before parenthesis)
        var aShortForm = a.label.split(' (')[0];
        var bShortForm = b.label.split(' (')[0];
        var aShortFormLC = aShortForm.toLowerCase();
        var bShortFormLC = bShortForm.toLowerCase();
        var InputStringLC = InputString.toLowerCase();

        /*
         * Detect official symbol matches vs synonym matches
         * Official symbol: search term appears multiple times (label + synonyms)
         * Alias/Synonym: search term appears only once or only in synonyms
         * Rationale: Terms appearing in both label and synonyms are more likely official
         */
        var countTermOccurrences = function (item) {
          var count = 0;
          if (!item.label) {
            return 0;
          }

          var labelLC = item.label.toLowerCase();

          /*
           * Query builder labels can arrive as:
           * - "synonym (original_label)" for synonym matches
           * - "short_form (original_label)" for exploded ids
           * - "label" for original records
           */
          var parenIndex = labelLC.indexOf(' (');
          var mainPart = parenIndex > -1 ? labelLC.substring(0, parenIndex) : labelLC;
          var parenPart = parenIndex > -1 ? labelLC.substring(parenIndex + 2, labelLC.length - 1) : '';

          if (mainPart.indexOf(InputStringLC) > -1) {
            count += 1;
          }

          if (parenPart && parenPart.indexOf(InputStringLC) > -1) {
            count += 1;
          }

          if (item.synonym) {
            var syns = Array.isArray(item.synonym) ? item.synonym : [item.synonym];
            syns.forEach(function (syn) {
              if (syn && syn.toLowerCase().indexOf(InputStringLC) > -1) {
                count += 1;
              }
            });
          }

          return count;
        };
        var aTermCount = countTermOccurrences(a);
        var bTermCount = countTermOccurrences(b);
        var aIsOfficialSymbol = aTermCount >= 2;
        var bIsOfficialSymbol = bTermCount >= 2;
        var aIsSymbolCaseInsensitive = aTermCount >= 2;
        var bIsSymbolCaseInsensitive = bTermCount >= 2;

        /*
         * Helper function to find synonym position in list
         * Earlier position = more important/commonly used name
         */
        var getSynonymIndex = function (synonymField) {
          if (!synonymField) {
            return -1;
          }
          var syns = Array.isArray(synonymField) ? synonymField : (typeof synonymField === 'string' ? synonymField.split(';').map(s => s.trim()) : []);
          for (var i = 0; i < syns.length; i++) {
            if (syns[i].toLowerCase() === InputStringLC) {
              return i;
            }
          }
          return -1;
        };
        var aSynonymIndex = getSynonymIndex(a.synonym);
        var bSynonymIndex = getSynonymIndex(b.synonym);

        /* Synonym position ordering: earlier in list = more important */
        if ((aSynonymIndex >= 0 || bSynonymIndex >= 0) && aSynonymIndex !== bSynonymIndex) {
          if (aSynonymIndex >= 0 && bSynonymIndex < 0) {
            return -1;
          }
          if (bSynonymIndex >= 0 && aSynonymIndex < 0) {
            return 1;
          }
          if (aSynonymIndex >= 0 && bSynonymIndex >= 0 && aSynonymIndex !== bSynonymIndex) {
            return aSynonymIndex - bSynonymIndex;
          }
        }

        /* Priority 0: Official symbol match (short_form field match) */
        if (aIsOfficialSymbol || bIsOfficialSymbol) {
          if (aIsOfficialSymbol && !bIsOfficialSymbol) {
            return -1;
          }
          if (bIsOfficialSymbol && !aIsOfficialSymbol) {
            return 1;
          }
          /* Both are official symbols - prefer class terms if search doesn't specify a type */
          if (aIsOfficialSymbol && bIsOfficialSymbol) {
            var searchIsVFB = InputString.indexOf("VFB") === 0;
            var searchIsFBbt = InputString.indexOf("FBbt") === 0;
            var searchIsFBgn = InputString.indexOf("FBgn") === 0;
            if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
              if (aIsClass && !bIsClass) {
                return -1;
              }
              if (bIsClass && !aIsClass) {
                return 1;
              }
            }
          }
        }

        /* Case-insensitive official symbol match */
        if (aIsSymbolCaseInsensitive || bIsSymbolCaseInsensitive) {
          if (aIsSymbolCaseInsensitive && !bIsSymbolCaseInsensitive) {
            return -1;
          }
          if (bIsSymbolCaseInsensitive && !aIsSymbolCaseInsensitive) {
            return 1;
          }
        }

        /* Priority 1: Exact short form match */
        var aExactShort = InputString === aShortForm;
        var bExactShort = InputString === bShortForm;
        if (aExactShort || bExactShort) {
          if (aExactShort && !bExactShort) {
            return -1;
          }
          if (bExactShort && !aExactShort) {
            return 1;
          }
          /* Both match exactly - only prefer classes if search doesn't specify a type */
          if (aExactShort && bExactShort) {
            var searchIsVFB = InputString.indexOf("VFB") === 0;
            var searchIsFBbt = InputString.indexOf("FBbt") === 0;
            var searchIsFBgn = InputString.indexOf("FBgn") === 0;
            if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
              if (aIsClass && !bIsClass) {
                return -1;
              }
              if (bIsClass && !aIsClass) {
                return 1;
              }
            }
          }
        }

        /* Priority 2: Case-insensitive short form match */
        var aCaseInsensitiveShort = InputStringLC === aShortFormLC;
        var bCaseInsensitiveShort = InputStringLC === bShortFormLC;
        if (aCaseInsensitiveShort || bCaseInsensitiveShort) {
          if (aCaseInsensitiveShort && !bCaseInsensitiveShort) {
            return -1;
          }
          if (bCaseInsensitiveShort && !aCaseInsensitiveShort) {
            return 1;
          }
          /* Both match - only prefer classes if search doesn't specify a type */
          if (aCaseInsensitiveShort && bCaseInsensitiveShort) {
            var searchIsVFB = InputString.indexOf("VFB") === 0;
            var searchIsFBbt = InputString.indexOf("FBbt") === 0;
            var searchIsFBgn = InputString.indexOf("FBgn") === 0;
            if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
              if (aIsClass && !bIsClass) {
                return -1;
              }
              if (bIsClass && !aIsClass) {
                return 1;
              }
            }
          }
        }

        // move exact label matches to top
        if (InputString == a.label) {
          return -1;
        }
        if (InputString == b.label) {
          return 1;
        }
        // close match without case matching
        if (InputStringLC == a.label.toLowerCase()) {
          return -1;
        }
        if (InputStringLC == b.label.toLowerCase()) {
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
        // prioritise class terms (FBbt_) over individual terms (VFB_)
        if (aIsClass && !bIsClass) {
          return -1;
        }
        if (bIsClass && !aIsClass) {
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
