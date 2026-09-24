import { createMuiTheme } from "@material-ui/core/styles";

export const CustomStyle = theme => ({
  dropzoneArea: {
    minHeight: "20vh !important",
    backgroundColor: "#141313 !important",
    borderColor: "#0AB7FE !important",
    color: "rgba(255, 255, 255, 0.7) !important",
  },
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
    backgroundColor: 'transparent',
    color: '#c0c0c0',
  },
  // Dark, to match the rest of the UI (was a white Material dialog).
  paper: {
    backgroundColor: "#1e1e1e",
    border: "2px solid #11bffe",
    // Cookie-consent "Learn More" link: default link blue is unreadable here.
    "& a:not(.vfb-help)": { color: "#11bffe" },
  },
  errorButton : {
    backgroundColor : "#3b1d1d",
    color : "#ff6b6b",
    borderColor : "#ff6b6b",
    "&:hover": {
      backgroundColor: "#3b1d1d",
      color: "#ff6b6b"
    }
  },
  vfbColor : { backgroundColor : "#141313" },
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
      color : "#f1f1f1",
      lineHeight: "26.4px",
      fontFamily: "Barlow Condensed",
    },
    caption: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      color : "#f1f1f1",
      lineHeight: "13.2px",
      fontFamily: "Barlow Condensed",
    },
    h5: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      color : "rgba(255, 255, 255, 0.7)",
      lineHeight: "13.2px",
      fontFamily: "Barlow Condensed",
    }
  },
  palette: {
    type: "dark",
    primary: { main: '#0AB7FE' },
    secondary : { main : "#fff" },
    error : { main : "#ff6b6b" },
    background: { paper: "#1e1e1e", default: "#141313" }
  },
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
      root : { backgroundColor : "#141313" },
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
