var focusTermConfiguration = {
  global: {
    buttonsStyle: {
      standard: {
        background: '#191919',
        backgroundColor: "#191919",
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        margin: '0px -5px 0px 0px',
        minWidth: '400px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px',
        fontSize: '15px',
        fontWeight: '300'
      },
      hover: {
        background: "#11bffe",
        backgroundColor: "#11bffe",
        borderRadius: 0,
        border: 0,
        boxShadow: '0px 0px',
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        margin: '0px -5px 0px 0px',
        minWidth: '400px',
        height: '30px',
        textTransform: 'capitalize',
        textAlign: 'left',
        justifyContent: 'start',
        marginTop: '1px',
        fontSize: '15px',
        fontWeight: '300'
      }
    },
    drawersStyle: {
      standard: {
        top: '1px',
        backgroundColor: '#191919',
        borderRadius: 0,
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        minWidth: '120px',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderTop: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
        fontSize: '15px',
        fontWeight: '300'
      },
      hover: {
        top: '1px',
        backgroundColor: '#11bffe',
        borderRadius: 0,
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        minWidth: '120px',
        borderLeft: '1px solid #585858',
        borderRight: '1px solid #585858',
        borderBottom: '1px solid #585858',
        borderTop: '1px solid #585858',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '2px',
        fontSize: '15px',
        fontWeight: '300'
      }
    },
    labelsStyle: {
      standard: {
        backgroundColor: '#191919',
        borderRadius: 0,
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        paddingTop: 0,
        paddingBottom: 0,
        fontSize: '15px',
        fontWeight: '300'
      },
      hover: {
        background: "#11bffe",
        backgroundColor: "#11bffe",
        borderRadius: 0,
        color: '#ffffff',
        fontFamily: 'Khand, sans-serif',
        paddingTop: 0,
        paddingBottom: 0,
        fontSize: '15px',
        fontWeight: '300'
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
