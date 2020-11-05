import {
  VFB_ERROR,
  VFB_ID_LOADED,
  VFB_LOAD_ID,
  VFB_UI_UPDATED,
  INSTANCE_ADDED,
  INSTANCE_DELETED,
  SHOW_LIST_VIEWER,
  LOAD_CYPHER_QUERIES,
  SHOW_GRAPH,
  UPDATE_GRAPH,
  UPDATE_CIRCUIT_QUERY,
  INSTANCE_SELECTED,
  INSTANCE_VISIBILITY_CHANGED,
  VFB_LOAD_TERM_INFO
} from '../actions/generals';

const componentsMap = require('../components/configuration/VFBLoader/VFBLoaderConfiguration').componentsMap;

export const GENERAL_DEFAULT_STATE = {
  error: undefined,
  idsMap: {},
  idsList: [],
  idsLoaded: 0,
  idsToLoad: 0,
  stepsToLoad: 1,
  stepsLoaded: 0,
  loading: false,
  instanceOnFocus : {},
  ui : {
    canvas : {
      instanceSelection : {},
      instanceDeleted : {},
      instanceVisibilityChanged : false
    },
    graph : { graphQueryIndex : -1 },
    termInfo : { termInfoVisible : false },
    layers : { listViewerInfoVisible : true },
    circuitBrowser : { circuitQuerySelected : [] },
    layout: {
      "ThreeDViewer": true,
      "StackViewer": true,
      "TermInfo": true
    }
  } 
}

export default ( state = {}, action ) => ({
  ...state,
  ...generalReducer(state, action),
  ...lastAction(state, action)
});

function lastAction (state = {}, action) {
  return action;
}

function checkLayoutState (layout) {
  var stateValue = false;
  Object.keys(layout).map(key => {
    if (layout[key]) {
      stateValue = true;
    }
  });
  return stateValue;
}

function returnComponent (instance_type) {
  var matchString = null;
  for (let key in componentsMap) {
    if (typeof componentsMap[key].geppettoSuffix === "string") {
      if (instance_type.includes(componentsMap[key].geppettoSuffix)) {
        matchString = componentsMap[key].matchingString;
        break;
      }
    } else if (componentsMap[key].geppettoSuffix.length > 1) {
      componentsMap[key].geppettoSuffix.map(suffix => {
        if (instance_type.includes(suffix)) {
          matchString = componentsMap[key].matchingString;
        }
      });
      if (matchString !== null) {
        break;
      }
    }
  }
  return matchString;
}

