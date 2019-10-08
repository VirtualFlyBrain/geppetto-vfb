var toolbarMenu = {
  global: {
    buttonsStyle: {
      standard: {
        background: '#010101',
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Khand, sans-serif',
        margin: '0px 0px 0px 0px',
        minWidth: '44px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px',
        fontWeight: '300'
      },
      hover: {
        background: "#11bffe",
        backgroundColor: "#11bffe",
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Khand, sans-serif',
        margin: '0px 0px 0px 0px',
        minWidth: '44px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px',
        fontWeight: '300'
      }
    },
    drawersStyle: {
      standard: {
        top: '1px',
        backgroundColor: '#444141f2',
        borderRadius: 0,
        color: '#ffffff',
        fontSize: '12px',
        fontFamily: 'Khand, sans-serif',
        minWidth: '110px',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
        fontWeight: '300'
      },
      hover: {
        top: '1px',
        backgroundColor: '#444141f2',
        borderRadius: 0,
        color: '#ffffff',
        fontSize: '12px',
        fontFamily: 'Khand, sans-serif',
        minWidth: '110px',
        borderTop: '1px solid #585858',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
        fontWeight: '300',
      }
    },
    labelsStyle: {
      standard: {
        backgroundColor: '#44414112',
        borderRadius: 0,
        color: '#ffffff',
        fontSize: '14px',
        fontFamily: 'Khand, sans-serif',
        paddingTop: 0,
        paddingBottom: 0,
        fontWeight: '300',
        minHeight: '30px',
        height: '30px'
      },
      hover: {
        background: "#11bffe",
        backgroundColor: "#11bffe",
        borderRadius: 0,
        color: '#ffffff',
        fontSize: '14px',
        fontFamily: 'Khand, sans-serif',
        paddingTop: 0,
        paddingBottom: 0,
        fontWeight: '300',
        minHeight: '30px',
        height: '30px'
      }
    }
  },
  buttons: [
    {
      label: "Virtual Fly Brain",
      icon: "",
      action: "",
      position: "bottom-start",
      list: [
        {
          label: "About",
          icon: "",
          action: {
            handlerAction: "clickAbout",
            parameters: []
          }
        },
        {
          label: "Contribute",
          icon: "",
          action: {
            handlerAction: "clickContribute",
            parameters: []
          }
        },
        {
          label: "Feedback",
          icon: "",
          action: {
            handlerAction: "clickFeedback",
            parameters: []
          }
        },
        {
          label: "Social media",
          icon: "",
          position: "right-start",
          action: {
            handlerAction: "submenu",
            parameters: ["undefinedAction"]
          },
          list: [
            {
              label: "Twitter",
              icon: "fa fa-twitter",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://twitter.com/virtualflybrain"]
              }
            },
            {
              label: "Facebook",
              icon: "fa fa-facebook",
              action: {
                handlerAction: "openNewTab",
                parameters: ["https://www.facebook.com/pages/Virtual-Fly-Brain/131151036987118"]
              }
            },
            {
              label: "Blog",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["https://virtualflybrain.tumblr.com/"]
              }
            },
            {
              label: "Rss",
              icon: "fa fa-rss",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://blog.virtualflybrain.org/rss"]
              }
            }
          ]
        }
      ]
    },
    {
      label: "Tools",
      icon: "",
      action: "",
      position: "bottom-start",
      list: [
        {
          label: "Search",
          icon: "fa fa-search",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["spotlightVisible"]
          }
        },
        {
          label: "Query",
          icon: "fa fa-quora",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["queryBuilderVisible"]
          }
        },
        {
          label: "Layers",
          icon: "fa fa-list",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["controlPanelVisible"]
          }
        },
        {
          label: "Term Info",
          icon: "fa fa-info",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["termInfoVisible"]
          }
        },
        {
          label: "3D Viewer",
          icon: "fa fa-cube",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["canvasVisible"]
          }
        },
        {
          label: "Slice Viewer",
          icon: "fa fa-sliders",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["sliceViewerVisible"]
          }
        },
        {
          label: "Tree Browser",
          icon: "fa fa-tree",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["treeBrowserVisible"]
          }
        }
      ]
    },
    {
      label: "History",
      icon: "",
      action: "",
      position: "bottom-start",
      dynamicListInjector: {
        handlerAction: "historyMenuInjector",
        parameters: ["undefined"]
      }
    },
    {
      label: "Templates",
      icon: "",
      action: "",
      position: "bottom-start",
      list: [
        {
          label: "Adult",
          icon: "",
          position: "right-start",
          action: {
            handlerAction: "submenu",
            parameters: ["undefinedAction"]
          },
          list: [
            {
              label: "Adult Brain (JFRC2)",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00017894"]
              }
            },
            {
              label: "Adult VNS",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00100000"]
              }
            },
            {
              label: "Ito Half Brain",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00030786"]
              }
            }
          ]
        },
        {
          label: "Larval",
          icon: "",
          position: "right-start",
          action: {
            handlerAction: "submenu",
            parameters: ["undefinedAction"]
          },
          list: [
            {
              label: "L1 CNS (ssTEM)",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00050000"]
              }
            },
            {
              label: "L3 CNS (Wood2018)",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00049000"]
              }
            }
          ]
        }
      ]
    },
    {
      label: "Help",
      icon: "",
      action: "",
      position: "bottom-start",
      list: [
        {
          label: "F.A.Q.",
          icon: "",
          action: {
            handlerAction: "openNewTab",
            parameters: ["http://www.virtualflybrain.org/site/vfb_site/faq.htm"]
          }
        },
        {
          label: "Support Forum",
          icon: "",
          action: {
            handlerAction: "openNewTab",
            parameters: ["https://groups.google.com/forum/#!forum/vfb-suport"]
          }
        },
        {
          label: "Report an issue",
          icon: "",
          action: {
            handlerAction: "clickFeedback",
            parameters: []
          }
        }
      ]
    }
  ]
};

module.exports = { toolbarMenu };
