import React, { Component } from 'react';
import StackViewerComponent from 'geppetto-client/js/components/widgets/stackViewer/StackViewerComponent';

function arrayUnique (array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) {
        a.splice(j--, 1);
      }
    }
  }

  return a;
}

export default class VFBStackViewer extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      data: { id: this.props.id, height: this.props.defHeight, width: this.props.defWidth, instances: [], selected: [] },
      canvasRef: this.props.canvasRef
    }

    this.addSlices = this.addSlices.bind(this);
    this.removeSlice = this.removeSlice.bind(this);
    this.changedStacks = this.changedStacks.bind(this);
    this.updateCanvasRef = this.updateCanvasRef.bind(this);
    this.checkConnection = this.checkConnection.bind(this);
    this.updateStackWidget = this.updateStackWidget.bind(this);
    this.getSliceInstances = this.getSliceInstances.bind(this);

    this.variable = null;
    this.options = null;
    // REMEMBER to define these props in the VFBMain
    this.data = { id: this.props.id, height: this.props.defHeight, width: this.props.defWidth, instances: [], selected: [] };
    this.config = undefined;
    this.canvasRef = null;
    this.voxelSize = { x:0.622088, y:0.622088, z:0.622088 };
    this.stackConfiguration = {
      serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
      templateId: 'NOTSET'
    };
    this.stackMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/stack.md";
    this.stackElement = undefined;
  }

  changedStacks () {
    if (this.refs.StackViewerRef !== undefined && this.data !== undefined && this.data.instances !== undefined) {
      var a = this.getSliceInstances();
      var b = this.state.data.instances;
      if (a.length == b.length) {
        for (var i = 0; i < a.length; i++) {
          try {
            if (a[i].parent.getColor() != b[i].parent.getColor()) {
              return true;
            }
            if (a[i].parent.isVisible() != b[i].parent.isVisible()) {
              return true;
            }
          } catch (ignore) { }
        }
        return false;
      }
    }
    return true;
  }

  checkConnection () {
    try {
      if (GEPPETTO.MessageSocket.socket.readyState == WebSocket.CLOSED && window.vfbRelaodMessage) {
        window.vfbRelaodMessage = false;
        if (confirm("Sorry but your connection to our servers has timed out. \nClick OK to reconnect and reload your current items or click Cancel to do nothing.")) {
          location.reload(true);
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  updateStackWidget () {
    this.addSlices(this.getSliceInstances());
  }

  updateCanvasRef (newRef) {
    this.setState({ canvasRef: newRef });
  }

  // stack widget helper methods
  getSliceInstances () {
    var potentialInstances = GEPPETTO.ModelFactory.getAllPotentialInstancesEndingWith('_slices');
    var sliceInstances = [];
    var instance;
    for (var i = 0; i < potentialInstances.length; i++) {
      instance = Instances.getInstance(potentialInstances[i], false);
      if (instance) {
        sliceInstances.push(instance);
      }
    }
    return sliceInstances;
  }

  addSlices (instances) {
    var added = undefined;
    var curr = this.data.instances.length;
    if (instances.length == undefined) {
      added = [instances];
      if (instances.parent) {
        // console.log('Adding ' + instances.parent.getName() + ' to StackViewer...');
        if (this.props.onLoad !== undefined) {
          this.props.onLoad(instances.parent.getId());
        }
        this.data.instances[this.data.instances.length] = instances;
      } else {
        // console.log('Adding ' + instances.toString() + ' to ' + this.data.instances.length);
        window.test = instances;
      }
    } else {
      added = instances;
      // console.log('Updating ' + instances.length + ' instances...');
      this.data.instances = instances;
    }
    // console.log('Passing ' + this.data.instances.length + ' instances');
    this.setState({ data: this.data }, () => {
      this.forceUpdate();
    });
  }

  removeSlice (path) {
    // console.log('Removing ' + path.split('.')[0] + ' from ' + this.data.instances.length);
    var i;
    for (i in this.data.instances){
      try {
        if (this.data.instances[i].parent.getId() == path.split('.')[0]){
          this.data.instances.splice(i,1);
          break;
        }
      } catch (ignore){ // handling already deleted instance
        // this.data.instances.splice(i,1);
      }
    }
    // console.log('Passing ' + this.data.instances.length + ' instances');
    this.setState({ data: this.data }, () => {
      this.forceUpdate();
    });
  }

  componentWillUnmount () {
    if (this.refs.StackViewerRef !== undefined || this.refs.StackViewerRef !== null) {
      this.refs.StackViewerRef._isMounted = false;
    }
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.data.height !== nextProps.defHeight || this.state.data.width !== nextProps.defWidth) {
      let newData = this.state.data;
      newData.height = nextProps.defHeight;
      newData.width = nextProps.defWidth;
      this.setState({ data: newData }, () => {
        this.updateStackWidget();
      });
    }
  }

  componentDidMount () {
    if (GEPPETTO.MessageSocket.socket !== null) {
      this.updateStackWidget();
    }

    if (this.refs.StackViewerRef._isMounted === false && this.refs.StackViewerRef !== undefined) {
      this.refs.StackViewerRef._isMounted = true;
    }

    // on change to instances reload stack:
    GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (path) {
      // console.log(path.split('.')[0] + ' deleted...');
      if (this.refs.StackViewerRef != undefined) {
        if (path != undefined && path.length > 0) {
          this.removeSlice(path);
        } else {
          console.error('Removing instance issue: ' + path);
        }
      }
    }.bind(this));
    GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
      var that = this;

      if (this.refs.StackViewerRef != undefined) {
        if (instances != undefined && instances.length > 0) {
          var config = {
            serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
            templateId: window.templateID
          };
          instances.forEach(function (parentInstance) {
            parentInstance.parent.getChildren().forEach(function (instance) {
              if (instance.getName() == 'Stack Viewer Slices') {
                that.addSlices(instance);
                if (instance.parent.getId() == window.templateID) {
                  try {
                    config = JSON.parse(instance.getValue().wrappedObj.value.data);
                    that.setState({ data: that.data }, () => {
                      that.updateStackWidget();
                    });
                  } catch (err) {
                    console.error(err.message);
                    that.setState({ data: that.data }, () => {
                      that.updateStackWidget();
                    });
                  }
                }
                // console.log('Passing instance: ' + instance.getId());
              }
            })
          });
        }
      }
    }.bind(this));

    // on colour change update:
    GEPPETTO.on(GEPPETTO.Events.Color_set, function (instances) {
      if (this.refs.StackViewerRef != undefined) {
        this.updateStackWidget();
      }
    }.bind(this));

    // on colour change update:
    GEPPETTO.on(GEPPETTO.Events.Select, function (instances) {
      if (this.refs.StackViewerRef != undefined) {
        this.updateStackWidget();
      }
    }.bind(this));
  }

  render () {
    var sliceInstances = this.getSliceInstances();

    if (sliceInstances.length > 0 && typeof sliceInstances[0] !== "undefined" && sliceInstances[0].getValue !== undefined) {
      this.config = JSON.parse(sliceInstances[0].getValue().wrappedObj.value.data);
    }
    if (this.config == undefined) {
      this.config = {
        serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
        templateId: 'NOTSET'
      };
    } else if (this.config.subDomains != undefined && this.config.subDomains[0] != undefined && this.config.subDomains[0].length > 2) {
      this.voxelSize.x = Number(this.config.subDomains[0][0] || 0.622088);
      this.voxelSize.y = Number(this.config.subDomains[0][1] || 0.622088);
      this.voxelSize.z = Number(this.config.subDomains[0][2] || 0.622088);
    }

    return (
      <StackViewerComponent
        data={this.state.data}
        config={this.config}
        voxel={this.voxelSize}
        canvasRef={this.props.canvasRef}
        ref="StackViewerRef"
        layout={this.props.layout}/>
    )
  }

}
