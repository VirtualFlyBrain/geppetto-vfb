export const VFB_ERROR = 'VFB_ERROR';
export const VFB_LOAD_ID = 'VFB_LOAD_ID';
export const VFB_LOAD_TERM_INFO = 'VFB_LOAD_TERM_INFO';
export const VFB_ID_LOADED = 'VFB_ID_LOADED';
export const VFB_UI_UPDATED = 'VFB_UI_UPDATED';
export const INSTANCE_ADDED = 'INSTANCE_ADDED';
export const SHOW_GRAPH = 'SHOW_GRAPH';
export const UPDATE_GRAPH = 'UPDATE_GRAPH';
export const UPDATE_CIRCUIT_QUERY = 'UPDATE_CIRCUIT_QUERY';
export const INSTANCE_SELECTED = 'INSTANCE_SELECTION';
export const INSTANCE_DELETED = 'INSTANCE_DELETED';
export const INSTANCE_VISIBILITY_CHANGED = 'INSTANCE_VISIBILITY_CHANGED';
export const SHOW_LIST_VIEWER = 'SHOW_LIST_VIEWER';

export const vfbError = errorMessage => ({
  type: VFB_ERROR,
  data: errorMessage
});

export const vfbLoadId = idList => ({
  type: VFB_LOAD_ID,
  data: idList
});

export const vfbIdLoaded = (id, component) => ({
  type: VFB_ID_LOADED,
  data: {
    id: id,
    component: component
  }
});

export const vfbGraph = (type, instance, queryIndex, visible, sync) => ({
  type: type,
  data: {
    instance : instance ,
    queryIndex : queryIndex,
    visible : visible,
    sync : sync
  }
});

export const vfbCircuitBrowser = (type, instance, visible) => ({
  type: type,
  data: {
    instance : instance,
    visible : visible
  }
});

export const vfbUIUpdated = layout => ({
  type: VFB_UI_UPDATED,
  data: layout
});

export const instanceAdded = instance => ({
  type: INSTANCE_ADDED,
  data: instance
});

export const instanceDeleted = (type, id) => ({
  type: type,
  data: id
});

export const instanceSelected = instance => ({
  type: INSTANCE_SELECTED,
  data: instance
});

export const instanceVisibilityChanged = instance => ({
  type: INSTANCE_VISIBILITY_CHANGED,
  data: instance
});

export const setTermInfo = ( instance, visible ) => ({
  type: VFB_LOAD_TERM_INFO,
  data : {
    instance : instance,
    visible : visible
  }
});

export const showListViewer = () => ({
  type: SHOW_LIST_VIEWER,
  data : {}
});
