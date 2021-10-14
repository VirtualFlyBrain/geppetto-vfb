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

const PERMISSIONS = "Permissions to store URL in browser history";
const styles = theme => ({ 
  listItemText: { fontSize:'1em' },
  templateSelection: {
    width : "30% !important",
    height : "5rem"
  },
  templateContent : { fontSize : "14px" },
  dialogActions : { justifyContent : "space-evenly" }
});

class VFBUploader extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      uploading : false,
      nblastEnabled : false,
      files : [],
      permissionsChecked : false,
      templateSelected : ""
    }

    this.configuration = require('../../configuration/VFBUploader/configuration');
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handlePermissionsCheck = this.handlePermissionsCheck.bind(this);
    this.handleNBLASTAction = this.handleNBLASTAction.bind(this);
    this.requestUpload = this.requestUpload.bind(this);
  }

  handleCloseDialog () {
    this.setState({ open : false });
  }
  
  handleDropZoneChange (files){
    this.setState({ files: files });
  }
  
  handleTemplateChange (event) {
    this.setState({ templateSelected : event.target.value })
  }
  
  openDialog () {
    this.setState({ open : true });
  }
 
  handleNBLASTAction () {
    this.requestUpload({});
  }
  
  /**
   * Make axios call to download the zip
   */
  requestUpload (jsonRequest) {
    let self = this;

    this.setState( { uploading : true } );
    // Axios HTTP Post request with post query
    axios({
      method: 'post',
      url: this.configuration.nblastURL,
      headers: { 'content-type': this.configuration.contentType },
      data: jsonRequest,
      responseType: "arraybuffer"
    }).then( function (response) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setTimeout( () => self.setState( { nblastEnabled : true, uploading : false } ), 500);
    }).catch( function (error) {
      self.downloadErrorMessage = error?.message;
      self.setState( { nblastEnabled : true, uploading : false } );
    })
  }
  
  /**
   * Handle checkbox selection of different types to download
   */
  handlePermissionsCheck (event) {
    this.setState({ permissionsChecked : event.target.checked });
  }
  
  render () {
    let self = this;
    const { classes } = this.props;
    
    return (
      <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={self.state.open}
        onClose={self.handleCloseDialog}
        aria-labelledby="max-width-dialog-title"
      >
        <DialogTitle id="max-width-dialog-title" onClose={self.handleCloseDialog} ><h2>NBLAST Uploader</h2></DialogTitle>
        <DialogContent>
          <FormControl className={classes.templateSelection}>
            <InputLabel className={classes.templateContent} htmlFor="template-selection">Choose Template:</InputLabel>
            <Select
              native
              className={classes.templateContent}
              value={self.state.templateSelected}
              onChange={self.handleTemplateChange.bind(self)}
              inputProps={{
                name: 'template',
                id: 'template-selection',
              }}
            >
              <option aria-label="None" value="" />" +
              {
                self.configuration.templates.map( template => (
                  <option value={Object.keys(template)[0]}>{Object.keys(template)[0]}</option>
                ))
              }
            </Select>
          </FormControl>
          <DropzoneArea
            onChange={self.handleDropZoneChange.bind(self)}
            acceptedFiles={self.configuration.acceptedFiles}
            maxFileSize={self.configuration.maxFileSize}
            filesLimit={self.configuration.filesLimit}
            dropzoneText={self.configuration.dropZoneMessage}
          />
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <div>
            <Typography variant="h5">--- NBLAST Text Updates --- </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={self.permissionsChecked}
                  edge="start"
                  onChange={event => self.handlePermissionsCheck(event)}
                />
              }
              label={<Typography variant="body1" color="textPrimary">{PERMISSIONS}</Typography>}
            />
          </div>
          {
            self.state.uploading ? <CircularProgress align="left" size={24} /> : null
          }
          <Button disabled={!self.state.nblastEnabled} onClick={self.handleNBLASTAction} variant="contained" color="primary">
            NBLAST Upload
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default (withStyles(styles)(VFBUploader));