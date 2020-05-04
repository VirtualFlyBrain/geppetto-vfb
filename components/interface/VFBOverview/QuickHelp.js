import React from 'react';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';

var Rnd = require('react-rnd').default;

export default class VFBQuickHelp extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      // eslint-disable-next-line no-unneeded-ternary
      isChecked: (window.getCookie("show_quick_help") === "1" ? true : false),
    }

    this.escFunction = this.escFunction.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.closeQuickHelp = this.closeQuickHelp.bind(this);

    this.htmlContent = "<img style=\"height : 90vh; object-fit : cover; width: 100%; padding : 1rem; display: block; padding-top : 3rem; \" src=\"geppetto/build/splash.png\" />"
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
    return (
      <Rnd enableResizing={{
        top: false, right: false, bottom: false, left: false,
        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
      }}
      default={{
        x: 50, y: 25,
        height: window.innerHeight - 50,
        width: window.innerWidth - 100
      }} className="quickHelpViewer"
      disableDragging={true}
      maxHeight={window.innerHeight - 50} minHeight={100}
      maxWidth={window.innerWidth - 100} minWidth={100}
      ref={d => {
        this.rnd2 = d;
      }} >
        <div><i onClick={this.closeQuickHelp} className='close-quickHelp fa fa-times'/></div>
        <div ref={this.htmlToolbarRef}>
          <HTMLViewer
            id="ButtonBarComponentViewerContainer"
            name={"HTMLViewer"}
            componentType={'HTMLViewer'}
            content={this.htmlContent}
            style={{
              width: '100%',
              height: '100%',
              float: 'center'
            }}
            ref="htmlViewer" />
        </div>
        <div id="quickHelpCheckbox">
          <input type="checkbox" id="quick_help_dialog" onChange={e => this.handleChange(e)} ref={ input => this.myinput = input} name="help_dialog" checked={this.state.isChecked} />
          <label htmlFor="help_dialog">&nbsp;&nbsp;Dont show up the quick help on startup screen.</label>
        </div>
      </Rnd>
    )
  }
}
