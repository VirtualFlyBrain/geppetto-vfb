/* eslint-disable no-undef */
import React, { Component } from 'react';
import VFBToolBar from './interface/VFBToolBar';
import FocusTerm from './interface/FocusTerm';
import StackViewer from './interface/StackViewer';
import TutorialWidget from './interface/TutorialWidget';
import VFBTermInfoWidget from './interface/VFBTermInfo';
import Logo from 'geppetto-client/js/components/interface/logo/Logo';
import Canvas from 'geppetto-client/js/components/interface/3dCanvas/Canvas';
import QueryBuilder from 'geppetto-client/js/components/interface/query/queryBuilder';
import SpotLight from 'geppetto-client/js/components/interface/spotlight/spotlight';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';
import ControlPanel from 'geppetto-client/js/components/interface/controlPanel/controlpanel';
import * as FlexLayout from 'geppetto-client/js/components/interface/flexLayout2/src/index';

require('../css/base.less');
require('../css/VFBMain.less');

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;
var modelJson = require('../components/configuration/layoutModel').modelJson;

export default class VFBMain extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      canvasAvailable: false,
      modelLoaded: (window.Model != undefined),
      canvasVisible: true,
      termInfoVisible: true,
      sliceViewerVisible: true,
      tutorialWidgetVisible: false,
      spotlightVisible: true,
      controlPanelVisible: true,
      wireframeVisible: false,
      queryBuilderVisible: true,
      idSelected: undefined,
      htmlFromToolbar: undefined,
      termInfoId: undefined,
      termInfoName: undefined,
      UIUpdated: false
    };

    this.menuHandler = this.menuHandler.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.htmlToolbarRef = this.htmlToolbarRef.bind(this);
    this.tutorialHandler = this.tutorialHandler.bind(this);
    this.UIUpdateManager = this.UIUpdateManager.bind(this);
    this.closeHtmlViewer = this.closeHtmlViewer.bind(this);
    this.renderHTMLViewer = this.renderHTMLViewer.bind(this);
    this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);

    this.coli = 1;
    this.vfbLoadBuffer = [];
    this.tutorialRender = undefined;
    this.htmlToolbarRender = undefined;
    this.urlIdsLoaded = false;
    this.canvasReference = undefined;
    this.termInfoReference = undefined;
    this.sliceViewerReference = undefined;
    this.focusTermReference = undefined;
    this.termInfoId = undefined;
    this.termInfoName = undefined;
    this.modalX = undefined;
    this.modalY = undefined;

    this.UIElementsVisibility = {};

    this.stackConfiguration = {
      serverUrl: 'https://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
      templateId: 'NOTSET'
    };

    this.voxel = {
      x: 0.622,
      y: 0.622,
      z: 0.622
    };

    this.stackViewerData = { id: "StackViewerWidget_" };

    this.colours = require('./configuration/colours.json');
    this.spotlightConfig = require('./configuration/spotlightConfiguration').spotlightConfig;
    this.spotlightDataSourceConfig = require('./configuration/spotlightConfiguration').spotlightDataSourceConfig;
    this.controlPanelConfig = require('./configuration/controlPanelConfiguration').controlPanelConfig;
    this.controlPanelColMeta = require('./configuration/controlPanelConfiguration').controlPanelColMeta;
    this.controlPanelColumns = require('./configuration/controlPanelConfiguration').controlPanelColumns;
    this.controlPanelControlConfigs = require('./configuration/controlPanelConfiguration').controlPanelControlConfigs;
    this.queryResultsColMeta = require('./configuration/queryBuilderConfiguration').queryResultsColMeta;
    this.queryResultsColumns = require('./configuration/queryBuilderConfiguration').queryResultsColumns;
    this.queryResultsControlConfig = require('./configuration/queryBuilderConfiguration').queryResultsControlConfig;
    this.queryBuilderDatasourceConfig = require('./configuration/queryBuilderConfiguration').queryBuilderDatasourceConfig;

    this.idForTermInfo = undefined;
    this.model = FlexLayout.Model.fromJson(modelJson)

    window.redirectURL = '$PROTOCOL$//$HOST$/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto?i=$TEMPLATE$,$VFB_ID$&id=$VFB_ID$';
    window.customAction = [];
  }

  getStackViewerDefaultX () {
    return (Math.ceil(window.innerWidth / 1.826));
  }

  getStackViewerDefaultY () {
    return (Math.ceil(window.innerHeight / 3.14));
  }

  // Logic to add VFB ids into the scene starts here
  setSepCol (entityPath) {
    if (entityPath.indexOf(window.templateID) < 0) {
      var c = this.coli;
      this.coli++;
      if (this.coli > 199) {
        this.coli = 1;
      }
    } else {
      c = 0;
    }
    if (Instances.getInstance(entityPath).setColor != undefined) {
      Instances.getInstance(entityPath).setColor(this.colours[c], true).setOpacity(0.3, true);
      try {
        Instances.getInstance(entityPath)[entityPath + '_swc'].setOpacity(1.0);
      } catch (ignore) {
      }
      if (c == 0) {
        Instances.getInstance(entityPath).setOpacity(0.4, true);
      }
    } else {
      console.log('Issue setting colour for ' + entityPath);
    }
  }

  clearQS () {
    if (this.refs.spotlightRef) {
      $("#spotlight").hide();
      $('#spotlight #typeahead')[0].placeholder = "Search for the item you're interested in...";
    }
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
          this.fetchVariableThenRun(idsList, this.handleSceneAndTermInfoCallback);
          this.setState({ idSelected: idsList[idsList.length - 1] });
        }
      }

    } else {
      console.log("model has not been loaded, in the old initialization here I was triggering a setTimeout to call recursively this same function addvfbid");
      // setTimeout(function () { this.addVfbId(idsList); }, 1000);
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
      if ((this.hasVisualType(variableIds[singleId])) && (this.termInfoReference !== null)) {
        var instance = Instances.getInstance(variableIds[singleId]);
        if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
          this.termInfoReference.setTermInfo(meta, meta.getParent().getId());
        }
        this.termInfoName = meta;
        this.termInfoId = meta.getParent().getId();
        // this.setState({termInfoName: meta, termInfoId: meta.getParent().getId()});
        this.resolve3D(variableIds[singleId], function () {
          GEPPETTO.SceneController.deselectAll();
          if ((instance != undefined) && (typeof instance.select === "function") && (this.termInfoReference !== null)){
            instance.select();
            if (this.termInfoReference !== undefined && this.termInfoReference !== null && instance[instance.getId() + "_meta"] !== undefined) {
              let meta = instance[instance.getId() + "_meta"];
              this.termInfoReference.setTermInfo(meta, meta.getParent().getId());
              this.termInfoName = meta;
              this.termInfoId = meta.getParent().getId();
            }
          }
        }.bind(this));
      } else {
        if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
          this.termInfoReference.setTermInfo(meta, meta.getParent().getId());
        }
        this.termInfoName = meta;
        this.termInfoId = meta.getParent().getId();
        // this.setState({termInfoName: meta, termInfoId: meta.getParent().getId()});
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

  hasVisualType (variableId) {
    var counter = 0;
    var instance = undefined;
    var extEnum = {
      0 : { extension: "_swc" },
      1 : { extension: "_obj" },
      2 : { extension: "_slice" }
    };
    while ((instance == undefined) && (counter < 3)) {
      try {
        instance = Instances.getInstance(variableId + "." + variableId + extEnum[counter].extension);
      } catch (ignore) { }
      counter++;
    }
    if (instance != undefined) {
      return true;
    } else {
      return false;
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
            window.fetchVariableThenRun([templateID], window.handleSceneAndTermInfoCallback, window.resolve3D(path));
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
              window.open(newUrl, targetWindow);
              window.ga('vfb.send', 'event', 'opening', 'newtemplate', templateID);
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
          callback();
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
      if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
        this.termInfoReference.setTermInfo(click.value[0], click.value[0].getName());
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
      let tabSet: TabSetNode | undefined;
      tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset", weight: 50 });
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
      let tabSet: TabSetNode | undefined;
      tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset", weight: 50 });
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
      $('#spotlight #typeahead')[0].placeholder = "Search for the item you're interested in...";
      this.refs.spotlightRef.open();
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
          termInfoName={this.termInfoName}
          termInfoId={this.termInfoId}
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
                  'Related Individuals',
                  'Relationships',
                  'Query for',
                  'Query For',
                  'Description',
                  'Cross References',
                  'References',
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
          <StackViewer
            id="NewStackViewer"
            defHeight={_height}
            defWidth={_width}
            layout={this.refs.layout}
            ref={ref => this.sliceViewerReference = ref}
            canvasRef={this.canvasReference}
            stackViewerHandler={this.stackViewerHandler} /></div>);
      } else {
        return (<div className="flexChildContainer"></div>);
      }
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
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);

    GEPPETTO.G.setIdleTimeOut(-1);

    // Global functions linked to VFBMain functions
    window.resolve3D = function (globalID) {
      this.resolve3D(globalID);
    }.bind(this);

    window.stackViewerRequest = function (idFromStack) {
      this.stackViewerRequest(idFromStack);
    }.bind(this);

    window.addVfbId = function (idFromOutside) {
      this.addVfbId(idFromOutside);
    }.bind(this);

    window.setTermInfo = function (meta, id) {
      if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
        this.termInfoReference.setTermInfo(meta, id);
      }
    }.bind(this);

    window.fetchVariableThenRun = function (idsList, cb, label) {
      this.fetchVariableThenRun(idsList, cb, label);
    }.bind(this);

    window.addToQueryCallback = function (variableId, label) {
      this.addToQueryCallback(variableId, label)
    }.bind(this);

    window.resolve3D = function (externalID) {
      this.resolve3D(externalID);
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
    if ((this.props.location.search.indexOf("id=VFB") == -1) && (this.props.location.search.indexOf("i=VFB") == -1)) {
      var that = this;
      console.log("Loading default Adult Brain VFB_00017894 template.");
      GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
        that.addVfbId("VFB_00017894");
      });
    }

    
    var idList = this.props.location.search;
    var idList = idList.replace("?","").split("&");
    var idsList = "";
    var idsTermInfoSubstring = "";
    var list;
    for (list in idList) {
      if (idList[list].indexOf("id=") > -1) {
        idsTermInfoSubstring = idList[list].replace("id=","");
        if (idsList.length > 0) {
          idsList += ",";
        }
        idsList += idsTermInfoSubstring;
      } else if (idList[list].indexOf("i=") > -1) {
        if (idsList.length > 0) {
          idsList = "," + idsList;
        }
        idsList = idList[list].replace("i=","") + idsList;
      }
    }
    if ((idsList.length > 0) && (this.state.modelLoaded == true) && (this.urlIdsLoaded == false)) {
      this.urlIdsLoaded = true;
      var idArray = idsList.split(",");
      var that = this;
      console.log("Loading IDS to add to the scene from url");
      GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
        that.addVfbId(idArray);
        if (idsTermInfoSubstring.length > 0) {
          this.idForTermInfo = idsTermInfoSubstring;
        }
      });
    }

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
      if (Array.from(arguments).join("\n").indexOf('www.pixijs.com') < 0) {
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
          if ((currentSelectionName != latestSelection.getName()) && (this.termInfoReference !== null) && (this.termInfoReference !== null)) {
            if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
              this.termInfoReference.setTermInfo(latestSelection[latestSelection.getId() + "_meta"], latestSelection[latestSelection.getId() + "_meta"].getName());
            }
            this.termInfoName = latestSelection[latestSelection.getId() + "_meta"];
            this.termInfoId = latestSelection[latestSelection.getId() + "_meta"].getName();
            // this.setState({termInfoName: latestSelection[latestSelection.getId() + "_meta"], termInfoId: latestSelection[latestSelection.getId() + "_meta"].getName()});
          }
        } else {
          // it's a leaf (no children) / grab parent if name is different from current selection set term info
          var parent = latestSelection.getParent();
          if ((parent != null && currentSelectionName != parent.getName()) && (this.termInfoReference !== null) && (this.termInfoReference !== null)) {
            if (this.termInfoReference !== undefined && this.termInfoReference !== null) {
              this.termInfoReference.setTermInfo(parent[parent.getId() + "_meta"], parent[parent.getId() + "_meta"].getName());
            }
            this.termInfoName = parent[parent.getId() + "_meta"];
            this.termInfoId = parent[parent.getId() + "_meta"].getName();
            // this.setState({termInfoName: parent[parent.getId() + "_meta"], termInfoId: parent[parent.getId() + "_meta"].getName()});
          }
        }
      }
      if (window.StackViewer1 != undefined) {
        this.sliceViewerReference.updateStackWidget();
      }
    }.bind(this));

    GEPPETTO.on(GEPPETTO.Events.Websocket_disconnected, function () {
      window.ga('vfb.send', 'event', 'reload', 'websocket-disconnect', (window.location.pathname + window.location.search));
      console.log("Reloading websocket connection by reloading page");
      window.location.reload(true);
    });
  }

  render () {
    if ((this.state.tutorialWidgetVisible == true) && (this.tutorialRender == undefined)) {
      this.tutorialRender = <TutorialWidget tutorialHandler={this.tutorialHandler} ref="tutorialWidgetRef" />
    }

    var key = 0;
    var onRenderTabSet = function (node:(TabSetNode), renderValues:any) {
      if (node.getType() === "tabset") {
        renderValues.buttons.push(<div key={key} className="fa fa-window-minimize customIconFlexLayout" onClick={() => {
          this.model.doAction(FlexLayout.Actions.moveNode(node.getSelectedNode().getId(), "border_bottom", FlexLayout.DockLocation.CENTER, 0));
        }} />);
        key++;
      }
    };

    key = 0;

    var clickOnBordersAction = function (node:(TabNode)) {
      let idChild = 0;
      let rightChild = 0;
      let tempModel = node.getModel();
      var rootNode = tempModel.getRoot();
      var modelChildren = tempModel.getRoot().getChildren();
      // const fromNode = this._idMap[action.data["fromNode"]] as (Node & IDraggable);
      if (node instanceof FlexLayout.TabNode || node instanceof FlexLayout.TabSetNode) {
        if (modelChildren.length <= 1) {
          let tabSet: TabSetNode | undefined;
          tabSet = new FlexLayout.TabSetNode(tempModel, { type: "tabset" });
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

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <VFBToolBar
          htmlOutputHandler={this.renderHTMLViewer}
          menuHandler={this.menuHandler}/>

        <FocusTerm
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
            useBuiltInFilter={false} />
        </div>

        <div id="controlpanel" style={{ top: 0 }}>
          <ControlPanel ref="controlpanelRef"
            icon={"styles.Modal"}
            enableInfiniteScroll={true}
            useBuiltInFilter={false}
            controlPanelColMeta={this.controlPanelColMeta}
            controlPanelConfig={this.controlPanelConfig}
            columns={this.controlPanelColumns}
            controlPanelControlConfigs={this.controlPanelControlConfigs}/>
        </div>

        <QueryBuilder ref="querybuilderRef"
          icon={"styles.Modal"}
          useBuiltInFilter={false}
          resultsColMeta={this.queryResultsColMeta}
          resultsColumns={this.queryResultsColumns}
          resultsControlConfig={this.queryResultsControlConfig}
          datasourceConfig={this.queryBuilderDatasourceConfig} />

        <div id="tutorialDiv">
          {this.tutorialRender}
        </div>

        {this.htmlToolbarRender}
      </div>
    );
  }
}
