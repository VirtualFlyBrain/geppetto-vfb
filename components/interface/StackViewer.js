import React, { Component } from 'react';
import StackViewerComponent from '../../../../js/components/widgets/stackViewer/StackViewerComponent';

function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

export default class StackViewer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            data: {id: this.props.id, height: this.props.defHeight, width: this.props.defWidth, instances: [], selected: [] }
        }

        this.addSlices = this.addSlices.bind(this);
        this.getMDText = this.getMDText.bind(this);
        this.changedStacks = this.changedStacks.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.updateStackWidget = this.updateStackWidget.bind(this);
        this.getSliceInstances = this.getSliceInstances.bind(this);

        this.variable = null;
        this.options = null;
        // REMEMBER to define these props in the VFBMain
        this.data = {id: this.props.id, height: this.props.defHeight, width: this.props.defWidth, instances: [], selected: [] };
        this.config = undefined;
        this.canvasRef = null;
        this.voxelSize = {x:0.622088, y:0.622088, z:0.622088};
        this.stackConfiguration = {
            serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
            templateId: 'NOTSET'
        };
        this.stackMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/stack.md";
        this.stackHelpInfo = this.getMDText(this.stackMD);
        this.stackElement = undefined;
    }

    getMDText(urlLocation) {
        var result = null;
        $.ajax({
            url: urlLocation,
            type: 'get',
            dataType: 'html',
            async: false,
            success: function (data) { result = data; }
        }
        );
        return result;
    }

    changedStacks() {
        if (this.refs.StackViewerRef != undefined && this.data != undefined && this.data.instances != undefined) {
            var a = this.getSliceInstances();
            var b = this.state.data.instances;
            if (a.length == b.length) {
                for (var i = 0; i < a.length; i++) {
                    try {
                        if (a[i].parent.getColor() != b[i].parent.getColor()) {
                            return true;
                        }
                    } catch (ignore) { }
                }
                return false;
            }
        }
        return true;
    };

    checkConnection() {
        try {
            if (GEPPETTO.MessageSocket.socket.readyState == WebSocket.CLOSED && window.vfbRelaodMessage) {
                window.vfbRelaodMessage = false;
                if (confirm("Sorry but your connection to our servers has timed out. \nClick OK to reconnect and reload your current items or click Cancel to do nothing.")) {
                    location.reload();
                }
            }
        }
        catch (err) {
            console.log(err.message);
        }
    };

    updateStackWidget() {
        this.checkConnection();
        console.log('Updating stack...');
        if (this.changedStacks()) {
            this.addSlices(this.getSliceInstances());
        }
        //window.StackViewer1.updateScene();
    };

    // stack widget helper methods
    getSliceInstances() {
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
    };

    addSlices(instances) {
        var curr = this.data.instances.length;
        if (instances.length == undefined) {
            if (instances.parent) {
                console.log('Adding ' + instances.parent.getName() + ' to ' + this.data.instances.length);
            }else{
                console.log('Adding ' + instances.toString() + ' to ' + this.data.instances.length);
                window.test = instances;
            }
        }else{
            console.log('Adding ' + instances.length + ' instances to ' + this.data.instances.length);
        }
        this.data.instances = arrayUnique(this.data.instances.concat(instances));
        if (curr != this.data.instances.length){
            console.log('Passing ' + this.data.instances.length + ' instances');
            //this.updateScene();
            this.setState({data: this.data});
        }
    }

    resizeStack() {
        this.stackElement = $("#"+this.props.id);
    }

    componentDidMount() {
        //
        var that = this;
        window.addEventListener('resize', function(event){
            that.resizeStack();
        }.bind(this));

        // on change to instances reload stack:
        GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (path) {
            console.log(path.split('.')[0] + ' deleted...');
            if (this.refs.StackViewerRef != undefined) {
                if (path != undefined && path.length > 0) {
                    this.removeSlice(path);
                } else {
                    console.log('Removing instance issue: ' + path);
                }
            }
        }.bind(this));
        GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
            var that = this;
            console.log('Instance created...');

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
                                        //window.StackViewer1.setConfig(config);
                                    } catch (err) {
                                        console.log(err.message);
                                        //window.StackViewer1.setConfig(config);
                                    }
                                }
                                console.log('Passing instance: ' + instance.getId());
                            }
                        })
                    });
                }
            }
        }.bind(this));

        // on colour change update:
        GEPPETTO.on(GEPPETTO.Events.Color_set, function (instances) {
            console.log('Colour change...');
            if (this.refs.StackViewerRef != undefined) {
                this.updateStackWidget();
            }
        }.bind(this));
    }

    render() {
        var sliceInstances = this.getSliceInstances();

        var domainId = [];
        var domainName = [];
        if (typeof sliceInstances[0] !== "undefined") {
            this.config = JSON.parse(sliceInstances[0].getValue().wrappedObj.value.data);
        }
        if (this.config == undefined) {
            this.config = {
                serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
                templateId: 'NOTSET'
            };
        }

        return(
            <StackViewerComponent
                data={this.state.data}
                config={this.config}
                voxel={this.voxelSize}
                canvasRef={this.props.canvasRef}
                ref="StackViewerRef"/>
        )
    }

}
