import {
  VFB_ERROR,
  VFB_ID_LOADED,
  VFB_LOAD_ID
} from '../actions/generals';

export const GENERAL_DEFAULT_STATE = {
  error: undefined,
  idsList: [],
  idsToLoad: undefined,
  idLoaded: undefined
}

export default ( state = {}, action ) => ({
  ...state,
  ...generalReducer(state, action)
});

function generalReducer (state, action) {
  switch (action.type) {
  case VFB_ERROR:
    return {
      ...state,
      error: action.data
    }
  case VFB_LOAD_ID:
    // action.data is a string or an array? let's check it
    if (action.data.length === undefined) {
      if (!state.idsList.includes(action.data)) {
        return {
          ...state,
          idsList: [...state.idsToLoad, action.data],
          idsToLoad: [action.data],
          idLoaded: undefined
        };
      }
    } else {
      var newIds = [];
      action.data.map(item => {
        if (!state.idsList.includes(item)) {
          newIds.push(item);
        }
      });
      if (newIds.length > 0) {
        return {
          ...state,
          idsList: [...state.idsList, ...newIds],
          idsToLoad: newIds,
          idLoaded: undefined
        };
      }
    }
    return {
      ...state,
      idsToLoad: undefined,
      idLoaded: undefined
    };
  case VFB_ID_LOADED:
    return {
      ...state,
      idsToLoad: undefined,
      idLoaded: action.data
    };
  }
}
