import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import CircularProgress from '@material-ui/core/CircularProgress';
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Checkbox, Divider, IconButton } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import axios from "axios";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import NRRDIcon from "../../configuration/VFBDownloadContents/nrrd.png";
import OBJIcon from "../../configuration/VFBDownloadContents/obj.png";
import SWCIcon from "../../configuration/VFBDownloadContents/swc.png";
import ReferenceIcon from "../../configuration/VFBDownloadContents/reference.png";
import CloseIcon from "@material-ui/icons/Close";
import { connect } from "react-redux";

const iconsMap = {
  obj: OBJIcon,
  swc: SWCIcon,
  reference: ReferenceIcon,
  nrrd: NRRDIcon,
};

const ALL_INSTANCES = { id: "ALL_INSTANCES", name: "All Instances" };

const styles = theme => ({
  downloadButton: { backgroundColor: "#0AB7FE", color: "white !important" },
  downloadErrorButton: { backgroundColor: "#FCE7E7", color: "#E53935", border : "1px solid #E53935" },
  error: { color: "#E53935" },
  errorMessage: { wordWrap: "break-word" },
  downloadButtonText: { color: "white !important" },
  checkedBox: { borderColor: "#0AB7FE" },
  footer: { backgroundColor: "#EEF9FF" },
  errorFooter: { backgroundColor: "#FCE7E7" },
  listItemText: { fontSize: "1em" },
  customizedButton: {
    position: "absolute",
    left: "95%",
    top: "2%",
    backgroundColor: "#F5F5F5",
    color: "gray",
  },
  dialog: {
    overflow: "unset",
    margin: "0 auto",
  },
  dialogContent: { overflow: "hidden" },
  checked: { "&$checked": { color: "#0AB7FE" } },
  "@global": {
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label": { backgroundColor: "white" },
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label:hover, .MuiTreeItem-root.Mui-selected:focus > .MuiTreeItem-content .MuiTreeItem-label": { backgroundColor: "white" }
  },
});

const theme = createMuiTheme({
  typography: {
    h2: {
      fontSize: 22,
      fontWeight: 400,
      fontStyle: "normal",
      lineHeight: "26.4px",
      color: "#181818",
      fontFamily: "Barlow",
    },
    h5: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      lineHeight: "13.2px",
      fontFamily: "Barlow",
      color: "rgba(0, 0, 0, 0.54)",
    },
    subtitle2: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      lineHeight: "13.2px",
      fontFamily: "Barlow",
      color: "rgba(0, 0, 0, 0.24)",
    },
    error: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "normal",
      lineHeight: "13.2px",
      fontFamily: "Barlow",
      color: "#E53935",
    },
    button: {
      fontSize: 11,
      fontWeight: 600,
      fontStyle: "normal",
      lineHeight: "13.2px",
      fontFamily: "Barlow",
      color: "#0AB7FE",
    },
  },
  Button: {
    "&:hover": {
      backgroundColor: "#0AB7FE",
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: "#0AB7FE",
    },
  },
});

/**
 * Component to download files contents
 */
