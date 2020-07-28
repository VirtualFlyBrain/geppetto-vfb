import React, { Component } from "react";

const controlsMenu = {
  itemOptions: { customArrow: <i className="fa fa-caret-down" /> },
  global: {
    buttonsStyle: {
      standard: {
        background: '#4f4f4f',
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
      list: [
        {
          label: "Show Info",
          icon: "fa fa-info",
          action: { handlerAction: entity => console.log("Show Info ", entity) }
        },
        {
          label: "Select",
          icon: "fa fa-check-circle-o",
          action: { handlerAction: entity => entity.select() }
        },
        {
          label: "Zoom To",
          icon: "fa fa-search-plus",
          action: { handlerAction: entity => GEPPETTO.SceneController.zoomTo([entity]) }
        },
        {
          label: "Show As",
          icon: "",
          action: "",
          position: "right-start",
          list: [
            {
              label: "3D Volume",
              icon: "gpt-shapehide",
              action: {
                handlerAction: "openNewTab",
                parameters: ["http://flybrain.mrc-lmb.cam.ac.uk/si/nblast/www/"]
              }
            }
          ]
        },
        {
          label: "Color",
          icon: "fa fa-tint",
          action: entity => console.log("Color ", entity)
        },
      ]
    }
  ]
};

export default controlsMenu;
