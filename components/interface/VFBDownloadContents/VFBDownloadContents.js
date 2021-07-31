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
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/styles';
import axios from 'axios';

const styles = theme => ({ listItemText: { fontSize:'1em' } });

class VFBDownloadContents extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      checked : [],
      downloading : false
    }

    this.configuration = require('../../configuration/VFBDownloadContents/configuration');
    this.configurationOptions = this.configuration.options;
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.extractVariableFileMeta = this.extractVariableFileMeta.bind(this);
    this.getAllLoadedVariables = this.getAllLoadedVariables.bind(this);
    this.requestZipDownload = this.requestZipDownload.bind(this);
  }
  
  handleClickOpen () {
    this.setState({ open : true });
  }

  handleClose () {
    this.setState({ open : false });
  }
  
  openDialog () {
    this.setState({ open : true });
  }
 
  handleDownload () {
    let variables = this.getAllLoadedVariables();
    let json = { "entries" : [] };
    
    variables.map( variable => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });
        
    json.entries.length > 0 && this.requestZipDownload(json);
  }
  
  extractVariableFileMeta (variable) {
    const filemeta = window.Instances[variable][variable + "_meta"].variable.types[0].filemeta;
    let filemetaText = filemeta.values[0].value.text;
    filemetaText = filemetaText.replace(/'/g, '"');

    const filemetaObject = JSON.parse(filemetaText);
    let filesArray = [];
    
    this.state.checked.map( check => {
      filemetaObject[check] && filesArray.push({ "Url" : filemetaObject[check]?.url , "ZipPath" : filemetaObject[check]?.local })
    })
    
    return filesArray;
  }
 
  getAllLoadedVariables () {
    let entities = GEPPETTO.ModelFactory.allPaths;
    var visuals = [];

    for (var i = 0; i < entities.length; i++) {
      if (entities[i].metaType === "VisualType" || entities[i].metaType === "CompositeVisualType" ) {
        visuals.push(entities[i].path.split(".")[0]);
      }
    }

    return visuals;
  }
  
  requestZipDownload (jsonRequest) {
    let self = this;

    this.setState( { downloading : true } );
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
      setTimeout( () => self.setState( { downloading : false , open : false} ), 1000);
    }).catch( function (error) {
      self.setState( { downloading : false } );
    })
  }
  
  handleToggle (value) {
    const currentIndex = this.state.checked.indexOf(value);
    const newChecked = [...this.state.checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setState({ checked : newChecked });
  }

  render () {
    let self = this;
    return (
      <Dialog
        fullWidth={this.state.fullWidth}
        maxWidth={this.state.maxWidth}
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title"><h3>Download Contents</h3></DialogTitle>
        <DialogContent>
          <DialogContentText variant="h5">
             Select all files to download as part of zip.
          </DialogContentText>
          <form noValidate>
            <FormControl >
              <List dense >
                {Object.keys(this.configurationOptions).map( value => {
                  const label = this.configurationOptions[value];
                  const labelId = `checkbox-list-secondary-label-${label}`;
                  return ( <ListItem key={value}>
                    <ListItemText classes={{ primary:self.props.classes.listItemText }} id={labelId} primary={`${label}`} />
                    <ListItemSecondaryAction>
                      <Checkbox
                        edge="end"
                        onChange={() => self.handleToggle(value)}
                        checked={this.state.checked.indexOf(value) !== -1}
                        inputProps={{ 'aria-labelledby': labelId }}
                        disabled={this.state.downloading}
                      />
                    </ListItemSecondaryAction>
                  </ListItem> );
                })}
              </List>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          {
            this.state.downloading ? <CircularProgress /> : null
          }
          <Button disabled={this.state.downloading} onClick={this.handleDownload} variant="contained" color="primary">
            Download
          </Button>
          <Button disabled={this.state.downloading} onClick={this.handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default (withStyles(styles)(VFBDownloadContents));
