import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/styles';
import axios from 'axios';
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";

const styles = theme => ({ listItemText: { fontSize:'1em' } });
const ALL_INSTANCES = { id : "ALL_INSTANCES", name : "All Instances" };
const NO_FILES_FOUND = "No files found";

/**
 * Component to download files contents 
 */
class VFBDownloadContents extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      typesChecked : [],
      downloadEnabled : false,
      downloading : false,
      downloadError : false,
      instances : [ALL_INSTANCES],
      selectedVariables : [],
      allVariablesSelectedFlag : true
    }

    this.configuration = require('../../configuration/VFBDownloadContents/configuration');
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

  handleCloseDialog () {
    this.setState({ open : false });
  }
  
  openDialog () {
    const variables = this.getAllLoadedVariables();
    this.setState({ instances : variables , selectedVariables : variables, open : true });
  }
 
  handleDownload () {
    let json = { "entries" : [] };
    
    this.state.selectedVariables.map( variable => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });
        
    json.entries.length > 0 ? this.requestZipDownload(json) : this.setState( { downloadError : true });
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
      filemetaObject[check] && filesArray.push({ "Url" : filemetaObject[check]?.url , "ZipPath" : filemetaObject[check]?.local })
    })
    
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
        visuals.push({ id : variable , name : instance.name , filemeta : filemeta });
      }
    }

    return visuals;
  }
  
  /**
   * Make axios call to download the zip
   */
  requestZipDownload (jsonRequest) {
    let self = this;

    this.setState( { downloadEnabled : false, downloading : true } );
    // Axios HTTP Post request with post query
    axios({
      method: 'post',
      url: this.configuration.postURL,
      headers: { 'content-type': this.configuration.contentType },
      data: jsonRequest,
      responseType: "arraybuffer"
    }).then( function (response) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', self.configuration.zipName);
      document.body.appendChild(link);
      link.click();
      setTimeout( () => self.setState( { downloadEnabled : true, downloading : false, open : false } ), 500);
    }).catch( function (error) {
      self.downloadErrorMessage = error?.message;
      self.setState( { downloadEnabled : true, dowloadError : true, downloading : false } );
    })
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

    this.setState({ typesChecked : newTypesChecked, downloadEnabled : newTypesChecked.length > 0 , downloadError : false });
  }
  
  /**
   * Get variable by id, trigger by checkbox selection of variables
   */
  getVariableById (nodes, id) {
    let variablesMatched = [];
    
    if ( id === ALL_INSTANCES.id ){
      variablesMatched = nodes;
    } else {
      nodes.forEach(node => {
        if ( node.id === id) {
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
      : this.state.selectedVariables.filter(value => !allNode.includes(value));

    array = array.filter((v, i) => array.indexOf(v) === i);

    this.setState({ selectedVariables : array, allVariablesSelectedFlag : array.length > 0 , downloadError : false });
  }

  render () {
    let self = this;
    return (
      <Dialog
        fullWidth={this.state.fullWidth}
        maxWidth={this.state.maxWidth}
        open={this.state.open}
        onClose={this.handleCloseDialog}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title" onClose={this.handleCloseDialog} ><h3>Download Contents</h3></DialogTitle>
        <DialogContent>
          <DialogContentText variant="h5">
             Select types
          </DialogContentText>
          <form noValidate>
            <FormControl >
              <List dense >
                {Object.keys(this.configurationOptions).map( value => {
                  const label = this.configurationOptions[value];
                  const labelId = `checkbox-list-secondary-label-${label}`;
                  return ( <ListItem key={value}>
                    <Checkbox
                      edge="start"
                      onChange={() => self.handleTypeSelection(value)}
                      checked={this.state.typesChecked.indexOf(value) !== -1}
                      inputProps={{ 'aria-labelledby': labelId }}
                      disabled={this.state.downloading}
                    />
                    <ListItemText variant="h5" classes={{ primary:self.props.classes.listItemText }} id={labelId} primary={`${label}`} />
                  </ListItem> );
                })}
              </List>
            </FormControl>
          </form>
          <DialogContentText variant="h5">
            Select Variables:
          </DialogContentText>
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
                      onClick={e => e.stopPropagation()}
                      checked={self.state.allVariablesSelectedFlag}
                      onChange={event =>
                        self.toggleVariable(event.currentTarget.checked, ALL_INSTANCES)
                      }
                    />
                  }
                  label={<Typography variant="h5" color="textPrimary">{ALL_INSTANCES.name}</Typography>}
                  key={ALL_INSTANCES.id}
                />
              }
            >
              { this.state.instances.map(node => ( 
                <TreeItem
                  key={node.id}
                  nodeId={node.id}
                  label={
                    <FormControlLabel
                      control={
                        <Checkbox
                          onClick={e => e.stopPropagation()}
                          checked={self.state.selectedVariables.some(item => item.id === node.id)}
                          onChange={event =>
                            self.toggleVariable(event.currentTarget.checked, node)
                          }
                        />
                      }
                      label={<Typography variant="h5" color="textPrimary">{node.name}</Typography>}
                      key={node.id}
                    />
                  }
                />))
              }
            </TreeItem>
          </TreeView>
        </DialogContent>
        <DialogActions>
          {
            this.state.downloading ? <CircularProgress align="left" size={24} /> : null
          }
          {
            this.state.downloadError ? <Typography color="error">{ self.dowloadErrorMessage }</Typography> : null
          }
          <Button disabled={!this.state.downloadEnabled} onClick={this.handleDownload} variant="contained" color="primary">
            Download
          </Button>
          <Button disabled={!this.state.downloadEnabled} onClick={this.handleCloseDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default (withStyles(styles)(VFBDownloadContents));
