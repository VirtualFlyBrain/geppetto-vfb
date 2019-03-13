var modelJson = {
    global: {
        tabEnableClose: true,
        sideBorders: 8
    },
    borders: [
        {
            "type": "border",
            "location": "bottom",
            "size": 100,
            "children": [],
            "barSize": 35
        }
    ],
    layout: {
        "type": "row",
        "weight": 100,
        "children": [
            {
                "type": "row",
                "weight": 55,
                "selected": 0,
                "children": [
                    {
                        "type": "tabset",
                        "weight": 36,
                        "children": [
                            {
                                "type": "tab",
                                "name": "Slice Viewer",
                                "component": "sliceViewer"
                            }
                        ]
                    },
                    {
                        "type": "tabset",
                        "weight": 64,
                        "children": [
                            {
                                "type": "tab",
                                "name": "3D Viewer",
                                "component": "canvas"
                            }
                        ]
                    }
                ]
            },
            {
                "type": "tabset",
                "weight": 45,
                "selected": 0,
                "children": [
                    {
                        "type": "tab",
                        "name": "Info",
                        "component": "termInfo"
                    }
                ]
            },
        ]
    }
};

module.exports = {
    modelJson
};