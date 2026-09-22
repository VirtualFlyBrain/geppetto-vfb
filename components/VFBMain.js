/* eslint-disable no-undef */
import React, { Component } from 'react';
import VFBToolBar from './interface/VFBToolbar/VFBToolBar';
import VFBFocusTerm from './interface/VFBFocusTerm/VFBFocusTerm';
import VFBTree from './interface/VFBTree/VFBTree';
import VFBStackViewer from './interface/VFBStackViewer/VFBStackViewer';
import TutorialWidget from './interface/VFBOverview/TutorialWidget';
import VFBTermInfoWidget from './interface/VFBTermInfo/VFBTermInfo';
import Logo from '@geppettoengine/geppetto-client/components/interface/logo/Logo';
import Canvas from '@geppettoengine/geppetto-client/components/interface/3dCanvas/Canvas';
import QueryBuilder from '@geppettoengine/geppetto-client/components/interface/query/queryBuilder';
import GrossTypeLabelsComponent from './interface/utils/GrossTypeLabelsComponent';
import { safeGa } from './interface/utils/utils';
import { showConnectionNotice, hideConnectionNotice } from './interface/utils/connectionNotice';
import { initTermPageMetadata, updateTermPageMetadata } from './interface/utils/pageMetadata';
import VFBDownloadContents from './interface/VFBDownloadContents/VFBDownloadContents';
import VFBUploader from './interface/VFBUploader/VFBUploader';
import HTMLViewer from '@geppettoengine/geppetto-ui/html-viewer/HTMLViewer';
import VFBListViewer from './interface/VFBListViewer/VFBListViewer';
import * as FlexLayout from '@geppettoengine/geppetto-ui/flex-layout/src/index';
import Search from '@geppettoengine/geppetto-ui/search/Search';
import VFBQuickHelp from './interface/VFBOverview/QuickHelp';
import VFBGraph from './interface/VFBGraph/VFBGraph';
import VFBCircuitBrowser from './interface/VFBCircuitBrowser/VFBCircuitBrowser';
import VFBOrientationGizmo from './interface/VFBOrientationGizmo/VFBOrientationGizmo';
import { connect } from "react-redux";
import * as ACTIONS from './../actions/generals';

require('../css/base.less');
require('../css/VFBMain.less');

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;
var modelJson = require('./configuration/VFBMain/layoutModel').modelJson;

/*
 * The VFB template ids. When a URL loads, the first of its ids that is one of
 * these becomes the scene's template straight away (see componentDidMount).
 */
const VFB_TEMPLATES = [
  'VFB_00017894', 'VFB_00101567', 'VFB_00101384', 'VFB_00050000',
  'VFB_00049000', 'VFB_00100000', 'VFB_00030786', 'VFB_00200000'
];

