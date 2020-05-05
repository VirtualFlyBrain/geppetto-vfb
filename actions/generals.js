export const VFB_ERROR = 'VFB_ERROR';
export const VFB_LOAD_ID = 'VFB_LOAD_ID';
export const VFB_ID_LOADED = 'VFB_ID_LOADED';
export const VFB_UI_UPDATED = 'VFB_UI_UPDATED';

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
