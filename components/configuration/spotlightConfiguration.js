var spotlightConfig = {
    "SpotlightBar": {
        "DataSources": {},
        "CompositeType": {
            "type": {
                "actions": [
                    "window.setTermInfo($variableid$['$variableid$' + '_meta'],'$variableid$'); $(\"#spotlight\").hide();",
                ],
                "icon": "fa-info-circle",
                "label": "Show info",
                "tooltip": "Show info"
            },
            "query": {
                actions: [
                    "window.fetchVariableThenRun('$variableid$', window.addToQueryCallback);"
                ],
                icon: "fa-quora",
                label: "Add to query",
                tooltip: "Add to query"
            },
        },
        "VisualCapability": {
            "buttonOne": {
                "condition": "GEPPETTO.SceneController.isSelected($instances$)",
                "false": {
                    "actions": ["GEPPETTO.SceneController.select($instances$)"],
                    "icon": "fa-hand-stop-o",
                    "label": "Unselected",
                    "tooltip": "Select"
                },
                "true": {
                    "actions": ["GEPPETTO.SceneController.deselect($instances$)"],
                    "icon": "fa-hand-rock-o",
                    "label": "Selected",
                    "tooltip": "Deselect"
                },
            },
            "buttonTwo": {
                "condition": "GEPPETTO.SceneController.isVisible($instances$)",
                "false": {
                    "actions": [
                        "GEPPETTO.SceneController.show($instances$)"
                    ],
                    "icon": "fa-eye-slash",
                    "label": "Hidden",
                    "tooltip": "Show"
                },
                "true": {
                    "actions": [
                        "GEPPETTO.SceneController.hide($instances$)"
                    ],
                    "icon": "fa-eye",
                    "label": "Visible",
                    "tooltip": "Hide"
                }

            },
            "buttonThree": {
                "actions": [
                    "GEPPETTO.SceneController.zoomTo($instances$);$(\"#spotlight\").hide();"
                ],
                "icon": "fa-search-plus",
                "label": "Zoom",
                "tooltip": "Zoom"
            },
        }
    }
};

module.exports = {
    spotlightConfig
};
