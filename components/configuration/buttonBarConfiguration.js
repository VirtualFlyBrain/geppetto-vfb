var buttonBarConfig = {
    "spotlightVisible": {
        "icon": "fa fa-search",
        "label": "",
        "tooltip": "Search"
    },
    "queryBuilderVisible": {
        "icon": "fa fa-quora",
        "label": "",
        "tooltip": "Open Query"
    },
    "controlPanelVisible": {
        "icon": "fa fa-list",
        "label": "",
        "tooltip": "Layers"
    },
    "wireframeVisible": {
        "condition": "false",
        "false": {
            "icon": "gpt-sphere_solid",
            "label": "",
            "tooltip": "Show wireframe"
        },
        "true": {
            "icon": "gpt-sphere_wireframe-jpg",
            "label": "",
            "tooltip": "Hide wireframe"
        }
    }
};

module.exports = {
    buttonBarConfig
};