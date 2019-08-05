var focusTermConfiguration = {
  global: {
    buttonsStyle: {
      standard: {
        background: '#11bffe',
        backgroundColor: "#11bffe",
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontSize: '19px',
        fontFamily: 'Khand, sans-serif',
        margin: '0px -5px 0px 0px',
        minWidth: '180px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px'
      },
      hover: {
        background: "#11bffe",
        backgroundColor: "#11bffe",
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontSize: '19px',
        fontFamily: 'Khand, sans-serif',
        margin: '0px -5px 0px 0px',
        minWidth: '180px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px'
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
        minWidth: '120px',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
      },
      hover: {
        top: '1px',
        backgroundColor: '#444141f2',
        borderRadius: 0,
        color: '#ffffff',
        fontSize: '12px',
        fontFamily: 'Khand, sans-serif',
        minWidth: '120px',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
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
      }
    }
  },
  buttons: [
    {
      label: "",
      icon: "",
      action: "",
      position: "bottom-start",
      dynamicListInjector: {
        handlerAction: "focusTermHandler",
        parameters: ["undefined"]
      }
    }
  ]
};

module.exports = { focusTermConfiguration };