class VFBDownloadContents extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      typesChecked: [],
      downloadError: false,
      downloading: false,
      selectedVariables: [],
      allVariablesSelectedFlag: false,
      errorMessage : ""
    };

    this.configuration = require("../../configuration/VFBDownloadContents/configuration");
    this.configurationOptions = this.configuration.options;
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handleTypeSelection = this.handleTypeSelection.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.extractVariableFileMeta = this.extractVariableFileMeta.bind(this);
    this.getAllLoadedVariables = this.getAllLoadedVariables.bind(this);
    this.requestZipDownload = this.requestZipDownload.bind(this);
    this.getVariableById = this.getVariableById.bind(this);
    this.toggleVariable = this.toggleVariable.bind(this);
    this.variables = [ALL_INSTANCES];
  }

  handleCloseDialog () {
    this.setState({ open: false });
  }

  openDialog () {
    this.variables = this.getAllLoadedVariables();
    this.setState({
      open: true,
      downloadError : false,
      downloading : false,
      downloadEnabled : this.state.typesChecked.length > 0 && this.state.selectedVariables.length > 0 
    });
  }

  handleDownload () {
    if ( this.state.downloading ) { 
      return;
    }

    let json = { entries: [] };

    this.state.selectedVariables.map( variable => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });

    json.entries.length > 0 ? this.requestZipDownload(json) : this.setState({ downloadError : true, errorMessage : this.configuration.text.noEntriesFound });
  }

  /**
   * Extract filemeta from geppetto model, using variable id to find it
   */
  extractVariableFileMeta (variable) {
    let filemetaText = variable.filemeta?.values[0]?.value?.text;
    filemetaText = filemetaText?.replace(/'/g, '"');

    const filemetaObject = JSON.parse(filemetaText);
    let filesArray = [];

    this.state.typesChecked.map( check => {
      filemetaObject[check] 
        && filesArray.push({
          Url: filemetaObject[check]?.url,
          ZipPath: filemetaObject[check]?.local,
        });
    });

    return filesArray;
  }

  /**
   * Get array of all loaded variables in application
   */
  getAllLoadedVariables () {
    let entities = GEPPETTO.ModelFactory.allPaths;
    var visuals = [];

    for (var i = 0; i < entities.length; i++) {
      if ( entities[i].metaType === "VisualType" || entities[i].metaType === "CompositeVisualType" ) {
        const variable = entities[i]?.path?.split(".")[0];
        const instance = window.Instances[variable];
        const filemeta = instance[variable + "_meta"]?.variable?.types[0]?.filemeta;
        visuals.push({ id: variable, name: instance?.name, filemeta: filemeta });
      }
    }

    return visuals;
  }

  /**
   * Make axios call to download the zip
   */
  requestZipDownload (jsonRequest) {
    let self = this;

    this.setState({ downloading: true, downloadEnabled : false });
    // Axios HTTP Post request with post query
    axios({
      method: "post",
      url: this.configuration.postURL,
      headers: { "content-type": this.configuration.contentType },
      data: jsonRequest,
      responseType: "arraybuffer",
    })
      .then(function (response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", self.configuration.zipName);
        document.body.appendChild(link);
        link.click();
        setTimeout(
          () =>
            self.setState({
              downloading: false,
              open: false,
              downloadEnabled : true
            }),
          500
        );
      })
      .catch(function (error) {
        self.setState({
          downloadError: true,
          downloading: false,
          errorMessage : this.props.classes.errorMessage
        });
      });
  }

  /**
   * Handle checkbox selection of different types to download
   */
  handleTypeSelection (value) {
    const currentIndex = this.state.typesChecked.indexOf(value);
    const newTypesChecked = [...this.state.typesChecked];

    if (currentIndex === -1) {
      newTypesChecked.push(value);
    } else {
      newTypesChecked.splice(currentIndex, 1);
    }

    this.setState({ typesChecked: newTypesChecked, downloadEnabled : newTypesChecked.length > 0 && this.state.selectedVariables.length > 0 });
  }

  /**
   * Get variable by id, trigger by checkbox selection of variables
   */
  getVariableById (nodes, id) {
    let variablesMatched = [];

    if (id === ALL_INSTANCES.id) {
      variablesMatched = nodes;
    } else {
      nodes.forEach(node => {
        if (node.id === id) {
          variablesMatched.push(node);
        }
      });
    }

    return variablesMatched;
  }

  /**
   * Toggle variable selection from checklist
   */
  toggleVariable (checked, node) {
    const allNode = this.getVariableById(this.variables, node.id);
    let updatedVariables = checked
      ? [...this.state.selectedVariables, ...allNode]
      : this.state.selectedVariables.filter(
        value => !allNode.find( node => node.id === value.id )
      );

    updatedVariables = updatedVariables.filter((v, i) => updatedVariables.indexOf(v) === i);
    
    this.setState({
      selectedVariables: updatedVariables,
      allVariablesSelectedFlag: updatedVariables.length > 0,
      downloadEnabled : this.state.typesChecked.length > 0 && updatedVariables.length > 0
    });
  }

  render () {
    let self = this;
    const { idsMap } = this.props;
    this.variables = this.getAllLoadedVariables();
    
    return (
      <ThemeProvider theme={theme}>
        <Dialog
          open={this.state.open}
          onClose={this.handleCloseDialog}
          aria-labelledby="max-width-dialog-title"
          classes={{ root: self.props.classes.dialog }}
          id="downloadContents"
        >
          <DialogTitle
            id="max-width-dialog-title"
            align="center"
            onClose={this.handleCloseDialog}
          >
            <Typography variant="h2">{this.configuration.text.title}</Typography>
          </DialogTitle>
          <DialogContent key="dialog-contents" classes={{ root: self.props.classes.dialogContent }}>
            { !this.state.downloadError ? (
              <Grid container textAlign="center" spacing={2}>
                <Grid item xs={12}>
                  <Typography align="left" variant="subtitle2">
                    {this.configuration.text.typesSubtitle}
                  </Typography>
                </Grid>
                <Grid container textAlign="center" spacing={2}>
                  {Object.keys(this.configurationOptions).map(key => {
                    const option = this.configurationOptions[key];
                    const labelId = `checkbox-list-secondary-label-${key}`;
                    return (
                      <Grid item xs={3}>
                        <Tooltip title={ <h6>{`${option.tooltip}`}</h6> } classes={ { popper: "light" } } placement="top-start" arrow>
                          <Box
                            textAlign="center"
                            className={
                              this.state.typesChecked.indexOf(key) !== -1
                                ? self.props.classes.checkedBox
                                : null
                            }
                            p={2}
                            border={1}
                            borderColor="#E5E5E5"
                            key={option.label}
                          >
                            <img src={iconsMap[key]} alt="" />
                            <Typography
                              align="center"
                              variant="h5"
                              id={labelId}
                            >
                              {`${option.label}`}
                            </Typography>
                            <Checkbox
                              onChange={() => self.handleTypeSelection(key)}
                              checked={this.state.typesChecked.indexOf(key) !== -1}
                              inputProps={{ "aria-labelledby": labelId }}
                              disabled={this.state.downloading}
                              disableRipple
                              className={self.props.classes.checked}
                              id={option.id}
                            />
                          </Box>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Divider fullWidth />
                  {this.variables.length > 0 ? (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">
                          {this.configuration.text.variablesSubtitle}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TreeView
                          defaultCollapseIcon={<ExpandMoreIcon />}
                          defaultExpanded={[ALL_INSTANCES.id]}
                          defaultExpandIcon={<ChevronRightIcon />}
                        >
                          <TreeItem
                            key={ALL_INSTANCES.id}
                            nodeId={ALL_INSTANCES.id}
                            label={
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onClick={e => e.stopPropagation()}
                                    checked={self.state.allVariablesSelectedFlag}
                                    onChange={event =>
                                      self.toggleVariable(
                                        event.currentTarget.checked,
                                        ALL_INSTANCES
                                      )
                                    }
                                    disableRipple
                                    className={self.props.classes.checked}
                                    id={ALL_INSTANCES.id}
                                  />
                                }
                                label={
                                  <Typography variant="h5">
                                    {ALL_INSTANCES.name}
                                  </Typography>
                                }
                                key={ALL_INSTANCES.id}
                              />
                            }
                          >
                            {this.variables.map(node => (
                              <TreeItem
                                key={node.id}
                                nodeId={node.id}
                                label={
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        onClick={e => e.stopPropagation()}
                                        checked={self.state.selectedVariables.some(
                                          item => item.id === node.id
                                        )}
                                        onChange={event =>
                                          self.toggleVariable(
                                            event.currentTarget.checked,
                                            node
                                          )
                                        }
                                        className={self.props.classes.checked}
                                        id={"Download_" + node.id}
                                      />
                                    }
                                    label={
                                      <Typography variant="h5">
                                        {node.name}
                                      </Typography>
                                    }
                                    key={node.id}
                                  />
                                }
                              />
                            ))}
                          </TreeItem>
                        </TreeView>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="h5">{this.configuration.text.noVariablesSubtitle}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )
              : (
                <Grid className={self.props.classes.error} container textAlign="center" spacing={4}>
                  <Grid align="center" item xs={12}>
                    <i className="fa fa-info-circle"/>
                  </Grid>  
                  <Grid item xs={12}>
                    <Typography className={self.props.classes.errorMessage} align="left" variant="error">
                      {this.state.errorMessage}
                    </Typography>
                  </Grid>
                </Grid>
              )
            }
          </DialogContent>
          <DialogActions>
            <IconButton
              size="small"
              autoFocus
              onClick={this.handleCloseDialog}
              color="primary"
              className={self.props.classes.customizedButton}
            >
              <CloseIcon />
            </IconButton>
            { !this.state.downloadError ? (
              <Grid
                container
                classes={{ root: self.props.classes.footer }}
                spacing={2}
              >
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    onClick={this.handleCloseDialog}
                    color="primary"
                  >
                    <Typography variant="button">{this.configuration.text.cancelButton}</Typography>
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    classes={{ root: self.props.classes.downloadButton }}
                    disabled={!this.state.downloadEnabled}
                    onClick={this.handleDownload}
                    variant="contained"
                    id="downloadContentsButton"
                  >
                    {self.state.downloading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Typography
                        classes={{ root: self.props.classes.downloadButtonText }}
                        variant="button"
                      >
                        {this.configuration.text.downloadButton}
                      </Typography>
                    )}
                  </Button>
                </Grid>
              </Grid>
            )
              : ( 
                <Grid
                  container
                  classes={{ root: self.props.classes.errorFooter }}
                  spacing={12}
                >
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      classes={{ root: self.props.classes.downloadErrorButton }}
                      onClick={() => self.setState({ downloadError : false })}
                      color="primary"
                    >
                      <Typography classes={{ root: self.props.classes.error }} variant="button"><i className="fa fa-refresh"/>  {this.configuration.text.tryAgainButton}</Typography>
                    </Button>
                  </Grid>
                </Grid>
              )
            }
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }
}

function mapStateToProps (state) {
  return { 
    instanceDeleted : state.generals.ui.canvas.instanceDeleted,
    instanceOnFocus : state.generals.instanceOnFocus,
    idsMap : state.generals.idsMap,
    idsList : state.generals.idsList
  }
}

export default connect(mapStateToProps, null, null, { forwardRef : true } )(withStyles(styles)(VFBDownloadContents));