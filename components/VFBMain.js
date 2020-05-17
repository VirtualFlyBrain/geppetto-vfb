/* eslint-disable no-undef */
import React, { Component } from 'react';
import VFBToolBar from './interface/VFBToolbar/VFBToolBar';
import VFBFocusTerm from './interface/VFBFocusTerm/VFBFocusTerm';
import VFBTree from './interface/VFBTree/VFBTree';
import VFBStackViewer from './interface/VFBStackViewer/VFBStackViewer';
import TutorialWidget from './interface/VFBOverview/TutorialWidget';
import VFBTermInfoWidget from './interface/VFBTermInfo/VFBTermInfo';
import Logo from 'geppetto-client/js/components/interface/logo/Logo';
import Canvas from 'geppetto-client/js/components/interface/3dCanvas/Canvas';
import QueryBuilder from 'geppetto-client/js/components/interface/query/queryBuilder';
import SpotLight from 'geppetto-client/js/components/interface/spotlight/spotlight';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';
import ControlPanel from 'geppetto-client/js/components/interface/controlPanel/controlpanel';
import * as FlexLayout from 'geppetto-client/js/components/interface/flexLayout2/src/index';
import Search from 'geppetto-client/js/components/interface/search/Search';
import VFBQuickHelp from './interface/VFBOverview/QuickHelp';
import VFBGraph from './interface/VFBGraph/VFBGraph';

require('../css/base.less');
require('../css/VFBMain.less');

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;
var modelJson = require('./configuration/VFBMain/layoutModel').modelJson;

