import { createMuiTheme } from "@material-ui/core/styles";

export const CustomStyle = theme => ({
  dropzoneArea: { minHeight: "20vh !important" },
  marginTop: { marginTop: "2vh !important" },
  checked: { "&$checked": { color: "#0AB7FE" } },
  dialog: {
    overflowY: 'unset',
    maxWidth: "60vh",
    width: "60vh",
    margin: "0 auto"
  },
  customizedButton: {
    position: 'absolute',
    left: '90%',
    top: '2%',
    backgroundColor: '#F5F5F5',
    color: 'gray',
  },
  errorButton : {
    backgroundColor : "rgba(252, 231, 231, 1)",
    color : "red",
    borderColor : "red",
    "&:hover": {
      backgroundColor: "rgba(252, 231, 231, 1)",
      color: "red"
    }
  },
  vfbColor : { backgroundColor : "#EEF9FF" },
  cookiesBox : {
    width : "100%",
    display : "contents"
  }
})

export const CustomTheme = createMuiTheme({
  typography: {
    h2: {
      fontSize: 22,
      fontWeight: 400,
      fontStyle: "normal",
      color : "#181818",
      lineHeight: "26.4px",
      fontFamily: "Barlow Condensed",
    },
    caption: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      color : "#181818",
      lineHeight: "13.2px",
      fontFamily: "Barlow Condensed",
    },
    h5: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      color : "rgba(0, 0, 0, 0.4)",
      lineHeight: "13.2px",
      fontFamily: "Barlow Condensed",
    }
  },
  palette: { primary: { main: '#0AB7FE' }, secondary : { main : "#fff" }, error : { main : "#ff0000" } },
  overrides: {
    MuiButton: {
      contained: {
        color: "#f1f1f1",
        backgroundColor : "#0AB7FE",
        "&:hover": {
          backgroundColor: "#0AB7FE",
          color: "#f1f1f1"
        },
        "&:disabled": {
          backgroundColor: "rgba(10, 183, 254, .4)",
          color: "#f1f1f1"
        }
      },
      outlined: {
        color: "#0AB7FE",
        borderColor : "#0AB7FE",
        "&:hover": {
          backgroundColor: "#0AB7FE",
          color: "#f1f1f1"
        }
      },
    },
    MuiFilledInput : {
      root : { backgroundColor : "#EEF9FF" },
      input : {
        color : "#0AB7FE !important",
        borderColor : "#0AB7FE !important"
      }
    },
    MuiSelect : { 
      root : { 
        textAlign : "start",
        display : "flex"
      }
    },
    MuiListItemIcon : {
      root : { 
        color : "#0AB7FE",
        padding : "4px"
      }
    }
  }
});
