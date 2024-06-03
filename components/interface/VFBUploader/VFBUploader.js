import React from "react";
import { 
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel,
  FormGroup, InputLabel, Select, Typography, IconButton, Divider, Box, TextField,
  ListItemIcon, ListItemText, Checkbox, MenuItem, Button, LinearProgress, CircularProgress, Grid
} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import CheckIcon from '@material-ui/icons/Check';
import InfoIcon from '@material-ui/icons/Info';
import ReplayIcon from '@material-ui/icons/Replay';
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import axios from "axios";
import { DropzoneArea } from "material-ui-dropzone";
import UploadIcon from "../../configuration/VFBUploader/upload-icon.png";
import { customAlphabet } from 'nanoid';
import FileIcon from "../../configuration/VFBUploader/file-icon.png";
import { CustomStyle, CustomTheme } from "./styles";

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);
const UNIQUE_ID = "UNIQUE_ID";
class VFBUploader extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      fileNBLASTURL: "",
      nblastEnabled: false,
      files: [],
      templateSelected: "",
      progress: 100,
      cookies : false,
      error : false,
      uploading : false
    };

    this.configuration = require("../../configuration/VFBUploader/configuration");
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handleNBLASTAction = this.handleNBLASTAction.bind(this);
    this.handleFileDelete = this.handleFileDelete.bind(this);
    this.requestUpload = this.requestUpload.bind(this);
    this.getTitleHead = this.getTitleHead.bind(this);
    this.getUploaderComponents = this.getUploaderComponents.bind(this);
    this.getErrorDialog = this.getErrorDialog.bind(this);
    this.getUploadActions = this.getUploadActions.bind(this);
    this.handleCookieEvent = this.handleCookieEvent.bind(this);
  }
  
  handleCookieEvent (event) {
    this.setState({ cookies : event.target.checked })
  }

  handleCloseDialog () {
    this.setState({ open: false });
  }

  handleDropZoneChange (files) {
    this.setState({ files: files });
  }

  handleFileDelete () {
    this.setState({ files: [], nblastEnabled: false });
  }

  handleTemplateChange (event) {
    this.setState({ templateSelected: event.target.value });
  }

  openDialog () {
    this.setState({ open: true });
  }

  handleNBLASTAction () {
    let newId = "VFBu_" + nanoid();
    let url = this.configuration.nblastURL.replace(UNIQUE_ID, this.state.templateSelected + "&" + newId);
    var formData = new FormData();
    formData.append("file", this.state.files[0]);
    formData.append("vfbID", newId);
    formData.append("templateID", this.state.templateSelected);
    this.requestUpload(formData, url);
  }

  /**
   * Make axios call to upload to server
   */
  requestUpload (formData, url) {
    let self = this;
    let _id = formData.get("vfbID");
    let newURL = window.location.origin + window.location.pathname + "&q=" + _id + "," + this.configuration.queryType;

    this.setState({ fileNBLASTURL: newURL, uploading : true });
    window.setCookie(_id, newURL, this.configuration.cookieStorageDays);

    axios.put(url,
      formData, { headers: { 'Content-Type': this.configuration.contentType } }
    ).then(function (response) {
      console.log('SUCCESS!!', response);
      self.setState({ uploading : false, nblastEnabled: true });
    })
      .catch(function (error) {
        console.log('FAILURE!!', error);
        self.setState({ error : true, uploading : false });
      });
  }
  
  getTitleHead () {
    return (<Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h2">{this.configuration.text.dialogTitle}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">{this.configuration.text.dialogSubtitle}</Typography>
      </Grid>
    </Grid>);
  }
  
  getUploaderComponents () {
    const { classes } = this.props;
    let self = this;
    return (
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12}>
          <Typography align="left" variant="h5"> {self.configuration.text.selectTemplate}</Typography>
          <FormControl fullWidth>
            <Select
              value={self.state.templateSelected}
              onChange={self.handleTemplateChange.bind(self)}
              inputProps={{
                name: "template",
                id: "template-selection",
              }}
              color="primary"
              disabled={this.state.uploading}
            >
              <MenuItem value="Select">
                { self.state.templateSelected === self.configuration.text.select
                  ? <ListItemIcon>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                  : null
                }
                <ListItemText>Select</ListItemText>
              </MenuItem>
              {self.configuration.templates.map( template => (
                <MenuItem value={template.label}>
                  { self.state.templateSelected === template.label
                    ? <ListItemIcon>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    : null
                  }
                  <ListItemText>{template.label}</ListItemText>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography align="left" variant="h5"> {self.configuration.text.addYourFile}</Typography>
          {self.state.files.length > 0 ? (
            <Grid className={classes.marginTop} container>
              <Grid item xs={1}>
                <Box mt={1}>
                  <img src={FileIcon} alt="" />
                </Box>
              </Grid>
              <Grid align="left" item xs={10}>
                <Box pt={1}>
                  <Typography align="left" variant="caption">{self.state.files[0].name}</Typography>
                  <LinearProgress className={classes.vfbColor} variant="buffer" value={self.state.progress} />
                </Box>
              </Grid>
              <Grid item xs={1}>
                <Box mt={1.5}> 
                  <IconButton disabled={this.state.uploading} autoFocus size="small" variant="outlined" onClick={self.handleFileDelete.bind(self)}><DeleteIcon /></IconButton>
                </Box>
              </Grid>
            </Grid>
          )
            : <DropzoneArea
              onChange={self.handleDropZoneChange.bind(self)}
              onDelete={self.handleFileDelete.bind(self)}
              acceptedFiles={self.configuration.acceptedFiles}
              maxFileSize={self.configuration.maxFileSize}
              filesLimit={self.configuration.filesLimit}
              dropzoneText={self.configuration.text.dropZoneMessage}
              Icon={() => <img src={UploadIcon} alt="upload" />}
              showAlerts={["error"]}
              fullWidth
              showPreviewsInDropzone={false}
              dropzoneClass={classes.dropzoneArea}
            />
          }
        </Grid>
        <Box className={classes.cookiesBox} mt={2}>
          <Checkbox inputProps={{ "aria-labelledby": "cookies-store" }} className={classes.checked} onChange={event => self.handleCookieEvent(event)} checked={self.state.cookies} />
          <Typography id={"cookies-store"} variant="h5">
            {self.configuration.text.agreeTerms}
            <a target="_blank" href={self.configuration.cookiesLearnLink}>{self.configuration.text.learnMore}</a>
          </Typography>
        </Box>
      </Grid>
    );
  }
          
  getSuccessComponent () {
    const { classes } = this.props;
    return (
      <Grid container>
        <Grid item xs={9}>
          <TextField
            value={this.state.fileNBLASTURL}
            variant="filled"
            color="primary"
            fullWidth
            InputProps={{ disableUnderline: true, spellCheck: 'false' }}
          />
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileCopyIcon />}
            classes={{ root : classes.nblastButton }}
            onClick={() => { 
              navigator.clipboard.writeText(this.state.fileNBLASTURL)
            }}
          >
            {this.configuration.text.copyButtonText}
          </Button>
        </Grid>
        <Grid container className={classes.marginTop}>
          <Grid item xs={2}>
            <InfoIcon fontSize="small"/>
          </Grid>
          <Grid item xs={10}>
            <Typography fullwidth variant="h5">
              {this.configuration.text.infoMessage}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );  
  }
  
  getErrorDialog () {
    const { classes } = this.props;
  
    return (
      <Grid container>
        <Grid container justify="center" spacing={1}>
          <Grid item xs={2}>
            <InfoIcon color="error" fontSize="small"/>
          </Grid>
          <Grid item xs={12}>
            <Typography color="error" fullwidth variant="h5">
              {this.configuration.text.errorDialog}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    );  
  }        
          
  getUploadActions () {
    const { classes } = this.props;
    let self = this;

    return (
      <>
        <IconButton size="small" onClick={this.handleCloseDialog} color="primary" className={classes.customizedButton}>
          <CloseIcon />
        </IconButton> 
        <Grid container spacing={2}>
          { !this.state.error
            ? !this.state.nblastEnabled ? (
              <Grid item xs={12}>
                <Button
                  fullWidth
                  disabled={this.state.files.length == 0 || this.state.uploading}
                  onClick={this.handleNBLASTAction}
                  variant="contained"
                  classes={{ root : classes.nblastButton }}
                >
                  {this.state.uploading ? <CircularProgress color="secondary" size={10} /> : this.configuration.text.blastButtonText}
                </Button>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Button
                  fullWidth
                  startIcon={<ReplayIcon color="primary" />}
                  onClick={() => self.setState({ fileNBLASTURL : "", nblastEnabled : false, files : [], templateSelected: "" }) }
                  variant="outlined"
                >
                  {this.configuration.text.restartButtonText}
                </Button>
              </Grid>
            )
            : <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                classes={{ root : classes.errorButton }}
                startIcon={<ReplayIcon color="error" />}
                onClick={() => self.setState({ fileNBLASTURL : "", error : false, nblastEnabled : false, files : [], templateSelected: "" }) }
              >
                {this.configuration.text.errorButtonText}
              </Button>
            </Grid>
          }
        </Grid>
      </>
    );  
  }

  render () {
    let self = this;
    const { classes } = this.props;

    return (
      <ThemeProvider theme={CustomTheme}>
        <Dialog
          open={self.state.open}
          onClose={self.handleCloseDialog}
          aria-labelledby="max-width-dialog-title"
          maxWidth="lg"
          classes={{ root: classes.dialog }}
        >
          <DialogTitle
            align="center"
            id="max-width-dialog-title"
            onClose={self.handleCloseDialog}
          >
            {this.getTitleHead()}
          </DialogTitle>
          <DialogContent
            style={{ height: "auto", overflow: "hidden" }}
            align="center"
          >
            { !self.state.error
              ? !self.state.nblastEnabled ? this.getUploaderComponents() : this.getSuccessComponent()
              : this.getErrorDialog() 
            }
          </DialogContent>
          <Divider fullWidth />
          <DialogActions className={this.state.error ? classes.errorButton : classes.vfbColor} align="center">
            {self.getUploadActions()}
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withStyles(CustomStyle)(VFBUploader);
