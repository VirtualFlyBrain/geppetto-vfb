import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Menu from 'geppetto-client/js/components/interface/menu/Menu';

var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;

require('../../css/FocusTerm.less');

export default class FocusTerm extends React.Component {

  constructor (props) {
    super(props);
    this.state = { currentInstance: undefined };

    this.focusTermConfiguration = require('../configuration/focusTermConfiguration.js').focusTermConfiguration;

    this.menuHandler = this.menuHandler.bind(this);
  }

  menuHandler (click) {
    switch (click.handlerAction) {
    case 'focusTermHandler':
      console.log("just a test");
      break;
    default:
      return this.props.menuHandler(click);
    }
  }

  setInstance(instance) {
    this.focusTermConfiguration.buttons[0].label = instance.name;
    this.setState({ currentInstance: instance });
  }

  componentDidMount() {
    
  }

  render () {
    var buttonsToRender = (<span>
      <i className="fa fa-arrow-left arrowsStyle"
        onClick={() => {
          window.setTermInfo( window.historyWidgetCapability.vfbterminfowidget[window.historyWidgetCapability.vfbterminfowidget.length - 1].arguments[1], window.historyWidgetCapability.vfbterminfowidget[window.historyWidgetCapability.vfbterminfowidget.length - 1].arguments[1].getName() );
        }}/>
      <i className="fa fa-arrow-right arrowsStyle"
        onClick={() => {
          window.setTermInfo( window.historyWidgetCapability.vfbterminfowidget[1].arguments[1], window.historyWidgetCapability.vfbterminfowidget[1].arguments[1].getName() );
        }}/>
    </span>);
    return (
      <Rnd
        enableResizing={{
          top: false, right: false, bottom: false, left: false,
          topRight: false, bottomRight: false, bottomLeft: false,
          topLeft: false
        }}
        default={{
          x: 0, y: 30,
          height: 30,
          width: '100%'
        }}
        className="focustermClass"
        disableDragging={true}
        ref={e => {
          this.rnd = e;
        }}
        style={{ "backgroundColor": "#010101" }} >
        <nav className="focusTerm">
          <div className="focusTermLeft">
            <div className="focusTermDivL">
              <Tabs>
                <TabList>
                  <Tab>Adult Brain</Tab>
                  <Tab>&nbsp; + &nbsp;</Tab>
                </TabList>
              </Tabs>
            </div>
          </div>

          <div className="focusTermCenter">
            <div className="focusTermDivC">
            </div>
          </div>

          <div className="focusTermRight">
            <div className="focusTermDivR">
              <i className="fa fa-arrow-left arrowsStyle"
                onClick={() => {
                  if (window.historyWidgetCapability !== undefined && window.historyWidgetCapability.vfbterminfowidget.length > 1) {
                    window.setTermInfo( window.historyWidgetCapability.vfbterminfowidget[window.historyWidgetCapability.vfbterminfowidget.length - 1].arguments[0], window.historyWidgetCapability.vfbterminfowidget[window.historyWidgetCapability.vfbterminfowidget.length - 1].arguments[0].getName() );
                  }
                }}/>
              <i className="fa fa-arrow-right arrowsStyle"
                onClick={() => {
                  if (window.historyWidgetCapability !== undefined && window.historyWidgetCapability.vfbterminfowidget.length > 1) {
                    window.setTermInfo( window.historyWidgetCapability.vfbterminfowidget[1].arguments[0], window.historyWidgetCapability.vfbterminfowidget[1].arguments[0].getName() );
                  }
                }}/>
              { this.state.currentInstance !== undefined
                ? <Menu
                  configuration={this.focusTermConfiguration}
                  menuHandler={this.menuHandler} />
                : undefined }
            </div>
          </div>
        </nav>
      </Rnd>

    );
  }
}