export default class VFBMain extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      canvasAvailable: false,
      modelLoaded: (window.Model != undefined),
      canvasVisible: true,
      termInfoVisible: true,
      treeBrowserVisible: false,
      graphVisible : false,
      sliceViewerVisible: true,
      tutorialWidgetVisible: false,
      spotlightVisible: true,
      controlPanelVisible: true,
      wireframeVisible: false,
      queryBuilderVisible: true,
      quickHelpVisible: undefined,
      UIUpdated: false,
      htmlFromToolbar: undefined,
      instanceOnFocus: undefined,
      idSelected: undefined,
    };

    this.addVfbId = this.addVfbId.bind(this);
    this.menuHandler = this.menuHandler.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.htmlToolbarRef = this.htmlToolbarRef.bind(this);
    this.closeQuickHelp = this.closeQuickHelp.bind(this);
    this.tutorialHandler = this.tutorialHandler.bind(this);
    this.UIUpdateManager = this.UIUpdateManager.bind(this);
    this.closeHtmlViewer = this.closeHtmlViewer.bind(this);
    this.renderHTMLViewer = this.renderHTMLViewer.bind(this);
    this.TermInfoIdLoaded = this.TermInfoIdLoaded.bind(this);
    this.StackViewerIdLoaded = this.StackViewerIdLoaded.bind(this);
    this.ThreeDViewerIdLoaded = this.ThreeDViewerIdLoaded.bind(this);
    this.handlerInstanceUpdate = this.handlerInstanceUpdate.bind(this);
    this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);

    this.vfbLoadBuffer = [];
    this.tutorialRender = undefined;
    this.htmlToolbarRender = undefined;
    this.urlIdsLoaded = false;
    this.canvasReference = undefined;
    this.termInfoReference = undefined;
    this.sliceViewerReference = undefined;
    this.treeBrowserReference = undefined;
    this.graphReference = undefined;
    this.focusTermReference = undefined;
    this.idOnFocus = undefined;
    this.instanceOnFocus = undefined;
    this.idFromURL = undefined;
    this.idsFromURL = [];
    this.urlQueryLoader = undefined;
    this.quickHelpRender = undefined;
    this.firstLoad = true;
    this.quickHelpOpen = true;

    this.UIElementsVisibility = {};

    this.colours = require('./configuration/VFBMain/colours.json');

    this.spotlightConfig = require('./configuration/VFBMain/spotlightConfiguration').spotlightConfig;
    this.spotlightDataSourceConfig = require('./configuration/VFBMain/spotlightConfiguration').spotlightDataSourceConfig;

    this.searchConfiguration = require('./configuration/VFBMain/searchConfiguration').searchConfiguration;
    this.datasourceConfiguration = require('./configuration/VFBMain/searchConfiguration').datasourceConfiguration;

    this.controlPanelConfig = require('./configuration/VFBMain/controlPanelConfiguration').controlPanelConfig;
    this.controlPanelColMeta = require('./configuration/VFBMain/controlPanelConfiguration').controlPanelColMeta;
    this.controlPanelColumns = require('./configuration/VFBMain/controlPanelConfiguration').controlPanelColumns;
    this.controlPanelControlConfigs = require('./configuration/VFBMain/controlPanelConfiguration').controlPanelControlConfigs;

    this.queryResultsColMeta = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsColMeta;
    this.queryResultsColumns = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsColumns;
    this.queryResultsControlConfig = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsControlConfig;
    this.queryBuilderDatasourceConfig = require('./configuration/VFBMain/queryBuilderConfiguration').queryBuilderDatasourceConfig;
    this.sorterColumns = require('./configuration/VFBMain/queryBuilderConfiguration').sorterColumns;

    this.setSepCol = require('./interface/utils/utils').setSepCol;
    this.hasVisualType = require('./interface/utils/utils').hasVisualType;
    this.getStackViewerDefaultX = require('./interface/utils/utils').getStackViewerDefaultX;
    this.getStackViewerDefaultY = require('./interface/utils/utils').getStackViewerDefaultY;

    this.model = FlexLayout.Model.fromJson(modelJson)

    window.redirectURL = '$PROTOCOL$//$HOST$/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto?i=$TEMPLATE$,$VFB_ID$&id=$VFB_ID$';
    window.customAction = [];
  }

  clearQS () {
    if (this.refs.querybuilderRef && (!GEPPETTO.isKeyPressed("shift"))) {
      this.refs.querybuilderRef.close();
    }
    this.sliceViewerReference.checkConnection();
  }

  addToQueryCallback (variableId, label) {
    // Failsafe check with old and new logic - to be refactored when finished
    if (typeof (variableId) == "string") {
      this.clearQS();
      this.refs.querybuilderRef.switchView(false, true);
      this.refs.querybuilderRef.addQueryItem({
        term: (label != undefined) ? label : window[variableId].getName(),
        id: variableId
      });
    } else {
      for (var singleId = 0; variableId.length > singleId; singleId++) {
        this.clearQS();
        this.refs.querybuilderRef.switchView(false, true);
        this.refs.querybuilderRef.addQueryItem({
          term: (label != undefined) ? label : window[variableId[singleId]].getName(),
          id: variableId[singleId]
        });
      }
    }
    this.refs.querybuilderRef.open();
  }

  addVfbId (idsList) {
    if (this.state.modelLoaded === true) {
      if (typeof (idsList) == "string") {
        if (idsList.indexOf(',') > -1) {
          var idArray = idsList.split(",");
          idsList = idArray;
        } else {
          idsList = [idsList];
        }
      }
      idsList = Array.from(new Set(idsList));
      // Udate URL in case of reload before items loaded:
      if (window.history.state != null && (window.history.state.s == 1 || window.history.state.s == 4) && window.location.search.indexOf("i=") > -1) {
        window.history.replaceState({ s:0, n:window.history.state.n, b:window.history.state.b, f:window.history.state.f, u:window.location.search }, "Loading", location.pathname + location.search.replace(/id=.*\&/gi,"id=" + idsList[0] + "&") + "," + idsList.join(','));
      }
      window.ga('vfb.send', 'event', 'request', 'addvfbid', idsList.join(','));
      if (idsList != null && idsList.length > 0) {
        for (var singleId = 0; idsList.length > singleId; singleId++) {
          if ($.inArray(idsList[singleId], this.vfbLoadBuffer) == -1) {
            this.vfbLoadBuffer.push(idsList[singleId]);
          }
          if (window[idsList[singleId]] != undefined) {
            this.handleSceneAndTermInfoCallback(idsList[singleId]);
            idsList.splice($.inArray(idsList[singleId], idsList), 1);
            this.vfbLoadBuffer.splice($.inArray(idsList[singleId], this.vfbLoadBuffer), 1);
          }
        }
        if (idsList.length > 0) {
          this.props.vfbLoadId(idsList);
          this.fetchVariableThenRun(idsList, this.handleSceneAndTermInfoCallback);
          this.setState({ idSelected: idsList[idsList.length - 1] });
        }
      }

    } else {
      console.log("model has not been loaded, in the old initialization here I was triggering a"
                  + "setTimeout to call recursively this same function addvfbid");
    }
  }

  fetchVariableThenRun (variableId, callback, label) {
    GEPPETTO.SceneController.deselectAll(); // signal something is happening!
    var variables = GEPPETTO.ModelFactory.getTopLevelVariablesById(variableId);
    if (!variables.length > 0) {
      Model.getDatasources()[0].fetchVariable(variableId, function () {
        if (callback != undefined) {
          callback(variableId, label);
        }
      });
    } else {
      if (callback != undefined) {
        callback(variableId, label);
      }
    }
  }

  ThreeDViewerIdLoaded (id) {
    this.props.vfbIdLoaded(id, "ThreeDViewer");
  }

  StackViewerIdLoaded (id) {
    this.props.vfbIdLoaded(id, "StackViewer");
  }

  TermInfoIdLoaded (id) {
    this.props.vfbIdLoaded(id, "TermInfo");
  }

  handleSceneAndTermInfoCallback (variableIds) {
    if (typeof(variableIds) == "undefined") {
      console.log('Blank Term Info Callback ');
      return;
    }
    if (typeof (variableIds) == "string") {
      variableIds = [variableIds];
    }
    for (var singleId = 0; variableIds.length > singleId; singleId++) {
      var meta = undefined;
      // check invalid id trying to get the meta data instance, if still undefined we catch the error and we remove this from the buffer.
      try {
        meta = Instances.getInstance(variableIds[singleId] + '.' + variableIds[singleId] + '_meta');
      } catch (e) {
        console.log('Instance for ' + variableIds[singleId] + '.' + variableIds[singleId] + '_meta' + ' does not exist in the current model');
        this.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
        continue;
      }
      if (this.hasVisualType(variableIds[singleId])) {
        if (!this.firstLoad) {
          this.handlerInstanceUpdate(meta);
        }
        this.resolve3D(variableIds[singleId], function (id) {
          var instance = Instances.getInstance(id);
          GEPPETTO.SceneController.deselectAll();
          if ((instance != undefined) && (typeof instance.select === "function")) {
            if (this.idsFromURL.length > 0 && window.templateID !== undefined && Instances[window.templateID]) {
              this.handlerInstanceUpdate(instance);
            } else {
              instance.select();
            }
          }
        }.bind(this));
      } else {
        this.handlerInstanceUpdate(meta);
      }
      // if the element is not invalid (try-catch) or it is part of the scene then remove it from the buffer
      if (window[variableIds[singleId]] != undefined) {
        this.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
      }
    }
    if (this.vfbLoadBuffer.length > 0) {
      GEPPETTO.trigger('spin_logo');
    } else {
      GEPPETTO.trigger('stop_spin_logo');
    }
  }

  resolve3D (path, callback) {
    var ImportType = require('geppetto-client/js/geppettoModel/model/ImportType');
    var rootInstance = Instances.getInstance(path);
    GEPPETTO.SceneController.deselectAll();

    if (window.templateID == undefined) {
      var superTypes = rootInstance.getType().getSuperType();
      for (var i = 0; i < superTypes.length; i++) {
        if (superTypes[i].getId() == 'Template') {
          window.templateID = rootInstance.getId();
          // Set wireframe by template:
          switch (window.templateID) {
          case "VFB_00030786":
            this.canvasReference.setWireframe(true);
            break;
          case "VFB_00050000":
            this.canvasReference.setWireframe(true);
            break;
          default:
            this.canvasReference.setWireframe(false);
          }
        }
      }
      // Assume the template associated with the first item loaded and ensure the template is added to the cue for loading.
      if (window.templateID == undefined) {
        var meta = rootInstance[rootInstance.getId() + '_meta'];
        if (meta != undefined) {
          if (typeof meta.getType().template != "undefined") {
            var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
            var domObj = $(templateMarkup);
            var anchorElement = domObj.filter('a');
            // extract ID
            var templateID = anchorElement.attr('data-instancepath');
            this.addVfbId(templateID);
            setTimeout(function (){
              window.resolve3D(path);
            }, 5000);
            return; // Don't load until the template has
          }
        }
      }
    } else {
      // check if the user is adding to the scene something belonging to another template
      var superTypes = rootInstance.getType().getSuperType();
      var templateID = "unknown";
      for (var i = 0; i < superTypes.length; i++) {
        if (superTypes[i].getId() == window.templateID) {
          templateID = superTypes[i].getId()
        }
        if (superTypes[i].getId() == 'Class') {
          templateID = window.templateID;
          return; // Exit if Class - Class doesn't have image types.
        }
      }

      var meta = rootInstance[rootInstance.getId() + '_meta'];
      if (meta != undefined) {
        if (typeof meta.getType().template != "undefined") {
          var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
          var domObj = $(templateMarkup);
          var anchorElement = domObj.filter('a');
          // extract ID
          var templateID = anchorElement.attr('data-instancepath');
          if (window.EMBEDDED) {
            var curHost = parent.document.location.host;
            var curProto = parent.document.location.protocol;
          } else {
            var curHost = document.location.host;
            var curProto = document.location.protocol;
          }
          if (templateID != window.templateID) {
            // open new window with the new template and the instance ID
            window.ga('vfb.send', 'event', 'request', 'newtemplate', templateID);
            var targetWindow = '_blank';
            var newUrl = window.redirectURL.replace(/\$VFB_ID\$/gi, rootInstance.getId()).replace(/\$TEMPLATE\$/gi, templateID).replace(/\$HOST\$/gi, curHost).replace(/\$PROTOCOL\$/gi, curProto);
            if (confirm("The image you requested is aligned to another template. \nClick OK to open in a new tab or Cancel to just view the image metadata.")) {
              window.ga('vfb.send', 'event', 'opening', 'newtemplate', templateID);
              window.open(newUrl, targetWindow);
            } else {
              window.ga('vfb.send', 'event', 'cancelled', 'newtemplate', templateID);
            }
            // stop flow here, we don't want to add to scene something with a different template
            return;
          }
        }
      }
    }

    var instance = undefined;
    var flagRendering = true;
    // check if we have swc
    try {
      instance = Instances.getInstance(path + "." + path + "_swc");
      if (!window[path][path + '_swc'].visible && typeof window[path][path + '_swc'].show == "function") {
        window[path][path + '_swc'].show();
        flagRendering = false;
      }
    } catch (ignore) {
    }
    // if no swc check if we have obj
    if (instance == undefined) {
      try {
        instance = Instances.getInstance(path + "." + path + "_obj");
        if ((!window[path][path + '_obj'].visible) && (typeof window[path][path + '_obj'].show == "function") && (flagRendering)) {
          window[path][path + '_obj'].show();
        }
      } catch (ignore) {
      }
    }
    // if anything was found resolve type (will add to scene)
    if (instance != undefined) {
      var postResolve = () => {
        this.setSepCol(path);
        if (callback != undefined) {
          callback(path);
        }
      };

      if (typeof (instance) != 'undefined' && instance.getType() instanceof ImportType) {
        instance.getType().resolve(postResolve);
      } else {
        // add instance to scene
        this.canvasReference.display([instance]);
        // trigger update for components that are listening
        GEPPETTO.trigger(GEPPETTO.Events.Instances_created, [instance]);
        postResolve();
      }
    }

    // independently from the above, check if we have slices for the instance
    try {
      instance = Instances.getInstance(path + "." + path + "_slices");
      if (typeof (instance) != 'undefined' && instance.getType() instanceof ImportType) {
        instance.getType().resolve();
      }
    } catch (ignore) {
      // any alternative handling goes here
    }
  }

  UIUpdateItem (itemState, visibilityAnchor) {
    if (this.state[itemState] === false) {
      this.setState({ [itemState]: !this.state[itemState] });
    } else if (this.UIElementsVisibility[visibilityAnchor] === false) {
      this.setState({ UIUpdated: itemState });
    }
  }

  // Children handlers
  UIUpdateManager (buttonState) {
    switch (buttonState) {
    case 'termInfoVisible':
      this.UIUpdateItem(buttonState, "termInfo");
      break;
    case 'canvasVisible':
      this.UIUpdateItem(buttonState, "canvas");
      break;
    case 'sliceViewerVisible':
      this.UIUpdateItem(buttonState, "sliceViewer");
      break;
    case 'spotlightVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'queryBuilderVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'controlPanelVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'wireframeVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'tutorialWidgetVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'treeBrowserVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'graphVisible':
      this.setState({ [buttonState]: !this.state[buttonState] });
      break;
    case 'quickHelpVisible':
      if (this.state[buttonState] === undefined) {
        this.setState({ [buttonState]: true });
      } else {
        this.setState({ [buttonState]: !this.state[buttonState] });
      }
      break;
    }
  }

  menuHandler (click) {
    switch (click.handlerAction) {
    case 'UIElementHandler':
      this.UIUpdateManager(click.parameters[0]);
      break;
    case 'historyMenuInjector':
      var historyList = [];
      for (var i = 0; window.historyWidgetCapability.vfbterminfowidget.length > i; i++) {
        historyList.push(
          {
            label: window.historyWidgetCapability.vfbterminfowidget[i].label,
            icon: "",
            action: {
              handlerAction: "triggerSetTermInfo",
              value: window.historyWidgetCapability.vfbterminfowidget[i].arguments
            }
          },
        );
      }
      return historyList;
    case 'triggerSetTermInfo':
      this.handlerInstanceUpdate(click.value[0]);
      break;
    case 'triggerRunQuery':
      GEPPETTO.trigger('spin_logo');
      var that = this;
      var otherId = click.parameters[0].split(',')[1];
      var otherName = click.parameters[0].split(',')[2];
      var path = click.parameters[0].split(',')[0];
      var entity = Model[path];
      this.refs.querybuilderRef.open();
      this.refs.querybuilderRef.switchView(false, false);
      this.refs.querybuilderRef.clearAllQueryItems();

      var callback = function () {
        // check if any results with count flag
        if (that.refs.querybuilderRef.props.model.count > 0) {
          // runQuery if any results
          that.refs.querybuilderRef.runQuery();
        } else {
          that.refs.querybuilderRef.switchView(false);
        }
        // show query component
        that.refs.querybuilderRef.open();
        GEPPETTO.trigger('stop_spin_logo');
      };
      // add query item + selection
      if (window[otherId] == undefined) {
        window.fetchVariableThenRun(otherId, function () {
          that.refs.querybuilderRef.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback)
        });
      } else {
        setTimeout(function () {
          that.refs.querybuilderRef.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback);
        }, 100);
      }
      break;
    default:
      console.log("Menu action not mapped, it is " + click);
    }
  }

  tutorialHandler () {
    if (this.state.tutorialWidgetVisible == true) {
      this.setState({ tutorialWidgetVisible: false });
    }
  }

  stackViewerRequest (variableId) {
    this.addVfbId([variableId]);
  }

  renderHTMLViewer (htmlChild) {
    if (htmlChild !== undefined) {
      this.setState({ htmlFromToolbar: htmlChild });
    }
  }

  htmlToolbarRef (node) {
    this.toolBarRef = node;
  }

  setWrapperRef (node) {
    this.historyRef = node;
  }

  handleClickOutside () {
    if (this.toolBarRef && !this.toolBarRef.contains(event.target)) {
      this.setState({ htmlFromToolbar: undefined });
    }
  }

  closeHtmlViewer () {
    this.setState({ htmlFromToolbar: undefined });
  }

  closeQuickHelp () {
    this.setState({ quickHelpVisible: false });
  }

  /*
   * FLEXLayout custom methods used to reopen an element of the UI according to our logic
   *(2 columns and bottom-right corner)
   */
  reopenUIComponent (json) {
    let idChild = 0;
    let rightChild = 0;
    let tempModel = this.model;
    let rootNode = tempModel.getRoot();
    let modelChildren = tempModel.getRoot().getChildren();
    // const fromNode = this._idMap[action.data["fromNode"]] as (Node & IDraggable);
    if (modelChildren.length <= 1) {
      let tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset", weight: 50 });
      rootNode._addChild(tabSet);
      this.model.doAction(FlexLayout.Actions.addNode(json, tabSet.getId(), FlexLayout.DockLocation.BOTTOM, 0));
    } else {
      for (var i = 0; i <= (modelChildren.length - 1); i++) {
        if (modelChildren[i].getRect().getRight() > rightChild) {
          rightChild = modelChildren[i].getRect().getRight();
          idChild = i;
        }
      }
      let toNode = modelChildren[idChild];
      if (toNode instanceof FlexLayout.TabSetNode || toNode instanceof FlexLayout.BorderNode || toNode instanceof FlexLayout.RowNode) {
        this.model.doAction(FlexLayout.Actions.addNode(json, toNode.getId(), FlexLayout.DockLocation.BOTTOM, 0));
      }
    }
  }

  /*
   * FLEXLayout custom methods used to restore a minimised element of the UI according to our logic
   *(2 columns and bottom-right corner)
   */
  restoreUIComponent (componentName) {
    let idChild = 0;
    let rightChild = 0;
    let tempModel = this.model;
    let rootNode = tempModel.getRoot();
    let modelChildren = tempModel.getRoot().getChildren();
    // const fromNode = this._idMap[action.data["fromNode"]] as (Node & IDraggable);
    if (modelChildren.length <= 1) {
      let tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset", weight: 50 });
      rootNode._addChild(tabSet);
      var borders = tempModel.getBorderSet().getBorders();
      for (var i = 0; i < borders.length; i++) {
        var borderChildren = borders[i].getChildren();
        for (var j = 0; j < borderChildren.length; j++) {
          if (borderChildren[j].getComponent() === componentName) {
            this.model.doAction(FlexLayout.Actions.moveNode(borderChildren[j].getId(), tabSet.getId(), FlexLayout.DockLocation.BOTTOM, 0));
            return;
          }
        }
      }
    } else {
      for (var i = 0; i <= (modelChildren.length - 1); i++) {
        if (modelChildren[i].getRect().getRight() > rightChild) {
          rightChild = modelChildren[i].getRect().getRight();
          idChild = i;
        }
      }
      var toNode = modelChildren[idChild];
      var borders = tempModel.getBorderSet().getBorders();
      for (var i = 0; i < borders.length; i++) {
        var borderChildren = borders[i].getChildren();
        for (var j = 0; j < borderChildren.length; j++) {
          if (borderChildren[j].getComponent() === componentName) {
            if (toNode instanceof FlexLayout.TabSetNode || toNode instanceof FlexLayout.BorderNode || toNode instanceof FlexLayout.RowNode) {
              this.model.doAction(FlexLayout.Actions.moveNode(borderChildren[j].getId(), toNode.getId(), FlexLayout.DockLocation.BOTTOM, 0));
            }
            return;
          }
        }
      }
    }
  }

  UIDidUpdate (prevState) {
    // REDUX action to update the ui state
    if ((prevState.canvasVisible !== this.state.canvasVisible) || (prevState.sliceViewerVisible !== this.state.sliceViewerVisible) || (prevState.termInfoVisible !== this.state.termInfoVisible)) {
      this.props.vfbUIUpdated({
        "ThreeDViewer": this.state.canvasVisible,
        "StackViewer": this.state.sliceViewerVisible,
        "TermInfo": this.state.termInfoVisible
      });
    }

    if ((this.state.termInfoVisible !== prevState.termInfoVisible) && (this.state.termInfoVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Term Info",
        component: "termInfo"
      });
    }
    if ((this.state.sliceViewerVisible !== prevState.sliceViewerVisible) && (this.state.sliceViewerVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Slice Viewer",
        component: "sliceViewer"
      });
    }
    if ((this.state.canvasVisible !== prevState.canvasVisible) && (this.state.canvasVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "3D Viewer",
        component: "canvas"
      });
      this.setState({ canvasAvailable: true });
    }
    if ((this.state.treeBrowserVisible !== prevState.treeBrowserVisible) && (this.state.treeBrowserVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Tree Browser",
        component: "treeBrowser"
      });
      this.setState({ treeBrowserVisible: true });
    }
    if ((this.state.graphVisible !== prevState.graphVisible) && (this.state.graphVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Graph",
        component: "vfbGraph"
      });
      this.setState({ graphVisible: true });
    }

    if ((prevState.tutorialWidgetVisible !== this.state.tutorialWidgetVisible) && (this.state.tutorialWidgetVisible !== false) && (this.tutorialRender !== undefined)) {
      this.refs.tutorialWidgetRef.refs.tutorialRef.open(true);
    }
    if ((prevState.wireframeVisible !== this.state.wireframeVisible)) {
      this.canvasReference.setWireframe(!this.canvasReference.getWireframe());
    }
    if ((prevState.controlPanelVisible !== this.state.controlPanelVisible)) {
      this.refs.controlpanelRef.open();
    }
    if ((prevState.spotlightVisible !== this.state.spotlightVisible)) {
      this.refs.searchRef.openSearch(true);
    }
    if ((prevState.queryBuilderVisible !== this.state.queryBuilderVisible)) {
      this.refs.querybuilderRef.open();
    }
    if ((this.state.UIUpdated !== prevState.UIUpdated) && (this.state.UIUpdated !== false)) {
      switch (this.state.UIUpdated) {
      case 'termInfoVisible':
        if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
          this.restoreUIComponent("termInfo");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'canvasVisible':
        if (this.canvasReference !== undefined && this.canvasReference !== null) {
          this.restoreUIComponent("canvas");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'sliceViewerVisible':
        if (this.sliceViewerReference !== undefined && this.sliceViewerReference !== null) {
          this.restoreUIComponent("sliceViewer");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'graphVisible':
        if (this.graphReference !== undefined && this.graphReference !== null) {
          this.restoreUIComponent("vfbGraph");
        }
        this.setState({ UIUpdated: false });
        break;
      }
    }

    if ((this.state.canvasAvailable !== prevState.canvasAvailable) && (this.state.canvasAvailable === true) && (this.canvasReference !== undefined && this.canvasReference !== null)) {
      if (this.sliceViewerReference !== undefined && this.sliceViewerReference !== null) {
        this.sliceViewerReference.updateCanvasRef(this.canvasReference);
      }
      /*
       * this.canvasReference.engine.THREE.Points.prototype.raycast.prototype = this.canvasReference.engine.Points.Points.prototype.raycast.prototype;
       * this.canvasReference.engine.THREE.Points.prototype.raycast = this.canvasReference.engine.Points.Points.prototype.raycast;
       */
      this.canvasReference.flipCameraY();
      this.canvasReference.flipCameraZ();
      this.canvasReference.displayAllInstances();
      this.canvasReference.engine.controls.rotateSpeed = 3;
      this.canvasReference.engine.setLinesThreshold(0);
      for (var i = 0; i < Instances.length; i++) {
        if ((Instances[i].id !== "time")) {
          this.addVfbId(Instances[i].id);
        }
      }
    }

    if ((this.state.sliceViewerVisible !== prevState.sliceViewerVisible) && (this.state.sliceViewerVisible === true) && (this.canvasReference !== undefined && this.canvasReference !== null)) {
      if (this.sliceViewerReference !== undefined && this.sliceViewerReference !== null) {
        this.sliceViewerReference.updateCanvasRef(this.canvasReference);
      }
    }
  }

  /* FLEXLayout factory method */
  factory (node) {
    var component = node.getComponent();
    if (component === "text") {
      return (<div className="">Panel {node.getName()}</div>);
    } else if (component === "canvas") {
      this.UIElementsVisibility;
      node.setEventListener("close", () => {
        this.setState({
          canvasVisible: false,
          canvasAvailable: false
        });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      return (<Canvas
        id="CanvasContainer"
        name={"Canvas"}
        baseZoom="1.2"
        wireframeEnabled={true}
        minimiseAnimation={false}
        onLoad={this.ThreeDViewerIdLoaded}
        ref={ref => this.canvasReference = ref} />)
    } else if (component === "termInfo") {
      node.setEventListener("close", () => {
        this.setState({ termInfoVisible: false });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      return (<div className="flexChildContainer">
        <VFBTermInfoWidget
          termInfoHandler={this.termInfoHandler}
          ref={ref => this.termInfoReference = ref}
          queryBuilder={this.refs.querybuilderRef}
          showButtonBar={true}
          onLoad={this.TermInfoIdLoaded}
          termInfoName={this.instanceOnFocus}
          termInfoId={this.idOnFocus}
          focusTermRef={this.focusTermReference}
          exclude={["ClassQueriesFrom", "Debug"]}
          order={['Name',
                  'Label',
                  'Alternative Names',
                  'Types',
                  'Classification',
                  'Parents',
                  'Logo',
                  'Link',
                  'Thumbnail',
                  'Examples',
                  'Source',
                  'License',
                  'Targeting Splits',
                  'Targeting Neurons',
                  'Targeted Neurons',
                  'Related Individuals',
                  'Relationships',
                  'Query for',
                  'Query For',
                  'Description',
                  'Cross References',
                  'Attribution',
                  'Aligned To',
                  'Download']} /></div>)
    } else if (component === "sliceViewer") {
      node.setEventListener("close", () => {
        this.setState({ sliceViewerVisible: false });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      if (_height > 0 || _width > 0) {
        return (<div className="flexChildContainer">
          <VFBStackViewer
            id="NewStackViewer"
            defHeight={_height}
            defWidth={_width}
            layout={this.refs.layout}
            ref={ref => this.sliceViewerReference = ref}
            canvasRef={this.canvasReference}
            onLoad={this.StackViewerIdLoaded}
            stackViewerHandler={this.stackViewerHandler} /></div>);
      } else {
        return (<div className="flexChildContainer"></div>);
      }
    } else if (component === "treeBrowser") {
      node.setEventListener("close", () => {
        this.setState({ treeBrowserVisible: false });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      return (<div className="flexChildContainer">
        <VFBTree
          id="treeWidget"
          instance={this.instanceOnFocus}
          size={{ height: _height, width: _width }}
          ref={ref => this.treeBrowserReference = ref}
          selectionHandler={this.addVfbId} />
      </div>);
    } else if (component === "vfbGraph") {
      let graphVisibility = node.isVisible();
      node.setEventListener("close", () => {
        this.setState({ graphVisible: false });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      return (<div className="flexChildContainer" style={{ height: _height, width: _width }}>
        <VFBGraph ref={ref => this.graphReference = ref} instance={this.instanceOnFocus} visible={graphVisibility} />
      </div>);
    }
  }

  /* React functions */
  shouldComponentUpdate (nextProps, nextState) {
    if ((nextState.UIUpdated === false) && (this.state.UIUpdated !== nextState.UIUpdated)) {
      return false;
    } else {
      return true;
    }
  }

  componentDidUpdate (prevProps, prevState) {
    document.addEventListener('mousedown', this.handleClickOutside);

    this.UIDidUpdate(prevState);

    /**
     * Important, needed to let know the Three.js control's library the real size of
     * the canvas right after if finished rendering.Otherwise it thinks its width and
     * height 0 *
     */
    if (this.canvasReference !== undefined && this.canvasReference !== null) {
      this.canvasReference.engine.controls.handleResize();
    }

    /**
     * Global reference to Stackviewer used in testing
     */
    if (this.sliceViewerReference !== undefined && this.sliceViewerReference !== null){
      if (window.StackViewer1 == undefined || window.StackViewer == null){
        window.StackViewer1 = this.sliceViewerReference;
      }
    }

  }

  componentWillMount () {
    if ((window.Model == undefined) && (this.state.modelLoaded == false)) {
      if (location.host.indexOf('localhost:8081') < 0){
        Project.loadFromURL(window.location.origin.replace('https:','http:') + '/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto/build/vfb.json');
      } else {
        // Local deployment for development.
        Project.loadFromURL(window.location.origin.replace(":8081", ":8989").replace('https:','http:') + '/' + 'vfb.json');
      }
      this.setState({ modelLoaded: true });
    }

    window.setCookie = function ( name, value, days ) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    };

    window.getCookie = function ( name ) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1, c.length);
        }
        if ( c.indexOf(nameEQ) == 0 ) {
          var result = c.substring(nameEQ.length, c.length);
          return result;
        }
      }
      return null;
    };

    // Retrieve cookie for 'quick_help' modal
    var cookie = getCookie("show_quick_help");
    // Show 'Quick Help' modal if cookie to hide it is not set to True
    if ((this.props.location.search.indexOf("id=") > -1) || (this.props.location.search.indexOf("i=") > -1)) {
      this.quickHelpOpen = false;
    }
    if (( cookie !== "1") && (this.quickHelpOpen)) {
      this.quickHelpRender = <VFBQuickHelp id="quickHelp" closeQuickHelp={this.closeQuickHelp} />;
    }
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);

    GEPPETTO.G.setIdleTimeOut(-1);

    // Global functions linked to VFBMain functions
    window.stackViewerRequest = function (idFromStack) {
      this.stackViewerRequest(idFromStack);
    }.bind(this);

    window.addVfbId = function (idFromOutside) {
      this.addVfbId(idFromOutside);
    }.bind(this);

    window.setTermInfo = function (meta, id) {
      this.handlerInstanceUpdate(meta);
    }.bind(this);

    window.fetchVariableThenRun = function (idsList, cb, label) {
      this.fetchVariableThenRun(idsList, cb, label);
    }.bind(this);

    window.addToQueryCallback = function (variableId, label) {
      this.addToQueryCallback(variableId, label)
    }.bind(this);

    window.resolve3D = function (externalID) {
      this.resolve3D(externalID, function (id) {
        var instance = Instances.getInstance(id);
        if ((instance != undefined) && (typeof instance.select === "function")) {
          GEPPETTO.SceneController.deselectAll();
          instance.select();
        }
      }.bind(this));
    }.bind(this);

    this.canvasReference.flipCameraY();
    this.canvasReference.flipCameraZ();
    this.canvasReference.setWireframe(false);
    this.canvasReference.displayAllInstances();
    this.canvasReference.engine.controls.rotateSpeed = 3;
    this.canvasReference.engine.setLinesThreshold(0);

    // Control panel initialization and filter which instances to display
    if (this.refs.controlpanelRef !== undefined) {
      this.refs.controlpanelRef.setColumnMeta(this.controlPanelColMeta);
      this.refs.controlpanelRef.setColumns(this.controlPanelColumns);
      this.refs.controlpanelRef.setControlsConfig(this.controlPanelConfig);
      this.refs.controlpanelRef.setControls(this.controlPanelControlConfigs);
      this.refs.controlpanelRef.setDataFilter(function (entities) {
        var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, entities);
        var visualParents = [];
        for (var i = 0; i < visualInstances.length; i++) {
          if (visualInstances[i].getParent() != null) {
            visualParents.push(visualInstances[i].getParent());
          }
        }
        visualInstances = visualInstances.concat(visualParents);
        var compositeInstances = [];
        for (var i = 0; i < visualInstances.length; i++) {
          if (visualInstances[i].getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
            compositeInstances.push(visualInstances[i]);
          }
        }
        return compositeInstances;
      });
    }

    // Loading ids passed through the browser's url
    var idsList = "";
    var idList = this.props.location.search;
    idList = idList.replace("?","").split("&");
    for (let list in idList) {
      if (idList[list].indexOf("id=") > -1) {
        this.idFromURL = idList[list].replace("id=","");
        if (idsList.length > 0) {
          idsList += ",";
        }
        idsList += this.idFromURL;
      } else if (idList[list].indexOf("i=") > -1) {
        if (idsList.length > 0) {
          idsList = "," + idsList;
        }
        idsList = idList[list].replace("i=","") + idsList;
      } else if (idList[list].indexOf("q=") > -1) {
        this.urlQueryLoader = idList[list].replace("q=","").replace("%20", " ").split(",");
      }
    }

    if ((idsList.length > 0) && (this.state.modelLoaded == true) && (this.urlIdsLoaded == false)) {
      this.urlIdsLoaded = true;
      if (!idsList.includes("VFB_")) {
        idsList = "VFB_00017894," + idsList;
      }
      this.idsFromURL = idsList.split(",");
      // remove duplicates
      var counter = this.idsFromURL.length;
      if (this.idFromURL === undefined) {
        this.idFromURL = this.idsFromURL[this.idsFromURL.length - 1];
      }
      while (counter--) {
        if (this.idsFromURL[counter] === this.idFromURL) {
          this.idsFromURL.splice(counter, 1);
        }
      }
      this.idsFromURL.push(this.idFromURL);
      this.idsFromURL = [... new Set(this.idsFromURL)];
      this.idsFinalList = this.idsFromURL;
      console.log("Loading IDS to add to the scene from url");
    } else {
      this.urlIdsLoaded = true;
      this.idsFinalList = ["VFB_00017894"];
    }

    var that = this;

    GEPPETTO.on(GEPPETTO.Events.Instance_added, function (instance) {
      that.props.instanceAdded(instance);
    });

    GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
      that.addVfbId(that.idsFinalList);

      var callback = function () {
        // check if any results with count flag
        if (that.refs.querybuilderRef.props.model.count > 0) {
          // runQuery if any results
          that.refs.querybuilderRef.runQuery();
        } else {
          that.refs.querybuilderRef.switchView(false);
        }
        // show query component
        that.refs.querybuilderRef.open();
        $("body").css("cursor", "default");
        GEPPETTO.trigger('stop_spin_logo');
      };

      if (that.urlQueryLoader !== undefined) {
        if (window[that.urlQueryLoader[0]] == undefined) {
          window.fetchVariableThenRun(that.urlQueryLoader[0], function () {
            that.refs.querybuilderRef.addQueryItem({ term: "", id: that.urlQueryLoader[0], queryObj: Model[that.urlQueryLoader[1]] }, callback)
          });
        } else {
          setTimeout(function () {
            that.refs.querybuilderRef.addQueryItem({ term: "", id: that.urlQueryLoader[0], queryObj: Model[that.urlQueryLoader[1]] }, callback);
          }, 100);
        }
      }
    });

    // wipe the history state:
    window.history.replaceState({ s:4, n:"", b:"", f:"" }, "", window.location.pathname + window.location.search);

    // browser back/forward handling
    window.onpopstate = function () {
      var idList = window.location.search;
      var idList = idList.replace("?","").split("&");
      var idsTermInfoSubstring = "";
      var list;
      for (list in idList) {
        if (idList[list].indexOf("id=") > -1) {
          idsTermInfoSubstring = idList[list].replace("id=","");
        }
      }
      if (idsTermInfoSubstring.length > 0) {
        console.log("Browser History Call triggered termInfo: " + idsTermInfoSubstring);
        if (window.history.state != null) {
          window.history.replaceState({ s:2, n:window.history.state.n, b:window.history.state.b, f:window.history.state.f }, window.history.state.n, window.location.pathname + window.location.search);
        } else {
          window.history.replaceState({ s:2, n:"", b:"", f:"" }, "", window.location.pathname + window.location.search);
        }
        that.addVfbId(idsTermInfoSubstring);
      }
    }

    // google analytics vfb specific tracker
    ga('create', 'UA-18509775-2', 'auto', 'vfb');
    window.console.stdlog = console.log.bind(console);
    window.console.stderr = console.error.bind(console);
    window.console.logs = [];
    console.log = function () {
      if (Array.from(arguments).join("\n").indexOf('Pixi.js') < 0 && Array.from(arguments).join("\n") != 'unmount') {
        window.ga('vfb.send', 'event', 'log', Array.from(arguments).join("\n"));
        window.console.logs.push('+ ' + Array.from(arguments).join('\n'));
        window.console.stdlog.apply(console, arguments);
      }
    }
    console.error = function () {
      if (Array.from(arguments).join("\n").indexOf('www.pixijs.com') < 0 && Array.from(arguments).join("\n").indexOf("Warning: Failed prop type: There should be an equal number of 'Tab' and 'TabPanel' in `UncontrolledTabs`. Received 2 'Tab' and 0 'TabPanel'.") < 0 ) {
        window.ga('vfb.send', 'event', 'errorlog', Array.from(arguments).join("\n"));
        window.console.logs.push('- ' + Array.from(arguments).join('\n'));
        window.console.stderr.apply(console, arguments);
      }
    }

    // Selection listener
    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      var selection = GEPPETTO.SceneController.getSelection();
      if (selection.length > 0 && instance.isSelected()) {
        var latestSelection = instance;
        var currentSelectionName = "";
        if (this.termInfoReference != undefined) {
          currentSelectionName = this.termInfoReference.refs.termInfoRef.name;
        }
        if (latestSelection.getChildren().length > 0) {
          // it's a wrapper object - if name is different from current selection set term info
          if ((currentSelectionName != latestSelection.getName())) {
            this.handlerInstanceUpdate(latestSelection[latestSelection.getId() + "_meta"]);
          }
        } else {
          // it's a leaf (no children) / grab parent if name is different from current selection set term info
          var parent = latestSelection.getParent();
          if ((parent != null && currentSelectionName != parent.getName()) && (this.termInfoReference !== null) && (this.termInfoReference !== null)) {
            this.handlerInstanceUpdate(parent);
          }
        }
      }
      if (window.StackViewer1 != undefined) {
        this.sliceViewerReference.updateStackWidget();
      }
    }.bind(this));

    GEPPETTO.on(GEPPETTO.Events.Websocket_disconnected, function () {
      if (GEPPETTO.MessageSocket.socketStatus === GEPPETTO.Resources.SocketStatus.CLOSE) {
        window.ga('vfb.send', 'event', 'reload', 'websocket-disconnect', (window.location.pathname + window.location.search));
        console.log("Reloading websocket connection by reloading page");
        window.location.reload(true);
      } else {
        console.log("%c Websocket reconnection in progress... ", 'background: #444; color: #bada55');
      }
    });
  }

  // Handler created to manage all the update that relates to components of the UI
  handlerInstanceUpdate (instance) {
    let metaInstance = undefined;
    let parentInstance = undefined;
    if (instance === undefined || instance === null) {
      console.log("Instance passed to handlerInstanceUpdate is undefined");
      console.trace();
      return;
    }

    // Logic to determine the parent and the meta instance, used to get all the data needed
    if (instance.getId().indexOf("_meta") === -1 && instance.getParent() === null) {
      parentInstance = instance;
      metaInstance = parentInstance[parentInstance.getId() + "_meta"];
    } else {
      metaInstance = instance;
      parentInstance = metaInstance.getParent();
    }

    this.instanceOnFocus = metaInstance;
    this.idOnFocus = parentInstance.getId();

    /*
     * this is the core of the logic id= that we use on startup of the application from the URL.
     * All the ids in the url in i= and id= are placed in the idsFromURL array, where the only id in
     * id= is placed in idFromURL. In this portion of code we loop through this list, if the id on focus
     * at the moment is in the list but is different from the id= that should take over term info and
     * tree browser we simply remove this id from the array and return, instead if the id on focus is the
     * the same that we stored in idFromURL in that case we remove this id from the array, break the loop
     * and go forward to place all this information.
     * Keep in mind this loop is executed only once, on startup, since the array is emptied and never
     * filled again, for that reason DO NOT REUSE idsFromURL differently this logic will be broken.
     */
    for (var counter = 0; counter < this.idsFromURL.length; counter++) {
      if (this.idsFromURL[counter] === this.idOnFocus && this.idFromURL !== this.idOnFocus) {
        this.TermInfoIdLoaded(this.idOnFocus);
        this.idsFromURL.splice(counter, 1);
        return;
      }
      if (this.idsFromURL[counter] === this.idOnFocus && this.idFromURL === this.idOnFocus) {
        this.idsFromURL.splice(counter, 1);
        this.firstLoad = false;
        break;
      }
    }

    // Update the graph component
    if (this.graphReference !== undefined && this.graphReference !== null) {
      this.graphReference.updateGraph(this.instanceOnFocus, this.idOnFocus);
    }
    
    // Update the term info component
    if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
      this.termInfoReference.setTermInfo(this.instanceOnFocus, this.idOnFocus);
    } else {
      this.TermInfoIdLoaded(this.idOnFocus);
    }

    // Update the tree browser
    if (this.treeBrowserReference !== undefined && this.treeBrowserReference !== null) {
      this.treeBrowserReference.updateTree(this.instanceOnFocus);
    }
  }

  render () {
    if ((this.state.tutorialWidgetVisible == true) && (this.tutorialRender == undefined)) {
      this.tutorialRender = <TutorialWidget tutorialHandler={this.tutorialHandler} ref="tutorialWidgetRef" />
    }

    var key = 0;
    var onRenderTabSet = function (node, renderValues) {
      if (node.getType() === "tabset") {
        renderValues.buttons.push(<div key={key} className="fa fa-window-minimize customIconFlexLayout" onClick={() => {
          this.model.doAction(FlexLayout.Actions.moveNode(node.getSelectedNode().getId(), "border_bottom", FlexLayout.DockLocation.CENTER, 0));
        }} />);
        key++;
      }
    };

    key = 0;

    var clickOnBordersAction = function (node) {
      let idChild = 0;
      let rightChild = 0;
      let tempModel = node.getModel();
      var rootNode = tempModel.getRoot();
      var modelChildren = tempModel.getRoot().getChildren();
      // const fromNode = this._idMap[action.data["fromNode"]] as (Node & IDraggable);
      if (node instanceof FlexLayout.TabNode || node instanceof FlexLayout.TabSetNode) {
        if (modelChildren.length <= 1) {
          let tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset" });
          rootNode._addChild(tabSet);
          this.model.doAction(FlexLayout.Actions.moveNode(node.getId(), tabSet.getId(), FlexLayout.DockLocation.BOTTOM, 0));
          // tabSet.drop(tabNode, DockLocation.BOTTOM, 0);
        } else {
          for (var i = 0; i <= (modelChildren.length - 1); i++) {
            if (modelChildren[i].getRect().getRight() > rightChild) {
              rightChild = modelChildren[i].getRect().getRight();
              idChild = i;
            }
          }
          let toNode = modelChildren[idChild];
          if (toNode instanceof FlexLayout.TabSetNode || toNode instanceof FlexLayout.BorderNode || toNode instanceof FlexLayout.RowNode) {
            this.model.doAction(FlexLayout.Actions.moveNode(node.getId(), toNode.getId(), FlexLayout.DockLocation.BOTTOM, 0));
            // toNode.drop(tabNode, DockLocation.BOTTOM, 0);
          }
        }
      }
    };

    this.htmlToolbarRender = (this.state.htmlFromToolbar !== undefined)
      ? <Rnd enableResizing={{
        top: false, right: false, bottom: false, left: false,
        topRight: false, bottomRight: false, bottomLeft: false, topLeft: false
      }}
      default={{
        x: 50, y: 50,
        height: window.innerHeight - 100,
        width: window.innerWidth - 100
      }}className="htmlViewerVFB"
      disableDragging={true}
      maxHeight={window.innerHeight - 100} minHeight={100}
      maxWidth={window.innerWidth - 100} minWidth={100}
      ref={d => {
        this.rnd2 = d;
      }} >
        <div><i onClick={this.closeHtmlViewer} className='close-slider fa fa-times'/></div>
        <div ref={this.htmlToolbarRef}>
          <HTMLViewer
            id="ButtonBarComponentViewerContainer"
            name={"HTMLViewer"}
            componentType={'HTMLViewer'}
            content={this.state.htmlFromToolbar}
            style={{
              width: '100%',
              height: '100%',
              float: 'center'
            }}
            ref="htmlViewer" />
        </div>
      </Rnd> : undefined;

    if (this.state.quickHelpVisible !== undefined) {
      this.quickHelpRender = (this.state.quickHelpVisible === false)
        ? undefined
        : <VFBQuickHelp id="quickHelp" closeQuickHelp={this.closeQuickHelp} />;
    }

    return (
      <div style={{ height: '100%', width: '100%' }}>
        { this.quickHelpRender }
        <VFBToolBar
          htmlOutputHandler={this.renderHTMLViewer}
          menuHandler={this.menuHandler}/>

        <VFBFocusTerm
          ref={ref => this.focusTermReference = ref}
          UIUpdateManager={this.UIUpdateManager}
          queryBuilder={this.refs.querybuilderRef}/>

        <Logo
          logo='gpt-fly'
          id="geppettologo" />

        <FlexLayout.Layout
          ref="layout"
          model={this.model}
          factory={this.factory.bind(this)}
          onRenderTabSet={onRenderTabSet}
          clickOnBordersAction={clickOnBordersAction}/>

        <div id="spotlight" style={{ top: 0 }}>
          <SpotLight ref="spotlightRef"
            indexInstances={false}
            spotlightConfig={this.spotlightConfig}
            spotlightDataSourceConfig={this.spotlightDataSourceConfig}
            icon={"styles.Modal"}
            useBuiltInFilter={false}
            showClose={true} />
        </div>

        <div id="controlpanel" style={{ top: 0 }}>
          <ControlPanel ref="controlpanelRef"
            icon={"styles.Modal"}
            enableInfiniteScroll={true}
            useBuiltInFilter={false}
            controlPanelColMeta={this.controlPanelColMeta}
            controlPanelConfig={this.controlPanelConfig}
            columns={this.controlPanelColumns}
            controlPanelControlConfigs={this.controlPanelControlConfigs}
            showClose={true} />
        </div>

        <QueryBuilder ref="querybuilderRef"
          icon={"styles.Modal"}
          useBuiltInFilter={false}
          resultsColMeta={this.queryResultsColMeta}
          resultsColumns={this.queryResultsColumns}
          resultsControlConfig={this.queryResultsControlConfig}
          datasourceConfig={this.queryBuilderDatasourceConfig} 
          sorterColumns={this.sorterColumns}
          showClose={true} />

        <Search ref="searchRef"
          datasource="SOLR"
          searchConfiguration={this.searchConfiguration}
          datasourceConfiguration={this.datasourceConfiguration} />

        {this.htmlToolbarRender}
      </div>
    );
  }
}