function generalReducer (state, action) {
  let ui = { ...state.ui };
  switch (action.type) {
  case VFB_ERROR:
    return {
      ...state,
      error: action.data
    }
  case VFB_LOAD_ID:
    // check if data are provided as string or array of strings
    if (typeof action.data === "string") {
      if (!state.idsList.includes(action.data) && checkLayoutState(state.ui.layout)) {
        var idsToLoad = state.idsToLoad + 1;
        var newMap = { ...state.idsMap };
        newMap[action.data] = {
          loaded: !checkLayoutState(state.ui.layout),
          components: {}
        };
        return {
          ...state,
          loading: true,
          idsMap: newMap,
          idsList: [...state.idsList, action.data],
          idsToLoad: idsToLoad,
        };
      }
    } else {
      var newIds = [];
      var idsToLoad = state.idsToLoad;
      var newMap = { ...state.idsMap };
      action.data.map(item => {
        if (!state.idsList.includes(item) && checkLayoutState(state.ui.layout)) {
          idsToLoad++;
          newIds.push(item);
          newMap[item] = {
            loaded: !checkLayoutState(state.ui.layout),
            components: {}
          };
        }
      });
      if (newIds.length > 0) {
        return {
          ...state,
          loading: true,
          idsMap: newMap,
          idsList: [...state.idsList, ...newIds],
          idsToLoad: idsToLoad,
        };
      }
    }
    return { ...state };
  case VFB_ID_LOADED:
    var loading = false;
    var stepsToLoad = 0;
    var stepsLoaded = 0;
    var idsLoaded = state.idsLoaded;
    var newMap = { ...state.idsMap };

    if (newMap[action.data.id] !== undefined && newMap[action.data.id].components[action.data.component]) {
      var newComponents = { ...newMap[action.data.id].components };
      newMap[action.data.id].components = newComponents;
      newMap[action.data.id].components[action.data.component].loaded = true;
    }

    for (let singleId in newMap) {
      var instanceLoaded = true;
      if (Object.keys(newMap[singleId].components).length === 0) {
        stepsToLoad++;
        loading = true;
        instanceLoaded = false;
      }

      for (let singleComponent in newMap[singleId].components) {
        if (newMap[singleId].components[singleComponent].loaded) {
          stepsToLoad++;
          stepsLoaded++;
        } else {
          stepsToLoad++;
          loading = true;
          instanceLoaded = false;
        }
      }

      if (instanceLoaded) {
        idsLoaded++;
        delete newMap[action.data.id];
      }
    }

    if (loading) {
      return {
        ...state,
        idsMap: newMap,
        loading: loading,
        idsLoaded: idsLoaded,
        stepsToLoad: stepsToLoad,
        stepsLoaded: stepsLoaded
      };
    } else {
      return {
        ...state,
        idsToLoad: 0,
        idsLoaded: 0,
        stepsToLoad: 0,
        stepsLoaded: 0,
        idsMap: newMap,
        loading: loading,
        instanceOnFocus : Instances[action.data.id] != null ? Instances[action.data.id] : {},
        idsList : !state.idsList.includes(action.data.id) ? [ ...state.idsList, action.data.id ] : [ ...state.idsList ]
      };
    }
  case VFB_UI_UPDATED:
    ui.layout = action.data;
    return {
      ...state,
      ui : ui
    };
  case SHOW_GRAPH:
    ui.graph.graphQueryIndex = action.data.queryIndex;
    return { 
      ...state, 
      ui : ui,
      instanceOnFocus : action.data.instance
    };
  case UPDATE_GRAPH:
    ui.graph.graphQueryIndex = action.data.queryIndex;
    return { 
      ...state, 
      ui : ui
    };
  case UPDATE_CIRCUIT_QUERY:
    var newQueryMap = [];
    if ( Array.isArray(action.data.instance) ) {
      newQueryMap = action.data.instance;
    } else {
      !state.ui.circuitBrowser.circuitQuerySelected.includes(action.data.instance) ? newQueryMap = [...state.ui.circuitBrowser.circuitQuerySelected, action.data.instance] : newQueryMap = [...state.ui.circuitBrowser.circuitQuerySelected];
    }
    
    ui.circuitBrowser.circuitQuerySelected = newQueryMap;
    return { 
      ...state, 
      ui : ui
    };
  case INSTANCE_ADDED:
    var newMap = { ...state.idsMap };
    var newInstance = action.data.split(".");
    var component = returnComponent(newInstance[1]);
    if (newMap[newInstance[0]] !== undefined
              && component !== null
              && newMap[newInstance[0]].components[component] === undefined
              && Instances[newInstance[0]][newInstance[1]] !== undefined) {
      var newComponents = { ...newMap[newInstance[0]].components };
      newMap[newInstance[0]].components = newComponents;
      if (state.ui.layout[component]) {
        newMap[newInstance[0]].components[component] = {
          loaded: false,
          loadable: true
        }
      } else {
        newMap[newInstance[0]].components[component] = {
          loaded: true,
          loadable: false
        }
      }
    }
    return {
      ...state,
      idsMap: newMap,
      instanceOnFocus : Instances[newInstance[0]] != null ? Instances[newInstance[0]] : {},
      idsList : !state.idsList.includes(action.data) ? [ ...state.idsList, action.data ] : [ ...state.idsList ]
    };
  case INSTANCE_SELECTED:
    ui.canvas.instanceSelected = action.data;
    return {
      ...state,
      ui : ui,
      instanceOnFocus : action.data
    }
  case INSTANCE_DELETED:
    var newMap = [ ...state.idsList ];
    var index = newMap.indexOf(action.instance.id);
    if ( index > -1 ) {
      newMap.splice(index, 1);
    }
    ui.canvas.instanceDeleted = action.instance;
    return {
      ...state,
      ui : ui,
      idsList : newMap
    }
  case INSTANCE_VISIBILITY_CHANGED:
    ui.canvas.instanceVisibilityChanged = action.data;
    return {
      ...state,
      ui : ui
    }
  case VFB_LOAD_TERM_INFO:
    ui.termInfo.termInfoVisible = action.data.visible;
    return {
      ...state,
      ui : ui,
      instanceOnFocus : action.data.instance
    }
  case SHOW_LIST_VIEWER:
    ui.layers.listViewerInfoVisible = true; 
    return {
      ...state,
      ui : ui
    }    
  }
}
