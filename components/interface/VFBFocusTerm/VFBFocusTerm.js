import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Menu from '@geppettoengine/geppetto-ui/menu/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";
import { connect } from 'react-redux';
import { SHOW_LIST_VIEWER } from './../../../actions/generals';
import focusTermConfiguration from '../../configuration/VFBFocusTerm/focusTermConfiguration';

var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;

require('../../../css/VFBFocusTerm.less');

class VFBFocusTerm extends React.Component {

  constructor (props) {
    super(props);
    this.state = { currentInstance: undefined };


    this.labels = require('../../configuration/VFBFocusTerm/menuGroups').subMenusGrouping;
    this.theme = createMuiTheme({ overrides: { MuiTooltip: { tooltip: { fontSize: "12px" } } } });
    this.configuration = undefined;

    this.clearAll = this.clearAll.bind(this);
    this.menuHandler = this.menuHandler.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
  }

  clearAll () {
    if (Instances !== undefined && Instances.length > 1) {
      for (var i = 1; i < Instances.length; i++) {
        if (Instances[i].getId() !== window.templateID) {
          window.addVfbId(window[window.templateID].getId());
          if (Instances[i].parent != null) {
            Instances[i].parent.delete();
            // Delete instance too after deleting parent
            if (Instances[i] != null) {
              Instances[i].delete()
            }
          } else {
            Instances[i].delete()
          }
          i = i - 1; // Since an array element has been deleted, index is updated too
        }
      }
    }
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
        if (click.parameters[0].getType().classqueriesfrom !== undefined) {
          var classId = click.parameters[0].getType().classqueriesfrom.getValue().getWrappedObj().value.text;
          if (window[classId] === undefined) {
            window.fetchVariableThenRun(classId, () => {
              var variable2 = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
              var allQueries2 = GEPPETTO.ModelFactory.getMatchingQueries(variable2.getType(), undefined);
              if (allQueries2.length > 0) {
                focusSubMenu.push(
                  {
                    label: "Query for",
                    icon: "",
                    action: "",
                    position: "left",
                    dynamicListInjector: {
                      handlerAction: "subMenuGrouping",
                      parameters: [{ variable: variable, allQueries: allQueries },
                                   { variable: variable2, allQueries: allQueries2 }]
                    }
                  }
                );
              }
            });
          }
        } else {
          focusSubMenu.push(
            {
              label: "Query for",
              icon: "",
              action: "",
              position: "left",
              dynamicListInjector: {
                handlerAction: "subMenuGrouping",
                parameters: [{ variable: variable, allQueries: allQueries }]
              }
            }
          );
        }
      } else {
        if (click.parameters[0].getType().classqueriesfrom !== undefined) {
          var classId = click.parameters[0].getType().classqueriesfrom.getValue().getWrappedObj().value.text;
          if (window[classId] === undefined) {
            window.fetchVariableThenRun(classId, () => {
              var variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
              var allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
              if (allQueries.length > 0) {
                focusSubMenu.push(
                  {
                    label: "Query for",
                    icon: "",
                    action: "",
                    position: "left",
                    dynamicListInjector: {
                      handlerAction: "subMenuGrouping",
                      parameters: [{ variable: variable, allQueries: allQueries }]
                    }
                  }
                );
              }
            });
          } else {
            var variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
            var allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
            if (allQueries.length > 0) {
              focusSubMenu.push(
                {
                  label: "Query for",
                  icon: "",
                  action: "",
                  position: "left",
                  dynamicListInjector: {
                    handlerAction: "subMenuGrouping",
                    parameters: [{ variable: variable, allQueries: allQueries }]
                  }
                }
              );
            }
          }
        }
      }
      return focusSubMenu;
    case 'subMenuGrouping':
      var subMenus = [];
      var globalQueries = [];
      for (let i = 0; i < this.labels.length; i++) {
        var subMenu = [];
        for ( let j = 0; j < click.parameters.length; j++ ) {
          var instance = click.parameters[j].variable;
          var instanceId = instance.getId();
          if (globalQueries[instanceId] === undefined) {
            var queries = click.parameters[j].allQueries;
            globalQueries[instanceId] = [...queries]
          }
          for (let y = globalQueries[instanceId].length; y--;) {
            if (this.labels[i].label === "Other queries ") {
              subMenu.push({ variable: instance, allQueries: [globalQueries[instanceId][y]] });
              globalQueries[instanceId].splice(y, 1);
            } else {
              for (let z = 0; z < this.labels[i].keys.length; z++) {
                if (globalQueries[instanceId][y].getDescription().includes(this.labels[i].keys[z])) {
                  subMenu.push({ variable: instance, allQueries: [globalQueries[instanceId][y]] });
                  globalQueries[instanceId].splice(y, 1);
                }
              }
            }
          }
        }
        if (subMenu.length > 0) {
          subMenus.push(
            {
              label: this.labels[i].label,
              icon: "",
              action: "",
              position: "left",
              dynamicListInjector: {
                handlerAction: "searchForHandler",
                parameters: subMenu
              }
            },
          );
        }
      }
      for (let i = 0; i < click.parameters.length; i++) {
        var instance = click.parameters[i].variable;
        var instanceId = instance.getId();
        if (globalQueries[instanceId].length > 0) {
          for (let j = globalQueries[instanceId].length; j--;) {
            subMenus.push(
              {
                label: globalQueries[instanceId][j].getDescription().replace("$NAME", instance.getName()),
                icon: "",
                action: {
                  handlerAction: "runQueryHandler",
                  parameters: [instance, globalQueries[instanceId][j]]
                }
              },
            );
            globalQueries[instanceId].splice(j, 1);
          }
        }
      }
      return subMenus;
    case 'searchForHandler':
      var searchSubMenu = [];
      for (let j = 0; j < click.parameters.length; j++) {
        var queries = click.parameters[j].allQueries;
        var instance = click.parameters[j].variable;
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
      }
      return searchSubMenu;
    case 'runQueryHandler':
      var that = this;
      var Query = require('@geppettoengine/geppetto-core/model/Query');
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
      this.props.queryBuilder.switchView(false, false);
      if (!GEPPETTO.isKeyPressed("shift")) {
        this.props.queryBuilder.clearAllQueryItems();
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
    this.configuration.buttons[0].label = "Queries for " + instance.getName();
    var variable = undefined;

    if (instance.parent !== null || instance.parent !== undefined) {
      variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([instance.getParent().getId()])[0]
    } else {
      variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([instance.getId()])[0]
    }
    allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
    if (allQueries.length > 0) {
      if (instance.getType().classqueriesfrom !== undefined) {
        var classId = instance.getType().classqueriesfrom.getValue().getWrappedObj().value.text;
        if (window[classId] === undefined) {
          window.fetchVariableThenRun(classId, () => {
            var variable2 = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
            var allQueries2 = GEPPETTO.ModelFactory.getMatchingQueries(variable2.getType(), undefined);
            if (allQueries2.length > 0) {
              this.configuration.buttons[0].dynamicListInjector.parameters = [{ variable: variable, allQueries: allQueries },
                                                                              { variable: variable2, allQueries: allQueries2 }];
            }
          });
        } else {
            this.configuration.buttons[0].dynamicListInjector.parameters = [{ variable: variable, allQueries: allQueries }];
        }
      } else {
        this.configuration.buttons[0].dynamicListInjector.parameters = [{ variable: variable, allQueries: allQueries }];
      }
    } else {
      if (instance.getType().classqueriesfrom !== undefined) {
        var classId = instance.getType().classqueriesfrom.getValue().getWrappedObj().value.text;
        if (window[classId] === undefined) {
          window.fetchVariableThenRun(classId, () => {
            var variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
            if (variable !== undefined) {
              var allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
              if (allQueries.length > 0) {
                this.configuration.buttons[0].dynamicListInjector.parameters = [{ variable: variable, allQueries: allQueries }];
              }
            }
          });
        } else {
          var variable = GEPPETTO.ModelFactory.getTopLevelVariablesById([classId])[0]
          if (variable !== undefined) {
            var allQueries = GEPPETTO.ModelFactory.getMatchingQueries(variable.getType(), undefined);
            if (allQueries.length > 0) {
              this.configuration.buttons[0].dynamicListInjector.parameters = [{ variable: variable, allQueries: allQueries }];
            }
          }
        }
      }
    }
    this.updateHistory(instance);
    this.setState({ currentInstance: instance });
  }

