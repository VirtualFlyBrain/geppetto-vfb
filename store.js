import all from "./reducers/all";
import vfbMiddleware from "./vfbMiddleware/vfbMiddleware";
import { GENERAL_DEFAULT_STATE } from "./reducers/generals";
import { createStore, applyMiddleware, compose } from "redux";

const INIT_STATE = { generals: GENERAL_DEFAULT_STATE };

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

function configureStore (state = INIT_STATE) {
  return createStore(
    all,
    state,
    composeEnhancers(applyMiddleware(vfbMiddleware))
  );
}

export default configureStore;