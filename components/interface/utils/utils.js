var coli = 1;

var getStackViewerDefaultX = function () {
  return (Math.ceil(window.innerWidth / 1.826));
};

var getStackViewerDefaultY = function () {
  return (Math.ceil(window.innerHeight / 3.14));
};

// Logic to add VFB ids into the scene starts here
var setSepCol = function (entityPath) {
  if (entityPath.indexOf(window.templateID) < 0) {
    var c = coli;
    coli++;
    if (coli > 199) {
      coli = 1;
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
};

var hasVisualType = function (variableId) {
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
};

module.exports = {
  setSepCol,
  getStackViewerDefaultX,
  getStackViewerDefaultY,
  hasVisualType
};