  componentDidMount () {
    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      if (this.state.currentInstance === undefined && instance[instance.getId() + "_meta"] !== undefined) {
        this.setInstance(instance[instance.getId() + "_meta"]);
      } else if (instance[instance.getId() + "_meta"] !== undefined && instance.getName() !== this.state.currentInstance.getName()) {
        this.setInstance(instance[instance.getId() + "_meta"]);
      }
    }.bind(this));
  }

  componentWillMount () {
    this.configuration = $.extend(true, {}, focusTermConfiguration);
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
        if (items != "i=") {
          var title = null;
          try {
            items = 'id=' + instance.getId().replace('_meta','') + '&' + items;
            title = instance.getName();
            window.ga('vfb.send', 'pageview', (window.location.pathname + '?id=' + instance.getId().replace('_meta','') ));
          } catch (ignore) { }

          if (window.history.state == null) {
            window.history.replaceState({ s:1, n:title, b:"", f:"" }, title, window.location.pathname + "?" + items);
          }
          var state = window.history.state.s;
          switch (state) {
          case 2:
            // Call from history back/forward
            if (window.location.search.indexOf(items.split("&")[0]) > -1) {
              window.history.replaceState({ s:1, n:title, b:window.history.state.b, f:window.history.state.f }, title, window.location.pathname + "?" + items);
            }
            break;
          case 0:
            // Call from new item loaded
            window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.n, window.location.pathname + window.history.state.u);
            if (!(("?" + items) == window.location.search)) {
              window.history.pushState({ s:1, n:title, b:window.history.state.n, f:"" }, title, window.location.pathname + "?" + items);
            }
            break;
          case 4:
            // Site reloaded
            window.history.replaceState({ s:4, n:title, b:window.history.state.b, f:window.history.state.f }, title, window.location.pathname + "?" + items);
            break;
          default:
            if (!(("?" + items) == window.location.search) && !(window.history.state.b == title)) {
              window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.n, window.location.pathname + window.location.search);
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
    var tooltipNext = "";
    var tooltipPrevious = "";
    if (window.history.state !== null){
      if (window.history.state.b !== undefined && window.history.state.b !== ""){
        tooltipPrevious = window.history.state.b
      }
      if (window.history.state.f !== undefined && window.history.state.f !== ""){
        tooltipNext = window.history.state.f
      }
    }
    
    const { showListViewer } = this.props;
    
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
                  <Tab>{(window.templateID !== undefined) ? window[window.templateID].getName() : "Template"}</Tab>
                  <Tab disabled={true} style={{ display: "none" }}>&nbsp; + &nbsp;</Tab>
                </TabList>
                <TabPanel style={{ display: "none" }}/>
                <TabPanel style={{ display: "none" }}/>
              </Tabs>
            </div>
          </div>

          <div className="focusTermCenter">
            <div className="focusTermDivC">
            </div>
          </div>

          <div className="focusTermRight">
            <div className="focusTermDivR">
              <MuiThemeProvider theme={this.theme}>
                { window.history.state !== null && window.history.state.b !== undefined && window.history.state.b !== ""
                  ? <Tooltip placement="top-end"
                    title={tooltipPrevious}>
                    <i className="fa fa-chevron-left arrowsStyle"
                      onClick={() => {
                        if (window.vfbUpdatingHistory == false) {
                          window.history.back();
                        }
                      }} />
                  </Tooltip>
                  : <i className="fa fa-chevron-left arrowsStyle isDisabled" /> 
                }
                <Menu
                  configuration={this.configuration}
                  menuHandler={this.menuHandler} />
                { window.history.state !== null && window.history.state.f !== undefined && window.history.state.f !== "" 
                  ? <Tooltip placement="top-end"
                    title={tooltipNext}> 
                    <i className="fa fa-chevron-right arrowsStyle"
                      onClick={() => {
                        if (window.vfbUpdatingHistory == false) {
                          window.history.forward();
                        }
                      }} />
                  </Tooltip>
                  : <i className="fa fa-chevron-right arrowsStyle isDisabled" /> 
                }
                <Tooltip placement="top-end"
                  title="NBLAS Uploader">
                  <i id="fa-upload" className="fa fa-upload arrowsStyle"
                    onClick={() => {
                      this.props.UIUpdateManager("uploaderContentsVisible");
                    }} />
                </Tooltip>
                <Tooltip placement="top-end"
                  title="Download Contents">
                  <i className="fa fa-download arrowsStyle"
                    onClick={() => {
                      this.props.UIUpdateManager("downloadContentsVisible");
                    }} />
                </Tooltip>
                <Tooltip placement="top-end"
                  title="Clear all">
                  <i className="fa fa-eraser arrowsStyle"
                    onClick={() => {
                      this.clearAll();
                    }} />
                </Tooltip>
                <Tooltip placement="top-end"
                  title="Search">
                  <i className="fa fa-search arrowsStyle"
                    onClick={() => {
                      this.props.UIUpdateManager("spotlightVisible");
                    }} />
                </Tooltip>
                <Tooltip placement="top-end"
                  title="Query results">
                  <i className="fa fa-quora arrowsStyle"
                    onClick={() => {
                      this.props.UIUpdateManager("queryBuilderVisible");
                    }} />
                </Tooltip>
                <Tooltip placement="top-end"
                  title="Layers">
                  <i className="fa fa-list arrowsStyle"
                    onClick={() => {
                      this.props.showListViewer(SHOW_LIST_VIEWER);
                    }} />
                </Tooltip>
              </MuiThemeProvider>
            </div>
          </div>
        </nav>
      </Rnd>

    );
  }
}

function mapStateToProps (state) {
  return { ... state }
}

function mapDispatchToProps (dispatch) {
  return { showListViewer: type => dispatch({ type : type }) }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(VFBFocusTerm);
