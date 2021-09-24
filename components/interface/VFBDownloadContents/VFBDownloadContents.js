import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItemText from "@material-ui/core/ListItemText";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Checkbox } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { withStyles } from "@material-ui/styles";
import axios from "axios";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import DefaultIcon from "../../configuration/VFBDownloadContents/default.png";
import NRRDIcon from "../../configuration/VFBDownloadContents/nrrd.png";
import OBJIcon from "../../configuration/VFBDownloadContents/obj.png";
import SWCIcon from "../../configuration/VFBDownloadContents/swc.png";
import ReferenceIcon from "../../configuration/VFBDownloadContents/reference.png";

const iconsMap = {
  images: DefaultIcon,
  obj: OBJIcon,
  swc: SWCIcon,
  reference: ReferenceIcon,
  nrrd: NRRDIcon
};

const ALL_INSTANCES = { id: "ALL_INSTANCES", name: "All Instances" };
const NO_FILES_FOUND = "No files found";

const styles = (theme) => ({
  customButton: { color: "#0AB7FE" },
  listItemText: { fontSize: "1em" },
});

/**
 * Component to download files contents
 */
class VFBDownloadContents extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      typesChecked: [],
      downloadEnabled: false,
      downloading: false,
      downloadError: false,
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
    this.dowloadErrorMessage = NO_FILES_FOUND;
  }

  handleCloseDialog() {
    this.setState({ open: false });
  }

  openDialog() {
    const variables = this.getAllLoadedVariables();
    this.setState({
      instances: variables,
      selectedVariables: variables,
      open: true,
    });
  }

  handleDownload() {
    let json = { entries: [] };

    this.state.selectedVariables.map((variable) => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });

    json.entries.length > 0
      ? this.requestZipDownload(json)
      : this.setState({ downloadError: true });
  }

  /**
   * Extract filemeta from geppetto model, using variable id to find it
   */
  extractVariableFileMeta(variable) {
    let filemetaText = variable.filemeta?.values[0]?.value?.text;
    filemetaText = filemetaText?.replace(/'/g, '"');

    const filemetaObject = JSON.parse(filemetaText);
    let filesArray = [];

    this.state.typesChecked.map((check) => {
      filemetaObject[check] &&
        filesArray.push({
          Url: filemetaObject[check]?.url,
          ZipPath: filemetaObject[check]?.local,
        });
    });

    return filesArray;
  }

  /**
   * Get array of all loaded variables in application
   */
  getAllLoadedVariables() {
    let entities = GEPPETTO.ModelFactory.allPaths;
    var visuals = [];

    for (var i = 0; i < entities.length; i++) {
      if (
        entities[i].metaType === "VisualType" ||
        entities[i].metaType === "CompositeVisualType"
      ) {
        const variable = entities[i].path.split(".")[0];
        const instance = window.Instances[variable];
        const filemeta =
          instance[variable + "_meta"].variable.types[0].filemeta;
        visuals.push({ id: variable, name: instance.name, filemeta: filemeta });
      }
    }

    return visuals;
  }

  /**
   * Make axios call to download the zip
   */
  requestZipDownload(jsonRequest) {
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
      .then(function(response) {
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
      .catch(function(error) {
        self.downloadErrorMessage = error?.message;
        self.setState({
          downloadEnabled: true,
          dowloadError: true,
          downloading: false,
        });
      });
  }

  /**
   * Handle checkbox selection of different types to download
   */
  handleTypeSelection(value) {
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
      downloadError: false,
    });
  }

  /**
   * Get variable by id, trigger by checkbox selection of variables
   */
  getVariableById(nodes, id) {
    let variablesMatched = [];

    if (id === ALL_INSTANCES.id) {
      variablesMatched = nodes;
    } else {
      nodes.forEach((node) => {
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
  toggleVariable(checked, node) {
    const allNode = this.getVariableById(this.state.instances, node.id);
    let array = checked
      ? [...this.state.selectedVariables, ...allNode]
      : this.state.selectedVariables.filter(
          (value) => !allNode.includes(value)
        );

    array = array.filter((v, i) => array.indexOf(v) === i);

    this.setState({
      selectedVariables: array,
      allVariablesSelectedFlag: array.length > 0,
      downloadError: false,
    });
  }

  render() {
    let self = this;
    return (
      <Dialog
        fullWidth={this.state.fullWidth}
        maxWidth={this.state.maxWidth}
        open={this.state.open}
        onClose={this.handleCloseDialog}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle
          id="max-width-dialog-title"
          align="center"
          onClose={this.handleCloseDialog}
        >
          <h3>Download Data</h3>
        </DialogTitle>
        <DialogContent>
          <Grid item xs={12}>
            <DialogContentText align="left" variant="h5">
              Please select the desired types
            </DialogContentText>
          </Grid>
          <Grid container textAlign="center" spacing={2}>
            {Object.keys(this.configurationOptions).map((key) => {
              const option = this.configurationOptions[key];
              const labelId = `checkbox-list-secondary-label-${option.label}`;
              return (
                <Grid
                  item
                  xs={Math.round(12 / Object.keys(this.configurationOptions).length)}
                >
                  <Box textAlign="center" border={1} key={option.label}>
                    <img src={iconsMap[key]} />
                    <ListItemText
                      align="center"
                      variant="h5"
                      classes={{ primary: self.props.classes.listItemText }}
                      id={labelId}
                      primary={`${option.label}`}
                    />
                    <Checkbox
                      onChange={() => self.handleTypeSelection(option.label)}
                      checked={
                        this.state.typesChecked.indexOf(option.label) !== -1
                      }
                      inputProps={{ "aria-labelledby": labelId }}
                      disabled={this.state.downloading}
                      iconStyle={{ fill: "white" }}
                    />
                  </Box>
                </Grid>
              );
            })}
            <Grid item xs={12}>
              <DialogContentText variant="h5">
                Please select Variables:
              </DialogContentText>
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
                          onClick={(e) => e.stopPropagation()}
                          checked={self.state.allVariablesSelectedFlag}
                          onChange={(event) =>
                            self.toggleVariable(
                              event.currentTarget.checked,
                              ALL_INSTANCES
                            )
                          }
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
                  {this.state.instances.map((node) => (
                    <TreeItem
                      key={node.id}
                      nodeId={node.id}
                      label={
                        <FormControlLabel
                          control={
                            <Checkbox
                              onClick={(e) => e.stopPropagation()}
                              checked={self.state.selectedVariables.some(
                                (item) => item.id === node.id
                              )}
                              onChange={(event) =>
                                self.toggleVariable(
                                  event.currentTarget.checked,
                                  node
                                )
                              }
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
        </DialogContent>
        <DialogActions>
          <Grid container spacing={2}>
            {this.state.downloading ? (
              <Grid item xs={12}>
                <Typography color="error">
                  {self.dowloadErrorMessage}
                </Typography>
              </Grid>
            ) : null}
            {this.state.downloadError ? (
              <Grid item xs={12}>
                <Typography color="error">
                  {self.dowloadErrorMessage}
                </Typography>
              </Grid>
            ) : null}
            <Grid item xs={6}>
              <Button
                fullWidth
                classes={{ root: self.props.classes.customButton }}
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
    );
  }
}

export default withStyles(styles)(VFBDownloadContents);