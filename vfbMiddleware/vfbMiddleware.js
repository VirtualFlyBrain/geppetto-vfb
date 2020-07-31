const vfbMiddleware = store => next => action => {
  console.log("middleware action : ", action);
  next(action);
}

export default vfbMiddleware;
