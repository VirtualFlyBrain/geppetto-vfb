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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
        minWidth: '110px',
        borderTop: '1px solid #585858',
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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
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
        fontFamily: 'Barlow Condensed, Khand, sans-serif',
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
            parameters: ["listViewerVisible"]
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
          label: "Template ROI Browser",
          icon: "fa fa-indent",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["treeBrowserVisible"]
          }
        },
        {
          label: "Term Context",
          icon: "fas fa-project-diagram",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["graphVisible"]
          }
        },
        {
          label: "Circuit Browser",
          icon: "fa fa-cogs",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["circuitBrowserVisible"]
          }
        },
        {
          label: "Download Contents",
          icon: "fa fa-download",
          action: {
            handlerAction: "downloadContentsVisible",
            parameters: []
          }
        },
        {
          label: "NBLAST",
          icon: "",
          action: "",
          position: "right-start",
          list: [
            {
              label: "What is NBLAST?",
              icon: "",
              trailerIcon: "fa fa-external-link",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://flybrain.mrc-lmb.cam.ac.uk/si/nblast/www/"]
              }
            },
            {
              label: "NBLAST against your own data",
              icon: "",
              trailerIcon: "fa fa-external-link",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://nblast.virtualflybrain.org:8080/NBLAST_on-the-fly/?gal4_n=10&all_use_mean=F&all_query=&tab=One%20against%20all&gal4_query="]
              }
            }
          ]
        },
        {
          label: "CATMAID",
          icon: "",
          action: "",
          position: "right-start",
          list: [
            {
              label: "What is CATMAID?",
              icon: "",
              trailerIcon: "fa fa-external-link",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://catmaid.readthedocs.io/"]
              }
            },
            {
              label: "Hosted EM Data",
              icon: "",
              position: "right-start",
              action: {
                handlerAction: "submenu",
                parameters: ["undefinedAction"]
              },
              list: [
                {
                  label: "Adult Brain (FAFB)",
                  icon: "",
                  trailerIcon: "fa fa-external-link",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://fafb.catmaid.virtualflybrain.org/?pid=1&zp=65720&yp=160350.0517811483&xp=487737.6942783438&tool=tracingtool&sid0=1&s0=3.1999999999999993&help=true&layout=h(XY,%20%7B%20type:%20%22neuron-search%22,%20id:%20%22neuron-search-1%22,%20options:%20%7B%22annotation-name%22:%20%22Published%22%7D%7D,%200.6)"]
                  }
                },
                {
                  label: "Adult VNC (FANC)",
                  icon: "",
                  trailerIcon: "fa fa-external-link",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://fanc.catmaid.virtualflybrain.org/?pid=1&zp=55260&yp=512482.5999999994&xp=173092.19999999998&tool=tracingtool&sid0=1&s0=9&help=true&layout=h(XY,%20%7B%20type:%20%22neuron-search%22,%20id:%20%22neuron-search-1%22,%20options:%20%7B%22annotation-name%22:%20%22publication%22%7D%7D,%200.6)"]
                  }
                },
                {
                  label: "Larval (L1EM)",
                  icon: "",
                  trailerIcon: "fa fa-external-link",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://l1em.catmaid.virtualflybrain.org/?pid=1&zp=108250&yp=82961.59999999999&xp=54210.799999999996&tool=tracingtool&sid0=1&s0=2.4999999999999996&help=true&layout=h(XY,%20%7B%20type:%20%22neuron-search%22,%20id:%20%22neuron-search-1%22,%20options:%20%7B%22annotation-name%22:%20%22papers%22%7D%7D,%200.6)"]
                  }
                }
              ]
            },
            {
              label: "APIs",
              icon: "",
              position: "right-start",
              action: {
                handlerAction: "submenu",
                parameters: ["undefinedAction"]
              },
              list: [
                {
                  label: "Adult Brain (FAFB)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://fafb.catmaid.virtualflybrain.org/apis/"]
                  }
                },
                {
                  label: "Adult VNC (FANC)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://fanc.catmaid.virtualflybrain.org/apis/"]
                  }
                },
                {
                  label: "Larval (L1EM)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["https://l1em.catmaid.virtualflybrain.org/apis/"]
                  }
                }
              ]
            }
          ]
        },
        {
          label: "VFB CONNECT (API)",
          icon: "",
          action: "",
          position: "right-start",
          list: [
            {
              label: "Python (PyPi)",
              icon: "",
              trailerIcon: "fa fa-external-link",
              action: {
                handlerAction: "openNewTab",
                parameters: ["https://pypi.org/project/vfb-connect/"]
              }
            },
            {
              label: "R wrapper",
              icon: "",
              trailerIcon: "fa fa-external-link",
              action: {
                handlerAction: "openNewTab",
                parameters: ["https://github.com/jefferis/vfbconnectr"]
              }
            }
          ]
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
              label: "Adult Brain Unisex (JRC2018U)",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00101567"]
              }
            },
            {
              label: "Adult VNC Unisex (JRC2018VU)",
              icon: "",
              action: {
                handlerAction: "openNewTab",
                parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00200000"]
              }
            },
            {
              label: "Other",
              icon: "",
              position: "right-start",
              action: {
                handlerAction: "submenu",
                parameters: ["undefinedAction"]
              },
              list: [
                {
                  label: "Adult Head (McKellar)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00110000"]
                  }
                },
                {
                  label: "Adult Brain (JFRC2/2010)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00017894"]
                  }
                },
                {
                  label: "Adult VNS (Court2017)",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00100000"]
                  }
                },
                {
                  label: "Janelia FlyEM HemiBrain",
                  icon: "",
                  action: {
                    handlerAction: "openNewTab",
                    parameters: ["/org.geppetto.frontend/geppetto?i=VFB_00101384"]
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
      label: "Datasets",
      icon: "",
      action: "",
      position: "bottom-start",
      list: [
        {
          label: "All Available Datasets",
          icon: "",
          action: {
            handlerAction: "triggerRunQuery",
            parameters: ["AllDatasets,VFB_00017894,adult brain template JFRC2"]
          }
        },
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
              label: "Adult Brain Unisex (JRC2018U)",
              icon: "",
              action: {
                handlerAction: "triggerRunQuery",
                parameters: ["AlignedDatasets,VFB_00101567,adult brain unisex JRC2018U"]
              }
            },
            {
              label: "Adult VNC Unisex (JRC2018VU)",
              icon: "",
              action: {
                handlerAction: "triggerRunQuery",
                parameters: ["AlignedDatasets,VFB_00200000,adult VNC unisex JRC2018VU"]
              }
            },
            {
              label: "Other",
              icon: "",
              position: "right-start",
              action: {
                handlerAction: "submenu",
                parameters: ["undefinedAction"]
              },
              list: [
                {
                  label: "Adult Head (McKellar)",
                  icon: "",
                  action: {
                    handlerAction: "triggerRunQuery",
                    parameters: ["AlignedDatasets,VFB_00110000,adult head template McKellar"]
                  }
                },
                {
                  label: "Adult Brain (JFRC2/2010)",
                  icon: "",
                  action: {
                    handlerAction: "triggerRunQuery",
                    parameters: ["AlignedDatasets,VFB_00017894,adult brain template JFRC2"]
                  }
                },
                {
                  label: "Adult VNS",
                  icon: "",
                  action: {
                    handlerAction: "triggerRunQuery",
                    parameters: ["AlignedDatasets,VFB_00100000,adult VNS template"]
                  }
                },
                {
                  label: "Janelia FlyEM HemiBrain",
                  icon: "",
                  action: {
                    handlerAction: "triggerRunQuery",
                    parameters: ["AlignedDatasets,VFB_00101384,Janelia FlyEM HemiBrain"]
                  }
                },
                {
                  label: "Ito Half Brain",
                  icon: "",
                  action: {
                    handlerAction: "triggerRunQuery",
                    parameters: ["AlignedDatasets,VFB_00030786,Ito Half Brain"]
                  }
                }
              ]
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
                handlerAction: "triggerRunQuery",
                parameters: ["AlignedDatasets,VFB_00050000,L1 CNS"]
              }
            },
            {
              label: "L3 CNS (Wood2018)",
              icon: "",
              action: {
                handlerAction: "triggerRunQuery",
                parameters: ["AlignedDatasets,VFB_00049000,L3 CNS"]
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
          trailerIcon: "fa fa-external-link",
          action: {
            handlerAction: "openNewTab",
            parameters: ["https://groups.google.com/forum/embed/?place=forum/vfb-suport#!forum/vfb-suport"]
          }
        },
        {
          label: "Support Forum",
          icon: "",
          trailerIcon: "fa fa-external-link",
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
        },
        {
          label: "Quick Help",
          icon: "fa fa-question",
          action: {
            handlerAction: "UIElementHandler",
            parameters: ["quickHelpVisible"]
          }
        }
      ]
    }
  ]
};

module.exports = { toolbarMenu };
