import React, { Component } from 'react';

export default class StackViewerWidget extends React.Component {

    constructor(props) {
        super(props);

        
    }

    addStackWidget() {
        var sliceInstances = getSliceInstances();

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
                    if (window.vfbCanvas != undefined) {
                        window.StackViewer1.setCanvasRef(window.vfbCanvas);
                    }

                    // set initial position:
                    window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
                    window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                    window.StackViewer1.setName('Slice Viewer');
                    window.StackViewer1.showHistoryIcon(false);
                    window.StackViewer1.setHelpInfo(stackHelpInfo);
                    window.StackViewer1.setTransparentBackground(false);
                    window.StackViewer1.$el.bind('restored', function (event, id) {
                        if (id == window.StackViewer1.getId()) {
                            if (window.StackViewer1 != undefined) {
                                window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                                window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
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
                            updateStackWidget();
                        }
                    });
                    $('.ui-dialog-titlebar-minimize').hide(); //hide all minimize buttons
                }
            );
        } else {
            window.vfbWindowResize();
            $('#' + window.StackViewer1.getId()).parent().effect('shake', { distance: 5, times: 3 }, 500);
        }
    };

    render() {
        const logoStyle = { fontSize: '20px'};
        
        return (
            <div>
                
            </div>
        );
    }
}
