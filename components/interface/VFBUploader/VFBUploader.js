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
import Select from '@material-ui/core/Select';
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/styles';
import axios from 'axios';
import { DropzoneArea } from 'material-ui-dropzone'

const PERMISSIONS = "Permissions to store";
const styles = theme => ({ 
  listItemText: { fontSize:'1em' },
  templateSelection: {
    float: "right !important",
    width : "20% !important",
    fontSize : "1 rem !important"
  }
});

class VFBUploader extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      uploading : false,
      files : [],
      template : ""
    }

    this.configuration = require('../../configuration/VFBUploader/configuration');
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handlePermissionsCheck = this.handlePermissionsCheck.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.requestUpload = this.requestUpload.bind(this);
  }

  handleCloseDialog () {
    this.setState({ open : false });
  }
  
  handleChange (files){
    this.setState({ files: files });
  }
  
  openDialog () {
    this.setState({ open : true });
  }
 
  handleUpload () {
    let json = { "entries" : [] };
    
    this.state.selectedVariables.map( variable => {
      const filemeta = this.extractVariableFileMeta(variable);
      json.entries = json.entries.concat(filemeta);
    });
        
    json.entries.length > 0 ? this.requestZipDownload(json) : this.setState( { downloadError : true });
  }
  
  /**
   * Make axios call to download the zip
   */
  requestUpload (jsonRequest) {
    let self = this;

    this.setState( { downloadEnabled : false, downloading : true } );
    // Axios HTTP Post request with post query
    axios({
      method: 'post',
      url: this.configuration.blastURL,
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
  handlePermissionsCheck (value) {
    const currentIndex = this.state.typesChecked.indexOf(value);
    const newTypesChecked = [...this.state.typesChecked];

    if (currentIndex === -1) {
      newTypesChecked.push(value);
    } else {
      newTypesChecked.splice(currentIndex, 1);
    }

    this.setState({ typesChecked : newTypesChecked, downloadEnabled : newTypesChecked.length > 0 , downloadError : false });
  }
  
  render () {
    let self = this;
    const { classes } = this.props;
    
    return (
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        titleStyle={{ textAlign: "center" }}
        open={this.state.open}
        onClose={this.handleCloseDialog}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title" onClose={this.handleCloseDialog} ><h3>NBLAST Uploader</h3></DialogTitle>
        <DialogContent>
          <FormControl className={classes.templateSelection}>
            <InputLabel variant="h2" htmlFor="template-selection">Choose Template:</InputLabel>
            <Select
              native
              value={this.state.template}
              inputProps={{
                name: 'age',
                id: 'template-selection',
              }}
            >
              <option aria-label="None" value="" />" +
              {
                this.configuration.templates.map( template => {
                  <option value={Object.keys(template)[0]}>{Object.keys(template)[0]}</option>
                })
              }
            </Select>
          </FormControl>
          <DropzoneArea
            onChange={this.handleChange.bind(this)}
            acceptedFiles={['swc']}
            dropzoneText={"Drag and drop a SWC file here or click"}
          />
        </DialogContent>
        <DialogActions>
          <FormControlLabel
            control={
              <Checkbox
                checked={true}
                edge="start"
                onChange={() => self.handlePermissionsCheck()}
              />
            }
            label={<Typography variant="h5" color="textPrimary">{PERMISSIONS}</Typography>}
          />
          {
            this.state.downloading ? <CircularProgress align="left" size={24} /> : null
          }
          {
            this.state.downloadError ? <Typography color="error">{ self.dowloadErrorMessage }</Typography> : null
          }
          <Button disabled={!this.state.downloadEnabled} onClick={this.handleDownload} variant="contained" color="primary">
            NBLAST Upload
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default (withStyles(styles)(VFBUploader));