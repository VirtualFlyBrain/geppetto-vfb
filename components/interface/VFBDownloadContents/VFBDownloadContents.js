import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItemText from "@material-ui/core/ListItemText";
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

const iconsMap = {
  obj: OBJIcon,
  swc: SWCIcon,
  reference: ReferenceIcon,
  nrrd: NRRDIcon,
};

const ALL_INSTANCES = { id: "ALL_INSTANCES", name: "All Instances" };

const styles = theme => ({
  customButton: { backgroundColor: "#0AB7FE" },
  footer: { backgroundColor: "#EEF9FF" },
  listItemText: { fontSize: "1em" },
  customizedButton: {
    position: "absolute",
    left: "95%",
    top: "2%",
    backgroundColor: "#F5F5F5",
    color: "gray",
  },
  dialog: {
    overflowY: "unset",
    margin: "0 auto",
  },
  dialogContent : { overflow : "hidden" },
  checked: { '&$checked': { color: '#0AB7FE' } },
  "@global": {
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label": { backgroundColor: "white" },
    ".MuiTreeItem-root.Mui-selected > .MuiTreeItem-content .MuiTreeItem-label:hover, .MuiTreeItem-root.Mui-selected:focus > .MuiTreeItem-content .MuiTreeItem-label": { backgroundColor: "white" }
  }
});

const theme = createMuiTheme({
  typography: {
    h2: {
      fontSize: 22,
      fontWeight: 400,
      fontStyle: "normal",
      color: "black",
      fontFamily: "Barlow Condensed, Khand, sans-serif",
    },
    h5: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "medium",
      fontFamily: "Barlow Condensed, Khand, sans-serif",
      color: "Gray / Dark",
    },
  }
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
      downloadEnabled: false,
      downloading: false,
      instances: [ALL_INSTANCES],
      selectedVariables: [],
      allVariablesSelectedFlag: true,
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
  }

  handleCloseDialog () {
    this.setState({ open: false });
  }

  openDialog () {
    const variables = this.getAllLoadedVariables();
    this.setState({
      instances: variables,
      selectedVariables: variables,
      open: true,
    });
  }

  handleDownload () {
    let json = { entries: [] };

    this.state.selectedVariables.map( variable => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });

    json.entries.length > 0 && this.requestZipDownload(json);
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
        const variable = entities[i].path.split(".")[0];
        const instance = window.Instances[variable];
        const filemeta = instance[variable + "_meta"].variable.types[0].filemeta;
        visuals.push({ id: variable, name: instance.name, filemeta: filemeta });
      }
    }

    return visuals;
  }

  /**
   * Make axios call to download the zip
   */
  requestZipDownload (jsonRequest) {
    let self = this;

    this.setState({ downloadEnabled: false, downloading: true });
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
              downloadEnabled: true,
              downloading: false,
              open: false,
            }),
          500
        );
      })
      .catch(function (error) {
        self.setState( {
          downloadEnabled: true,
          downloading: false,
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

    this.setState({
      typesChecked: newTypesChecked,
      downloadEnabled: newTypesChecked.length > 0,
    });
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
    const allNode = this.getVariableById(this.state.instances, node.id);
    let array = checked
      ? [...this.state.selectedVariables, ...allNode]
      : this.state.selectedVariables.filter(
        value => !allNode.includes(value)
      );

    array = array.filter((v, i) => array.indexOf(v) === i);

    this.setState({
      selectedVariables: array,
      allVariablesSelectedFlag: array.length > 0,
    });
  }

  render () {
    let self = this;
    return (
      <ThemeProvider theme={theme}>
        <Dialog
          fullWidth={this.state.fullWidth}
          maxWidth={this.state.maxWidth}
          open={this.state.open}
          onClose={this.handleCloseDialog}
          aria-labelledby="max-width-dialog-title"
          classes={{ root: self.props.classes.dialog }}
        >
          <DialogTitle
            id="max-width-dialog-title"
            align="center"
            onClose={this.handleCloseDialog}
          >
            <Typography variant="h2">Download Data</Typography>
          </DialogTitle>
          <DialogContent classes={{ root: self.props.classes.dialogContent }}>
            <Grid container textAlign="center" spacing={2}>
              <Grid item xs={12}>
                <Typography align="left" variant="h5">
                  Please select the desired types
                </Typography>
              </Grid>
              <Grid container textAlign="center" spacing={2}>
                {Object.keys(this.configurationOptions).map(key => {
                  const option = this.configurationOptions[key];
                  const labelId = `checkbox-list-secondary-label-${key}`;
                  return (
                    <Grid item xs={3}>
                      <Box textAlign="center" border={1} key={option.label}>
                        <img src={iconsMap[key]} alt="" />
                        <ListItemText
                          align="center"
                          variant="h5"
                          classes={{ primary: self.props.classes.listItemText }}
                          id={labelId}
                          primary={`${option.label}`}
                        />
                        <Checkbox
                          onChange={() => self.handleTypeSelection(key)}
                          checked={this.state.typesChecked.indexOf(key) !== -1}
                          inputProps={{ "aria-labelledby": labelId }}
                          disabled={this.state.downloading}
                          disableRipple
                          className={self.props.classes.checked}
                        />
                      </Box>
                    </Grid>
                  );
                })}
                <Divider fullWidth />
                <Grid item xs={12}>
                  <Typography variant="h5">Please select Variables:</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpanded={["0"]}
                    defaultExpandIcon={<ChevronRightIcon />}
                  >
                    <TreeItem
                      key={ALL_INSTANCES.id}
                      nodeId={ALL_INSTANCES.id}
                      label={
                        <FormControlLabel
                          control={
                            <Checkbox
                              onClick={ e => e.stopPropagation()}
                              checked={self.state.allVariablesSelectedFlag}
                              onChange={event =>
                                self.toggleVariable(
                                  event.currentTarget.checked,
                                  ALL_INSTANCES
                                )
                              }
                              disableRipple
                              className={self.props.classes.checked}
                            />
                          }
                          label={
                            <Typography variant="h5" color="textPrimary">
                              {ALL_INSTANCES.name}
                            </Typography>
                          }
                          key={ALL_INSTANCES.id}
                        />
                      }
                    >
                      {this.state.instances.map(node => (
                        <TreeItem
                          key={node.id}
                          nodeId={node.id}
                          label={
                            <FormControlLabel
                              control={
                                <Checkbox
                                  onClick={ e => e.stopPropagation()}
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
                                />
                              }
                              label={
                                <Typography variant="h5" color="textPrimary">
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
              </Grid>
            </Grid>
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
            <Grid
              container
              classes={{ root: self.props.classes.footer }}
              spacing={2}
            >
              <Grid item xs={6}>
                <Button
                  fullWidth
                  disabled={!this.state.downloadEnabled}
                  onClick={this.handleCloseDialog}
                  color="primary"
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  classes={{ root: self.props.classes.customButton }}
                  disabled={!this.state.downloadEnabled}
                  onClick={this.handleDownload}
                  variant="contained"
                  color="primary"
                >
                  Download
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(VFBDownloadContents);
