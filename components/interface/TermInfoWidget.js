import React, { Component } from 'react';

export default class TermInfoWidget extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            termInfoOpened: true,
            termInfoMounted: false,
            idSelected: undefined,
            termInfoToRender: undefined
        }

        this.termInfoToRender = undefined;

        this.addTermInfo = this.addTermInfo.bind(this);
        this.customHandler = this.customHandler.bind(this);
        this.getTermInfoDefaultWidth = this.getTermInfoDefaultWidth.bind(this);
        this.getTermInfoDefaultHeight = this.getTermInfoDefaultHeight.bind(this);
        this.getTermInfoDefaultX = this.getTermInfoDefaultX.bind(this);
        this.getTermInfoDefaultY = this.getTermInfoDefaultY.bind(this);
        this.getMDText = this.getMDText.bind(this);
        this.vfbWindowResize = this.vfbWindowResize.bind(this);
        this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);
        this.setTermInfo = this.setTermInfo.bind(this);
        this.getTermInfoWidget = this.getTermInfoWidget.bind(this);
        this.closeHandler = this.closeHandler.bind(this);
        this.updateHistory = this.updateHistory.bind(this);

        this.termMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/term.md";
        this.termHelpInfo = this.getMDText(this.termMD);
    }

    getTermInfoDefaultWidth() { 
        return Math.ceil(window.innerWidth / 4); 
    };

    getTermInfoDefaultHeight() { 
        return ((window.innerHeight - Math.ceil(window.innerHeight / 4)) - 65); 
    };

    getTermInfoDefaultX() { 
        return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); 
    };

    getTermInfoDefaultY() { 
        return 55; 
    };

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

    customHandler(node, path, widget) {
        var n = window[path];
        var otherId;
        var otherName;
        var target = widget;
        var meta = path + "." + path + "_meta";
        if (n != undefined) {
            var metanode = Instances.getInstance(meta);
            if (target.data == metanode) {
                window.resolve3D(path);
            } else {
                target.setData(metanode).setName(n.getName());
            }
        } else {
            // check for passed ID:
            if (path.indexOf(',') > -1) {
                otherId = path.split(',')[1];
                otherName = path.split(',')[2];
                path = path.split(',')[0];
            } else {
                if (widget.data.length) {
                    otherId = target.data[0].getParent();
                } else {
                    otherId = target.data.getParent();
                }
                otherName = otherId.name;
                otherId = otherId.id;
            }
            // try to evaluate as path in Model
            var entity = Model[path];
            if (typeof (entity) != 'undefined' && entity instanceof Query) {
                // clear query builder unless ctrl pressed them add to compound.
                GEPPETTO.QueryBuilder.open();
                if (!GEPPETTO.isKeyPressed("shift")) {
                    GEPPETTO.QueryBuilder.switchView(false, false);
                    GEPPETTO.QueryBuilder.clearAllQueryItems();
                } else {
                    GEPPETTO.QueryBuilder.switchView(false, false);
                }

                GEPPETTO.trigger('spin_logo');
                $("body").css("cursor", "progress");

                var callback = function () {
                    // check if any results with count flag
                    if (GEPPETTO.QueryBuilder.props.model.count > 0) {
                        // runQuery if any results
                        GEPPETTO.QueryBuilder.runQuery();
                    } else {
                        GEPPETTO.QueryBuilder.switchView(false);
                    }
                    // show query component
                    GEPPETTO.QueryBuilder.open();
                    $("body").css("cursor", "default");
                    GEPPETTO.trigger('stop_spin_logo');
                };
                // add query item + selection
                if (window[otherId] == undefined) {
                    window.fetchVariableThenRun(otherId, function () { GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback) });
                } else {
                    setTimeout(function () { GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback); }, 100);
                }
            } else {
                Model.getDatasources()[0].fetchVariable(path, function () {
                    var m = Instances.getInstance(meta);
                    target.setData(m).setName(window[path].getName());
                    resolve3D(path);
                });
            }
        }
    };

    handleSceneAndTermInfoCallback(variableIds) {
        if (typeof (variableIds) == "string") {
            variableIds = [variableIds];
        }
        for (var singleId = 0; variableIds.length > singleId; singleId++) {
            var meta = undefined;
            // check invalid id trying to get the meta data instance, if still undefined we catch the error and we remove this from the buffer.
            try {
                meta = Instances.getInstance(variableIds[singleId] + '.' + variableIds[singleId] + '_meta');
            } catch (e) {
                console.log('Instance for '+variableIds[singleId] + '.' + variableIds[singleId] + '_meta'+' does not exist in the current model');
                //window.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
                continue;
            }
            if (hasVisualType(variableIds[singleId])) {
                var instance = Instances.getInstance(variableIds[singleId]);
                resolve3D(variableIds[singleId], function () {
                    GEPPETTO.SceneController.deselectAll();
                    if ((instance != undefined) && (typeof instance.select === "function"))
                        instance.select();
                    setTermInfo(meta, meta.getParent().getId());
                });
            } else {
                setTermInfo(meta, meta.getParent().getId());
            }
            // if the element is not invalid (try-catch) or it is part of the scene then remove it from the buffer
            if (window[variableIds[singleId]] != undefined) {
                console.log('Instance for '+variableIds[singleId] + '.' + variableIds[singleId] + '_meta'+' does not exist in the current model');
                //window.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
            }
        }
        //if (window.vfbLoadBuffer.length > 0) {
        //    GEPPETTO.trigger('spin_logo');
        //} else {
        //    GEPPETTO.trigger('stop_spin_logo');
        //}
    };

    setTermInfo(data, name) {
        //check if to level has been passed:
        if (data.parent == null) {
            if (data[data.getId() + '_meta'] != undefined) {
                data = data[data.getId() + '_meta'];
                console.log('meta passed to term info for ' + data.parent.getName());
            }
        }
        if (window.termInfoPopup != undefined) {
            this.forceUpdate();
            window.termInfoPopup.setData(data).setName(name);
        }
        this.updateHistory(name);
        GEPPETTO.SceneController.deselectAll();
        if (typeof data.getParent().select === "function") {
            data.getParent().select(); // Select if visual type loaded.
        }
        this.setState({
            idSelected: name
        });
    };

    updateHistory(title) {
        try {
            if (window.vfbUpdatingHistory == undefined) {
                window.vfbUpdatingHistory = false;
            }
            if (window.vfbUpdatingHistory == false && parent.location.toString().indexOf('virtualflybrain.org') > 0 && parent.location.toString().indexOf('virtualflybrain.org') < 25) {
                window.vfbUpdatingHistory = true;
                // Update the parent windows history with current instances (i=) and popup selection (id=)
                var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, Instances);
                var visualParents = [];
                for (var i = 0; i < visualInstances.length; i++) {
                    if (visualInstances[i].getParent() != null) {
                        visualParents.push(visualInstances[i].getParent());
                    }
                }
                visualInstances = visualInstances.concat(visualParents);
                var compositeInstances = [];
                for (var i = 0; i < visualInstances.length; i++) {
                    if (visualInstances[i] != null && visualInstances[i].getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
                        compositeInstances.push(visualInstances[i]);
                    }
                }

                var items = 'i=';
                if (window.templateID) {
                    items = items + ',' + window.templateID;
                }
                compositeInstances.forEach(function (compositeInstance) { if (!items.includes(compositeInstance.getId())) { items = items + ',' + compositeInstance.getId() } });
                items = items.replace(',,', ',').replace('i=,', 'i=');
                try {
                    items = 'id=' + window.getTermInfoWidget().data.split('.')[0] + '&' + items;
                } catch (ignore) { };
                if (items != "i=") {
                    parent.history.pushState({}, title, parent.location.pathname + "?" + items);
                }
                window.vfbUpdatingHistory = false;
            }
        } catch (ignore) {
            window.vfbUpdatingHistory = true; // block further updates
        };
    };

    getTermInfoWidget() {
        return window[window.termInfoPopupId];
    };

    vfbWindowResize() {
        // reset size and position of term info widget, if any
        if (window[window.termInfoPopupId] != undefined && !window[window.termInfoPopupId].maximize) {
            window.termInfoPopup.setPosition(this.getTermInfoDefaultX(), this.getTermInfoDefaultY());
            window.termInfoPopup.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
        }

        // reset size and position of stack widget, if any
        if (window.StackViewer1 != undefined && !window.StackViewer1.maximize) {
            window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
            window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
        }

        // reset position of button bar widget (always there)
        // ButtonBar1.setPosition(getButtonBarDefaultX(), getButtonBarDefaultY());
    };

    addTermInfo() {
        if (true) {
            // init empty term info area
            G.addWidget(1, { isStateless: true }).then(
                w => {
                    window.termInfoPopup = w;
                    window.termInfoPopup.setName('Click on image to show info').addCustomNodeHandler(this.customHandler, 'click');
                    window.termInfoPopup.setPosition(this.getTermInfoDefaultX(), this.getTermInfoDefaultY());
                    window.termInfoPopup.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
                    window.termInfoPopupId = window.termInfoPopup.getId();
                    window.termInfoPopup.setTransparentBackground(false);
                    window.termInfoPopup.showHistoryNavigationBar(true);
                    window.termInfoPopup.reactReference = this;
                    $('.ui-dialog-titlebar-minimize').hide(); //hide all minimize buttons

                    window[window.termInfoPopupId].$el.bind('restored', function (event, id) {
                        if (id == window.termInfoPopupId) {
                            if (window[window.termInfoPopupId] != undefined) {
                                window.termInfoPopup.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
                                window.termInfoPopup.setPosition(this.getTermInfoDefaultX(), this.getTermInfoDefaultY());
                            }
                        }
                    });

                    var buttonBarConfiguration = {
                        "Events": ["color:set", "experiment:selection_changed", "experiment:visibility_changed"],
                        "filter": function filter(instancePath) {
                            if (typeof (instancePath) == "string") {
                                return Instances.getInstance(instancePath).getParent();
                            }
                            return instancePath[0].getParent();
                        },
                        "VisualCapability": {
                            "select": {
                                "id": "select",
                                "condition": "GEPPETTO.SceneController.isSelected($instance$.$instance$_obj != undefined ? [$instance$.$instance$_obj] : []) ||  GEPPETTO.SceneController.isSelected($instance$.$instance$_swc != undefined ? [$instance$.$instance$_swc] : [])",
                                "false": {
                                    "actions": ["$instance$.select()"],
                                    "icon": "fa-hand-stop-o",
                                    "label": "Unselected",
                                    "tooltip": "Select",
                                    "id": "select",
                                },
                                "true": {
                                    "actions": ["$instance$.deselect()"],
                                    "icon": "fa-hand-rock-o",
                                    "label": "Selected",
                                    "tooltip": "Deselect",
                                    "id": "deselect",
                                }
                            },
                            "color": {
                                "id": "color",
                                "actions": ["$instance$.setColor('$param$');"],
                                "icon": "fa-tint",
                                "label": "Color",
                                "tooltip": "Color"
                            },
                            "zoom": {
                                "id": "zoom",
                                "actions": ["GEPPETTO.SceneController.zoomTo($instances$)"],
                                "icon": "fa-search-plus",
                                "label": "Zoom",
                                "tooltip": "Zoom"
                            },
                            "visibility_obj": {
                                "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_obj')",
                                "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_obj != undefined && $instance$.getType().$instance$_obj.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_obj != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_obj]); } return visible; })()",
                                "false": {
                                    "id": "visibility_obj",
                                    "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_obj'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                                    "icon": "gpt-shapehide",
                                    "label": "Hidden",
                                    "tooltip": "Show 3D Volume"
                                },
                                "true": {
                                    "id": "visibility_obj",
                                    "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                                    "icon": "gpt-shapeshow",
                                    "label": "Visible",
                                    "tooltip": "Hide 3D Volume"
                                }
                            },
                            "visibility_swc": {
                                "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_swc')",
                                "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_swc != undefined && $instance$.getType().$instance$_swc.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_swc != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_swc]); } return visible; })()",
                                "false": {
                                    "id": "visibility_swc",
                                    "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_swc'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                                    "icon": "gpt-3dhide",
                                    "label": "Hidden",
                                    "tooltip": "Show 3D Skeleton"
                                },
                                "true": {
                                    "id": "visibility_swc",
                                    "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                                    "icon": "gpt-3dshow",
                                    "label": "Visible",
                                    "tooltip": "Hide 3D Skeleton"
                                }
                            },
                            "delete": {
                                "showCondition": "$instance$.getId()!=window.templateID",
                                "id": "delete",
                                "actions": ["if($instance$.parent != null){$instance$.parent.deselect();$instance$.parent.delete();}else{$instance$.deselect();$instance$.delete();};setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());"],
                                "icon": "fa-trash-o",
                                "label": "Delete",
                                "tooltip": "Delete"
                            }
                        }
                    };
                    window.termInfoPopup.setButtonBarControls({ "VisualCapability": ['select', 'color', 'visibility_obj', 'visibility_swc', 'zoom', 'delete'] });
                    window.termInfoPopup.setButtonBarConfiguration(buttonBarConfiguration);
                    window.termInfoPopup.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
                    window.termInfoPopup.setHelpInfo(this.termHelpInfo);
                    window.termInfoPopup.showHelpIcon(true);
                }
            );
        } else {
            this.vfbWindowResize();
            $('#' + window.termInfoPopupId).parent().effect('shake', { distance: 5, times: 3 }, 500);
        }
    };

    closeHandler() {
        this.setState({
            termInfoOpened: false
        });
        this.props.termInfoHandler(false);
        window.termInfoPopup = undefined;
    };

    componentDidMount() {
        // Timeout necessary to avoid the terminfoWidget to disappear, related to loadProjectFromURL event apparently.
        setTimeout(function() {
            console.log("Rendering Term Info Widget...");
            if((this.state.termInfoOpened) && !(this.state.termInfoMounted)){
                this.termInfoToRender = this.addTermInfo();
        }}.bind(this), 2000);
    };

    componentWillReceiveProps() {
        console.log("component received props from VFBMain");
        //if((this.props.idSelected !== undefined) && (this.state.idSelected !== this.props.idSelected)) {
        //    this.handleSceneAndTermInfoCallback(this.props.idSelected);
        //    this.setState({
        //        idSelected: this.props.idSelected
        //    });
        //}
    };

    render() {
        return (
            <div id="vfbTermInfoWidget">
                {this.termInfoToRender}
            </div>
        )
    }
}