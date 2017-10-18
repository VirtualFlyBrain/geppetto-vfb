define(function (require) {
    return function (GEPPETTO) {

        // block loading
        window.canvasAvilable = false;

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = "geppetto/extensions/geppetto-vfb/css/VFB.css";
        document.getElementsByTagName("head")[0].appendChild(link);

        // any required stuff
        var Query = require('./../../js/geppettoModel/model/Query');
        var ImportType = require('./../../js/geppettoModel/model/ImportType');
        var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
        var vfbDefaultTutorial = require('./tutorials/controlPanelTutorial.json');

        var stackMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/stack.md";
        var termMD = "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/mdHelpFiles/term.md";
        
        //Retrieve 
        function getMDText(urlLocation){
            var result = null;
            $.ajax( { url: urlLocation, 
                      type: 'get', 
                      dataType: 'html',
                      async: false,
                      success: function(data) { result = data; } 
                    }
            );
            return result;
        }
        
        //retrieve MD files text output and stores it into local variables
        var termHelpInfo = getMDText(termMD);
        var stackHelpInfo = getMDText(stackMD);

        // widgets default dimensions and positions
        var getStackViewerDefaultWidth = function() { return Math.ceil(window.innerWidth / 4); };
        var getStackViewerDefaultHeight = function() { return Math.ceil(window.innerHeight/4) - 10; };
        var getTermInfoDefaultWidth = function() { return Math.ceil(window.innerWidth / 4); };
        var getTermInfoDefaultHeight = function() { return ((window.innerHeight - Math.ceil(window.innerHeight/4))-20); };
        var getTermInfoDefaultX = function() { return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); };
        var getStackViewerDefaultX = function() { return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); };
        var getStackViewerDefaultY = function() { return (window.innerHeight - Math.ceil(window.innerHeight/4)); };
        var getTermInfoDefaultY = function() {return 10;};
        var getButtonBarDefaultX = function() { return (Math.ceil(window.innerWidth / 2) - 175); };
        var getButtonBarDefaultY = function() { return 10; };

        // VFB initialization routines
        window.initVFB = function () {

        //Tutorial component initialization
        GEPPETTO.ComponentFactory.addWidget('TUTORIAL', {
            name: 'VFB Tutorial',
            tutorialData: vfbDefaultTutorial,
            isStateless: true,
            closeByDefault : true,
            tutorialMessageClass : "tutorialMessage",
            showMemoryCheckbox: false
        }, function() {
            GEPPETTO.Tutorial.setPosition(100, 70);
            // temporary load from dropbox as it's reliable (raw github is not) till we add ability to load local files for tutorial
            GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json");
            GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json");
            GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json");
            GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json");
        });
        
        //Control panel initialization
        GEPPETTO.ComponentFactory.addComponent('CONTROLPANEL', {enableInfiniteScroll: true}, document.getElementById("controlpanel"), function () {
            // CONTROLPANEL configuration
            // set column meta - which custom controls to use, source configuration for data, custom actions
            var controlPanelColMeta = [
                {
                    "columnName": "path",
                    "order": 1,
                    "locked": false,
                    "displayName": "Path",
                    "source": "$entity$.getPath()"
                },
                {
                    "columnName": "name",
                    "order": 2,
                    "locked": false,
                    "customComponent": GEPPETTO.LinkComponent,
                    "displayName": "Name",
                    "source": "$entity$.getName()",
                    "actions": "setTermInfo($entity$['$entity$' + '_meta'], $entity$.getName());"
                },
                {
                    "columnName": "type",
                    "order": 3,
                    "locked": false,
                    "customComponent": GEPPETTO.LinkArrayComponent,
                    "displayName": "Type",
                    "source": "$entity$.$entity$_meta.getTypes().map(function (t) {return t.type.getInitialValue().value})",
                    "actions": "window.fetchVariableThenRun('$entity$', window.setTermInfoCallback);",
                },
                {
                    "columnName": "controls",
                    "order": 4,
                    "locked": false,
                    "customComponent": GEPPETTO.ControlsComponent,
                    "displayName": "Controls",
                    "cssClassName": "controlpanel-controls-column",
                    "source": "",
                    "actions": "GEPPETTO.ControlPanel.refresh();"
                },
                {
                    "columnName": "image",
                    "order": 5,
                    "locked": false,
                    "customComponent": GEPPETTO.ImageComponent,
                    "displayName": "Image",
                    "cssClassName": "img-column",
                    "source": "GEPPETTO.ModelFactory.getAllVariablesOfMetaType($entity$.$entity$_meta.getType(), 'ImageType')[0].getInitialValues()[0].value.data"
                }
                if (Instances.getInstance(entityPath).setColor != undefined){
                	Instances.getInstance(entityPath).setColor(colours[c], true).setOpacity(0.3, true);
                	try {
                        Instances.getInstance(entityPath)[entityPath + '_swc'].setOpacity(1.0);
                    } catch (ignore) {
                    }
                    if (c = 0) {
                        Instances.getInstance(entityPath).setOpacity(0.2, true);
                    }
                }else{
                	console.log('Issue setting colour for ' + entityPath);
                }
            };

            // button bar helper method
            window.addButtonBar = function() {
                var buttonBarConfig = {
                    "searchBtn": {
                        "actions": [
                            "GEPPETTO.Spotlight.open();"
                        ],
                        "icon": "fa fa-search",
                        "label": "",
                        "tooltip": "Search"
                    },
                    "controlPanelBtn": {
                        "actions": [
                            "GEPPETTO.ControlPanel.open();"
                        ],
                        "icon": "fa fa-list",
                        "label": "",
                        "tooltip": "Control Panel"
                    },
                    "queryBtn": {
                        "actions": [
                            "GEPPETTO.QueryBuilder.open();"
                        ],
                        "icon": "gpt-query",
                        "label": "",
                        "tooltip": "Open Query"
                    },
                    "infoBtn": {
                        "actions": [
                            "window.addTermInfo();"
                        ],
                        "icon": "fa fa-info",
                        "label": "",
                        "tooltip": "Show term info"
                    },
                    "stackBtn": {
                        "actions": [
                            "window.addStackWidget();"
                        ],
                        "icon": "gpt-stack",
                        "label": "",
                        "tooltip": "Show stack viewer"
                    },
                    "meshBtn": {
                        "condition": "Canvas1.getWireframe();",
                        "false": {
                            "actions": [
                                "Canvas1.setWireframe(!Canvas1.getWireframe());"
                            ],
                            "icon": "gpt-sphere_solid",
                            "label": "",
                            "tooltip": "Show wireframe"
                        },
                        "true": {
                            "actions": [
                                "Canvas1.setWireframe(!Canvas1.getWireframe());"
                            ],
                            "icon": "gpt-sphere_wireframe-jpg",
                            "label": "",
                            "tooltip": "Hide wireframe"
                        }
                    },
                    "tutorialBtn": {
                        "actions": [
                            "G.toggleTutorial();"
                        ],
                        "icon": "fa fa-leanpub",
                        "label": "",
                        "tooltip": "Open tutorial"
                    }
                };

                GEPPETTO.ComponentFactory.addWidget('BUTTONBAR', {configuration: buttonBarConfig}, function () {
                    ButtonBar1 = this;
                    this.setPosition(getButtonBarDefaultX(), getButtonBarDefaultY());
                    this.showCloseButton(false);
                    this.showTitleBar(false);
                    this.setClass('transparent');
                    this.setResizable(false);
                    this.setMinSize(0, 0);
                    this.setAutoWidth();
                    this.setAutoHeight();
                });
            };

            // term info helper method
            window.addTermInfo = function(){
                if(window.termInfoPopupId == undefined || (window.termInfoPopupId != undefined && window[window.termInfoPopupId] == undefined)) {
                    // init empty term info area
                    G.addWidget(1, {isStateless: true}).then(
                        w => {
                            window.termInfoPopup = w;
                            window.termInfoPopup.setName('Click on image to show info').addCustomNodeHandler(customHandler, 'click');
                            window.termInfoPopup.setPosition(getTermInfoDefaultX(), getTermInfoDefaultY());
                            window.termInfoPopup.setSize(getTermInfoDefaultHeight(), getTermInfoDefaultWidth());
                            window.termInfoPopupId = window.termInfoPopup.getId();
                            window.termInfoPopup.setTransparentBackground(false);
                            window.termInfoPopup.showHistoryNavigationBar(true);
                            $('.ui-dialog-titlebar-minimize').hide(); //hide all minimize buttons

                            window[window.termInfoPopupId].$el.bind('restored', function(event,id) {
                                if(id == window.termInfoPopupId){
                                    if(window[window.termInfoPopupId] != undefined) {
                                        window.termInfoPopup.setSize(getTermInfoDefaultHeight(), getTermInfoDefaultWidth());
                                        window.termInfoPopup.setPosition(getTermInfoDefaultX(), getTermInfoDefaultY());
                                    }
                                }
                            });

                            var buttonBarConfiguration={
                                "Events" : ["color:set","experiment:selection_changed","experiment:visibility_changed"],
                                "filter" : function(instancePath){
                                    return Instances.getInstance(instancePath).getParent()
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
                                            "icon": "gpt-shapeshow",
                                            "label": "Hidden",
                                            "tooltip": "Show 3D Volume"
                                        },
                                        "true": {
                                            "id": "visibility_obj",
                                            "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                                            "icon": "gpt-shapehide",
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
                                            "icon": "gpt-3dshow",
                                            "label": "Hidden",
                                            "tooltip": "Show 3D Skeleton"
                                        },
                                        "true": {
                                            "id": "visibility_swc",
                                            "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                                            "icon": "gpt-3dhide",
                                            "label": "Visible",
                                            "tooltip": "Hide 3D Skeleton"
                                        }
                                    },
                                    "delete": {
                                        "showCondition": "$instance$.getId()!=window.templateID",
                                        "id": "delete",
                                        "actions": ["$instance$.deselect();$instance$.delete();setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());"],
                                        "icon": "fa-trash-o",
                                        "label": "Delete",
                                        "tooltip": "Delete"
                                    }
                                }
                            };
                            window.termInfoPopup.setButtonBarControls({"VisualCapability": ['select', 'color', 'visibility_obj', 'visibility_swc', 'zoom', 'delete']});
                            window.termInfoPopup.setButtonBarConfiguration(buttonBarConfiguration);
                            window.termInfoPopup.setSize(getTermInfoDefaultHeight(), getTermInfoDefaultWidth());
                            window.termInfoPopup.setHelpInfo(termHelpInfo);

                        }
                    );
                } else {
                    window.vfbWindowResize();
                    $('#' + window.termInfoPopupId).parent().effect('shake', {distance:5, times: 3}, 500);
                }
            };

            // custom handler for resolving 3d geometries
            window.resolve3D = function (path, callback) {
                var rootInstance = Instances.getInstance(path);
                window.updateHistory(rootInstance.getName());
                GEPPETTO.SceneController.deselectAll();

                // check if we can set templateID (first template loaded will be kept as templateID)
                if(window.templateID == undefined){
                    var superTypes = rootInstance.getType().getSuperType();
                    for(var i=0; i<superTypes.length; i++){
                        if(superTypes[i].getId() == 'Template'){
                            window.templateID = rootInstance.getId();
                        }
                    }
                } else {
                    // check if the user is adding to the scene something belonging to another template
                    var superTypes = rootInstance.getType().getSuperType();
                    var templateID = "unknown";
                    for(var i=0; i<superTypes.length; i++){
                        if(superTypes[i].getId() == window.templateID){
                            templateID = superTypes[i].getId()
                        }
                        if(superTypes[i].getId() == 'Class'){ 
                            templateID = window.templateID;
                            return; // Exit if Class - Class doesn't have image types.
                        }
                    }
                    
                    var meta = rootInstance[rootInstance.getId() + '_meta'];
                    if(meta != undefined){
                        if (typeof meta.getType().template != "undefined"){
                            var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
                            var domObj = $(templateMarkup);
                            var anchorElement = domObj.filter('a');
                            // extract ID
                            var templateID = anchorElement.attr('instancepath');
                            if (window.EMBEDDED){
                            	var curHost = parent.document.location.host;
                            	var curProto = parent.document.location.protocol;
                            }else{
                            	var curHost = document.location.host;
                            	var curProto = document.location.protocol;
                            }
                            if(templateID != window.templateID){
                                // open new window with the new template and the instance ID
                                var targetWindow = '_blank';
                                var newUrl = window.redirectURL.replace(/\$VFB_ID\$/gi, rootInstance.getId()).replace(/\$TEMPLATE\$/gi, templateID).replace(/\$HOST\$/gi, curHost).replace(/\$PROTOCOL\$/gi, curProto);
                                window.open(newUrl, targetWindow);
                                // stop flow here, we don't want to add to scene something with a different template
                                return;
                            }
                        }
                    }
                }

                var instance = undefined;
                // check if we have swc
                try {
                    instance = Instances.getInstance(path + "." + path + "_swc");
                } catch (ignore) {
                }
                // if no swc check if we have obj
                if (instance == undefined) {
                    try {
                        instance = Instances.getInstance(path + "." + path + "_obj");
                    } catch (ignore) {
                    }
                }
                // if anything was found resolve type (will add to scene)
                if (instance != undefined) {
                    var postResolve = function () {
                        setSepCol(path);
                        if (callback != undefined) {
                            callback();
                        }
                    };

                    if(instance.getType() instanceof ImportType) {
                        instance.getType().resolve(postResolve);
                    } else {
                        // add instance to scene
                        vfbCanvas.display([instance]);
                        // trigger update for components that are listening
                        GEPPETTO.trigger(GEPPETTO.Events.Instances_created, [instance]);
                        postResolve();
                    }
                }

                // independently from the above, check if we have slices for the instance
                try {
                    instance = Instances.getInstance(path + "." + path + "_slices");
                    if(instance.getType() instanceof ImportType){
                        instance.getType().resolve();
                    }
                } catch (ignore) {
                    // any alternative handling goes here
                }
            };

            window.fetchVariableThenRun = function(variableId, callback, label){
                GEPPETTO.SceneController.deselectAll(); // signal something is happening!
                var variables = GEPPETTO.ModelFactory.getTopLevelVariablesById([variableId]);
                if (!variables.length>0) {
                    Model.getDatasources()[0].fetchVariable(variableId, function() {
                        callback(variableId, label);
                    });
                } else {
                    callback(variableId, label);
                }
            };

            window.addToSceneCallback = function(variableId){
                var instance = Instances.getInstance(variableId);
                var meta = Instances.getInstance(variableId + '.' + variableId + '_meta');
                resolve3D(variableId, function() {
                    GEPPETTO.SceneController.deselectAll();
                    instance.select();
                    //GEPPETTO.Spotlight.openToInstance(instance);
                    setTermInfo(meta, meta.getParent().getId());
                });
            };
            
            window.addToQueryCallback = function(variableId, label) {
            	window.clearQS();
            	GEPPETTO.QueryBuilder.clearAllQueryItems();
                GEPPETTO.QueryBuilder.switchView(false);
                GEPPETTO.QueryBuilder.addQueryItem({
                    term: (label != undefined) ? label :  eval(variableId).getName(),
                    id: variableId
                });
                GEPPETTO.QueryBuilder.open();
            };

            window.setTermInfoCallback = function(variableId){
                var instance = Instances.getInstance(variableId + '.' + variableId + '_meta');
                setTermInfo(instance, instance.getParent().getId());
            };

            // custom handler for term info clicks
            window.customHandler = function (node, path, widget) {
                var n;
                var otherId;
                var otherName;
                try {
                    n = eval(path);
                } catch (ex) {
                    node = undefined;
                }
                var meta = path + "." + path + "_meta";
                var target = widget;
                // if (GEPPETTO.isKeyPressed("meta")) {
                //  target = G.addWidget(1, {isStateless: true}).addCustomNodeHandler(customHandler, 'click');
                //}
                if (n != undefined) {
                    var metanode = Instances.getInstance(meta);
                    if (target.data == metanode){
                    	window.resolve3D(path);
                    }else{
                    	target.setData(metanode).setName(n.getName());
                    }
                } else {
                	// check for passed ID:
                	if (path.indexOf(',')>-1){
                		otherId = path.split(',')[1];
                		otherName = path.split(',')[2];
                		path = path.split(',')[0];
                	}
                    // try to evaluate as path in Model
                    var entity = Model[path];
                    if(entity instanceof Query){
                        GEPPETTO.trigger('spin_logo');
                        $("body").css("cursor", "progress");

                        // clear query builder
                        GEPPETTO.QueryBuilder.clearAllQueryItems();

                        var callback = function(){
                            // check if any results with count flag
                            if(GEPPETTO.QueryBuilder.props.model.count > 0){
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
                        if (otherId == undefined) {
                        	GEPPETTO.QueryBuilder.addQueryItem({ term: widget.name, id: widget.data.split('.')[0], queryObj: entity}, callback);
                        }else{
                        	if (window[otherId] == undefined){
                        		window.fetchVariableThenRun(otherId, function(){GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity}, callback)});
                        	}else{
                        		GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity}, callback);
                        	}
                        }
                    } else {
                        Model.getDatasources()[0].fetchVariable(path, function () {
                            Instances.getInstance(meta);
                            target.setData(eval(meta)).setName(eval(path).getName());
                            resolve3D(path);
                        });
                    }
                }
          
            };
            
            // set term info on selection
            GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
                var selection = GEPPETTO.SceneController.getSelection();
                if (selection.length > 0 && instance.isSelected()) {
                    var latestSelection = instance;
                    var currentSelectionName = "";
                    if (window.getTermInfoWidget() != undefined) {
                    	currentSelectionName = window.getTermInfoWidget().name;
                    }
                    if(latestSelection.getChildren().length > 0){
                        // it's a wrapper object - if name is different from current selection set term info
                        if(currentSelectionName != latestSelection.getName()) {
                            setTermInfo(latestSelection[latestSelection.getId() + "_meta"], latestSelection[latestSelection.getId() + "_meta"].getName());
                        }
                    } else {
                        // it's a leaf (no children) / grab parent if name is different from current selection set term info
                        var parent = latestSelection.getParent();
                        if(parent != null && currentSelectionName != parent.getName()){
                            setTermInfo(parent[parent.getId() + "_meta"], parent[parent.getId() + "_meta"].getName());
                        }
                    }
                }
                if (window.StackViewer1 != undefined){
                    updateStackWidget();
                }
            });

            // stack widget helper methods
            var getSliceInstances = function(){
                var potentialInstances = GEPPETTO.ModelFactory.getAllPotentialInstancesEndingWith('_slices');
                var sliceInstances = [];
                var instance;
                for(var i=0; i<potentialInstances.length; i++){
                    instance = Instances.getInstance(potentialInstances[i],false);
                    if (instance){
                        sliceInstances.push(instance);
                    }
                }

                return sliceInstances;
            };

            var updateStackWidget = function(){
            	window.checkConnection();
            	console.log('Updating stack...');
                window.StackViewer1.setData({
                    instances: getSliceInstances()
                });
            };

            window.addStackWidget = function(){
                var sliceInstances = getSliceInstances();

                if (window.StackViewer1 == undefined){
                    var config;
                    var domainId = [];
                    var domainName = [];
                    if (typeof sliceInstances[0] !== "undefined"){
                        config = JSON.parse(sliceInstances[0].getValue().wrappedObj.value.data);
                    }
                    if (config == undefined || typeof config !== "undefined"){
                    	config = {
                                serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
                                templateId: 'NOTSET'
                            };
                    }
                    G.addWidget(8, {isStateless: true}).then(
                        w => {
                            window.StackViewer1 = w;

                            window.StackViewer1.setConfig(config).setData({
                                instances: sliceInstances
                            });

                            // set canvas if it's already there
                            if(window.vfbCanvas != undefined){
                                window.StackViewer1.setCanvasRef(window.vfbCanvas);
                            }

                            // set initial position:
                            window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
                            window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                            window.StackViewer1.setName('Slice Viewer');
                            window.StackViewer1.showHistoryIcon(false);
                            window.StackViewer1.setHelpInfo(stackHelpInfo);
                            window.StackViewer1.setTransparentBackground(false);
                            window.StackViewer1.$el.bind('restored', function(event,id) {
                                if(id == window.StackViewer1.getId()){
                                    if(window.StackViewer1 != undefined) {
                                        window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                                        window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
                                    }
                                }
                            });

                            // on change to instances reload stack:
                            GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function(path){
                                console.log(path.split('.')[0] + ' deleted...');
                                if (window.StackViewer1 != undefined){
                                    if(path!=undefined && path.length > 0){
                                        window.StackViewer1.removeSlice(path);
                                    }else{
                                        console.log('Removing instance issue: ' + path);
                                    }
                                }
                            });
                            GEPPETTO.on(GEPPETTO.Events.Instances_created, function(instances){
                                console.log('Instance created...');

                                if (window.StackViewer1 != undefined){
                                    if(instances!=undefined && instances.length > 0){
                                        var config = {
                                            serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
                                            templateId: window.templateID
                                        };
                                        instances.forEach(function (parentInstance){
                                            parentInstance.parent.getChildren().forEach(function (instance){
                                                if (instance.getName() == 'Stack Viewer Slices'){
                                                    window.StackViewer1.addSlices(instance);
                                                    if (instance.parent.getId() == window.templateID){
                                                        try{
                                                            config=JSON.parse(instance.getValue().wrappedObj.value.data);
                                                            window.StackViewer1.setConfig(config);
                                                        }catch (err){
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
                            GEPPETTO.on(GEPPETTO.Events.Color_set, function(instances){
                                console.log('Colour change...');

                                if (window.StackViewer1 != undefined){
                                    if(instances!=undefined && instances.instance){
                                        if (instances.instance.getType().getMetaType() == 'CompositeType'){
                                            instances.instance.getChildren().forEach(function (instance){if (instance.getName() == 'Stack Viewer Slices'){window.StackViewer1.addSlices(instance)}});
                                        }else if (instances.instance.parent && instances.instance.parent.getType().getMetaType() == 'CompositeType'){
                                            instances.instance.parent.getChildren().forEach(function (instance){if (instance.getName() == 'Stack Viewer Slices'){window.StackViewer1.addSlices(instance)}});
                                        }else{
                                            console.log('Colour setting issue: ' + instances);
                                        }
                                    }else{
                                        console.log('Colour setting issue! ' + instances);
                                    }
                                }
                            });
                            $('.ui-dialog-titlebar-minimize').hide(); //hide all minimize buttons
                        }
                    );
                } else {
                    window.vfbWindowResize();
                    $('#' + window.StackViewer1.getId()).parent().effect('shake', {distance:5, times: 3}, 500);
                }
            };

            // custom sorter for bloodhound
            window.customSorter = function (a, b, InputString) {
                //move exact matches to top
                if (InputString == a.label) {
                    return -1;
                }
                if (InputString == b.label) {
                    return 1;
                }
                //close match without case matching
                if (InputString.toLowerCase() == a.label.toLowerCase()) {
                    return -1;
                }
                if (InputString.toLowerCase() == b.label.toLowerCase()) {
                    return 1;
                }
                //match ignoring joinging nonwords
                Bloodhound.tokenizers.nonword("test thing-here12 34f").join(' ');
                if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ')) {
                    return -1;
                }
                if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ')) {
                    return 1;
                }
                //match against id
                if (InputString.toLowerCase() == a.id.toLowerCase()) {
                    return -1;
                }
                if (InputString.toLowerCase() == b.id.toLowerCase()) {
                    return 1;
                }
                //pick up any match without nonword join character match
                if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
                    return 1;
                }
                if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
                    return -1;
                }
                //also with underscores ignored
                if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
                    return 1;
                }
                if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
                    return -1;
                }
                //if not found in one then advance the other
                if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
                    return 1;
                }
                if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
                    return -1;
                }
                // if the match is closer to start than the other move up
                if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) < b.label.toLowerCase().indexOf(InputString.toLowerCase())) {
                    return -1;
                }
                if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) < a.label.toLowerCase().indexOf(InputString.toLowerCase())) {
                    return 1;
                }
                // if the match in the id is closer to start then move up
                if (a.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.id.toLowerCase().indexOf(InputString.toLowerCase()) < b.id.toLowerCase().indexOf(InputString.toLowerCase())) {
                    return -1;
                }
                if (b.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.id.toLowerCase().indexOf(InputString.toLowerCase()) < a.id.toLowerCase().indexOf(InputString.toLowerCase())) {
                    return 1;
                }
                // move the shorter synonyms to the top
                if (a.label < b.label) {
                    return -1;
                }
                else if (a.label > b.label) {
                    return 1;
                }
                else return 0; // if nothing found then do nothing.
            };

            // term info widget helper methods
            window.getTermInfoWidget = function () {
            	return window[window.termInfoPopupId];
            };

            window.setTermInfo = function (data, name) {
            	window.clearQS();
            	window.checkConnection();
            	//check if to level has been passed:
            	if (data.parent == null){
            		if (data[data.getId()+'_meta'] != undefined){
            			data = data[data.getId()+'_meta'];
            			console.log('meta passed to term info for ' + data.parent.getName());
            		}
            	}
            	if (window.getTermInfoWidget() != undefined){
            		window.getTermInfoWidget().setData(data).setName(name);
            	}
                window.updateHistory(name);
                GEPPETTO.SceneController.deselectAll();
                if (typeof data.getParent().select === "function") 
                {
                    data.getParent().select(); // Select if visual type loaded.
                }
            };

            window.addEventListener('resize', function(event){
            	window.vfbWindowResize();
            });

            window.vfbWindowResize = function() 
            {
            	// reset size and position of term info widget, if any
                if(window[window.termInfoPopupId] != undefined && !window[window.termInfoPopupId].maximize) {
                    window.termInfoPopup.setPosition(getTermInfoDefaultX(), getTermInfoDefaultY());
                    window.termInfoPopup.setSize(getTermInfoDefaultHeight(), getTermInfoDefaultWidth());
                }

                // reset size and position of stack widget, if any
                if(window.StackViewer1 != undefined && !window.StackViewer1.maximize){
                    window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
                    window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                }

                // reset position of button bar widget (always there)
                ButtonBar1.setPosition(getButtonBarDefaultX(), getButtonBarDefaultY());
            };
            
            window.updateHistory = function(title) 
            {
                if (window.vfbUpdatingHistory == false && parent.location.toString().indexOf('virtualflybrain.org') > 0 && parent.location.toString().indexOf('virtualflybrain.org') < 25){
                	window.vfbUpdatingHistory = true;
                	// Update the parent windows history with current instances (i=) and popup selection (id=)
                	var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, Instances);
	                var visualParents = [];
	                for (var i = 0; i < visualInstances.length; i++) {
	                	if (visualInstances[i].getParent() != null){
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
	                
	            	var items='i=';
	            	if (window.templateID)
	            	{
	            		items = items + ',' + window.templateID;
	            	}
	            	compositeInstances.forEach(function(compositeInstance){ if (!items.includes(compositeInstance.getId())){items = items + ',' + compositeInstance.getId()}}); 
	                items = items.replace(',,',',').replace('i=,','i=');
	                try{
	                	items = 'id=' + window.getTermInfoWidget().data.split('.')[0] + '&' + items;
	                }catch (ignore){};
	                if (items != "i="){
	                	parent.history.pushState({}, title, parent.location.pathname + "?" + items);
	                }
	                window.vfbUpdatingHistory = false;
                }
            };
            
            window.addIndCallback = function(variableId){
            	window.checkConnection();
                var instance = Instances.getInstance(variableId);
                var meta = Instances.getInstance(variableId + '.' + variableId + '_meta');
                resolve3D(variableId, function() {
                    GEPPETTO.SceneController.deselectAll();
                    instance.select();
                    setTermInfo(meta, meta.getParent().getId());
                });
            };
            
            window.addVfbId = function(variableId) 
            {
                if (variableId != null){
	            	if (window[variableId] == undefined){
	                	if (variableId.indexOf('VFB_') > -1){
	                		window.fetchVariableThenRun(variableId, window.addToSceneCallback);  
	                	}else{
	                		window.fetchVariableThenRun(variableId, window.setTermInfoCallback);
	                	}
	                }else{
	                	if (variableId.indexOf('VFB_') > -1){
	                		if (window[variableId][variableId+'_obj'] != undefined || window[variableId][variableId+'_swc'] != undefined){ 
	                			if (window[variableId][variableId+'_swc'] != undefined){
	                				if (!window[variableId][variableId+'_swc'].visible && typeof(window[variableId][variableId+'_swc'].show) == "function"){
	                					window[variableId][variableId+'_swc'].show();
	                				}
	                			}else{
	                				if (window[variableId][variableId+'_obj'] != undefined && !window[variableId][variableId+'_obj'].visible && typeof(window[variableId][variableId+'_obj'].show) == "function"){
	                					window[variableId][variableId+'_obj'].show();
	                				}
	                			}
	                			if (window[variableId][variableId+'_meta'] != undefined){
	                				try{window[variableId].select();}catch (ignore){};
	                				var meta = Instances.getInstance(variableId + '.' + variableId + '_meta');
	                    			setTermInfo(meta, variableId);
	                			}else{
	                				window.fetchVariableThenRun(variableId, window.setTermInfoCallback);
	                			}
	                		}
	                	}else{
	                		var instance = Instances.getInstance(variableId);
	                		var meta = Instances.getInstance(variableId + '.' + variableId + '_meta');
	                		setTermInfo(meta, meta.getParent().getId());
	                		window.resolve3D(variableId);
	                	}
	                }
                }
            };
		
            window.stackViewerRequest = function(variableId) 
            {
	    		window.addVfbIds([variableId]);   
            };

            window.clearQS = function() {
            	window.checkConnection();
            	if (GEPPETTO.Spotlight)
                {
            		$("#spotlight").hide();
                	$('#spotlight #typeahead')[0].placeholder = "Search for the item you're interested in...";
                }
                if (GEPPETTO.QueryBuilder)
                {
                	GEPPETTO.QueryBuilder.close();
                }
            };
            
            window.checkConnection = function() {
            	try{
	            	if (GEPPETTO.MessageSocket.socket.readyState == WebSocket.CLOSED && window.vfbRelaodMessage)
	            	{
	            		window.vfbRelaodMessage = false;
	            		if (confirm("Sorry but your connection to our servers has timed out. \nClick OK to reconnect and reload your current items or click Cancel to do nothing."))
	            		{
	            			location.reload();
	            		}
	            	}
            	}
            	catch(err)
            	{
            		console.log(err.message);
            	}
            };
            
            window.vfbRelaodMessage = true;
            
            if (window.vfbLoadBuffer == undefined){
            	window.vfbLoadBuffer = [];
            	window.vfbLoading = "";
            }
            
            window.addVfbIds = function(variableIds)
            {
                if (window.canvasAvilable){

                    for (i in variableIds){
                        if ($.inArray(variableIds[i], window.vfbLoadBuffer) < 0 || i == 0){
                            window.vfbLoadBuffer.push(variableIds[i]);
                        }
                    }
                    if (window.vfbLoadBuffer.length > 0){
                        GEPPETTO.trigger('spin_logo');
                    }else{
                        GEPPETTO.trigger('stop_spin_logo');
                    }
                    if (window.vfbLoading == ""){
                        for (i in window.vfbLoadBuffer){
                            if (window[window.vfbLoadBuffer[0]] != undefined){
                                window.vfbLoading=window.vfbLoadBuffer.splice(0,1)[0];
                                window.addVfbId(window.vfbLoading);
                                setTimeout(window.addVfbIds, 100);
                                break;
                            }else{
                                window.vfbLoading = window.vfbLoadBuffer[i];
                                window.vfbLoadBuffer.splice($.inArray(window.vfbLoading, window.vfbLoadBuffer),1);
                                window.vfbLoadingTimeout = 60;
                                window.addVfbId(window.vfbLoading);
                                setTimeout(window.addVfbIds, 500);
                                break;
                            }
                        }
                        window.updateHistory("Loading...");
                    }else{
                        if (window[window.vfbLoading] != undefined){
                            window.vfbLoading = "";
                            setTimeout(window.addVfbIds, 100);
                        }else{
                            window.vfbLoadingTimeout--
                            if (window.vfbLoadingTimeout < 1){
                                console.log("Failed to load " + window.vfbLoading + " in time");
                                window.vfbLoading = "";
                                window.checkConnection();
                                if (window.vfbLoadBuffer.length > 0){
                                    setTimeout(window.addVfbIds, 250);
                                }
                            }else{
                                setTimeout(window.addVfbIds, 500);
                            }
                        }
                    }

                }else{
                    setTimeout(function(){window.addVfbIds(variableIds);}, 1000);
                }
            }

            /*ADD COMPONENTS*/

            // github logo
            GEPPETTO.ComponentFactory.addComponent('LINKBUTTON', { left: 41, top: 320, icon: 'fa-github', url: 'https://github.com/VirtualFlyBrain/VFB2'}, document.getElementById("github-logo"));

            //Logo initialization
            GEPPETTO.ComponentFactory.addComponent('LOGO', {logo: 'gpt-fly'}, document.getElementById("geppettologo"));

            //Tutorial component initialization
            GEPPETTO.ComponentFactory.addWidget('TUTORIAL', {
                name: 'VFB Tutorial',
                tutorialData: vfbDefaultTutorial,
                isStateless: true,
                closeByDefault : true,
                tutorialMessageClass : "tutorialMessage",
                showMemoryCheckbox: false
            }, function() {
                // temporary load from dropbox as it's reliable (raw github is not) till we add ability to load local files for tutorial
                GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json");
                GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json");
                GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json");
                GEPPETTO.Tutorial.addTutorial("/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json");
            });

            //Control panel initialization
            GEPPETTO.ComponentFactory.addComponent('CONTROLPANEL', {enableInfiniteScroll: true}, document.getElementById("controlpanel"), function () {
                // CONTROLPANEL configuration
                // set column meta - which custom controls to use, source configuration for data, custom actions
                var controlPanelColMeta = [
                    {
                        "columnName": "path",
                        "order": 1,
                        "locked": false,
                        "displayName": "Path",
                        "source": "$entity$.getPath()"
                    },
                    {
                        "columnName": "name",
                        "order": 2,
                        "locked": false,
                        "customComponent": GEPPETTO.LinkComponent,
                        "displayName": "Name",
                        "source": "$entity$.getName()",
                        "actions": "setTermInfo($entity$['$entity$' + '_meta'], $entity$.getName());"
                    },
                    {
                        "columnName": "type",
                        "order": 3,
                        "locked": false,
                        "customComponent": GEPPETTO.LinkArrayComponent,
                        "displayName": "Type",
                        "source": "$entity$.$entity$_meta.getTypes().map(function (t) {return t.type.getInitialValue().value})",
                        "actions": "window.fetchVariableThenRun('$entity$', window.setTermInfoCallback);",
                    },
                    {
                        "columnName": "controls",
                        "order": 4,
                        "locked": false,
                        "customComponent": GEPPETTO.ControlsComponent,
                        "displayName": "Controls",
                        "cssClassName": "controlpanel-controls-column",
                        "source": "",
                        "actions": "GEPPETTO.ControlPanel.refresh();"
                    },
                    {
                        "columnName": "image",
                        "order": 5,
                        "locked": false,
                        "customComponent": GEPPETTO.ImageComponent,
                        "displayName": "Image",
                        "cssClassName": "img-column",
                        "source": "GEPPETTO.ModelFactory.getAllVariablesOfMetaType($entity$.$entity$_meta.getType(), 'ImageType')[0].getInitialValues()[0].value.data"
                    }
                ];
                GEPPETTO.ControlPanel.setColumnMeta(controlPanelColMeta);
                // which columns to display
                GEPPETTO.ControlPanel.setColumns(['name', 'type', 'controls', 'image']);
                // which instances to display in the control panel
                GEPPETTO.ControlPanel.setDataFilter(function (entities) {
                    var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, entities);
                    var visualParents = [];
                    for (var i = 0; i < visualInstances.length; i++) {
                        if (visualInstances[i].getParent() != null){
                            visualParents.push(visualInstances[i].getParent());
                        }
                    }
                    visualInstances = visualInstances.concat(visualParents);
                    var compositeInstances = [];
                    for (var i = 0; i < visualInstances.length; i++) {
                        if (visualInstances[i].getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
                            compositeInstances.push(visualInstances[i]);
                        }
                    }
                    return compositeInstances;
                });
                // custom controls configuration in the controls column
                GEPPETTO.ControlPanel.setControlsConfig({
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
                                "icon": "gpt-shapeshow",
                                "label": "Hidden",
                                "tooltip": "Show 3D Volume"
                            },
                            "true": {
                                "id": "visibility_obj",
                                "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                                "icon": "gpt-shapehide",
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
                                "icon": "gpt-3dshow",
                                "label": "Hidden",
                                "tooltip": "Show 3D Skeleton"
                            },
                            "true": {
                                "id": "visibility_swc",
                                "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                                "icon": "gpt-3dhide",
                                "label": "Visible",
                                "tooltip": "Hide 3D Skeleton"
                            }
                        },
                    },
                    "Common": {
                        "info": {
                            "id": "info",
                            "actions": ["var displayTxt = '$instance$'.split('.')['$instance$'.split('.').length - 1]; setTermInfo($instance$[displayTxt + '_meta'], displayTxt);"],
                            "icon": "fa-info-circle",
                            "label": "Info",
                            "tooltip": "Info"
                        },
                        "delete": {
                            "showCondition": "$instance$.getId()!=window.templateID",
                            "id": "delete",
                            "actions": ["if($instance$.getPath() == ((window.termInfoPopup.data != undefined) ? eval(window.termInfoPopup.data).getParent().getPath() : undefined)) { setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());} $instance$.deselect(); $instance$.delete();"],
                            "icon": "fa-trash-o",
                            "label": "Delete",
                            "tooltip": "Delete"
                        }
                    }
                });
                // which controls will be rendered, strings need to match ids in the controls configuration
                GEPPETTO.ControlPanel.setControls({
                    "Common": ['info', 'delete'],
                    "VisualCapability": ['select', 'color', 'visibility', 'zoom', 'visibility_obj', 'visibility_swc']
                });
            });

            //Spotlight initialization
            GEPPETTO.ComponentFactory.addComponent('SPOTLIGHT', {indexInstances: false}, document.getElementById("spotlight"), function () {
                // SPOTLIGHT configuration
                var spotlightConfig = {
                    "SpotlightBar": {
                        "DataSources": {},
                        "CompositeType": {
                            "type": {
                                "actions": [
                                    "setTermInfo($variableid$['$variableid$' + '_meta'],'$variableid$');GEPPETTO.Spotlight.close();",
                                ],
                                "icon": "fa-info-circle",
                                "label": "Show info",
                                "tooltip": "Show info"
                            },
                            "query": {
                                actions: [
                                    "window.fetchVariableThenRun('$variableid$', window.addToQueryCallback);"
                                ],
                                icon: "fa-quora",
                                label: "Add to query",
                                tooltip: "Add to query"
                            },
                        },
                        "VisualCapability": {
                            "buttonOne": {
                                "condition": "GEPPETTO.SceneController.isSelected($instances$)",
                                "false": {
                                    "actions": ["GEPPETTO.SceneController.select($instances$)"],
                                    "icon": "fa-hand-stop-o",
                                    "label": "Unselected",
                                    "tooltip": "Select"
                                },
                                "true": {
                                    "actions": ["GEPPETTO.SceneController.deselect($instances$)"],
                                    "icon": "fa-hand-rock-o",
                                    "label": "Selected",
                                    "tooltip": "Deselect"
                                },
                            },
                            "buttonTwo": {
                                "condition": "GEPPETTO.SceneController.isVisible($instances$)",
                                "false": {
                                    "actions": [
                                        "GEPPETTO.SceneController.show($instances$)"
                                    ],
                                    "icon": "fa-eye-slash",
                                    "label": "Hidden",
                                    "tooltip": "Show"
                                },
                                "true": {
                                    "actions": [
                                        "GEPPETTO.SceneController.hide($instances$)"
                                    ],
                                    "icon": "fa-eye",
                                    "label": "Visible",
                                    "tooltip": "Hide"
                                }

                            },
                            "buttonThree": {
                                "actions": [
                                    "GEPPETTO.SceneController.zoomTo($instances$);GEPPETTO.Spotlight.close();"
                                ],
                                "icon": "fa-search-plus",
                                "label": "Zoom",
                                "tooltip": "Zoom"
                            },
                        }
                    }
                };
                GEPPETTO.Spotlight.setButtonBarConfiguration(spotlightConfig);
                // external datasource configuration
                var spotlightDataSourceConfig = {
                    VFB: {
                        url: "https://www.virtualflybrain.org/search/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(fbbt)&fq=is_obsolete:false&fq=shortform_autosuggest:VFB_*%20OR%20shortform_autosuggest:FB*&rows=250&bq=is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true",
                        crossDomain: true,
                        id: "short_form",
                        label: {field: "label", formatting: "$VALUE$"},
                        explode_fields: [{field: "short_form", formatting: "$VALUE$ ($LABEL$)"}],
                        explode_arrays: [{field: "synonym", formatting: "$VALUE$ ($LABEL$)"}],
                        type: {
                            class: {
                                icon: "fa-file-text-o",
                                buttons: {
                                    buttonOne: {
                                        actions: ["window.fetchVariableThenRun('$ID$', window.setTermInfoCallback);"],
                                        icon: "fa-info-circle",
                                        label: "Show info",
                                        tooltip: "Show info"
                                    },
                                    buttonTwo: {
                                        actions: ["window.fetchVariableThenRun('$ID$', window.addToQueryCallback, '$LABEL$');"],
                                        icon: "fa-quora",
                                        label: "Add to query",
                                        tooltip: "Add to query"
                                    }
                                }
                            },
                            individual: {
                                icon: "fa-file-image-o",
                                buttons: {
                                    buttonOne: {
                                        actions: ["window.fetchVariableThenRun('$ID$', window.setTermInfoCallback);"],
                                        icon: "fa-info-circle",
                                        label: "Show info",
                                        tooltip: "Show info"
                                    },
                                    buttonTwo: {
                                        actions: ["window.fetchVariableThenRun('$ID$', window.addToSceneCallback);"],
                                        icon: "fa-file-image-o",
                                        label: "Add to scene",
                                        tooltip: "Add to scene"
                                    },
                                    buttonThree: {
                                        actions: ["window.fetchVariableThenRun('$ID$', window.addToQueryCallback, '$LABEL$');"],
                                        icon: "fa-quora",
                                        label: "Add to query",
                                        tooltip: "Add to query"
                                    }
                                }
                            }
                        },
                        bloodhoundConfig: {
                            datumTokenizer: function (d) {
                                return Bloodhound.tokenizers.nonword(d.label.replace('_', ' '));
                            },
                            queryTokenizer: function (q) {
                                return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
                            },
                            sorter: function (a, b) {
                                var term = $('#typeahead').val();
                                return customSorter(a, b, term);
                            }
                        }
                    }
                };
                GEPPETTO.Spotlight.addDataSource(spotlightDataSourceConfig);
            });

            //Query control initialization
            GEPPETTO.ComponentFactory.addComponent('QUERY', {enableInfiniteScroll: true}, document.getElementById("querybuilder"), function () {
                // QUERY configuration
                var queryResultsColMeta = [
                    {
                        "columnName": "id",
                        "order": 1,
                        "locked": false,
                        "visible": true,
                        "displayName": "ID",
                    },
                    {
                        "columnName": "name",
                        "order": 2,
                        "locked": false,
                        "visible": true,
                        "customComponent": GEPPETTO.QueryLinkComponent,
                        "actions": "window.fetchVariableThenRun('$entity$', function(){ var instance = Instances.getInstance('$entity$.$entity$_meta'); setTermInfo(instance, instance.getParent().getName());});",
                        "displayName": "Name",
                        "cssClassName": "query-results-name-column",
                    },
                    {
                        "columnName": "description",
                        "order": 3,
                        "locked": false,
                        "visible": true,
                        "displayName": "Definition",
                        "cssClassName": "query-results-description-column"
                    },
                    {
                        "columnName": "type",
                        "order": 4,
                        "locked": false,
                        "visible": true,
                        "displayName": "Type",
                        "cssClassName": "query-results-type-column"
                    },
                    {
                        "columnName": "controls",
                        "order": 5,
                        "locked": false,
                        "visible": false,
                        "customComponent": GEPPETTO.QueryResultsControlsComponent,
                        "displayName": "Controls",
                        "actions": "",
                        "cssClassName": "query-results-controls-column"
                    },
                    {
                        "columnName": "images",
                        "order": 6,
                        "locked": false,
                        "visible": true,
                        "customComponent": GEPPETTO.SlideshowImageComponent,
                        "displayName": "Images",
                        "actions": "window.fetchVariableThenRun('$entity$', function () { var meta = '$entity$' + '.' + '$entity$' + '_meta'; var inst = Instances.getInstance(meta); setTermInfo(inst, $entity$.getName()); resolve3D('$entity$'); });",
                        "cssClassName": "query-results-images-column"
                    }
                ];
                GEPPETTO.QueryBuilder.setResultsColumnMeta(queryResultsColMeta);
                // which columns to display in the results
                GEPPETTO.QueryBuilder.setResultsColumns(['name', 'description', 'type', 'images']);

                var queryResultsControlConfig = {
                    "Common": {
                        "info": {
                            "id": "info",
                            "actions": [
                                "window.fetchVariableThenRun('$ID$', window.setTermInfoCallback);"
                            ],
                            "icon": "fa-info-circle",
                            "label": "Info",
                            "tooltip": "Info"
                        },
                        "flybase": {
                            "showCondition": "'$ID$'.startsWith('FBbt')",
                            "id": "flybase",
                            "actions": [
                                "window.open('http://flybase.org/cgi-bin/cvreport.html?rel=is_a&id=' + '$ID$'.replace(/_/g, ':'), '_blank').focus()"
                            ],
                            "icon": "gpt-fly",
                            "label": "FlyBase",
                            "tooltip": "FlyBase Term"
                        },
                        "flybase": {
                            "showCondition": "('$ID$'.startsWith('FB') && !'$ID$'.startsWith('FBbt'))",
                            "id": "flybase",
                            "actions": [
                                "window.open('http://flybase.org/reports/' + '$ID$'.replace(/_/g, ':'), '_blank').focus()"
                            ],
                            "icon": "gpt-fly",
                            "label": "FlyBase",
                            "tooltip": "FlyBase Report"
                        }
                    }
                };
                GEPPETTO.QueryBuilder.setResultsControlsConfig(queryResultsControlConfig);

                // add datasource config to query control
                var queryBuilderDatasourceConfig = {
                    VFB: {
                        url: "https://www.virtualflybrain.org/search/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(fbbt)&fq=is_obsolete:false&fq=shortform_autosuggest:VFB_*%20OR%20shortform_autosuggest:FBbt_*&rows=250&bq=is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true",
                        crossDomain: true,
                        id: "short_form",
                        label: {field: "label", formatting: "$VALUE$"},
                        explode_fields: [{field: "short_form", formatting: "$VALUE$ ($LABEL$)"}],
                        explode_arrays: [{field: "synonym", formatting: "$VALUE$ ($LABEL$)"}],
                        type: {
                            class: {
                                actions: ["window.fetchVariableThenRun('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); });"],
                                icon: "fa-dot-circle-o"
                            },
                            individual: {
                                actions: ["window.fetchVariableThenRun('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); });"],
                                icon: "fa-square-o"
                            }
                        },
                        queryNameToken: '$NAME',
                        resultsFilters: {
                            getId: function (record) {
                                return record[0]
                            },
                            getName: function (record) {
                                return record[1]
                            },
                            getDescription: function (record) {
                                return record[2]
                            },
                            getType: function (record) {
                                return record[3]
                            },
                            getImageData: function (record) {
                                return record[4]
                            },
                            getRecords: function (payload) {
                                return payload.results.map(function (item) {
                                    return item.values
                                })
                            }
                        },
                        bloodhoundConfig: {
                            datumTokenizer: function (d) {
                                return Bloodhound.tokenizers.nonword(d.label.replace('_', ' '));
                            },
                            queryTokenizer: function (q) {
                                return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
                            },
                            sorter: function (a, b) {
                                var term = $("#query-typeahead").val();
                                return customSorter(a, b, term);
                            }
                        }
                    }
                };
                GEPPETTO.QueryBuilder.addDataSource(queryBuilderDatasourceConfig);
            });

            //Canvas initialisation
            window.vfbCanvas = undefined;
            GEPPETTO.ComponentFactory.addComponent('CANVAS', {}, document.getElementById("sim"), function () {
                this.flipCameraY();
                this.flipCameraZ();
                this.setWireframe(true);
                this.displayAllInstances();
                window.vfbCanvas = this;

                if(window.StackViewer1 != undefined){
                    window.StackViewer1.setCanvasRef(this);
                }

                // button bar needs the canvas to setup the wireframe button
                window.addButtonBar();
                // add term info
                window.addTermInfo();
                // unlock loading
                window.canvasAvilable = true;

            });

        };

        GEPPETTO.on(GEPPETTO.Events.Experiment_loaded, function(){
        	//Until the experiment is loaded we can't load any widgets (which the init function does)
        	window.initVFB();	
            // init stack viewer
            window.addStackWidget();

        });
        
        //In case the experiment was loaded before this extension was loaded
        if(window.Project!= undefined && window.Project.getActiveExperiment()!=null){
        	window.initVFB();	
            // init stack viewer
            window.addStackWidget();
        }
    };
});
