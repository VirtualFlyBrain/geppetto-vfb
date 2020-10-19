/* eslint-disable no-tabs */
import React from 'react';
import Menu from '@geppettoengine/geppetto-ui/menu/Menu';
var VFBLoader = require('../VFBLoader/VFBLoaderContainer').default;
var Rnd = require('react-rnd').default;

require('../../../css/VFBToolBar.less');

const popperStyles = {
  root: {
    top: '1px',
    backgroundColor: '#444141f2',
    borderRadius: 0,
    color: '#ffffff',
    fontSize: '12px',
    fontFamily: 'Barlow Condensed, Khand, sans-serif',
    minWidth: '110px',
    borderLeft: '1px solid #585858',
    borderRight: '1px solid #585858',
    borderBottom: '1px solid #585858',
    borderBottomLeftRadius: '2px',
    borderBottomRightRadius: '2px',
  }
};

const sectionStyles = {
  root1: {
    background: '#010101',
    borderRadius: 0,
    border: 0,
    boxShadow: '0px 0px',
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Barlow Condensed, Khand, sans-serif',
    margin: '0px 0px 0px 0px',
    minWidth: '44px',
    height: '30px',
    textTransform: 'capitalize',
    textAlign: 'left',
    justifyContent: 'start',
    marginTop: '1px'
  },
  root2: {
    background: "#11bffe",
    backgroundColor: "#11bffe",
    borderRadius: 0,
    border: 0,
    boxShadow: '0px 0px',
    color: '#ffffff',
    fontSize: '16px',
    fontFamily: 'Barlow Condensed, Khand, sans-serif',
    margin: '0px 0px 0px 0px',
    minWidth: '44px',
    height: '30px',
    textTransform: 'capitalize',
    textAlign: 'left',
    justifyContent: 'start',
    marginTop: '1px'
  }
};