class VFBMain extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      canvasAvailable: false,
      canvasVisible: true,
      listViewerVisible: true,
      graphVisible : true,
      circuitBrowserVisible : true,
      htmlFromToolbar: undefined,
      idSelected: undefined,
      instanceOnFocus: undefined,
      modelLoaded: (window.Model != undefined),
      queryBuilderVisible: true,
      sliceViewerVisible: true,
      spotlightVisible: true,
      termInfoVisible: true,
      treeBrowserVisible: true,
      tutorialWidgetVisible: false,
      quickHelpVisible: undefined,
      UIUpdated: true,
      wireframeVisible: false,
      downloadContentsVisible : true,
      uploaderContentsVisible : true
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
    this.instancesFromDifferentTemplates = this.instancesFromDifferentTemplates.bind(this);

    this.tutorialRender = undefined;
    this.htmlToolbarRender = undefined;
    this.urlIdsLoaded = false;
    this.canvasReference = undefined;
    this.termInfoReference = undefined;
    this.sliceViewerReference = undefined;
    this.treeBrowserReference = undefined;
    this.graphReference = undefined;
    this.circuitBrowserReference = undefined;
    this.listViewerReference = undefined;
    this.focusTermReference = undefined;
    this.idOnFocus = undefined;
    this.instanceOnFocus = undefined;
    this.idFromURL = undefined;
    this.idsFromURL = [];
    /*
     * The most recently requested term (last click, or the id= focus on a URL
     * load). Only this term drives the term-info panel / selection; other loads
     * complete silently. A newer request supersedes an in-flight one.
     */
    this.lastRequestedFocusId = undefined;
    this.urlQueryLoader = [];
    this.quickHelpRender = undefined;
    this.firstLoad = true;
    this.templateViewFramed = false;
    this.firstTermReported = false;
    this.quickHelpOpen = true;

    this.UIElementsVisibility = {};

    this.colours = require('./configuration/VFBMain/colours.json');

    this.searchStyle = require('./configuration/VFBMain/searchConfiguration').searchStyle;
    this.searchConfiguration = require('./configuration/VFBMain/searchConfiguration').searchConfiguration;
    this.datasourceConfiguration = require('./configuration/VFBMain/searchConfiguration').datasourceConfiguration;

    this.queryResultsColMeta = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsColMeta;
    this.queryResultsColumns = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsColumns;
    this.queryResultsControlConfig = require('./configuration/VFBMain/queryBuilderConfiguration').queryResultsControlConfig;
    this.queryBuilderDatasourceConfig = require('./configuration/VFBMain/queryBuilderConfiguration').queryBuilderDatasourceConfig;
    this.sorterColumns = require('./configuration/VFBMain/queryBuilderConfiguration').sorterColumns;

    this.setSepCol = require('./interface/utils/utils').setSepCol;
    this.hasVisualType = require('./interface/utils/utils').hasVisualType;
    this.hasUnresolvedVisualType = require('./interface/utils/utils').hasUnresolvedVisualType;
    this.hasGeometryMissingFromScene = require('./interface/utils/utils').hasGeometryMissingFromScene;
    this.isVariableLoaded = require('./interface/utils/utils').isVariableLoaded;

    /*
     * Single owner of term loading. Everything that loads a term goes through
     * this: it caps how many fetch at once, remembers the last id requested for
     * display (focusId), dedups repeat requests, lets a slow term step aside so
     * neighbours load, and publishes a live status for the progress overlay.
     */
    var VFBLoadManager = require('./interface/VFBLoader/VFBLoadManager').default;
    this.loadManager = new VFBLoadManager({
      concurrency: 3,
      fetch: (id, callbacks) => this.managerFetch(id, callbacks),
      onFocus: id => this.managerFocus(id),
      onFailed: id => this.props.invalidIdLoaded(id),
      publish: snapshot => this.props.setLoadStatus(snapshot),
      isLoaded: id => this.managerIsLoaded(id),
      /*
       * How long a term the user asked for actually took to arrive, and
       * whether it arrived at all -- the load path's own responsiveness,
       * separate from the direct-* counts which say which path served it.
       */
      onSettled: (id, ok, ms) => {
        try {
          if (typeof window.vfbGaDetail === "function") {
            window.vfbGaDetail('term-load', ok ? 'ok' : 'failed', window.vfbSecondsBucket(ms));
          }
        } catch (e) {
          /* reporting must never affect loading */
        }
      }
    });
    /*
     * Progressive query load-all (geppetto-client queryBuilder): page size,
     * the streamable query allowlist, and a status bridge to the loader overlay.
     */
    if (typeof window !== 'undefined') {
      window.VFB_QUERY_PAGE_SIZE = window.VFB_QUERY_PAGE_SIZE || 10000;
      window.VFB_STREAMABLE_QUERIES = window.VFB_STREAMABLE_QUERIES || ['AllAlignedImages'];
      /*
       * The Rancher ingress nodes, named directly so a session can take its
       * data from one of them instead of everyone queueing on the round-robin
       * name. Each node has its own 1Gb link, so spreading sessions across
       * them is the cheapest bandwidth available; a node that does not answer
       * is dropped for the session and the published name serves instead.
       *
       * Names, not addresses: DNS drops a host that goes down, and the
       * certificate is issued for names. vfbk8s10 to 12 are deliberately
       * absent -- no ingress yet -- and vfbk8s10 will want a weight
       * ('vfbk8s10.virtualflybrain.org*10') when it arrives, as it has a
       * 10Gb link where these have 1Gb.
       */
      window.VFB_DATA_HOSTS = window.VFB_DATA_HOSTS || [
        'buttermilk.virtualflybrain.org',
        'parsley.virtualflybrain.org',
        'sourcream.virtualflybrain.org',
        'chive.virtualflybrain.org',
        'mayo.virtualflybrain.org',
        'dill.virtualflybrain.org',
        'cayenne.virtualflybrain.org'
      ];
      var vfbMainSelf = this;
      window.vfbQueryLoadStatus = function (loaded, done) {
        try {
          vfbMainSelf.loadManager.setQueryLoadStatus(loaded, done);
        } catch (e) {
          /* overlay status is best-effort */
        }
      };
    }
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
      // Latest requested term wins focus/term-info (idsFromURL keeps id= last).
      if (idsList.length > 0) {
        this.lastRequestedFocusId = idsList[idsList.length - 1];
      }
      /*
       * Update URL in case of reload before items loaded. Rebuild a clean,
       * de-duplicated id=/i= URL rather than appending the id list onto the
       * existing search string (which duplicated the i= list on every call,
       * growing the URL and desyncing the loader when ids repeat).
       */
      if (window.history.state != null && (window.history.state.s == 1 || window.history.state.s == 4) && window.location.search.indexOf("i=") > -1) {
        /*
         * Keep what the URL already lists and add the new ids to it. Writing
         * only the ids of this request dropped everything already in the
         * scene from i=, so a reload (including the one the reconnect logic
         * falls back to) came back with just the last term.
         */
        var existingIds = (new URLSearchParams(window.location.search).get('i') || '').split(',').filter(Boolean);
        var cleanIds = Array.from(new Set(existingIds.concat(idsList)));
        var focusForUrl = (this.idFromURL !== undefined && this.idFromURL !== "") ? this.idFromURL : cleanIds[0];
        window.history.replaceState({ s:0, n:window.history.state.n, b:window.history.state.b, f:window.history.state.f, u:window.location.search }, "Loading", location.pathname + "?id=" + focusForUrl + "&i=" + cleanIds.join(','));
      }
      if (idsList != null && idsList.length > 0) {
        /*
         * Hand the whole request to the load manager. The last id is the display
         * target (focus); the rest load silently. The manager caps concurrency,
         * dedups repeats, and drives the overlay + focus -- replacing the old
         * per-item fetch loop and its focus race.
         */
        this.loadManager.focusId = idsList[idsList.length - 1];
        this.loadManager.requestMany(idsList, { displayLast: true });
        this.setState({
          UIUpdated: false,
          idSelected: idsList[idsList.length - 1]
        });
      }
      // Analytics ping only -- must never be able to abort the load above.
      safeGa('vfb.send', 'event', 'request', 'addvfbid', idsList.join(','));

    } else {
      console.log("model has not been loaded, in the old initialization here I was triggering a"
                  + "setTimeout to call recursively this same function addvfbid");
    }
  }

  fetchVariableThenRun (variableId, callback, label) {
    GEPPETTO.SceneController.deselectAll(); // signal something is happening!
    var variables = GEPPETTO.ModelFactory.getTopLevelVariablesById(variableId);
    if (variables.length > 0) {
      if (callback != undefined) {
        callback(variableId, label);
      }
      return;
    }

    /*
     * fetch_variable is a WebSocket request whose completion callback is matched
     * by requestID in MessageSocket. Issue it ONCE and wait. We deliberately do
     * NOT re-issue on a timeout: term-info replies are large and the server
     * sends them serially (~1-2s each), so re-fetching just piles more requests
     * onto an already-busy queue and makes loading slower, gridlocking it. A
     * long single grace period covers a genuinely lost/errored reply -- if the
     * variable still hasn't arrived by then, drain this one loader entry
     * (invalidIdLoaded, handled by the reducer) so the progress bar can complete
     * rather than sticking at "Loading N/M ..." forever.
     */
    var self = this;
    var settled = false;
    var finish = function () {
      if (settled) {
        return;
      }
      settled = true;
      if (callback != undefined) {
        callback(variableId, label);
      }
    };
    Model.getDatasources()[5].fetchVariable(variableId, finish);
    setTimeout(function () {
      if (settled) {
        return;
      }
      /*
       * The reply may have arrived and built the variable without our callback
       * firing (orphaned requestID) -- accept it if so.
       */
      if (GEPPETTO.ModelFactory.getTopLevelVariablesById(variableId).length > 0) {
        finish();
        return;
      }
      settled = true;
      console.error("fetchVariableThenRun: no response for " + variableId
        + "; draining loader entry");
      if (self.props && typeof self.props.invalidIdLoaded === "function") {
        self.props.invalidIdLoaded(variableId);
      }
    }, 120000);
  }

  ThreeDViewerIdLoaded (id) {
    this.props.vfbIdLoaded(id, "ThreeDViewer");
    this.loadManager.noteComponentLoaded(id);
    /*
     * The canvas frames the scene once, the first time every visual instance it
     * knows about has a mesh. On a URL load that is true well before the
     * template arrives -- with only a neuron or two in the scene -- so the
     * opening view was zoomed onto whichever term happened to load first (and
     * never corrected, since the canvas only does it once; pressing Home
     * afterwards looked right, because by then the template was there).
     * Frame it again, once, when the template's own mesh lands.
     */
    if (id === window.templateID && !this.templateViewFramed) {
      this.templateViewFramed = true;
      if (this.canvasReference !== undefined && this.canvasReference !== null) {
        this.canvasReference.resetCamera();
      }
    }
  }

  StackViewerIdLoaded (id) {
    this.props.vfbIdLoaded(id, "StackViewer");
    this.loadManager.noteComponentLoaded(id);
  }

  TermInfoIdLoaded (id) {
    this.props.vfbIdLoaded(id, "TermInfo");
    this.loadManager.noteComponentLoaded(id);
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
        this.props.invalidIdLoaded(variableIds[singleId])
        continue;
      }
      /*
       * Only the most recently requested term (last click / id= focus) drives
       * the term-info panel and selection. Everything else still loads into the
       * model and scene, but silently -- so clicking several terms in quick
       * succession while one is loading no longer has each completion fight for
       * focus (which piled up and looked like a stuck load). Evaluated against
       * the CURRENT latest request, so a newer click supersedes an in-flight one.
       */
      var isFocusTarget = (this.lastRequestedFocusId === undefined)
        || (variableIds[singleId] === this.lastRequestedFocusId);
      if (this.hasVisualType(variableIds[singleId])) {
        if (!this.firstLoad && isFocusTarget) {
          this.handlerInstanceUpdate(meta);
        }
        this.resolve3D(variableIds[singleId], function (id) {
          // Superseded terms: geometry still loads, but take no focus/selection.
          if (this.lastRequestedFocusId !== undefined && id !== this.lastRequestedFocusId) {
            return;
          }
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
        /*
         * Term with no visual type (a class / neuromere etc.): there is nothing
         * for the 3D or slice viewers to load, so no viewer ever dispatches its
         * loaded-signal and this id's loader entry (empty components) would stick
         * forever -- e.g. "Loading 2/2" -- keeping the progress overlay up so the
         * Term Info panel never surfaces. Resolve the loader entry here so the
         * load completes and the term simply appears in Term Info, with NO
         * geometry pulled in. Only the focus term drives the panel/tab.
         */
        if (isFocusTarget) {
          this.handlerInstanceUpdate(meta);
          this.setActiveTab("termInfo");
        }
        this.props.invalidIdLoaded(variableIds[singleId]);
      }
    }
  }

  /*
   * Per-item worker the load manager calls under its concurrency cap. Issues a
   * single fetch_variable -- the manager owns the timeout/give-up, so there is
   * NO retry here (retries only reloaded the serial sender and gridlocked
   * loading) -- then runs the existing scene/term-info handling and reports the
   * term resolved so the manager can free the slot and start the next one.
   */
  managerFetch (id, callbacks) {
    var self = this;
    var cb = callbacks || {};
    var resolved = cb.onResolved || function () {};
    var fetched = cb.onFetched || function () {};
    var failed = cb.onFailed || function () {};

    /* Already in the scene: nothing to fetch or paint -- done now. */
    if (Instances.getInstance(id) !== undefined) {
      this.handleSceneAndTermInfoCallback(id);
      this.managerLabel(id);
      resolved();
      return;
    }

    try {
      Model.getDatasources()[5].fetchVariable(id, function () {
        self.handleSceneAndTermInfoCallback(id);
        self.managerLabel(id);
        /*
         * Loading is owned by VFBLoadManager -- its status drives
         * generals.loading (loadStatus.active). A visual term (any image,
         * painted domains included) is reported fetched and completes when its
         * viewer paints (noteComponentLoaded) or the render grace elapses; a term
         * with no geometry resolves immediately. The old idsMap/vfbLoadId counter
         * is deliberately NOT written any more: it never cleared for a term
         * rendered as part of another mesh (a painted domain reports no separate
         * component load), so its idsMap entry held generals.loading true forever
         * and left the fly logo spinning. No term type is special-cased here.
         */
        if (self.hasVisualType(id)) {
          fetched();
        } else {
          resolved();
        }
      });
    } catch (e) {
      failed(e);
    }
  }

  /*
   * True when the term is already present in the model/scene, so a re-request
   * (a click to view it) should just re-focus rather than load and count it
   * again. Covers terms that came in with the initial scene (templates, painted
   * domains) which the manager itself never requested.
   */
  managerIsLoaded (id) {
    /*
     * Geppetto sets window[<id>] AND window.Instances[<id>] when a term's
     * top-level instance is created (Manager.augmentInstancesArray). Testing
     * window[id] is not safe: named access also resolves any DOM element with
     * that id, and the Layers list gives its class links the class id, so a
     * slice-viewer click on such a domain was taken as "already loaded" and
     * silently did nothing. Testing the model factory instead (#1755) was too
     * weak the other way: window.Model[id] exists as soon as the variable is
     * merged, before its instance and geometry exist, so a term requested
     * again in that window was skipped and its mesh never loaded (batch-2
     * tests: Term Info populated, empty 3D viewer, no deselect button).
     * window.Instances[id] is exactly what window[id] meant, minus the DOM.
     */
    if ((typeof window === "undefined") || !window.Instances || (window.Instances[id] === undefined)) {
      return false;
    }
    /*
     * A loaded variable only means Term Info has been fetched. The term is not loaded until its visual types have been
     * resolved into the scene; while any of them is still an ImportType there
     * is geometry outstanding, and a re-request must load it rather than just
     * re-focus. Treating "variable exists" as "loaded" is what made a Term Info
     * thumbnail click show the term and never its image.
     */
    if (this.hasUnresolvedVisualType(id)) {
      return false;
    }
    /*
     * Resolved is still not loaded if the geometry has left the scene. Clear
     * deletes every instance but leaves the resolved types in the model, so a
     * term that was cleared and then asked for again looked loaded here, was
     * only re-focused, and never came back -- for the rest of the session.
     */
    return !this.hasGeometryMissingFromScene(id);
  }

  /* Best-effort human label for the status line (falls back to the id). */
  managerLabel (id) {
    try {
      var instance = Instances.getInstance(id);
      var name = (instance && typeof instance.getName === "function") ? instance.getName() : undefined;
      if (name && name !== id) {
        this.loadManager.setLabel(id, name);
      }
    } catch (e) {
      // label is cosmetic; ignore
    }
  }

  /*
   * Apply focus for the manager's current display target: show it in Term Info
   * and, if it has geometry, select it in the scene. Idempotent -- safe to call
   * again when an already-loaded term is re-requested (re-click).
   */
  managerFocus (id) {
    var meta;
    try {
      meta = Instances.getInstance(id + '.' + id + '_meta');
    } catch (e) {
      meta = undefined;
    }
    if (meta === undefined) {
      /*
       * Focus was applied to a term the manager believes is loaded but whose
       * meta instance isn't in the model. Don't return silently -- that leaves
       * Term Info unchanged with nothing in the console -- fetch it properly.
       * Once per id: request() re-enters here if it still judges the term
       * loaded, and a second pass would recurse without end.
       */
      this.focusReloadTried = this.focusReloadTried || {};
      if (this.focusReloadTried[id]) {
        console.warn("managerFocus: still no meta instance for " + id + " after reloading it");
        return;
      }
      this.focusReloadTried[id] = true;
      console.warn("managerFocus: no meta instance for " + id + "; loading it");
      this.loadManager.loaded.delete(id);
      this.loadManager.items.delete(id);
      this.loadManager.request(id, { display: true });
      return;
    }
    delete (this.focusReloadTried || {})[id];
    this.handlerInstanceUpdate(meta);
    var instance = Instances.getInstance(id);
    if (this.hasVisualType(id) && instance !== undefined && typeof instance.select === "function") {
      GEPPETTO.SceneController.deselectAll();
      instance.select();
    } else {
      this.setActiveTab("termInfo");
    }
  }

  resolve3D (path, callback) {
    var rootInstance = Instances.getInstance(path);
    GEPPETTO.SceneController.deselectAll();

    var superTypes = rootInstance.getType().getSuperType();
    var isTemplate = false;
    var isClass = false;
    var alignedTo = [];
    for (var i = 0; i < superTypes.length; i++) {
      var superId = superTypes[i].getId();
      if (superId == 'Template') {
        isTemplate = true;
      } else if (superId == 'Class') {
        isClass = true;
      } else if (VFB_TEMPLATES.indexOf(superId) > -1) {
        // Every template the term has an image on is one of its super-types.
        alignedTo.push(superId);
      }
    }

    /*
     * The scene's template may already be known before its own term has loaded
     * (it is set from the URL, see componentDidMount), so apply the template's
     * view settings when the template itself resolves, not only when it is the
     * first thing to resolve.
     */
    if (isTemplate && (window.templateID == undefined || window.templateID == rootInstance.getId())) {
      window.templateID = rootInstance.getId();
      this.applyTemplateView(window.templateID);
    }

    if (window.templateID == undefined) {
      // Assume the template associated with the first item loaded and ensure the template is added to the cue for loading.
      var meta = rootInstance[rootInstance.getId() + '_meta'];
      if (meta != undefined && typeof meta.getType().template != "undefined") {
        var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
        var anchorElement = $(templateMarkup).filter('a');
        var templateID = anchorElement.attr('data-instancepath');
        /*
         * Queue the template SILENTLY (not through addVfbId, which would make it
         * the display target) and claim it as the scene's template now, so
         * terms resolving meanwhile are checked against it rather than each
         * picking their own.
         */
        window.templateID = templateID;
        this.loadManager.request(templateID, { display: false });
        /*
         * Retry with the SAME callback. This used to call window.resolve3D,
         * whose callback selects the instance unconditionally -- that selection
         * went through the Select listener into handlerInstanceUpdate, so any
         * term that resolved before the template stole Term Info / URL id=
         * from the requested focus ~5s later.
         */
        var self = this;
        setTimeout(function () {
          self.resolve3D(path, callback);
        }, 5000);
        return; // Don't load until the template has
      }
    } else if (!(isTemplate && rootInstance.getId() == window.templateID)) {
      if (isClass) {
        return; // Exit if Class - Class doesn't have image types.
      }
      /*
       * Check if the user is adding to the scene something belonging to another
       * template. A term can be aligned to several templates: it is only
       * "another template" if none of them is the scene's. Comparing against
       * just the first template listed in its term info (as before) prompted
       * for images that do have an alignment to the loaded template.
       */
      var otherTemplate = undefined;
      if (alignedTo.length > 0 && alignedTo.indexOf(window.templateID) < 0) {
        otherTemplate = alignedTo[0];
      } else if (alignedTo.length == 0) {
        // No template super-types (older model shapes): fall back to the term info's template link.
        var meta = rootInstance[rootInstance.getId() + '_meta'];
        if (meta != undefined && typeof meta.getType().template != "undefined") {
          var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
          var linkedTemplates = $(templateMarkup).filter('a').map(function () {
            return $(this).attr('data-instancepath');
          }).get();
          if (linkedTemplates.length > 0 && linkedTemplates.indexOf(window.templateID) < 0) {
            otherTemplate = linkedTemplates[0];
          }
        }
      }
      if (otherTemplate !== undefined) {
        if (window.EMBEDDED) {
          var curHost = parent.document.location.host;
          var curProto = parent.document.location.protocol;
        } else {
          var curHost = document.location.host;
          var curProto = document.location.protocol;
        }
        // open new window with the new template and the instance ID
        safeGa('vfb.send', 'event', 'request', 'newtemplate', otherTemplate);
        var targetWindow = '_blank';
        var newUrl = window.redirectURL.replace(/\$VFB_ID\$/gi, rootInstance.getId()).replace(/\$TEMPLATE\$/gi, otherTemplate).replace(/\$HOST\$/gi, curHost).replace(/\$PROTOCOL\$/gi, curProto);
        if (confirm("The image you requested is aligned to another template. \nClick OK to open in a new tab or Cancel to just view the image metadata.")) {
          safeGa('vfb.send', 'event', 'opening', 'newtemplate', otherTemplate);
          window.open(newUrl, targetWindow);
        } else {
          safeGa('vfb.send', 'event', 'cancelled', 'newtemplate', otherTemplate);
        }
        this.instancesFromDifferentTemplates(rootInstance);
        // stop flow here, we don't want to add to scene something with a different template
        return;
      }
    }

    this.selectAndResolve3D(path, callback);
  }

  /*
   * Fall back to the SWC skeleton for a term whose mesh could not be loaded.
   * Quietly does nothing when the term has no skeleton, or already shows one.
   */
  showSkeletonFor (id) {
    try {
      var swc = Instances.getInstance(id + "." + id + "_swc");
      if (swc === undefined || swc === null) {
        return;
      }
      if (swc.getType().getMetaType() === GEPPETTO.Resources.IMPORT_TYPE) {
        console.warn("VFB: no mesh for " + id + ", showing the skeleton instead");
        swc.getType().resolve(function () {
          if (typeof swc.show === "function") {
            swc.show();
          }
        });
      } else if (typeof swc.show === "function" && !GEPPETTO.SceneController.isVisible([swc])) {
        swc.show();
      }
    } catch (ignore) {
      // No skeleton for this term: nothing more we can offer.
    }
  }

  selectAndResolve3D (path, callback) {
    var ImportType = require('@geppettoengine/geppetto-core/model/ImportType');
    var instance = undefined;
    var flagRendering = true;
    // check if we have a full mesh
    try {
      instance = Instances[path].getType()[path + "_obj"].getType();
      if (instance != undefined && instance.getUrl != undefined && (typeof instance.getUrl == "function") && instance.getUrl().includes("volume_man.obj")) {
        instance = Instances.getInstance(path + "." + path + "_obj");
        if ((!window[path][path + '_obj'].visible) && (typeof window[path][path + '_obj'].show == "function") && (flagRendering)) {
          window[path][path + '_obj'].show();
          flagRendering = false;
        }
      } else {
        instance = undefined;
        flagRendering = true;
      }
    } catch (ignore) {
      instance = undefined;
    }
    // check if we have swc
    if (instance == undefined) {
      try {
        instance = Instances.getInstance(path + "." + path + "_swc");
        if (!window[path][path + '_swc'].visible && typeof window[path][path + '_swc'].show == "function" && flagRendering) {
          window[path][path + '_swc'].show();
          flagRendering = false;
        }
      } catch (ignore) {
      }
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

    // independently from the above, check if we have slices for the instance
    try {
      var slices = Instances.getInstance(path + "." + path + "_slices");
      if (typeof (slices) != 'undefined' && slices.getType() instanceof ImportType) {
        slices.getType().resolve();
      }
    } catch (ignore) {
      // any alternative handling goes here
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
  }

  applyTemplateView (templateID) {
    // Set wireframe by template:
    switch (templateID) {
    case "VFB_00101384":
      this.canvasReference.setWireframe(false);
      this.canvasReference.setCameraRotation(-1.812, 0, 3.121, 403.231);
      // TOOD: Fix Orientaion
      break;
    default:
      this.canvasReference.setWireframe(false);
      break;
    }
  }

  instancesFromDifferentTemplates (instance) {
    // Show its metadata only if it is the term asked for; a silent load stays silent.
    if (this.lastRequestedFocusId === undefined || instance.getId() === this.lastRequestedFocusId) {
      this.handlerInstanceUpdate(instance);
    }

    var children = instance.getChildren();
    for ( let i = 0; i < children.length; i++) {
      if (children[i].getId().indexOf("_swc") || children.getId().indexOf("_obj")) {
        this.ThreeDViewerIdLoaded(instance.getId());
      }
      if (children[i].getId().indexOf("_slices")) {
        this.StackViewerIdLoaded(instance.getId());
      }
    }
  }

  UIUpdateItem (itemState, visibilityAnchor) {
    if (this.state[itemState] === false) {
      this.setState({ 
        UIUpdated: true,
        [itemState]: !this.state[itemState]
      });
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
    case 'treeBrowserVisible':
      this.UIUpdateItem(buttonState, "treeBrowser");
      break;
    case 'graphVisible':
      this.UIUpdateItem(buttonState, "vfbGraph");
      break;
    case 'circuitBrowserVisible':
      this.UIUpdateItem(buttonState, "vfbCircuitBrowser");
      break;
    case 'spotlightVisible':
      this.setState({
        UIUpdated: true,
        [buttonState]: !this.state[buttonState]
      });
      break;
    case 'queryBuilderVisible':
      this.setState({
        UIUpdated: true,
        [buttonState]: !this.state[buttonState]
      });
      break;
    case 'listViewerVisible':
      this.UIUpdateItem(buttonState, "vfbListViewer");
      break;
    case 'wireframeVisible':
      this.setState({
        UIUpdated: true,
        [buttonState]: !this.state[buttonState]
      });
      break;
    case 'tutorialWidgetVisible':
      this.setState({
        UIUpdated: true,
        [buttonState]: !this.state[buttonState]
      });
      break;
    case 'downloadContentsVisible':
      this.refs.downloadContentsRef?.openDialog();
      break;
    case 'uploaderContentsVisible':
      this.refs.uploaderContentsRef?.openDialog();
      break;
    case 'quickHelpVisible':
      if (this.state[buttonState] === undefined) {
        this.setState({
          UIUpdated: true,
          [buttonState]: true
        });
      } else {
        this.setState({
          UIUpdated: true,
          [buttonState]: !this.state[buttonState]
        });
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
    case 'downloadContentsVisible':
      this.refs.downloadContentsRef?.openDialog();
      break;
    case 'uploaderContentsVisible':
      this.refs.uploaderContentsRef?.openDialog();
      break;
    case 'triggerRunQuery':
      var that = this;
      var otherId = click.parameters[0].split(',')[1];
      var otherName = click.parameters[0].split(',')[2];
      var path = click.parameters[0].split(',')[0];
      var entity = Model[path];

      $("body").css("cursor", "progress");
      this.refs.querybuilderRef.open();
      this.refs.querybuilderRef.switchView(false, false);
      this.refs.querybuilderRef.clearAllQueryItems();
      // $('#add-new-query-container')[0].hidden = true; $('#query-builder-items-container')[0].hidden = true;

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
      };
      // add query item + selection
      if (!this.isVariableLoaded(otherId)) {
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
      this.setState({ 
        UIUpdated: true,
        htmlFromToolbar: htmlChild
      });
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
      this.setState({
        UIUpdated: true,
        htmlFromToolbar: undefined
      });
    }
  }

  closeHtmlViewer () {
    this.setState({
      UIUpdated: true,
      htmlFromToolbar: undefined
    });
  }

  closeQuickHelp () {
    this.setState({
      UIUpdated: true,
      quickHelpVisible: false
    });
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
      this.setState({
        UIUpdated: true,
        termInfoVisible: true
      });
    }
    if ((this.state.sliceViewerVisible !== prevState.sliceViewerVisible) && (this.state.sliceViewerVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Slice Viewer",
        component: "sliceViewer"
      });
      this.setState({
        UIUpdated: true,
        sliceViewerVisible: true
      });
    }
    if ((this.state.canvasVisible !== prevState.canvasVisible) && (this.state.canvasVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "3D Viewer",
        component: "canvas"
      });
      this.setState({
        UIUpdated: true,
        canvasAvailable: true
      });
    }
    if ((this.state.treeBrowserVisible !== prevState.treeBrowserVisible) && (this.state.treeBrowserVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Template ROI Browser",
        component: "treeBrowser"
      });
      this.setState({
        UIUpdated: true,
        treeBrowserVisible: true
      });
    }
    if ((this.state.graphVisible !== prevState.graphVisible) && (this.state.graphVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Term Context",
        component: "vfbGraph"
      });
      this.setState({
        UIUpdated: true,
        graphVisible: true
      });
    }
    if ((this.state.circuitBrowserVisible !== prevState.circuitBrowserVisible) && (this.state.circuitBrowserVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Circuit Browser",
        component: "vfbCircuitBrowser"
      });
      this.setState({
        UIUpdated: true,
        circuitBrowserVisible: true
      });
    }
    if ((this.state.listViewerVisible !== prevState.listViewerVisible) && (this.state.listViewerVisible === true)) {
      this.reopenUIComponent({
        type: "tab",
        name: "Layers",
        component: "vfbListViewer"
      });
      this.setState({
        UIUpdated: true,
        listViewerVisible: true
      });
    }
    if ((prevState.tutorialWidgetVisible !== this.state.tutorialWidgetVisible) && (this.state.tutorialWidgetVisible !== false) && (this.tutorialRender !== undefined)) {
      this.refs.tutorialWidgetRef.refs.tutorialRef.open(true);
    }
    if ((prevState.wireframeVisible !== this.state.wireframeVisible)) {
      this.canvasReference.setWireframe(!this.canvasReference.getWireframe());
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
      case 'listViewerVisible':
        if (this.listViewerReference !== undefined || this.listViewerReference !== null) {
          this.restoreUIComponent("vfbListViewer");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'circuitBrowserVisible':
        if (this.circuitBrowserReference !== undefined && this.circuitBrowserReference !== null) {
          this.restoreUIComponent("vfbCircuitBrowser");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'treeBrowserVisible':
        if (this.treeBrowserReference !== undefined && this.treeBrowserReference !== null) {
          this.restoreUIComponent("treeBrowser");
        }
        this.setState({ UIUpdated: false });
        break;
      case 'graphVisible':
        if (this.graphReference !== undefined && this.graphReference !== null) {
          this.restoreUIComponent("vfbGraph");
        }
        this.setState({ UIUpdated: false, graphVisible : true });
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
    let self = this;
    if (component === "text") {
      return (<div className="">Panel {node.getName()}</div>);
    } else if (component === "canvas") {
      node.setEventListener("close", () => {
        this.setState({
          UIUpdated: false,
          canvasVisible: false,
          canvasAvailable: false
        });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      return (<Canvas
        id="CanvasContainer"
        name={"Canvas"}
        baseZoom="1.2"
        movieFilter={false}
        wireframeEnabled={true}
        minimiseAnimation={true}
        onLoad={this.ThreeDViewerIdLoaded}
        ref={ref => this.canvasReference = ref} />)
    } else if (component === "termInfo") {
      node.setEventListener("close", () => {
        this.props.setTermInfo(this.instanceOnFocus, false);
        this.setState({
          UIUpdated: false,
          termInfoVisible: false
        });
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
          uiUpdated= { () => {
            self.setState({ UIUpdated: true })
          }}
          focusTermRef={this.focusTermReference}
          exclude={["ClassQueriesFrom", "Debug", "DownloadMeta"]}
          order={['Symbol',
                  'Title',
                  'Name',
                  'Label',
                  'Alternative Names',
                  'Types',
                  'Classification',
                  'Parents',
                  'Logo',
                  'Link',
                  'Thumbnail',
                  'Examples',
                  'Available Images',
                  'Targeting Splits',
                  'Targeting Neurons',
                  'Targeted Neurons',
                  'Related Individuals',
                  'Relationships',
                  'Query for',
                  'Graphs For',
                  'Graphs for',
                  'Add Neuron to Circuit Browser Query',
                  'Circuit Browser for',
                  'Description',
                  'Cross References',
                  'Attribution',
                  'Source',
                  'License',
                  'Aligned To',
                  'Download']} /></div>)
    } else if (component === "sliceViewer") {
      node.setEventListener("close", () => {
        this.setState({
          UIUpdated: false,
          sliceViewerVisible: false
        });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height - 3;
      let _width = node.getRect().width - 3;
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
        this.setState({
          UIUpdated: false,
          treeBrowserVisible: false
        });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height - 15;
      let _width = node.getRect().width - 15;
      return (<div className="flexChildContainer" style={{ position : "fixed", height: _height, width: _width }}>
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
        self.setState({
          UIUpdated: true,
          graphVisible: false
        });
        self.props.vfbGraph(ACTIONS.SHOW_GRAPH,null,-1, false, false);
      });
      
      // Event listener fired when graph component is resized
      node.setEventListener("resize", () => {
        self.graphReference.resize();
      });
      
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      return (<div className="flexChildContainer" style={{ position : "fixed", overflow : "scroll", height: _height, width: _width }}>
        <VFBGraph instance={this.instanceOnFocus} ref={ref => this.graphReference = ref}visible={graphVisibility} />
      </div>);
    } else if (component === "vfbListViewer") {
      node.setEventListener("close", () => {
        this.setState({
          UIUpdated: false,
          listViewerVisible: false
        });
      });
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      return (<div className="flexChildContainer" style={{ position : "fixed", overflow : "scroll", height: _height, width: _width }}>
        <VFBListViewer ref={ref => this.listViewerReference = ref} />
      </div>);
    } else if (component === "vfbCircuitBrowser") {
      let circuitBrowserVisibility = node.isVisible();
      node.setEventListener("close", () => {
        self.setState({
          UIUpdated: true,
          circuitBrowserVisible: false
        });
        self.props.vfbCircuitBrowser(ACTIONS.UPDATE_CIRCUIT_QUERY,null,false);
      });
      
      // Event listener fired when circuit browser component is resized
      node.setEventListener("resize", () => {
        self.circuitBrowserReference.resize();
      });
      
      this.UIElementsVisibility[component] = node.isVisible();
      let _height = node.getRect().height;
      let _width = node.getRect().width;
      return (<div className="flexChildContainer" style={{ position : "fixed", overflow : "scroll", height: _height, width: _width }}>
        <VFBCircuitBrowser ref={ref => this.circuitBrowserReference = ref} instance={this.instanceOnFocus} visible={circuitBrowserVisibility} />
      </div>);
    }
  }

  /* React functions */
  shouldComponentUpdate (nextProps, nextState) {
    if (nextState.UIUpdated === false) {
      return false;
    } else {
      return true;
    }    
  }
  
  componentWillReceiveProps (nextProps) {
    /*
     * When a setTermInfo action lands in the store, adopt its instance as the
     * live focus. Two fixes here:
     *  - it compared the Redux instance OBJECT to this.instanceOnFocus.getId()
     *    (a string), which is never equal, so the "only if it changed" guard
     *    never skipped anything;
     *  - this hook runs on EVERY store change, and handlerInstanceUpdate never
     *    writes the store, so the store copy is stale most of the time. Without
     *    the action-type check any unrelated action (loader status, visibility,
     *    ...) re-applied that stale instance over the live focus -- one more
     *    "last writer wins" path in the term-info focus race.
     */
    if ( nextProps.generals.type === ACTIONS.VFB_LOAD_TERM_INFO
      && nextProps.generals.instanceOnFocus !== undefined && this.instanceOnFocus !== undefined) {
      if ( Object.keys(nextProps.generals.instanceOnFocus).length > 0 ) {
        var nextId = (typeof nextProps.generals.instanceOnFocus.getId === "function")
          ? nextProps.generals.instanceOnFocus.getId()
          : undefined;
        if ( nextId !== undefined && nextId !== this.instanceOnFocus.getId() ){
          this.instanceOnFocus = nextProps.generals.instanceOnFocus;
        }
      }
    }
    
    /**
     * If redux action was to set term info visible, we handle it here, other wise 'shouldComponentUpdate' will prevent update
     */
    if ( nextProps.generals.ui.termInfo.termInfoVisible && nextProps.generals.type === ACTIONS.VFB_LOAD_TERM_INFO ) {
      this.setActiveTab("termInfo");
      this.termInfoReference.setTermInfo(this.instanceOnFocus);
    }

    if ( nextProps.generals.ui.layers.listViewerInfoVisible && nextProps.generals.type === ACTIONS.SHOW_LIST_VIEWER ) {
      if (this.listViewerReference === undefined || this.listViewerReference === null) {
        this.setState({
          UIUpdated: true,
          listViewerVisible: true
        });
      }
      this.setActiveTab("vfbListViewer");
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

    if ( this.props.generals.type == ACTIONS.SHOW_GRAPH ) {
      if ( !this.state.graphVisible && this.props.generals.ui.graph.visible ) {
        this.setState({
          UIUpdated: true,
          graphVisible: true
        });
      } else if ( this.state.graphVisible && this.props.generals.ui.graph.visible ) {
        this.setActiveTab("vfbGraph");
      } 
    }
    
    if ( this.props.generals.type == ACTIONS.UPDATE_CIRCUIT_QUERY ) {
      if ( !this.state.circuitBrowserVisible && this.props.generals.ui.circuitBrowser.visible ) {
        this.setState({
          UIUpdated: true,
          circuitBrowserVisible: true
        });
      } else if ( this.state.circuitBrowserVisible && this.props.generals.ui.circuitBrowser.visible ) {
        this.setActiveTab("vfbCircuitBrowser");
      } else if ( !this.props.generals.ui.circuitBrowser.visible && this.state.circuitBrowserVisible ) {
        this.setState({
          UIUpdated: true,
          circuitBrowserVisible: false
        });
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
    if ((this.props.location.search.indexOf("id=") > -1) || (this.props.location.search.indexOf("i=") > -1) || (this.props.location.search.indexOf("q=") > -1)) {
      this.quickHelpOpen = false;
    }
    // Show 'Quick Help' modal if cookie to hide it is not set to True
    if ((this.props.location.search.indexOf("id=") < 0) && (this.props.location.search.indexOf("i=") < 0) && (this.props.location.search.indexOf("q=") < 0)) {
      if (( cookie !== "1") && (this.quickHelpOpen)) {
        this.quickHelpRender = <VFBQuickHelp id="quickHelp" closeQuickHelp={this.closeQuickHelp} />;
      }
    }
    // Set default page metadata
    document.querySelector('meta[name="description"]').setAttribute("content","VFB integrates data curated from the literature with image data from many bulk sources. The search system allows you to search for neurons and neuroanatomical structures using almost any name found in the literature. The query system can identify neurons innervating any specified neuropil or fasciculating with any specified tract. It also allows queries for genes, transgenes and phenotypes expressed in any brain region or neuron. Search and query results combine referenced textual descriptions with 3D images and links to originating data sources. VFB features tens of thousands of 3D images of neurons, clones and expression patterns, registered to standard template brains. Any combination of these images can be viewed together. A BLAST-type query system (NBLAST) allows you to find similar neurons and drivers starting from a registered neuron.");
    document.querySelector('meta[property="og:description"]').setAttribute("content","VFB integrates data curated from the literature with image data from many bulk sources. The search system allows you to search for neurons and neuroanatomical structures using almost any name found in the literature. The query system can identify neurons innervating any specified neuropil or fasciculating with any specified tract. It also allows queries for genes, transgenes and phenotypes expressed in any brain region or neuron. Search and query results combine referenced textual descriptions with 3D images and links to originating data sources. VFB features tens of thousands of 3D images of neurons, clones and expression patterns, registered to standard template brains. Any combination of these images can be viewed together. A BLAST-type query system (NBLAST) allows you to find similar neurons and drivers starting from a registered neuron.");
    document.title = "Virtual Fly Brain, a data integrator for Drosophila neurobiology";
    document.body.style.font = "x-large"
    document.querySelector('meta[property="og:title"]').setAttribute("content",document.title);
    var viewport = !!document.querySelector("meta[name='viewport']");
    viewport = viewport ? document.querySelector("meta[name='viewport']") : document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    document.head.appendChild(viewport);
    var conlink = !!document.querySelector("link[rel='canonical']");
    conlink = conlink ? document.querySelector("link[rel='canonical']") : document.createElement('link');
    conlink.setAttribute('rel', 'canonical');
    conlink.setAttribute('href', 'https://virtualflybrain.org');
    document.head.appendChild(conlink);
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'metaDesc';
    script.innerHTML = '{"@context": "https://schema.org","@type": "Organization","url": "https://virtualflybrain.org","logo": "https://v2.virtualflybrain.org/images/vfbbrain_icon.png","brand":"Virtual Fly Brain","name":"Virtual Fly Brain","legalName":"Virtual Fly Brain",'
      + '"description":"VFB integrates data curated from the literature with image data from many bulk sources. The search system allows you to search for neurons and neuroanatomical structures using almost any name found in the literature. The query system can identify neurons innervating any specified neuropil or fasciculating with any specified tract. It also allows queries for genes, transgenes and phenotypes expressed in any brain region or neuron. Search and query results combine referenced textual descriptions with 3D images and links to originating data sources. VFB features tens of thousands of 3D images of neurons, clones and expression patterns, registered to standard template brains. Any combination of these images can be viewed together. A BLAST-type query system (NBLAST) allows you to find similar neurons and drivers starting from a registered neuron.",'
      + '"headline":"A hub for fruit fly (Drosophila melanogaster) neuronal anatomy, connectivity & imaging data",'
      + '"affiliation":['
      + '{"@type": "Organization","name":"Institute for Adaptive and Neural Computation, School of Informatics, University of Edinburgh","logo":"https://v2.virtualflybrain.org/images/vfb/project/logos/InformaticsLogo.gif","url":"https://web.inf.ed.ac.uk/anc"},'
      + '{"@type": "Organization","name":"Department of Genetics, University of Cambridge","logo":"https://v2.virtualflybrain.org/images/vfb/project/logos/CUnibig.png","url":"http://www.gen.cam.ac.uk/"},'
      + '{"@type": "Organization","name":"Department of Physiology, Development and Neuroscience, University of Cambridge", "url":"https://www.pdn.cam.ac.uk/","logo":"https://www.pdn.cam.ac.uk/images/157071101713274785.png/image_logo"},'
      + '{"@type": "Organization","name":"FlyBase","url":"https://flybase.org","logo":"http://flybase.org/images/fly_logo.png"},'
      + '{"@type": "Organization","name":"MRC Laboratory of Molecular Biology, Cambridge","logo":"https://v2.virtualflybrain.org/images/vfb/project/logos/MRC-LMB_logo.png","url":"http://www2.mrc-lmb.cam.ac.uk/"},'
      + '{"@type": "Organization","name":"European Bioinformatics Institute (EMBL-EBI), Cambridge","logo":"https://v2.virtualflybrain.org/images/vfb/project/logos/EMBL_EBI_logo_180pixels_RGB.png","url":"http://www.ebi.ac.uk/"}'
      + '],"funder":{"@type": "Organization","name":"Wellcome Trust","logo":"https://v2.virtualflybrain.org/images/vfb/project/logos/wtvm050446.png","url":"https://wellcome.org/"},'
      + '"sameAs":["https://en.wikipedia.org/wiki/Virtual_Fly_Brain","https://www.youtube.com/channel/UC1g10aJo13fXpO9VwRJPdHg","https://www.facebook.com/Virtual-Fly-Brain-131151036987118","https://twitter.com/virtualflybrain","https://virtualflybrain.tumblr.com/"],"alternateName":"VFB",'
      + '"subjectOf":['
      + '{"@type": "ScholarlyArticle","citation":"http://dx.doi.org/10.1093/bioinformatics/btr677","sameAs":"http://dx.doi.org/10.1093/bioinformatics/btr677","headline":"The Virtual Fly Brain browser and query interface","name":"The Virtual Fly Brain browser and query interface","datePublished":"2012","author":[{"@type":"person","name":"Milyaev, N."},{"@type":"person","name":"Osumi-Sutherland, D."},{"@type":"person","name":"Reeve, S."},{"@type":"person","name":"Burton, N."},{"@type":"person","name":"Baldock, R. A."},{"@type":"person","name":"Armstrong, J. D."}],"publisher":"Bioinformatics"},'
      + '{"@type": "ScholarlyArticle","citation":"http://dx.doi.org/10.1098/rstb.2017.0380","sameAs":"http://dx.doi.org/10.1098/rstb.2017.0380","headline":"Geppetto: a reusable modular open platform for exploring neuroscience data and models","name":"Geppetto: a reusable modular open platform for exploring neuroscience data and models","author":"Cantarelli, Matteo and Marin, Boris and Quintana, Adrian and Earnshaw, Matt and Court, Robert and Gleeson, Padraig and Dura-Bernal, Salvador and Silver, R. Angus and Idili, Giovanni","publisher": "Philosophical Transactions of the Royal Society B: Biological Sciences","datePublished": "2018"}'
      + ']}';
    document.getElementsByTagName('head')[0].appendChild(script);

    /*
     * The values above describe the site as a whole. When the URL names a term
     * (id=<id>), replace them with that term's own title, description, canonical
     * and summary, fetched over plain HTTPS so it works for crawlers that never
     * open the WebSocket. Also called whenever the focus term changes.
     */
    window.vfbUpdatePageMetadata = updateTermPageMetadata;
    initTermPageMetadata(this.props.location.search);
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidMount () {
    document.addEventListener('mousedown', this.handleClickOutside);

    let self = this;
    GEPPETTO.G.setIdleTimeOut(-1);

    // Global functions linked to VFBMain functions
    window.stackViewerRequest = function (idFromStack) {
      this.stackViewerRequest(idFromStack);
    }.bind(this);

    // Terms still loading, so a URL rebuilt mid-load keeps them in i=.
    window.vfbPendingIds = function () {
      return this.loadManager ? this.loadManager.pendingIds() : [];
    }.bind(this);

    window.addVfbId = function (idFromOutside) {
      this.addVfbId(idFromOutside);
    }.bind(this);

    /*
     * Load a query-result image reference. Aligned images are referenced as
     * "<template>,<image>" (or "[<template>,<image>]"), and the same image id is
     * used for every template it is aligned to -- the prefix is the only thing
     * that says which alignment was clicked. This used to go straight to
     * addVfbId, which loaded BOTH ids: picking, say, a VNC alignment while the
     * brain template was open pulled a second template and the other
     * alignment's geometry into the scene. Offer the other template in a new
     * tab instead, exactly as the term info panel does for the same reference.
     */
    window.vfbLoadImageRef = function (reference) {
      var parts = String(reference).replace(/[[\]]/g, '').split(',');
      var imageId = parts[parts.length - 1].trim();
      var templateId = parts.length > 1 ? parts[0].trim() : undefined;
      if (templateId !== undefined && VFB_TEMPLATES.indexOf(templateId) > -1 && templateId !== window.templateID) {
        safeGa('vfb.send', 'event', 'request', 'newtemplate', templateId);
        if (confirm("The image you requested is aligned to another template. \nClick OK to open in a new tab or Cancel to stay here.")) {
          var curHost = window.EMBEDDED ? parent.document.location.host : document.location.host;
          var curProto = window.EMBEDDED ? parent.document.location.protocol : document.location.protocol;
          safeGa('vfb.send', 'event', 'opening', 'newtemplate', templateId);
          window.open(window.redirectURL.replace(/\$VFB_ID\$/gi, imageId).replace(/\$TEMPLATE\$/gi, templateId)
            .replace(/\$HOST\$/gi, curHost).replace(/\$PROTOCOL\$/gi, curProto), '_blank');
        } else {
          safeGa('vfb.send', 'event', 'cancelled', 'newtemplate', templateId);
        }
        return;
      }
      this.addVfbId(imageId);
    }.bind(this);

    // Delete what vfbLoadImageRef loaded: the image, never the template prefix.
    window.vfbDeleteImageRef = function (reference) {
      var parts = String(reference).replace(/[[\]]/g, '').split(',');
      var imageId = parts[parts.length - 1].trim();
      var instance;
      try {
        instance = Instances.getInstance(imageId);
      } catch (e) {
        instance = undefined;
      }
      if (instance !== undefined && typeof instance.delete === "function") {
        instance.delete();
      }
    };

    window.setTermInfo = function (meta, id) {
      this.handlerInstanceUpdate(meta);
      this.props.setTermInfo(meta, true);
    }.bind(this);

    /*
     * Fetch the VFBquery "Query For" set (get_term_info.Queries) for a term so
     * the query builder / focus term can offer the same queries the term-info
     * panel shows. preview=false keeps it light and uses the cached term_info.
     * Memoised; resolves to a {queryType: true} map, or null on failure (callers
     * then keep the full getMatchingQueries list, so no regression).
     */
    window._vfbQueryTypesCache = window._vfbQueryTypesCache || {};
    window.getVFBQueryTypes = function (id) {
      if (window._vfbQueryTypesCache[id] !== undefined) {
        return Promise.resolve(window._vfbQueryTypesCache[id]);
      }
      /*
       * Retried like the other v3-cached calls: a single blip here left the
       * term with no query list at all, which reads as "this term has no
       * queries" rather than as a failure.
       */
      var retryFetch = require('@geppettoengine/geppetto-client/common/RetryFetch').fetchWithRetry;
      return retryFetch("https://v3-cached.virtualflybrain.org/get_term_info?id=" + encodeURIComponent(id) + "&preview=false")
        .then(function (result) {
          return result.response.ok ? result.response.json() : null;
        })
        .catch(function () {
          return null;
        })
        .then(function (d) {
          var set = null;
          if (d && Array.isArray(d.Queries)) {
            set = {};
            d.Queries.forEach(function (q) {
              if (q && q.query) {
                /*
                 * Cache each query's real target id (takes.default.short_form --
                 * the parent CLASS for painted domains, else the term itself) and
                 * its preview count (-1 = unknown). The count is refreshed from
                 * the actual results after a run (window.vfbUpdateQueryCount), so
                 * a subsequent open reuses it instead of running another count.
                 * Stored as an object; still truthy for the geppetto-client
                 * query-sourcing membership test.
                 */
                var target = (q.takes && q.takes.default && q.takes.default.short_form) ? q.takes.default.short_form : id;
                var count = (typeof q.count === "number") ? q.count : -1;
                set[q.query] = { target: target, count: count };
              }
            });
          }
          window._vfbQueryTypesCache[id] = set;
          return set;
        })
        .catch(function () {
          window._vfbQueryTypesCache[id] = null;
          return null;
        });
    };

    /*
     * Warm the term's get_term_info.Queries set (memoised) and then run cb,
     * whatever the outcome. Queries can be invoked before the term/model has
     * loaded (e.g. a ?q= deep link), so this must never block or throw: if the
     * set can't be fetched the builder just falls back to type-matched queries.
     * Guarantees cb runs exactly once.
     */
    window.withVFBQueryTypes = function (id, cb) {
      var ran = false;
      var run = function () {
        if (!ran) {
          ran = true;
          cb();
        }
      };
      try {
        var p = (id && window.getVFBQueryTypes) ? window.getVFBQueryTypes(id) : null;
        if (p && typeof p.then === "function") {
          p.then(run, run);
          return;
        }
      } catch (e) { /* fall through to run */ }
      run();
    };

    /*
     * Resolve the real id a query should run against. Painted-domain (and some
     * individual) "Query For" entries are parameterised against a parent CLASS,
     * not the focus term -- get_term_info gives the true target in each query's
     * takes.default.short_form, cached as the value in _vfbQueryTypesCache.
     * Running against the focus individual returns 0 rows; the class has the
     * data. Falls back to the focus id when the target is unknown.
     */
    window.vfbQueryTargetId = function (focusId, queryType) {
      var s = (window._vfbQueryTypesCache) ? window._vfbQueryTypesCache[focusId] : null;
      var e = (s && queryType) ? s[queryType] : null;
      var t = (e && typeof e === "object") ? e.target : e;
      return (typeof t === "string" && t) ? t : focusId;
    };

    /*
     * Preview count for a term's query (get_term_info.Queries[].count), cached
     * per query. -1 = unknown. Lets the auto-run path skip the count step when
     * the preview already knows the number.
     */
    window.vfbQueryPreviewCount = function (focusId, queryType) {
      var s = (window._vfbQueryTypesCache) ? window._vfbQueryTypesCache[focusId] : null;
      var e = (s && queryType) ? s[queryType] : null;
      return (e && typeof e === "object" && typeof e.count === "number") ? e.count : -1;
    };

    /*
     * Write a query's real result count back into the cached term-info metadata
     * after a run. Keyed by the query's target id, so every cached term whose
     * "Query For" entry runs against that target (the class itself and any
     * painted-domain individual of it) picks up the fresh count.
     */
    window.vfbUpdateQueryCount = function (targetId, queryType, count) {
      try {
        var cache = window._vfbQueryTypesCache;
        if (!cache || typeof count !== "number" || !queryType) {
          return;
        }
        Object.keys(cache).forEach(function (fid) {
          var s = cache[fid];
          var e = s ? s[queryType] : null;
          if (e && typeof e === "object" && (e.target === targetId || fid === targetId)) {
            e.count = count;
          }
        });
      } catch (err) { /* best-effort metadata refresh */ }
    };

    /*
     * Warm the focus term's query set, resolve the real target id for queryType,
     * load + warm that target, then invoke done(targetId). Never blocks/throws,
     * so a query fired before anything has loaded still proceeds (against the
     * focus id as a fallback).
     */
    window.vfbResolveAndPrepQuery = function (model, focusId, queryType, done) {
      /*
       * Signal "running" immediately so the footer reads "Counting..." for the
       * whole resolve/fetch/count phase instead of a misleading "0 results".
       * getCount keeps it true; setCount clears it when the count returns, and
       * the completion callback clears it on any terminal (no-query) path.
       */
      try {
        if (model) {
          model.counting = true;
          model.notifyChange();
        }
      } catch (e) { /* non-fatal */ }
      window.withVFBQueryTypes(focusId, function () {
        var targetId = window.vfbQueryTargetId(focusId, queryType);
        var previewCount = window.vfbQueryPreviewCount(focusId, queryType);
        var proceed = function () {
          window.withVFBQueryTypes(targetId, function () {
            done(targetId, previewCount);
          });
        };
        /*
         * Fetch the target unless it is already a loaded top-level variable.
         * NB: `window[id]` is unreliable -- a DOM element with that id (e.g. the
         * class node in the ROI tree) makes it truthy even though the geppetto
         * variable isn't loaded, which would make addQueryItem throw. Check the
         * model factory instead.
         */
        var targetLoaded = false;
        try {
          targetLoaded = !!(GEPPETTO.ModelFactory.getTopLevelVariablesById([targetId])[0]);
        } catch (e) {
          targetLoaded = false;
        }
        if (!targetLoaded) {
          window.fetchVariableThenRun(targetId, proceed);
        } else {
          proceed();
        }
      });
    };

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

    // Loading ids passed through the browser's url
    var idsList = "";
    var idList = this.props.location.search;
    idList = idList.replace("?","").replace(/:/g, '_').split("&");
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
        const multipleQueries = idList[list].replace("q=","").replace("%20", " ").split(";");
        let that = this;
        multipleQueries?.forEach( query => {
          const querySplit = query.split(",");
          that.urlQueryLoader.push({ id : querySplit[0].trim(), selection : querySplit[1].trim() });
          if (querySplit[1].trim() == "SimilarMorphologyToUserData") {
            // if a user data query is called and the VFBu_ id is not loaded after timeout then it must still be being analysed
            let url = window.location.origin + window.location.pathname + "?id=" + querySplit[0].trim() + "&q=" + query;
            // Use an IIFE (Immediately Invoked Function Expression) to create a closure and capture the variables
            (function (querySplit, url) {
              setTimeout(function () {
                if (window[querySplit[0].trim()] == undefined) {
                  if (confirm("The image you uploaded is still being analysed; this can take over an hour. \nClick OK to check again or Cancel to just open VFB.")) {
                    safeGa('vfb.send', 'event', 'opening', 'uploadQuery', querySplit[0].trim());
                    window.open(url, "_self");
                  }
                }
              }, 10000);
            })(querySplit, url);
          }
        });
        // if no other ids are loaded the query target is added.
        if (idsList.length == 0 && this.urlQueryLoader.length > 1) {
          idsList = this.urlQueryLoader[0].id;
        }
      }
    }

    if ((idsList.length > 0) && (this.state.modelLoaded == true) && (this.urlIdsLoaded == false)) {
      this.urlIdsLoaded = true;
      if (!idsList.includes("VFB_") && !idsList.includes("VFBu_")) {
        idsList = "VFB_00101567," + idsList;
      }
      this.idsFromURL = idsList.split(",");
      // remove duplicates
      var counter = this.idsFromURL.length;
      if (this.idFromURL === undefined) {
        this.idFromURL = this.idsFromURL[0];
      }
      while (counter--) {
        if (this.idsFromURL[counter] === this.idFromURL) {
          this.idsFromURL.splice(counter, 1);
        }
      }
      this.idsFromURL.push(this.idFromURL);
      this.idsFromURL = [... new Set(this.idsFromURL)];
      this.idsFinalList = this.idsFromURL;
      /*
       * Claim the scene's template now -- the first template id the URL lists --
       * rather than when its term happens to resolve. Terms load several at a
       * time, so an image often resolves before its template; without this it
       * was checked against no template (or built its geometry for whichever
       * template its term info listed first) and could be wrongly flagged as
       * "aligned to another template".
       */
      if (window.templateID === undefined) {
        var urlTemplate = this.idsFromURL.find(function (id) {
          return VFB_TEMPLATES.indexOf(id) > -1;
        });
        if (urlTemplate !== undefined) {
          window.templateID = urlTemplate;
        }
      }
      // The id= term is the intended focus on a URL load; others load silently.
      this.lastRequestedFocusId = this.idFromURL;
      console.log("Loading IDS to add to the scene from url");
    } else {
      this.urlIdsLoaded = true;
      this.idsFinalList = ["VFB_00101567"];
    }

    var that = this;

    GEPPETTO.on(GEPPETTO.Events.Instance_added, function (instance) {
      that.props.instanceAdded(instance);
    });

    GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
      // Set template Instance to be not clickable in 3D viewer
      if ( instances[0]?.id?.includes(window.templateID) ) {
        that.canvasReference.engine.meshes ? that.canvasReference.engine.meshes[window.templateID + "." + instances[0]?.id].children[0].clickThrough = true : null;
      }
    });

    GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (instancePath) {
      let id = instancePath.split(".")[0];
      that.props.instanceDeleted(ACTIONS.INSTANCE_DELETED, id);
    });

    GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
      /*
       * Startup responsiveness, measured from the navigation itself so it is
       * what the user waited for: the model arriving, and (in
       * handlerInstanceUpdate) the first term actually on screen.
       */
      try {
        if (typeof window.vfbGaDetail === "function") {
          window.vfbGaDetail('startup-model', window.vfbSecondsBucket(Math.round(performance.now())));
        }
      } catch (eStartup) {
        /* reporting must never delay loading */
      }
      that.addVfbId(that.idsFinalList);

      var callback = function () {
        // Response is in: cancel the pending slow-query notice.
        if (that._vfbQueryNoticeTimer) {
          clearTimeout(that._vfbQueryNoticeTimer);
          that._vfbQueryNoticeTimer = null;
        }
        /*
         * Query settled: clear the "Counting..." flag (covers no-query paths
         * where setCount never runs).
         */
        if (that.refs.querybuilderRef.props.model) {
          that.refs.querybuilderRef.props.model.counting = false;
        }
        var qbModel = that.refs.querybuilderRef.props.model;
        /*
         * Deep-link (?q=) path keeps the counted flow: a compound query needs
         * the count to combine its parts and to show the count in the builder
         * (the skipCount/run-once optimisation is used on the interactive click
         * paths, not here). Still resolves the query's real target via
         * vfbResolveAndPrepQuery.
         */
        if (that.urlQueryLoader.length == 0 && qbModel.count > 0) {
          // Single / last query with results -- run it.
          that.refs.querybuilderRef.runQuery();
        } else if (that.urlQueryLoader.length > 0 && qbModel.count > 0) {
          // Compound: drop the current query and combine the next (counted).
          that.urlQueryLoader.shift();
          const query = that.urlQueryLoader[0];
          query
            ? window.vfbResolveAndPrepQuery(qbModel, query.id, query.selection, function (targetId) {
              that.refs.querybuilderRef.addQueryItem({ term: "", id: targetId, queryObj: Model[query.selection] }, callback);
            })
            : qbModel.count > 0
              ? that.refs.querybuilderRef.runQuery()
              : null;
        } else {
          /*
           * No results (count 0) -- say so instead of leaving a bare "0 results"
           * that reads like an in-flight query.
           */
          that.refs.querybuilderRef.setErrorMessage("No results for this query.", "info");
          that.refs.querybuilderRef.switchView(false);
        }
        // show query component
        that.refs.querybuilderRef.open();
        $("body").css("cursor", "default");
      };

      // Initial queries specified on URL
      if (that.urlQueryLoader !== undefined && that.urlQueryLoader[0]?.id) {
        /*
         * Arm a React-owned slow-query reassurance. The fly logo is driven
         * solely by generals.loading (VFBLoadManager) via VFBLoader; query paths
         * no longer trigger it directly. The footer covers query progress.
         */
        that.refs.querybuilderRef?.clearErrorMessage?.();
        if (that._vfbQueryNoticeTimer) {
          clearTimeout(that._vfbQueryNoticeTimer);
        }
        that._vfbQueryNoticeTimer = setTimeout(function () {
          that.refs.querybuilderRef?.setErrorMessage?.("Fetching results — this can take a moment for complex queries.", "info");
        }, 10000);
        window.vfbResolveAndPrepQuery(that.refs.querybuilderRef.props.model, that.urlQueryLoader[0].id, that.urlQueryLoader[0].selection, function (targetId) {
          that.refs.querybuilderRef.addQueryItem({ term: "", id: targetId, queryObj: Model[that.urlQueryLoader[0]?.selection] }, callback);
        });
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

    /*
     * google analytics vfb specific tracker
     * Bare (not window.) call, and the very first GA touchpoint in this
     * component -- if the GA loader script hasn't executed yet (or never
     * will), this used to throw a ReferenceError straight out of
     * componentDidMount, aborting everything after it: the console.log /
     * console.error overrides below, and the websocket disconnect/
     * reconnect listener further down this same method.
     */
    safeGa('create', 'G-K7DDZVVXM7', 'auto', 'vfb');
    window.console.stdlog = console.log.bind(console);
    window.console.stderr = console.error.bind(console);
    window.console.logs = [];
    console.log = function () {
      if (Array.from(arguments).join("\n").indexOf('Pixi.js') < 0 && Array.from(arguments).join("\n") != 'unmount') {
        // window.ga('vfb.send', 'event', 'log', Array.from(arguments).join("\n"));
        window.console.logs.push('+ ' + Array.from(arguments).join('\n'));
        window.console.stdlog.apply(console, arguments);
      }
    }
    console.error = function () {
      if (Array.from(arguments).join("\n").indexOf('www.pixijs.com') < 0 && Array.from(arguments).join("\n").indexOf("Warning: Failed prop type: There should be an equal number of 'Tab' and 'TabPanel' in `UncontrolledTabs`. Received 2 'Tab' and 0 'TabPanel'.") < 0 ) {
        safeGa('vfb.send', 'event', 'errorlog', Array.from(arguments).join("\n"));
        window.console.logs.push('- ' + Array.from(arguments).join('\n'));
        window.console.stderr.apply(console, arguments);
      }
    }

    /*
     * The application is unusable without its WebSocket connection. This is
     * the last-resort hand fallback: the client recovers from the causes it
     * can identify on its own (a browser that mishandles permessage-deflate
     * reconnects uncompressed), so anything reaching here is a failure we
     * cannot work around - a browser without WebSocket support, a blocked or
     * unstable connection, or a fault we have not identified. Keep the
     * wording general: it must read sensibly for any of those, so it names no
     * particular browser or setting. Report to Google Analytics at maximum
     * severity rather than reloading in a loop.
     */
    var websocketFailureReported = false;
    var reportWebsocketFailure = function (context) {
      if (websocketFailureReported) {
        return;
      }
      websocketFailureReported = true;
      var details = [
        'context:' + context,
        'userAgent:' + navigator.userAgent,
        'platform:' + (navigator.platform || 'unknown'),
        'vendor:' + (navigator.vendor || 'unknown'),
        'socketStatus:' + GEPPETTO.MessageSocket.socketStatus,
        'attempts:' + GEPPETTO.MessageSocket.attempts,
        'page:' + (window.location.pathname + window.location.search)
      ].join(' | ');
      // Routed to GA as an errorlog event by the console.error override above
      console.error('WebSocket connection failed: ' + details);
      if (typeof gtag === 'function') {
        // GA4 exception hit with fatal set - the highest severity GA offers
        gtag('event', 'exception', {
          description: 'websocket-connection-failed | ' + details,
          fatal: true
        });
      }
      safeGa('vfb.send', 'event', 'websocket-connection-failed', 'websocket-error', details);
      gaDetail('ws-connfail', context, GEPPETTO.MessageSocket.socketStatus, 'a' + GEPPETTO.MessageSocket.attempts);
      GEPPETTO.ModalFactory.infoDialog('Unable to load data from the Virtual Fly Brain server',
        'Virtual Fly Brain needs a WebSocket connection to load its data, and that connection could not be established '
        + 'or was interrupted. This is usually a browser or network problem rather than a fault with the service.'
        + '<br/><br/>Please try reloading the page. If the problem persists, try a different browser such as Chrome, '
        + 'Firefox or Edge, or a different network - some corporate firewalls and proxies block WebSocket connections.'
        + '<br/><br/>This failure has been reported automatically to help us investigate.');
    };
    window.vfbReportWebsocketFailure = reportWebsocketFailure;
    setTimeout(function () {
      if (GEPPETTO.MessageSocket.socketStatus !== GEPPETTO.Resources.SocketStatus.OPEN && GEPPETTO.MessageSocket.getClientID() == null) {
        reportWebsocketFailure('startup-timeout');
      }
    }, 30000);

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
      if (this.sliceViewerReference !== undefined && this.sliceViewerReference !== null) {
        this.sliceViewerReference.updateStackWidget();
      }

      self.props.instanceSelected(instance);
    }.bind(this));

    GEPPETTO.on(GEPPETTO.Events.Visibility_changed, function (instance) {
      self.props.instanceVisibilityChanged(instance);
    }.bind(this));

    /*
     * Connection lifecycle. The client (geppetto-client MessageSocket) now
     * recovers a dropped socket on its own: retries with backoff for minutes,
     * resumes the old server session where it can, and re-establishes one in
     * place where it cannot - all without touching the scene this page holds.
     * VFB's job here is to tell the user what is going on and to record it.
     *
     * GA event names are kept from the reload-based version so the
     * websocket-disconnect baseline stays comparable; reconnect-failed-reloading
     * is now only sent from the genuine last resort below.
     */
    var gaPage = function () {
      return window.location.pathname + window.location.search;
    };
    /*
     * GA4 only reports event parameters that have been registered as custom
     * dimensions, and none are, so everything passed as the label (reason,
     * close code, attempt count) is invisible in the Data API and the
     * reports. Put the facts that decide what a failure WAS into the event
     * name itself, as a second event alongside the baseline one so the
     * existing counts stay comparable. GA4 caps event names at 40 characters.
     */
    var gaDetail = function () {
      var name = Array.prototype.slice.call(arguments).map(function (part) {
        return String(part === undefined || part === null || part === '' ? 'na' : part)
          .toLowerCase().replace(/[^a-z0-9._-]+/g, '_');
      }).join(':').substring(0, 40);
      safeGa('vfb.send', 'event', name, 'websocket-detail', gaPage());
    };
    /*
     * Shared so the rest of the app (and code outside this component) reports
     * in the same shape: name:parts joined with ':', page as the label.
     */
    window.vfbGaDetail = gaDetail;
    /*
     * The extra diagnostics RetryFetch/Direct* attach to a failure (tab
     * visibility, online status, whether a Page Lifecycle freeze happened
     * mid-call, connection type) don't fit alongside kind/reason/call/attempts
     * in the 40-character geomfail/tifail/queryfail name, so they go out as a
     * second, short event next to it. Same event across a session's failures
     * is enough to see whether fails cluster on hidden tabs, offline blips,
     * a freeze, or a slow connection -- it does not need to join back to the
     * specific geomfail row to answer that.
     */
    var diagBits = function (info) {
      return [
        info.visibility === undefined ? 'na' : (info.visibility === 'visible' ? 'v1' : 'v0'),
        info.online === undefined ? 'na' : (info.online ? 'o1' : 'o0'),
        'f' + (info.frozeDuringCall ? '1' : '0')
      ];
    };
    /*
     * How far an OBJ body got before it died, against what the server said
     * it would be: 0/25/50/75/100 buckets, 'pna' when either figure is
     * missing (not every failure is a mid-stream body read).
     */
    var progressBucket = function (info) {
      if (typeof info.bytesReceived !== 'number' || typeof info.contentLength !== 'number' || !info.contentLength) {
        return 'pna';
      }
      var pct = Math.min(100, Math.round((info.bytesReceived / info.contentLength) * 100));
      var bucket = pct >= 100 ? 100 : (pct >= 75 ? 75 : (pct >= 50 ? 50 : (pct >= 25 ? 25 : 0)));
      return 'p' + bucket;
    };
    /*
     * Seconds, coarse enough to be readable as an event name but fine enough
     * to show a regression: tenths under 10s, whole seconds to a minute, then
     * 10s buckets.
     */
    var secondsBucket = function (ms) {
      var s = (ms || 0) / 1000;
      if (s < 10) {
        return (Math.round(s * 10) / 10) + 's';
      }
      if (s < 60) {
        return Math.round(s) + 's';
      }
      return (Math.floor(s / 10) * 10) + 's';
    };
    window.vfbSecondsBucket = secondsBucket;
    var sizeBucket = function (n) {
      var v = n || 0;
      if (v === 0) {
        return '0';
      }
      if (v < 10) {
        return '1-9';
      }
      if (v < 100) {
        return '10-99';
      }
      if (v < 1000) {
        return '100-999';
      }
      if (v < 10000) {
        return '1k-10k';
      }
      return '10k+';
    };
    /*
     * Time every query the user runs, whichever path serves it (client-direct
     * or the server), with how long it took and how much came back. The
     * direct-query counts say which path ran; this says what the user waited
     * for and whether anything arrived.
     */
    try {
      var qc = GEPPETTO.QueriesController;
      if (qc !== undefined && typeof qc.runQuery === "function" && !qc.vfbTimed) {
        var innerRunQuery = qc.runQuery.bind(qc);
        qc.runQuery = function (queryDTOs, callback, offset, limit) {
          var startedAt = Date.now();
          var queryName = 'na';
          try {
            queryName = (queryDTOs && queryDTOs[0] && queryDTOs[0].query && queryDTOs[0].query.getId)
              ? queryDTOs[0].query.getId() : 'na';
          } catch (eName) { /* name is best effort */ }
          var compound = (queryDTOs && queryDTOs.length > 1) ? 'compound' : 'single';
          var reported = false;
          var timedCallback = function (results) {
            if (!reported) {
              reported = true;
              var rows = 0;
              try {
                var parsed = (typeof results === "string") ? JSON.parse(results) : results;
                rows = (parsed && parsed.results) ? parsed.results.length : 0;
              } catch (eRows) { /* count is best effort */ }
              gaDetail('query-run', compound, queryName, secondsBucket(Date.now() - startedAt));
              gaDetail('query-rows', compound, queryName, sizeBucket(rows));
            }
            return callback.apply(this, arguments);
          };
          /*
           * A query that never calls back (the server erroring mid-run, a
           * dropped request) is exactly what needs reporting, so time it out.
           */
          setTimeout(function () {
            if (!reported) {
              reported = true;
              gaDetail('query-noresult', compound, queryName, secondsBucket(Date.now() - startedAt));
            }
          }, 120000);
          return innerRunQuery(queryDTOs, timedCallback, offset, limit);
        };
        qc.vfbTimed = true;
      }
    } catch (eQueryTiming) {
      console.error('Could not instrument query timing', eQueryTiming);
    }
    var droppedNoticeShown = false;
    /*
     * Background retry after the client's reconnection budget is spent. Slow
     * (once a minute) so a dead backend is not hammered, immediate on the
     * signals that make success likely (network back, tab foregrounded).
     */
    var AUTO_RETRY_MS = 60 * 1000;
    var autoRetryTimer = null;
    var autoRetryOnSignal = null;
    var stopAutoRetry = function () {
      if (autoRetryTimer) {
        clearInterval(autoRetryTimer);
        autoRetryTimer = null;
      }
      if (autoRetryOnSignal) {
        window.removeEventListener('online', autoRetryOnSignal);
        document.removeEventListener('visibilitychange', autoRetryOnSignal);
        autoRetryOnSignal = null;
      }
    };
    var startAutoRetry = function (retry) {
      stopAutoRetry();
      var attempt = function () {
        if (GEPPETTO.MessageSocket.socketStatus !== GEPPETTO.Resources.SocketStatus.CLOSE) {
          return; // a retry is already under way
        }
        if (typeof navigator.onLine === 'boolean' && !navigator.onLine) {
          return; // pointless while the browser knows it is offline
        }
        if (document.hidden) {
          return; // an abandoned background tab retries when it is next looked at
        }
        retry('auto');
      };
      autoRetryTimer = setInterval(attempt, AUTO_RETRY_MS);
      autoRetryOnSignal = function () {
        if (!document.hidden) {
          attempt();
        }
      };
      window.addEventListener('online', autoRetryOnSignal);
      document.addEventListener('visibilitychange', autoRetryOnSignal);
    };
    // A blip that reconnects on the first try should not flash a notice at all
    var NOTICE_GRACE_MS = 2000;
    var noticeGraceTimer = null;
    var clearNoticeGrace = function () {
      if (noticeGraceTimer) {
        clearTimeout(noticeGraceTimer);
        noticeGraceTimer = null;
      }
    };
    var reconnectingMessage = function (elapsedMs) {
      var waited = Math.round(elapsedMs / 1000);
      return waited < 10 ? 'Connection to the VFB server dropped. Reconnecting…'
        : 'Still trying to reach the VFB server (' + waited + 's). Your view is kept.';
    };
    /*
     * Downtime as a bucket rather than a raw number: GA event labels are
     * strings, and buckets are what the reports need to answer "did the user
     * notice", without a custom metric.
     */
    var downtimeBucket = function (ms) {
      if (ms < 2000) {
        return '0-2s';
      } else if (ms < 10000) {
        return '2-10s';
      } else if (ms < 30000) {
        return '10-30s';
      } else if (ms < 60000) {
        return '30-60s';
      }
      return '60s+';
    };
    /*
     * Anything thrown in here would otherwise escape into the client's
     * recovery sequence. The client guards its own triggers too; this makes
     * sure the failure is attributed to VFB's listener and reaches GA
     * (console.error is routed to an errorlog event above).
     */
    var onConnectionEvent = function (event, handler) {
      GEPPETTO.on(event, function (info) {
        try {
          handler(info || {});
        } catch (err) {
          console.error('VFB connection listener failed for ' + event + ': '
            + (err && err.stack ? err.stack : err));
        }
      });
    };

    onConnectionEvent(GEPPETTO.Events.Websocket_reconnecting, function (info) {
      if (!droppedNoticeShown) {
        safeGa('vfb.send', 'event', 'disconnected', 'websocket-disconnect', gaPage());
        droppedNoticeShown = true;
      }
      safeGa('vfb.send', 'event', 'reconnect-attempt:' + info.attempt, 'websocket-disconnect', gaPage());
      if (info.elapsedMs >= NOTICE_GRACE_MS) {
        clearNoticeGrace();
        showConnectionNotice(reconnectingMessage(info.elapsedMs), { level: 'warn' });
      } else if (!noticeGraceTimer) {
        noticeGraceTimer = setTimeout(function () {
          noticeGraceTimer = null;
          if (GEPPETTO.MessageSocket.socketStatus === GEPPETTO.Resources.SocketStatus.RECONNECTING) {
            showConnectionNotice(reconnectingMessage(NOTICE_GRACE_MS), { level: 'warn' });
          }
        }, NOTICE_GRACE_MS);
      }
    });

    onConnectionEvent(GEPPETTO.Events.Websocket_session_lost, function () {
      clearNoticeGrace();
      safeGa('vfb.send', 'event', 'reconnect-session-lost', 'websocket-disconnect', gaPage());
      /*
       * The server could not resume our session (another container, or the
       * retained manager was evicted), so the client would now re-establish
       * a FRESH project on this socket while keeping its own model. That
       * cannot be made consistent: Geppetto references types positionally
       * (//@libraries.N/@types.K) and a fresh server has none of the types
       * this client added, so every later fetch_variable resolves K against
       * the wrong list - Term Info shows JRC2018U, then GNG, VES, PED, FB
       * for clicks on medulla, SLP, wedge... (seen 16 Sep, Connection109) -
       * and the server rejects run_query / resolve_import_type for anything
       * loaded earlier ("is neither an instance variable nor a library id").
       * A reload from the URL (which keeps every id in the scene) is the one
       * recovery that is correct. Counted as reconnect-failed-reloading so
       * the reload rate stays comparable with the earlier baseline.
       */
      var detail = 'session-lost | ' + gaPage();
      safeGa('vfb.send', 'event', 'reconnect-failed-reloading', 'websocket-disconnect', detail);
      gaDetail('ws-reload', 'session-lost');
      console.log('%c Websocket session lost on the server, reloading from the URL ', 'background: #444; color: #bada55');
      showConnectionNotice('Reconnected, reloading your view…', { level: 'warn' });
      window.location.reload();
    });

    onConnectionEvent(GEPPETTO.Events.Websocket_reconnected, function (info) {
      var wasNoticed = droppedNoticeShown && !noticeGraceTimer;
      clearNoticeGrace();
      stopAutoRetry();
      droppedNoticeShown = false;
      safeGa('vfb.send', 'event', info.resumed ? 'reconnected-resumed' : 'reconnected-reestablished', 'websocket-disconnect', gaPage());
      /*
       * How long the user was without a session, and what it cost to get it
       * back. Without these a recovery that took two minutes and replayed
       * nothing looks the same in GA as one that took a second.
       */
      gaDetail('ws-back', info.resumed ? 'resumed' : 'reest', downtimeBucket(info.downtimeMs || 0),
        'a' + (info.attempts || 0), 'r' + (info.replayed || 0));
      safeGa('vfb.send', 'event', 'reconnect-downtime:' + downtimeBucket(info.downtimeMs || 0),
        'websocket-disconnect', (info.resumed ? 'resumed' : 'reestablished')
          + ' | attempts:' + (info.attempts || 0)
          + ' | replayed:' + (info.replayed || 0)
          + ' | ms:' + (info.downtimeMs || 0));
      console.log('%c VFB reconnected (' + (info.resumed ? 'resumed' : 're-established') + ') after '
        + (info.downtimeMs || 0) + 'ms, ' + (info.attempts || 0) + ' attempt(s), replayed '
        + (info.replayed || 0) + ' command(s) ', 'background: #444; color: #bada55');
      if (wasNoticed || !info.resumed) {
        showConnectionNotice('Reconnected.', { level: 'ok', autoHideMs: 3000 });
      } else {
        hideConnectionNotice();
      }
    });

    onConnectionEvent(GEPPETTO.Events.Websocket_disconnected, function (info) {
      var reason = (info && info.reason) || 'unknown';
      clearNoticeGrace();
      droppedNoticeShown = false;
      if (GEPPETTO.MessageSocket.protocol == 'wss://' && location.protocol !== 'https:') {
        console.log("%c Unsecure connection used reloading with HTTPS connection... ", 'background: #444; color: #bada55');
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
        return;
      }
      if (GEPPETTO.MessageSocket.getClientID() == null) {
        /*
         * The socket never completed a handshake in this session, so a
         * reload would fail the same way and loop forever. Warn the user
         * and report instead.
         */
        reportWebsocketFailure('reconnect-exhausted');
        return;
      }
      if (reason === 'resync-failed' || reason === 'resync-impossible') {
        /*
         * We got a socket back but could not re-establish the session on
         * it. A reload starts clean from the URL; this is the one path
         * that still reloads, and it is the Phase 1 success metric.
         */
        var detail = reason + ' | ' + (info.detail || 'no detail') + ' | ' + gaPage();
        safeGa('vfb.send', 'event', 'reconnect-failed-reloading', 'websocket-disconnect', detail);
        gaDetail('ws-reload', reason, (info.detail || '').split(' ').slice(0, 3).join('_'));
        /*
         * Also as an error, so the reason travels with the browser and page
         * context rather than only as a label, and shows up in the same place
         * as every other client failure.
         */
        console.error('Websocket session could not be re-established, reloading: ' + detail);
        window.location.reload();
        return;
      }
      /*
       * Budget exhausted: the server has been unreachable for minutes. Keep
       * the page - the user may just be offline - and let them choose.
       */
      var exhaustedDetail = 'attempts:' + (info.attempts || GEPPETTO.MessageSocket.attempts)
        + ' | ms:' + (info.elapsedMs || 0)
        + ' | closeCode:' + (info.closeCode || 'unknown')
        + ' | online:' + (typeof navigator.onLine === 'boolean' ? navigator.onLine : 'unknown')
        + ' | ' + gaPage();
      safeGa('vfb.send', 'event', 'reconnect-exhausted', 'websocket-disconnect', exhaustedDetail);
      gaDetail('ws-exhausted', reason, 'c' + (info.closeCode || 'na'),
        'a' + (info.attempts || GEPPETTO.MessageSocket.attempts),
        (typeof navigator.onLine === 'boolean' ? (navigator.onLine ? 'online' : 'offline') : 'na'));
      console.error('Websocket reconnection gave up: ' + exhaustedDetail);
      var retryNow = function (how) {
        safeGa('vfb.send', 'event', how === 'user' ? 'reconnect-retry-clicked' : 'reconnect-retry-auto', 'websocket-disconnect', gaPage());
        stopAutoRetry();
        hideConnectionNotice();
        GEPPETTO.MessageSocket.attempts = 0;
        GEPPETTO.MessageSocket.reconnect();
      };
      showConnectionNotice('Could not reach the VFB server. Your view is kept and VFB keeps trying in the background; anything you click will load once it is back.', {
        level: 'error',
        action: {
          label: 'Retry now',
          onClick: function () {
            retryNow('user');
          }
        }
      });
      /*
       * Only three of ~190 users who saw this banner on 16 Sep clicked Retry;
       * the rest left or reloaded by hand. So do not wait for the click: keep
       * retrying at a slow, fixed cadence while the page is open, and at once
       * when the network comes back or the tab is looked at again. The client
       * holds the commands the user issued meanwhile and replays them once a
       * session is back, so a retry that succeeds delivers what was clicked.
       */
      startAutoRetry(retryNow);
    });

    /*
     * A request whose reply died with the socket and could not be replayed.
     * The loader drains it, so the user sees no error - but the term or query
     * they asked for silently never arrives, which is exactly the kind of
     * failure this release needs to be able to see.
     */
    var requestFailedNoticeAt = 0;
    /*
     * VFB2 #502 phase 1: OBJ and SWC meshes are fetched by the client and
     * merged locally instead of being streamed through the websocket by the
     * server. On by default; ?direct=0 goes back to the server for a
     * side-by-side check. Counted in GA per resolution so the two paths can
     * be compared, and the fallback (a fetch that failed and went to the
     * server after all) is counted separately.
     */
    var directOff = (new URLSearchParams(window.location.search).get('direct') === '0');
    if (GEPPETTO.DirectGeometry !== undefined) {
      GEPPETTO.DirectGeometry.enabled = !directOff;
      GEPPETTO.on('geppetto:direct_geometry', function (info) {
        gaDetail('direct-geom', info.kind, info.ok ? 'ok' : 'fallback', Math.round((info.ms || 0) / 100) / 10 + 's');
        /*
         * The counts above say how often a path fell back; this says what
         * went wrong and on which call, which the duration alone could not.
         * Separate event so the counts stay comparable, and short enough to
         * survive GA4's 40-character event names.
         */
        /*
         * aN is every request the load made; rN, when present, is how many of
         * them picked a dropped download up from where it stopped (client
         * VFBv2.4.5.8). Absent when none did, so the names stay as they were.
         */
        var resumed = (info.resumes > 0) ? 'r' + info.resumes : null;
        if (!info.ok) {
          if (resumed !== null) {
            gaDetail('geomfail', info.kind, info.reason, info.call, 'a' + (info.attempts || 1), resumed);
          } else {
            gaDetail('geomfail', info.kind, info.reason, info.call, 'a' + (info.attempts || 1));
          }
          var geomBits = diagBits(info);
          gaDetail('geomdiag', info.kind, geomBits[0], geomBits[1], geomBits[2],
            progressBucket(info), info.effectiveType || 'na');
        } else if (info.attempts > 1) {
          /*
           * A load that needed a retry -- a host that dropped the stream, or
           * answered with an error -- and came good from another. Invisible
           * to the user, so this is the only place it shows.
           */
          if (resumed !== null) {
            gaDetail('georecover', info.kind, info.call, 'a' + info.attempts, resumed);
          } else {
            gaDetail('georecover', info.kind, info.call, 'a' + info.attempts);
          }
        }
        /*
         * A mesh the browser cannot load leaves the term with no geometry at
         * all: it vanishes from the scene and from i=, with nothing said. Show
         * the SWC skeleton instead. The server fallback runs in parallel and
         * replaces this if it succeeds.
         */
        if (!info.ok && info.reason !== 'unload' && info.kind === 'obj' && info.path !== undefined) {
          self.showSkeletonFor(String(info.path).split('.')[0]);
        }
      });
    }
    /*
     * VFB2 #502 phase 2: a term's info is fetched from v3-cached by the
     * client and its model built locally (the server's term-info processor
     * ported to JavaScript) instead of asking the server over the
     * websocket. Same switch and the same kind of GA count as the meshes.
     */
    if (GEPPETTO.DirectTermInfo !== undefined) {
      GEPPETTO.DirectTermInfo.enabled = !directOff;
      GEPPETTO.on('geppetto:direct_terminfo', function (info) {
        gaDetail('direct-terminfo', info.ok ? 'ok' : 'fallback', Math.round((info.ms || 0) / 100) / 10 + 's');
        if (!info.ok) {
          gaDetail('tifail', info.reason, info.call, 'a' + (info.attempts || 1));
          var tiBits = diagBits(info);
          gaDetail('tidiag', tiBits[0], tiBits[1], tiBits[2], info.effectiveType || 'na');
        }
      });
    }
    /*
     * VFB2 #502 phase 3: queries run against v3-cached from the client and
     * the table is built locally (the server's query processors ported to
     * JavaScript). Goes with phase 2: the server cannot run a query on a
     * term it never built. Same switch; counted as direct-query:<run|count>.
     */
    if (GEPPETTO.DirectQueries !== undefined) {
      GEPPETTO.DirectQueries.enabled = !directOff;
      GEPPETTO.on('geppetto:direct_query', function (info) {
        gaDetail('direct-query', info.kind, info.ok ? 'ok' : 'fallback', Math.round((info.ms || 0) / 100) / 10 + 's');
        if (!info.ok) {
          gaDetail('queryfail', info.kind, info.reason, info.call, 'a' + (info.attempts || 1));
          var qBits = diagBits(info);
          gaDetail('qdiag', info.kind, qBits[0], qBits[1], qBits[2], info.effectiveType || 'na');
        }
      });
    }
    GEPPETTO.on('geppetto:request_failed', function (requestID) {
      try {
        safeGa('vfb.send', 'event', 'request-failed', 'websocket-disconnect',
          'requestID:' + requestID + ' | socketStatus:' + GEPPETTO.MessageSocket.socketStatus + ' | ' + gaPage());
      } catch (err) {
        console.error('Failed to report a dropped request: ' + (err && err.message ? err.message : err));
      }
      /*
       * With the client now holding and replaying commands across a drop this
       * is rare (a request replayed three times and lost each time, or one
       * the server answered with an error), but when it happens the user must
       * hear about it rather than wait for a term that will never arrive.
       * One notice per burst, on the logo float so it does not cover the page.
       */
      if (Date.now() - requestFailedNoticeAt > 30000
        && GEPPETTO.MessageSocket.socketStatus !== GEPPETTO.Resources.SocketStatus.RECONNECTING) {
        requestFailedNoticeAt = Date.now();
        showConnectionNotice('Something you asked for could not be loaded after the connection dropped. Click it again to retry.', {
          level: 'warn',
          autoHideMs: 15000
        });
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

    /*
     * The moment the user first has a term in front of them: the end of the
     * startup path that startup-model begins.
     */
    if (!this.firstTermReported) {
      this.firstTermReported = true;
      try {
        if (typeof window.vfbGaDetail === "function") {
          window.vfbGaDetail('startup-first-term', window.vfbSecondsBucket(Math.round(performance.now())));
        }
      } catch (eFirstTerm) {
        /* reporting must never affect the panel */
      }
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

  /**
   * Makes tab named 'tabName' become active.
   */
  setActiveTab (tabComponentName, children) {
    let matchTab = 0;
    let layoutChildren = children == undefined || children == null ? this.model.toJson().layout.children : children;
    for ( var i = 0; i < layoutChildren.length; i++){
      if ( layoutChildren[i].type === "tabset"){
        for ( var j = 0; j < layoutChildren[i].children.length ; j++){
          if (layoutChildren[i].children[j].component === tabComponentName){
            matchTab = layoutChildren[i].children[j].id;
            break;
          }
        }
        this.model.doAction(FlexLayout.Actions.selectTab(matchTab));
      } else if ( layoutChildren[i].children !== undefined){
        this.setActiveTab(tabComponentName, layoutChildren[i].children);
      }
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
      <div className="unselectable" style={{ height: '100%', width: '100%' }}>
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

        <VFBOrientationGizmo getCanvas={() => this.canvasReference} />

        <FlexLayout.Layout
          ref="layout"
          model={this.model}
          factory={this.factory.bind(this)}
          onRenderTabSet={onRenderTabSet}
          clickOnBordersAction={clickOnBordersAction}/>

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
          searchStyle={this.searchStyle}
          searchConfiguration={this.searchConfiguration}
          datasourceConfiguration={this.datasourceConfiguration} />

        <VFBDownloadContents ref="downloadContentsRef" open={false} />

        <VFBUploader ref="uploaderContentsRef" open={false} />
        
        {this.htmlToolbarRender}
      </div>
    );
  }
}

function mapStateToProps (state) {
  return { ...state }
}

export default connect(mapStateToProps)(VFBMain);
