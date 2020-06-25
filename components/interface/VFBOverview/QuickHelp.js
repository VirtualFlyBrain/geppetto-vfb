import React from 'react';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/IconButton'

var Rnd = require('react-rnd').default;

const configuration = require('../../configuration/VFBOverview/quickHelp.json')

export default class VFBQuickHelp extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      // eslint-disable-next-line no-unneeded-ternary
      isChecked: (window.getCookie("show_quick_help") === "1" ? true : false),
      currentStep : 0 
    }

    this.escFunction = this.escFunction.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.closeQuickHelp = this.closeQuickHelp.bind(this);
  }

  escFunction (event) {
    if (event.keyCode === 27) {
      this.closeQuickHelp();
    }
  }

  handleChange (e) {
    // set 30 days expiration
    window.setCookie('show_quick_help', !this.state.isChecked ? 1 : 0, 30);
    this.setState({ isChecked: !this.state.isChecked });
  }

  closeQuickHelp () {
    this.props.closeQuickHelp();
  }

  componentDidMount () {
    document.addEventListener("keydown", this.escFunction, false);
  }

  componentWillUnmount () {
    document.removeEventListener("keydown", this.escFunction, false);
  }

  render () {
    var cookie = window.getCookie("show_quick_help");
    var boxChecked = false;
    // Show 'Quick Help' modal if cookie to hide it is not set to True
    if ( cookie != 1) {
      boxChecked = true;
    }
    
    let xPos = window.innerWidth / 2 - configuration.width / 2;
    let yPos = window.innerHeight / 2 - configuration.height / 2;
    return (
      <Rnd enableResizing={{
        top: false, right: false, bottom: false, left: false,
        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
      }}
      default={{
        x: xPos, y: yPos,
        height: configuration.height,
        width: configuration.width
      }} className="quickHelpViewer"
      disableDragging={true}
      maxHeight= {configuration.height}
      maxWidth= {configuration.width}
      ref={d => {
        this.rnd2 = d;
      }} >
        <div><i onClick={this.closeQuickHelp} className='close-quickHelp fa fa-times'/></div>
        <div ref={this.htmlToolbarRef} style={{ height : "90%" }}>
          <div style={{ float : "left" , width : "50%" }}><img src={configuration.steps[this.state.currentStep].image}/></div>
          <div style={{ float : "left" , width : "50%" }}>
            <div>
              <List>
                {configuration.steps[this.state.currentStep].instructions.forEach( (instruction) => {
                  return <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <Icon className={instruction.icon} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={instruction.label}
                    />
                  </ListItem>
                })}
              </List>
            </div>
          </div>
        </div>
        <div id="quickHelpFooter" style={{ marginLeft : "10px", height : "10%" }}>
          <div style={{ float : "left", width : "70%" }}>
            <input type="checkbox" id="quick_help_dialog" onChange={e => this.handleChange(e)} ref={ input => this.myinput = input} name="help_dialog" checked={this.state.isChecked} />
            <label htmlFor="help_dialog">&nbsp;&nbsp;Don&apos;t show Quick Help on startup (accessible from Help menu).</label>
          </div>
          <div style={{ float : "right", width : "30%" }}>
            <Button variant="contained">Skip intro</Button>
            <Button variant="contained" color="primary">
              Next
            </Button>
          </div>
        </div>
      </Rnd>
    )
  }
}
