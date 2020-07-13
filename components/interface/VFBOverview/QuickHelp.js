import React from 'react';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader';
import Icon from '@material-ui/core/IconButton'
import Divider from '@material-ui/core/Divider'
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

var Rnd = require('react-rnd').default;

const configuration = require('../../configuration/VFBOverview/quickHelp.json')

const styles = theme => ({
  root: {
    backgroundColor : "white",
    animation: "fadeIn 1s",
    WebkitAnimation: "fadeIn 1s",
    transition: "opacity 1s ease-out",
    zIndex: "999999",
    overflow: "hidden",
    boxShadow: "0 0 0 1600px rgba(0,0,0,0.65)",
  },
  
  main : { height : "85%" },
  
  font : {
    fontFamily: "Barlow",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "14px",
    lineHeight: "17px"
  },
  
  mainLeftSide : {
    float : "left" ,
    width : "50%",
    height : "100%",
    textAlign : "center",
    alignItems: "center",
    justifyContent: "center",
    display: "flex"
  },
  
  mainRightSide : {
    float : "right" ,
    width : "50%",
    height : "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex"
  },
  
  image : {
    magin : "0 auto",
    height : "85%",
    width : "85%",
    objectFit: "cover"
  },

  contentBar : {
    width : "85%",
    float : "left"
  },
  
  navigationBar : {
    width : "15%",
    float : "left"
  },
  
  listItem: { padding: 0 },
  
  listHeader : {
    fontFamily: "Barlow Condensed",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "22px",
    lineHeight: "26px",
    color: "#181818"
  },
    
  list : {
    color : "rgba(24, 24, 24, 0.6)",
    padding : "10px 0 0 5px"
  },
  
  footer : {
    margin : "3% 0 0 3%",
    height : "15%"
  },
  
  buttonBar : {
    float : "right",
    width : "30%"
  },
  
  nextButton : {
    marginLeft : "5px",
    backgroundColor : "#52BDF8",
    color : "white",
    borderRadius: "0px"
  },
  
  checkboxLabel : {
    fontWeight : "normal",
    color : "rgba(24, 24, 24, 0.6)"
  },
  
  checkboxBar : {
    float : "left",
    width : "70%"
  }
  
});

class VFBQuickHelp extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      // eslint-disable-next-line no-unneeded-ternary
      isChecked: (window.getCookie("show_quick_help") === "1" ? true : false),
      currentStep : 0 
    }

    this.escFunction = this.escFunction.bind(this);
    this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this);
    this.closeQuickHelp = this.closeQuickHelp.bind(this);
    this.nextStep = this.nextStep.bind(this);
  }

  escFunction (event) {
    if (event.keyCode === 27) {
      this.closeQuickHelp();
    }
  }

  handleCheckBoxClick (e) {
    // set 30 days expiration
    window.setCookie('show_quick_help', !this.state.isChecked ? 1 : 0, 30);
    this.setState({ isChecked: !this.state.isChecked });
  }

  closeQuickHelp () {
    this.props.closeQuickHelp();
  }
  
  nextStep (newStep) {
    let step = this.state.currentStep + 1;
    
    if ( newStep !== undefined ) {
      step = newStep;
    }
    
    if ( configuration.steps.length <= step ) {
      this.closeQuickHelp();
    } else {
      this.setState( { currentStep : step } );
    } 
  }

  componentDidMount () {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount () {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  render () {
    let self = this;
    var cookie = window.getCookie("show_quick_help");
    var boxChecked = false;
    // Show 'Quick Help' modal if cookie to hide it is not set to True
    if ( cookie != 1) {
      boxChecked = true;
    }
    
    let xPos = window.innerWidth / 2 - configuration.width / 2;
    let yPos = window.innerHeight / 2 - configuration.height / 2;
    
    const { classes } = this.props;
    
    return (
      <Rnd enableResizing={{
        top: false, right: false, bottom: false, left: false,
        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
      }}
      default={{
        x: xPos, y: yPos,
        height: configuration.height,
        width: configuration.width
      }}
      className={[classes.root, classes.font].join(' ')}
      disableDragging={true}
      maxHeight= {configuration.height}
      maxWidth= {configuration.width}
      ref={d => {
        self.rnd2 = d;
      }} >
        <div ref={self.htmlToolbarRef} className={ classes.main }>
          <div className={ classes.mainLeftSide }>
            <img
              className={ classes.image }
              src={configuration.steps[self.state.currentStep].image}
            />
          </div>
          <div className = { classes.mainRightSide }>
            <div className={ classes.contentBar }>
              <List
                subheader={
                  <ListSubheader
                    component="div"
                    id="nested-list-subheader"
                    classes={{ root: classes.listHeader }}
                  >  
                    {configuration.steps[self.state.currentStep].title}
                  </ListSubheader>
                }
                classes={{ root: classes.list }}
              >
                {configuration.steps[self.state.currentStep].instructions.map( function ( instruction, index ) {
                  return (<ListItem key={index} classes={{ root: classes.list }} >
                    <ListItemIcon>
                      <Icon className={instruction.icon} />
                    </ListItemIcon>
                    <ListItemText
                      primary={instruction.label}
                      classes={{ primary : classes.font }}
                    />
                  </ListItem>)
                })}
              </List>
            </div>
            <div className={ classes.navigationBar }>
              <List>
                {configuration.steps.map( function (instruction, index) {
                  return (<ListItem key={index} classes={{ root: classes.listItem }}>
                    <ListItemIcon onClick={ () => self.nextStep(index) } >
                      <Icon
                        className="fa fa-circle"
                        style={ 
                          self.state.currentStep === index
                            ? { color : "rgba(24, 24, 24, 0.6)" }
                            : { color : "rgba(30, 30, 30, 0.2)" }
                        }
                      />
                    </ListItemIcon>
                  </ListItem>)
                })}
              </List>
            </div>
          </div>
        </div>
        <Divider />
        <div id="quickHelpFooter" className={ classes.footer }>
          <div className={ classes.checkboxBar }>
            <input
              type="checkbox"
              id="quick_help_dialog"
              onChange={e => self.handleCheckBoxClick(e)}
              ref={ input => self.myinput = input}
              name="help_dialog"
              checked={self.state.isChecked}
            />
            <label className={classes.checkboxLabel}>
              &nbsp;&nbsp;Don&apos;t show Quick Help on startup (accessible from Help menu).
            </label>
          </div>
          <div className={[classes.buttonBar, classes.font].join(' ')}>
            <Button
              onClick={self.closeQuickHelp}
              classes={{ label : classes.font }}
            >
              Skip intro
            </Button>
            { configuration.steps.length - 1 === self.state.currentStep
              ? <Button
                variant="contained"
                classes={{ root: classes.nextButton, label : classes.font }}
                onClick={this.closeQuickHelp}
              >
                Finish
              </Button>
              : <Button
                variant="contained"
                classes={{ root: classes.nextButton, label : classes.font }}
                onClick={ () => self.nextStep() }
              >
                Next   <i style={{ marginLeft : "1rem" }} className="fa fa-arrow-right"/>
              </Button>
            }
          </div>
        </div>
      </Rnd>
    )
  }
}

VFBQuickHelp.propTypes = { classes: PropTypes.object.isRequired };

export default withStyles(styles)(VFBQuickHelp);
