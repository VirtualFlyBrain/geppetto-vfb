import customSorter from '../VFBMain';

var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");

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
        "customComponent": GEPPETTO.QueryLinkComponent,
        "actions": "window.addVfbId('$entity$');",
        "displayName": "Name",
        "cssClassName": "query-results-name-column",
    },
    {
        "columnName": "description",
        "order": 3,
        "locked": false,
        "visible": true,
        "displayName": "Definition",
        "cssClassName": "query-results-description-column"
    },
    {
        "columnName": "type",
        "order": 4,
        "locked": false,
        "visible": true,
        "displayName": "Type",
        "cssClassName": "query-results-type-column"
    },
    {
        "columnName": "controls",
        "order": 5,
        "locked": false,
        "visible": false,
        "customComponent": GEPPETTO.QueryResultsControlsComponent,
        "displayName": "Controls",
        "actions": "",
        "cssClassName": "query-results-controls-column"
    },
    {
        "columnName": "images",
        "order": 6,
        "locked": false,
        "visible": true,
        "customComponent": GEPPETTO.SlideshowImageComponent,
        "displayName": "Images",
        "actions": "window.addVfbId('$entity$');",
        "cssClassName": "query-results-images-column"
    },
    {
        "columnName": "score",
        "order": 7,
        "locked": false,
        "visible": true,
        "displayName": "Score",
        "cssClassName": "query-results-score-column"
    }
];

// which columns to display in the results
var queryResultsColumns = ['name', 'description', 'type', 'images', 'score'];

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
        },
        "flybase": {
            "showCondition": "('$ID$'.startsWith('FB') && !'$ID$'.startsWith('FBbt'))",
            "id": "flybase",
            "actions": [
                "window.open('http://flybase.org/reports/' + '$ID$'.replace(/_/g, ':'), '_blank').focus()"
            ],
            "icon": "gpt-fly",
            "label": "FlyBase",
            "tooltip": "FlyBase Report"
        }
    }
};

// add datasource config to query control
var queryBuilderDatasourceConfig = {
    VFB: {
        url: "https://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&rows=250&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E100.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", crossDomain: true,
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
            }.bind(this),
            queryTokenizer: function (q) {
                return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
            }.bind(this),
            sorter: function (a, b) {
                var term = $("#query-typeahead").val();
                return customSorter(a, b, term);
            }.bind(this)
        }
    }
};

module.exports = {
    queryResultsColMeta,
    queryResultsColumns,
    queryResultsControlConfig,
    queryBuilderDatasourceConfig
};
