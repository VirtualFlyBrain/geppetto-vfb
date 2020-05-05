const componentsMap = {
  CANVAS: {
    matchingString: "ThreeDViewer",
    geppettoSuffix: [
      "_obj",
      "_swc"
    ],
    visualCapability: true
  },
  STACK: {
    matchingString: "StackViewer",
    geppettoSuffix: "_slice",
    visualCapability: true
  },
  TERMINFO: {
    matchingString: "TermInfo",
    geppettoSuffix: "_meta",
    visualCapability: false
  }
};

module.exports = { componentsMap };