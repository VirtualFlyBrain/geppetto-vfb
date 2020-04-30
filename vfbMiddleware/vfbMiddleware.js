const vfbMiddleware = store => next => action => {
  next(action);
}

export default vfbMiddleware;
