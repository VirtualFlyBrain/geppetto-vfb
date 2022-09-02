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
        "weight": 40,
        "selected": 0,
        "children": [
          {
            "type": "tabset",
            "weight": 40,
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
            "weight": 60,
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
        "type": "row",
        "weight": 30,
        "selected": 0,
        "children": [
          {
            "type": "tabset",
            "weight": 60,
            "selected": 0,
            "children": [
              {
                "type": "tab",
                "name": "Template ROI Browser",
                "component": "treeBrowser"
              },
              {
                "type": "tab",
                "name": "Circuit Browser",
                "component": "vfbCircuitBrowser"
              },
              {
                "type": "tab",
                "name": "Term Context",
                "component": "vfbGraph"
              }
            ]
          },
          {
            "type": "tabset",
            "weight": 40,
            "children": [
              {
                "type": "tab",
                "name": "Layers",
                "component": "vfbListViewer"
              }
            ]
          }
        ]
      },
      {
        "type": "tabset",
        "weight": 30,
        "selected": 0,
        "children": [
          {
            "type": "tab",
            "name": "Term Info",
            "component": "termInfo"
          }
        ]
      }
    ]
  }
};

module.exports = { modelJson };
