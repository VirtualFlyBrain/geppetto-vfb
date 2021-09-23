import React from "react";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CloseIcon from "@material-ui/icons/Close";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import DeleteIcon from "@material-ui/icons/Delete";
import Checkbox from "@material-ui/core/Checkbox";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import axios from "axios";
import { DropzoneArea } from "material-ui-dropzone";
import UploadIcon from "../../configuration/VFBUploader/upload-icon.png";

const styles = theme => ({
  dropzoneArea: { minHeight: "20vh !important" },
  marginTop: { marginTop: "1vh !important" },
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
  nblastButton : { color : "#0AB7FE" }
});

const theme = createMuiTheme({
  typography: {
    h2: {
      fontSize: 22,
      fontWeight: 400,
      fontStyle: "normal",
      color : "black",
      fontFamily: "Barlow Condensed, Khand, sans-serif",
    },
    caption: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "medium",
      fontFamily: "Barlow Condensed, Khand, sans-serif",
      color: "Gray / Dark",
    },
    h5: {
      fontSize: 11,
      fontWeight: 500,
      fontStyle: "medium",
      fontFamily: "Barlow Condensed, Khand, sans-serif",
      color: "Gray / Dark",
    },
  },
});

const UNIQUE_ID = "UNIQUE_ID";
class VFBUploader extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      fileNBLASTURL: "self.configuration.nblastURL",
      nblastEnabled: false,
      files: [],
      templateSelected: "",
      progress: 100,
    };

    this.configuration = require("../../configuration/VFBUploader/configuration");
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.handleNBLASTAction = this.handleNBLASTAction.bind(this);
    this.handleFileDelete = this.handleFileDelete.bind(this);
    this.requestUpload = this.requestUpload.bind(this);
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
    this.setState({ nblastEnabled: true });
    let unique_id = Math.floor(10000000 + Math.random() * 90000000).toString();
    unique_id = unique_id + "." + this.state.files[0].name.split(".")[1];
    let url = this.configuration.nblastURL.replace(UNIQUE_ID, unique_id);
    var formData = new FormData();
    formData.append("file", this.state.files[0]);
    this.requestUpload(formData, url);
  }

  /**
   * Make axios call to upload to server
   */
  requestUpload (formData, url) {
    let self = this;

    this.setState({ fileNBLASTURL: url });
    
    axios.put(url,
      formData, { headers: { 'Content-Type': this.configuration.contentType } }
    ).then(function (response) {
      console.log('SUCCESS!!', response);
    })
      .catch(function (error) {
        console.log('FAILURE!!');
        console.log(error);
      });
  }

  render () {
    let self = this;
    const { classes } = this.props;

    return (
      <ThemeProvider theme={theme}>
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
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h2">{self.configuration.dialogTitle}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption">{self.configuration.dialogSubtitle}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <InputLabel htmlFor="template-selection">
                    Choose Template:
                  </InputLabel>
                  <Select
                    native
                    value={self.state.templateSelected}
                    onChange={self.handleTemplateChange.bind(self)}
                    inputProps={{
                      name: "template",
                      id: "template-selection",
                    }}
                  >
                    <option aria-label="None" value="" />
                    {self.configuration.templates.map( template => (
                      <option value={template.label}>{template.label}</option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent
            style={{ height: "auto", overflow: "hidden" }}
            align="center"
          >
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <DropzoneArea
                  onChange={self.handleDropZoneChange.bind(self)}
                  onDelete={self.handleFileDelete.bind(self)}
                  acceptedFiles={self.configuration.acceptedFiles}
                  maxFileSize={self.configuration.maxFileSize}
                  filesLimit={self.configuration.filesLimit}
                  dropzoneText={self.configuration.dropZoneMessage}
                  Icon={() => <img src={UploadIcon} alt="upload" />}
                  showAlerts={["error"]}
                  fullWidth
                  showPreviewsInDropzone={false}
                  dropzoneClass={classes.dropzoneArea}
                />
              </Grid>
            </Grid>
            {self.state.files.length > 0 ? (
              <Grid className={classes.marginTop} container m={2}>
                <Grid item align="left" xs={12}>
                  <Typography align="left" variant="caption">Uploaded File</Typography>
                </Grid>
                <Grid item className={classes.marginTop} xs={1}>
                  <FileIcon autoFocus />
                </Grid>
                <Grid align="left" item xs={10}>
                  <Box sx={{ width: '100%' }}>
                    <Typography align="left" variant="caption">{this.state.files[0].name}</Typography>
                    <LinearProgress variant="buffer" value={this.state.progress} />
                  </Box>
                </Grid>
                <Grid item className={classes.marginTop} xs={1}>
                  <IconButton autoFocus size="small" variant="outlined" onClick={self.handleFileDelete.bind(self)}><DeleteIcon /></IconButton>
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>
          <Divider fullWidth />
          <DialogActions style={{ overflow: "hidden" }} align="center">
            <IconButton size="small" autoFocus onClick={this.handleCloseDialog} color="primary" className={classes.customizedButton}>
              <CloseIcon />
            </IconButton>
            <Grid container spacing={2}>
              {!self.state.nblastEnabled ? (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    disabled={self.state.files.length == 0}
                    onClick={self.handleNBLASTAction}
                    variant="outlined"
                    color="primary"
                    classes={{ root : classes.nblastButton }}
                  >
                    {self.configuration.blastButtonText}
                  </Button>
                </Grid>
              ) : (
                <>
                  <Grid item xs={9}>
                    <TextField
                      value={self.state.fileNBLASTURL}
                      variant="outlined"
                      color="primary"
                      fullWidth
                      classes={{ root : classes.nblastButton }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<FileCopyIcon />}
                      classes={{ root : classes.nblastButton }}
                      onClick={() => { 
                        navigator.clipboard.writeText(self.state.fileNBLASTURL)
                      }}
                    >
                      Copy
                    </Button>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography fullwidth variant="caption">
                      {self.configuration.infoMessage}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(VFBUploader);