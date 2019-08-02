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
    var allQueries = undefined;
    var variable = undefined;

    switch (click.handlerAction) {
    case 'focusTermHandler':
      var focusSubMenu = [];
      if (typeof click.parameters[0].getParent().select !== 'undefined' && typeof click.parameters[0].getParent().select === 'function') {
        focusSubMenu.push(
          {
            label: "Select",
            icon: "",
            action: {
              handlerAction: "singleAction",
              value: () => {
                click.parameters[0].getParent().select()
              }
            }
          },
        );
      }
      if (typeof click.parameters[0].getParent().show !== 'undefined' && typeof click.parameters[0].getParent().show === 'function') {
        focusSubMenu.push(
          {
            label: "Show 3D Volume",
            icon: "",
            action: {
              handlerAction: "singleAction",
              value: () => {
                click.parameters[0].getParent().show()
              }
            }
          },
        );
      }
      if (typeof click.parameters[0].getParent().hide !== 'undefined' && typeof click.parameters[0].getParent().hide === 'function') {
        focusSubMenu.push(
          {
            label: "Hide 3D Volume",
            icon: "",
            action: {
              handlerAction: "singleAction",
              value: () => {
                click.parameters[0].getParent().hide()
              }
            }
          },
        );
      }
      // TO BE FIXED condition in if, not required
      if (click.parameters[0] !== undefined || click.parameters[0] === null) {
        focusSubMenu.push(
          {
            label: "Show Info",
            icon: "",
            action: {
              handlerAction: "singleAction",
              value: () => {
                this.props.UIUpdateManager("termInfoVisible");
              }
            }
          },
        );
      }

      if (click.parameters[0].parent !== null || click.parameters[0].parent !== undefined) {
        variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([click.parameters[0].getParent().getId()])[0]
      } else {
        variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([click.parameters[0].getId()])[0]
      }
      allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
      if (allQueries.length > 0) {
        focusSubMenu.push(
          {
            label: "Search for",
            icon: "",
            action: "",
            position: "left",
            dynamicListInjector: {
              handlerAction: "searchForHandler",
              parameters: [variable, allQueries]
            }
          }
        );
      }
      return focusSubMenu;
    case 'searchForHandler':
      var searchSubMenu = [];
      var queries = click.parameters[1];
      var instance = click.parameters[0]
      for (let i = 0; i < queries.length; i++) {
        searchSubMenu.push(
          {
            label: queries[i].getDescription().replace("$NAME", instance.getName()),
            icon: "",
            action: {
              handlerAction: "runQueryHandler",
              parameters: [instance, queries[i]]
            }
          },
        );
      }
      return searchSubMenu;
    case 'runQueryHandler':
      var that = this;
      var Query = require('geppetto-client/js/geppettoModel/model/Query');
      var otherId = click.parameters[0].getId();
      var otherName = click.parameters[0].getName();
      var callback = function () {
        // check if any results with count flag
        if (that.props.queryBuilder.props.model.count > 0) {
          // runQuery if any results
          that.props.queryBuilder.runQuery();
        } else {
          that.props.queryBuilder.switchView(false);
        }
        // show query component
        that.props.queryBuilder.open();
        $("body").css("cursor", "default");
        GEPPETTO.trigger('stop_spin_logo');
      };
      var entity = Model[otherId];
      // clear query builder unless ctrl pressed them add to compound.
      this.props.queryBuilder.open();
      if (!GEPPETTO.isKeyPressed("shift")) {
        this.props.queryBuilder.switchView(false, false);
        this.props.queryBuilder.clearAllQueryItems();
      } else {
        this.props.queryBuilder.switchView(false, false);
      }

      GEPPETTO.trigger('spin_logo');
      $("body").css("cursor", "progress");
      if (window[otherId] === undefined) {
        window.fetchVariableThenRun(otherId, function () {
          this.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: click.parameters[1] }, callback) 
        }.bind(this));
      } else {
        setTimeout(function () {
          this.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: click.parameters[1] }, callback); 
        }.bind(this), 100);
      }
      break;
    case 'showInstance':
      click.value.getParent().show();
      break;
    case 'singleAction':
      click.value();
      break;
    default:
      console.log("Focus Term menu component error, default case, click attached");
      console.log(click);
    }
  }

  setInstance (instance) {
    this.focusTermConfiguration.buttons[0].label = instance.name;
    this.focusTermConfiguration.buttons[0].dynamicListInjector.parameters = [instance];
    this.setState({ currentInstance: instance });
  }

  componentDidMount () {
    
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
            { this.state.currentInstance !== undefined
              ? <div className="focusTermDivR">
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
                <Menu
                  configuration={this.focusTermConfiguration}
                  menuHandler={this.menuHandler} />
              </div>
              : undefined }
          </div>
        </nav>
      </Rnd>

    );
  }
}