export default class VFBToolBar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      anchorEl: null,
      htmlChild: undefined
    }

    this.menuConfiguration = require('../../configuration/VFBToolbar/vfbtoolbarMenuConfiguration').toolbarMenu;
    this.aboutHTML = require('../../configuration/VFBToolbar/vfbtoolbarHTML').about;
    this.feedbackHTML = require('../../configuration/VFBToolbar/vfbtoolbarHTML').feedback;
    this.contributeHTML = require('../../configuration/VFBToolbar/vfbtoolbarHTML').contribute;

    this.clickAbout = this.clickAbout.bind(this);
    this.menuHandler = this.menuHandler.bind(this);
    this.clickFeedback = this.clickFeedback.bind(this);
    this.clickContribute = this.clickContribute.bind(this);
    this.clickQuickHelp = this.clickQuickHelp.bind(this);
  }

  componentWillMount () {
    var head = document.head;
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css?family=Khand:300,400&display=swap"

    head.appendChild(link);
  }

  clickFeedback () {
    var htmlContent = this.feedbackHTML;
    window.ga('vfb.send', 'pageview', (window.location.pathname + '?page=Feedback'));
    // report console log for agrigated analysis
    window.ga('vfb.send', 'feedback', window.location.href, window.console.logs.join('\n').replace(/\#/g,escape('#')), );

    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion,10);
    var nameOffset,verOffset,ix;

    if ((verOffset = nAgt.indexOf("Opera")) != -1) { // In Opera, the true version is after "Opera" or after "Version"
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1) {
        fullVersion = nAgt.substring(verOffset + 8);
      }
    } else if ((verOffset = nAgt.indexOf("MSIE")) != -1) { // In MSIE, the true version is after "MSIE" in userAgent
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset + 5);
    } else if ((verOffset = nAgt.indexOf("Chrome")) != -1) { // In Chrome, the true version is after "Chrome"
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset + 7);
    } else if ((verOffset = nAgt.indexOf("Safari")) != -1) { // In Safari, the true version is after "Safari" or after "Version"
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1) {
        fullVersion = nAgt.substring(verOffset + 8);
      }
    } else if ((verOffset = nAgt.indexOf("Firefox")) != -1) { // In Firefox, the true version is after "Firefox"
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset + 8);
    } else if ( (nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/')) ) { // In most other browsers, "name/version" is at the end of userAgent
      browserName = nAgt.substring(nameOffset,verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1) {
      fullVersion = fullVersion.substring(0,ix);
    }
    if ((ix = fullVersion.indexOf(" ")) != -1) {
      fullVersion = fullVersion.substring(0,ix);
    }
    majorVersion = parseInt('' + fullVersion,10);
    if (isNaN(majorVersion)) {
      fullVersion = '' + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion,10);
    }
    // return as much of the log up to the last 10 events < 1000 characters:
    var logLength = -50;
    var limitedLog = window.console.logs.slice(logLength).join('/n');
    while (limitedLog.length < 1000 && logLength < 0) {
      logLength += 1;
      limitedLog = window.console.logs.slice(logLength).join('/n');
    }
    this.props.htmlOutputHandler(
      htmlContent.replace(
        /\$URL\$/g,window.location.href.replace(
          /\&/g,escape('&')
        ).replace(
          /\#/g,escape('#')
        )
      ).replace(
        /\$BROWSER\$/g, browserName
      ).replace(
        /\$VERSION\$/g, fullVersion
      ).replace(
        /\$DATE\$/g, Date()
      ).replace(
        /\$SCREEN\$/g, window.innerWidth + ',' + window.innerHeight
      ).replace(
        /\$LOG\$/g, limitedLog
      ).replace(
        /\$COLOURLOG\$/g, window.console.logs.join('</span><br />').replace(
          /\&/g,escape('&')
        ).replace(
          /\#/g,escape('#')
        ).replace(
          /\-\ /g, '<span style="color:orange">'
        ).replace(
          /\+\ /g, '<span style="color:yellow">'
        )
      )
    );
  }

  clickAbout () {
    var htmlContent = this.aboutHTML;
    this.props.htmlOutputHandler(htmlContent);
    window.ga('vfb.send', 'pageview', (window.location.pathname + '?page=About'));
  }

  clickContribute () {
    var htmlContent = this.contributeHTML;
    this.props.htmlOutputHandler(htmlContent);
    window.ga('vfb.send', 'pageview', (window.location.pathname + '?page=Contribute'));
  }
  
  clickQuickHelp () {
    GEPPETTO.trigger('show_quick_help');
  }

  menuHandler (click) {
    switch (click.handlerAction) {
    case 'openNewTab':
      click.parameters.map((item, index) => {
        window.ga('vfb.send', 'pageview', item);
        window.open(item, '_blank');
      })
      break;
    case 'redirectTo':
      window.location.href = click.parameters[0];
      break;
    case 'clickAbout':
      this.clickAbout();
      break;
    case 'clickFeedback':
      this.clickFeedback();
      break;
    case 'clickContribute':
      this.clickContribute();
      break;
    case 'clickQuickHelp':
      this.clickQuickHelp();
      break;
    default:
      return this.props.menuHandler(click);
    }
  }

  render () {
    const style = { padding: 2 };
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : null;

    return (
      <Rnd
        enableResizing={{
          top: false, right: false, bottom: false, left: false,
          topRight: false, bottomRight: false, bottomLeft: false,
          topLeft: false
        }}
        default={{
          x: 0, y: 0,
          height: 30,
          width: '100%'
        }}
        className="vfbToolBarClass"
        disableDragging={true}
        ref={e => {
          this.rnd = e;
        }}
        style={{ "backgroundColor": "#010101" }} >
        <nav className="vfbToolBar">
          <div className="toolBarLeft">
            <div className="toolBarDivL">
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Menu
                configuration={this.menuConfiguration}
                menuHandler={this.menuHandler}/>
            </div>
          </div>

          <div className="toolBarCenter">
            <div className="toolBarDivC">
            </div>
          </div>

          <div className="toolBarRight">
            <div className="toolBarDivR"> 
              <VFBLoader />
            </div>
          </div>
        </nav>
      </Rnd>
    );
  }
}
