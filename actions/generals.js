export const VFB_ERROR = 'VFB_ERROR';
export const VFB_LOAD_ID = 'VFB_LOAD_ID';
export const VFB_ID_LOADED = 'VFB_ID_LOADED';
export const VFB_UI_UPDATED = 'VFB_UI_UPDATED';
export const INSTANCE_ADDED = 'INSTANCE_ADDED';
export const INSTANCE_SELECTED = 'INSTANCE_SELECTION';
export const INSTANCE_VISIBILITY_CHANGED = 'INSTANCE_VISIBILITY_CHANGED';

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

export const vfbUIUpdated = layout => ({
  type: VFB_UI_UPDATED,
  data: layout
});

export const instanceAdded = instance => ({
  type: INSTANCE_ADDED,
  data: instance
});

export const instanceSelected = instance => ({
  type: INSTANCE_SELECTED,
  data: instance
});

export const instanceVisibilityChanged = instance => ({
  type: INSTANCE_VISIBILITY_CHANGED,
  data: instance
});
