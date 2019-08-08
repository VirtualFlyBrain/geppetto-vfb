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
    this.updateHistory = this.updateHistory.bind(this);
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
          if ($('#add-new-query-container')[0] !== undefined) {
            $('#add-new-query-container')[0].hidden = true;
            $('#query-builder-items-container')[0].hidden = true;
          }
          this.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: click.parameters[1] }, callback) 
        }.bind(this));
      } else {
        setTimeout(function () {
          if ($('#add-new-query-container')[0] !== undefined) {
            $('#add-new-query-container')[0].hidden = true;
            $('#query-builder-items-container')[0].hidden = true;
          }
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
    this.focusTermConfiguration.buttons[0].label = instance.getName();
    this.focusTermConfiguration.buttons[0].dynamicListInjector.parameters = [instance];
    this.setState({ currentInstance: instance });
    this.updateHistory(instance);
  }

  componentDidMount () {
    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      if (instance[instance.getId() + "_meta"] !== undefined && instance.getName() !== this.state.currentInstance.getName()) {
        this.setInstance(instance[instance.getId() + "_meta"]);
      }
    }.bind(this));
  }

  updateHistory (instance) {
    try {
      if (window.vfbUpdatingHistory == undefined) {
        window.vfbUpdatingHistory = false;
      }
      if (window.vfbUpdatingHistory == false) {
        window.vfbUpdatingHistory = true;
        // Update the parent windows history with current instances (i=) and popup selection (id=)
        var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, Instances);
        var visualParents = [];
        for (var i = 0; i < visualInstances.length; i++) {
          if (visualInstances[i].getParent() != null) {
            visualParents.push(visualInstances[i].getParent());
          }
        }
        visualInstances = visualInstances.concat(visualParents);
        var compositeInstances = [];
        for (var i = 0; i < visualInstances.length; i++) {
          if (visualInstances[i] != null && visualInstances[i].getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
            compositeInstances.push(visualInstances[i]);
          }
        }
        var items = 'i=';
        if (window.templateID) {
          items = items + ',' + window.templateID;
        }
        compositeInstances.forEach(function (compositeInstance) {
          if (!items.includes(compositeInstance.getId())) {
            items = items + ',' + compositeInstance.getId() 
          } 
        });
        items = items.replace(',,', ',').replace('i=,', 'i=');
        var title = null;
        try {
          items = 'id=' + instance.getId() + '&' + items;
          title = instance.getName();
          window.ga('vfb.send', 'pageview', (window.location.pathname + '?id=' + instance.getId() ));
        } catch (ignore) { }
        if (items != "i=") {
          if (window.history.state == null) {
            window.history.replaceState({ s:1, n:title, b:"", f:"" }, title, window.location.pathname + "?" + items);
          }
          var state = window.history.state.s;
          switch (state) {
          case 2:
            if (window.location.search.indexOf(items.split("&")[0]) > -1) {
              window.history.replaceState({ s:1, n:title, b:window.history.state.b, f:window.history.state.f }, title, window.location.pathname + "?" + items);
            }
            break;
          case 0:
            window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.name, window.location.pathname + window.history.state.u);
            if (!(("?" + items) == window.location.search)) {
              window.history.pushState({ s:1, n:title, b:window.history.state.n, f:"" }, title, window.location.pathname + "?" + items);
            }
            break;
          default:
            if (!(("?" + items) == window.location.search)) {
              window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.name, window.location.pathname + window.location.search);
              window.history.pushState({ s:1, n:title, b:window.history.state.n, f:"" }, title, window.location.pathname + "?" + items);
            }
          }
        }
        window.ga('vfb.send', 'pageview', (window.location.pathname + window.location.search));
        window.vfbUpdatingHistory = false;
      }
    } catch (ignore) {
      console.error("Focus term URL update error!");
      window.vfbUpdatingHistory = true; // block further updates
    }
  }

  render () {
    var buttonsToRender = (<span>
      <i className="fa fa-arrow-left arrowsStyle"
        onClick={() => {
          window.history.back();
        }}/>
      <i className="fa fa-arrow-right arrowsStyle"
        onClick={() => {
          window.history.forward();
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
              <i className="fa fa-search arrowsStyle"
                onClick={() => {
                  this.props.UIUpdateManager("spotlightVisible");
                }}/>
              <i className="fa fa-quora arrowsStyle"
                onClick={() => {
                  this.props.UIUpdateManager("queryBuilderVisible");
                }}/>
              <i className="fa fa-list arrowsStyle"
                onClick={() => {
                  this.props.UIUpdateManager("controlPanelVisible");
                }}/>
              { this.state.currentInstance !== undefined
                ? <span>
                  { window.history.state.b !== undefined && window.history.state.b !== ""
                    ? <i className="fa fa-chevron-left arrowsStyle"
                      onClick={() => {
                        if (window.vfbUpdatingHistory == false) {
                          window.history.back();
                        }
                      }} title={window.history.state.b} />
                    : undefined }
                  { window.history.state.f !== undefined && window.history.state.f !== "" 
                    ? <i className="fa fa-chevron-right arrowsStyle"
                      onClick={() => {
                        if (window.vfbUpdatingHistory == false) {
                          window.history.forward();
                        }
                      }} title={window.history.state.f} />
                    : undefined }
                  <Menu
                    configuration={this.focusTermConfiguration}
                    menuHandler={this.menuHandler} />
                </span>
                : undefined }
            </div>
          </div>
        </nav>
      </Rnd>

    );
  }
}
