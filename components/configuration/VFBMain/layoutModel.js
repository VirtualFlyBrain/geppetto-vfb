var modelJson = {
  global: {
    tabEnableClose: true,
    sideBorders: 8,
    tabSetHeaderHeight: 26,
    tabSetTabStripHeight: 26
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
            "name": "Term Info",
            "component": "termInfo"
          },
          {
            "type": "tab",
            "name": "Template ROI Browser",
            "component": "treeBrowser"
          },
          {
            "type": "tab",
            "name": "Term Context",
            "component": "vfbGraph"
          },
          {
            "type": "tab",
            "name": "Layers",
            "component": "vfbListViewer"
          },
          {
            "type": "tab",
            "name": "Circuit Browser",
            "component": "vfbCircuitBrowser"
          }
        ]
      }
    ]
  }
};

module.exports = { modelJson };
