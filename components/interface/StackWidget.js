import React, { Component } from 'react';

export default class StackWidget extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stackViewerOpened: true,
            stackViewerMounted: false,
        }

        this.addStackWidget = this.addStackWidget.bind(this);
        this.closeHandler = this.closeHandler.bind(this);
        this.getSliceInstances = this.getSliceInstances.bind(this);
        this.getStackViewerDefaultHeight = this.getStackViewerDefaultHeight.bind(this);
        this.getStackViewerDefaultWidth = this.getStackViewerDefaultWidth.bind(this);
        this.getStackViewerDefaultX = this.getStackViewerDefaultX.bind(this);
        this.getStackViewerDefaultY = this.getStackViewerDefaultY.bind(this);
        this.getMDText = this.getMDText.bind(this);
        this.updateStackWidget = this.updateStackWidget.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.changedStacks = this.changedStacks.bind(this);

        this.stackViewToRender = undefined;
        this.stackConfiguration = {
            serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
            templateId: 'NOTSET'
        };
        this.stackMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/stack.md";
        this.stackHelpInfo = this.getMDText(this.stackMD);

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
        if (window.StackViewer1 != undefined && window.StackViewer1.data != undefined && window.StackViewer1.data.instances != undefined) {
            var a = this.getSliceInstances();
            var b = window.StackViewer1.data.instances;
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

    getStackViewerDefaultWidth() { return Math.ceil(window.innerWidth / 4); };
    getStackViewerDefaultHeight() { return Math.ceil(window.innerHeight / 4) - 10; };
    getStackViewerDefaultX() { return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); };
    getStackViewerDefaultY() { return (window.innerHeight - Math.ceil(window.innerHeight / 4)); };

    updateStackWidget() {
        this.checkConnection();
        console.log('Updating stack...');
        if (this.changedStacks()) {
            window.StackViewer1.addSlices(this.getSliceInstances());
        }
        window.StackViewer1.updateScene();
    };

    addStackWidget() {
        var sliceInstances = this.getSliceInstances();

        if (window.StackViewer1 == undefined) {
            var config;
            var domainId = [];
            var domainName = [];
            if (typeof sliceInstances[0] !== "undefined") {
                config = JSON.parse(sliceInstances[0].getValue().wrappedObj.value.data);
            }
            if (config == undefined || typeof config !== "undefined") {
                config = {
                    serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
                    templateId: 'NOTSET'
                };
            }
            G.addWidget(8, { isStateless: true }).then(
                w => {
                    window.StackViewer1 = w;

                    window.StackViewer1.setConfig(config).setData({
                        instances: sliceInstances
                    });

                    // set config from template metadata
                    if (window.templateID != undefined) {
                        try {
                            window.StackViewer1.setConfig(JSON.parse(window[window.templateID][window.templateID + "_slices"].getValue().wrappedObj.value.data));
                        } catch (ignore) { }
                    }


                    // set canvas if it's already there
                    if (this.props.canvasRef != undefined) {
                        window.StackViewer1.setCanvasRef(this.props.canvasRef);
                    }

                    // set initial position:
                    window.StackViewer1.setPosition(this.getStackViewerDefaultX(), this.getStackViewerDefaultY());
                    window.StackViewer1.setSize(this.getStackViewerDefaultHeight(), this.getStackViewerDefaultWidth());
                    window.StackViewer1.setName('Slice Viewer');
                    window.StackViewer1.showHistoryIcon(false);
                    window.StackViewer1.setHelpInfo(this.stackHelpInfo);
                    window.StackViewer1.setTransparentBackground(false);
                    window.StackViewer1.$el.bind('restored', function (event, id) {
                        if (id == window.StackViewer1.getId()) {
                            if (window.StackViewer1 != undefined) {
                                window.StackViewer1.setSize(this.getStackViewerDefaultHeight(), this.getStackViewerDefaultWidth());
                                window.StackViewer1.setPosition(this.getStackViewerDefaultX(), this.getStackViewerDefaultY());
                            }
                        }
                    });

                    // on change to instances reload stack:
                    GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (path) {
                        console.log(path.split('.')[0] + ' deleted...');
                        if (window.StackViewer1 != undefined) {
                            if (path != undefined && path.length > 0) {
                                window.StackViewer1.removeSlice(path);
                            } else {
                                console.log('Removing instance issue: ' + path);
                            }
                        }
                    });
                    GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
                        console.log('Instance created...');

                        if (window.StackViewer1 != undefined) {
                            if (instances != undefined && instances.length > 0) {
                                var config = {
                                    serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
                                    templateId: window.templateID
                                };
                                instances.forEach(function (parentInstance) {
                                    parentInstance.parent.getChildren().forEach(function (instance) {
                                        if (instance.getName() == 'Stack Viewer Slices') {
                                            window.StackViewer1.addSlices(instance);
                                            if (instance.parent.getId() == window.templateID) {
                                                try {
                                                    config = JSON.parse(instance.getValue().wrappedObj.value.data);
                                                    window.StackViewer1.setConfig(config);
                                                } catch (err) {
                                                    console.log(err.message);
                                                    window.StackViewer1.setConfig(config);
                                                }
                                            }
                                            console.log('Passing instance: ' + instance.getId());
                                        }
                                    })
                                });
                            }
                        }
                    });

                    // on colour change update:
                    GEPPETTO.on(GEPPETTO.Events.Color_set, function (instances) {
                        console.log('Colour change...');
                        if (window.StackViewer1 != undefined) {
                            this.updateStackWidget();
                        }
                    }.bind(this));
                    $('.ui-dialog-titlebar-minimize').hide(); //hide all minimize buttons
                }
            );
        } else {
            //this.vfbWindowResize();
            $('#' + window.StackViewer1.getId()).parent().effect('shake', { distance: 5, times: 3 }, 500);
        }
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

    // TOCHECK the stack viewer widget is not triggering the close method defined in widget.js
    // so this method is never called and the update when closed is not propagated to VFBMain
    closeHandler() {
        this.setState({
            stackViewerOpened: false
        });
        this.props.stackViewerHandler(false);
        window.StackViewer1 = undefined;
    };

    componentDidMount() {
        // Timeout necessary to avoid the terminfoWidget to disappear, related to loadProjectFromURL event apparently.
        GEPPETTO.on(GEPPETTO.Events.Experiment_loaded, function () {
            console.log("Rendering stack viewer Widget...");
            if((this.state.stackViewerOpened) && !(this.state.stackViewerMounted)){
                this.stackViewToRender = this.addStackWidget();
        }}.bind(this));
    };

    render() {
        return (
            <div id="vfbStackWidget">
                {this.stackViewToRender}
            </div>
        )
    }
}