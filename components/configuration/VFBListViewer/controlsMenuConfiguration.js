import React from "react";

const controlsMenuConf = {
  itemOptions: { customArrow: <i style={ { float : "right" } } className="fa fa-caret-right" /> },
  global: {
    buttonsStyle: {
      standard: {
        background: 'rgb(53, 51, 51)',
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
      label: "",
      icon: "fa fa-eye",
      action: "",
      position: "bottom-start",
      caret : {
        show : true, 
        icon : "fa fa-caret-down"
      },      
      list: [
        {
          label: "Show Info",
          icon: "fa fa-info",
          action: entity => console.log("Show Info ", entity)
        },
        {
          toggle : {
            condition : entity => entity.isSelected(),
            options : {
              false : {
                label: "Select",
                icon: "fa fa-check-circle-o",
                action: entity => entity.select() 
              },
              true : {
                label: "Unselect",
                icon: "fa fa-check-circle",
                action: entity => entity.deselect() 
              }
            }
          }
        },
        {
          toggle : {
            condition : entity => entity.isVisible(),
            options : {
              false : {
                label: "Show",
                icon: "fa fa-eye",
                action: entity => entity.show() 
              },
              true : {
                label: "Hide",
                icon: "fa fa-eye-slash",
                action: entity => entity.hide() 
              }
            }
          }
        },
        {
          label: "Zoom To",
          icon: "fa fa-search-plus",
          action: entity => GEPPETTO.SceneController.zoomTo([entity])
        },
        {
          label: "Show As",
          icon: "",
          action: "",
          position: "right-start",
          list: [
            {
              toggle : {
                condition : entity => entity.isVisible(),
                options : {
                  false : {
                    label: "Show 3D Volume",
                    icon: "gpt-shapeshow",
                    action: entity => {
                      entity.show()
                    }
                  },
                  true : {
                    label: "Hide 3D Volume",
                    icon: "gpt-shapehide",
                    action: entity => {
                      entity.hide()
                    }
                  }
                }
              }
            },
          ]
        },
        {
          label: "Color",
          icon: "fa fa-tint",
          action: entity => entity => console.log("Color ", entity)
        },
      ]
    }
  ]
};

export default controlsMenuConf;