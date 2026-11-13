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
  /*
   * Left 70%: the viewers on top (Neuroglass selected, 3D and slice viewers
   * behind it) over the Layers list, split 75/25. Right 30%: Term Info with
   * the browsers as tabs behind it.
   */
  layout: {
    "type": "row",
    "weight": 100,
    "children": [
      {
        "type": "row",
        "weight": 70,
        "children": [
          {
            "type": "tabset",
            "weight": 75,
            "selected": 0,
            "children": [
              {
                "type": "tab",
                "name": "Neuroglass Viewer",
                "component": "vfbNeuroglassViewer"
              },
              {
                /*
                 * Rendered even while hidden: VFBMain drives the 3D canvas
                 * from startup, and the scene colours and opacities the
                 * Neuroglass viewer shows are read from it
                 */
                "type": "tab",
                "name": "3D Viewer",
                "component": "canvas",
                "enableRenderOnDemand": false
              },
              {
                "type": "tab",
                "name": "Slice Viewer",
                "component": "sliceViewer",
                "enableRenderOnDemand": false
              }
            ]
          },
          {
            "type": "tabset",
            "weight": 25,
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
          },
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
      }
    ]
  }
};

module.exports = { modelJson };
