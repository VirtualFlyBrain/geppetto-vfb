import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

require('../../css/VFBMain.less');
require('../../css/colors.less');

const styles = {
  rootTitle: {
    fontFamily: "Khand",
    color: "#11bffe",
    fontSize: "20px"
  },
  rootText: {
    fontFamily: "Helvetica Neue",
    color: "#000000",
    fontSize: "13px"
  },
  rootButton: {
    fontFamily: "Khand",
    color: "#ffffff",
    backgroundColor: "#11bffe",
    fontSize: "16px",
    "&:hover": {
      background: "#DCDCDC",
      backgroundColor: "#DCDCDC",
      color: '#11bffe'
    },
  }
};

class ErrorCatcher extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hasError: false,
      open: true,
      error: undefined
    };
  }
    handleClose = () => {
      var url = "https://github.com/VirtualFlyBrain/VFB2/issues/new";
      var customMessage = "Steps to reproduce the problem: \n\nPlease fill the below with the necessary steps to reproduce the problem\n\n\n\nError Information:\n\n"
      // return as much of the log up to the last 10 events < 1000 characters:
      var logLength = -1;
      var limitedLog = window.console.logs.slice(logLength).join('%0A').replace(
        /\&/g,escape('&')
      ).replace(
        /\#/g,escape('#')
      ).replace(
        /\-/g,'%2D'
      ).replace(
        /\+/g,'%2B'
      );
      while (limitedLog.length < 1000 && logLength > -50) {
        logLength -= 1;
        limitedLog = window.console.logs.slice(logLength).join('%0A').replace(
          /\&/g,escape('&')
        ).replace(
          /\#/g,escape('#')
        ).replace(
          /\-/g,'%2D'
        ).replace(
          /\+/g,'%2B'
        );
      }
      var body = customMessage + this.state.error.message + "\n\n" + this.state.error.stack.replace("#",escape("#")) + "\n\n```diff\n" + limitedLog + "\n```\n";
      var form = document.createElement("form");
      form.setAttribute("method", "get");
      form.setAttribute("action", url);
      form.setAttribute("target", "view");
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", "body");
      hiddenField.setAttribute("value", body);
      form.appendChild(hiddenField);
      document.body.appendChild(form);
      window.open('', 'view');
      form.submit();
    };

    componentDidCatch (error, info) {
      // Report error to GA
      window.ga('vfb.send', 'event', 'error', 'react', error.message + " - " + error.stack.replace("#",escape("#")));
      // Display fallback UI
      this.setState({ hasError: true, error: error });
      // add clinet data to console
      $.getJSON('http://gd.geobytes.com/GetCityDetails?callback=?', function (data) {
        console.log('USER: ' + data.geobytesipaddress + '  ' + data.geobytesfqcn);
      });
    }
  
    render () {
      const { classes } = this.props;
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return (
          <div>
            <Dialog
              open={this.state.open}
              onClose={this.handleClose}>
              <DialogTitle 
                classes={{ root: classes.rootTitle }}
                disableTypography={true}>
                {"VFB Error report"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText
                  classes={{ root: classes.rootText }}>
                    An error just occurred, you can either reload the application or help us out by reporting
                    the issue using the button below.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={this.handleClose} 
                  size="medium" 
                  autoFocus
                  classes={{ root: classes.rootButton }}>
                    Report
                </Button>
                <Button 
                  onClick={() => location.reload(true)} 
                  size="medium"
                  classes={{ root: classes.rootButton }}>
                    Reload
                </Button>

              </DialogActions>
            </Dialog>
          </div>
        );
      }
      return this.props.children;
    }
}

ErrorCatcher.propTypes = { classes: PropTypes.object.isRequired, };

export default withStyles(styles)(ErrorCatcher);
