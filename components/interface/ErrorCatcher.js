import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { safeGa } from './utils/utils';

require('../../css/VFBMain.less');
require('../../css/colors.less');

// GitHub rejects issue URLs much past 8k; keep the body comfortably inside that.
const MAX_REPORT_BODY = 5000;

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
    /*
     * Open a prefilled GitHub issue. This used to build the body from up to 50
     * console lines and submit it as a GET form, which quietly did nothing:
     * the URL ran past what GitHub accepts, and any missing piece
     * (console.logs, error.stack) threw inside the click handler. Cap the body,
     * guard every part, and fall back to the clipboard if the window is blocked.
     */
    buildReportBody = () => {
      var error = this.state.error || {};
      var parts = [
        "Steps to reproduce the problem:",
        "",
        "Please fill the below with the necessary steps to reproduce the problem",
        "",
        "",
        "Error Information:",
        "",
        String(error.message || "(no message)"),
        "",
        String(error.stack || "(no stack)")
      ];
      var logs = (window.console && Array.isArray(window.console.logs)) ? window.console.logs : [];
      if (logs.length > 0) {
        /*
         * Newest lines are the interesting ones, and the whole report has to fit
         * in a URL -- GitHub rejects much beyond 8k, so keep the body well under.
         */
        var budget = MAX_REPORT_BODY - parts.join("\n").length - 32;
        var tail = [];
        for (var i = logs.length - 1; i >= 0 && budget > 0; i--) {
          var line = String(logs[i]);
          budget -= line.length + 1;
          if (budget > 0) {
            tail.unshift(line);
          }
        }
        if (tail.length > 0) {
          parts.push("", "```", tail.join("\n"), "```");
        }
      }
      return parts.join("\n").slice(0, MAX_REPORT_BODY);
    };

    handleClose = () => {
      try {
        var error = this.state.error || {};
        var url = "https://github.com/VirtualFlyBrain/VFB2/issues/new?"
          + "title=" + encodeURIComponent("Error: " + String(error.message || "unknown").slice(0, 120))
          + "&body=" + encodeURIComponent(this.buildReportBody());
        var opened = window.open(url, "_blank");
        if (opened === null || opened === undefined) {
          // Popup blocked: leave the report where the user can paste it themselves.
          if (navigator.clipboard !== undefined && navigator.clipboard.writeText !== undefined) {
            navigator.clipboard.writeText(this.buildReportBody());
          }
          window.alert("Couldn't open GitHub (the window was blocked). The report has been copied to your"
            + " clipboard - please paste it into a new issue at"
            + " https://github.com/VirtualFlyBrain/VFB2/issues/new");
        }
      } catch (e) {
        // Reporting must never throw on top of the error being reported.
        console.error("Could not open the error report", e);
        window.alert("Couldn't open the report form. Please raise an issue at"
          + " https://github.com/VirtualFlyBrain/VFB2/issues/new");
      }
    };

    componentDidCatch (error, info) {
      // Report error to GA
      safeGa('vfb.send', 'event', 'error', 'react', error.message + " - " + error.stack.replace("#",escape("#")));
      // Display fallback UI
      this.setState({ hasError: true, error: error });
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
