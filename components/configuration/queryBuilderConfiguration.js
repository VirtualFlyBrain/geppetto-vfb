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
        "actions": "window.addVfbId('$entity$');$(\"#querybuilder\").hide();",
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

module.exports = {
    queryResultsColMeta,
    queryResultsColumns,
    queryResultsControlConfig
};
