/*******************************************************************************
 *
 * Copyright (c) 2011, 2016 OpenWorm.
 * http://openworm.org
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the MIT License
 * which accompanies this distribution, and is available at
 * http://opensource.org/licenses/MIT
 *
 * Contributors:
 *      OpenWorm - http://openworm.org/people.html
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 *******************************************************************************/
define(function (require) {
    return function (GEPPETTO) {

        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = "geppetto/extensions/geppetto-vfb/css/VFB.css";
        document.getElementsByTagName("head")[0].appendChild(link);

        // any required stuff
        var Query = require('model/Query');

        /*ADD COMPONENTS*/
        
        //Logo initialization
        GEPPETTO.ComponentFactory.addComponent('LOGO', {logo: 'gpt-fly'}, document.getElementById("geppettologo"));

        //Control panel initialization
        GEPPETTO.ComponentFactory.addComponent('CONTROLPANEL', {}, document.getElementById("controlpanel"), function () {
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
                    "displayName": "Type(s)",
                    "source": "$entity$.$entity$_meta.getTypes().map(function (t) {return t.type.getInitialValue().value})",
                    "actions": "Model.getDatasources()[0].fetchVariable('$entity$', function(){ var instance = Instances.getInstance('$entity$.$entity$_meta'); setTermInfo(instance, instance.getParent().getId());});"
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
                    visualParents.push(visualInstances[i].getParent());
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
                        "condition": "GEPPETTO.SceneController.isSelected($instance$.$instance$_obj != undefined ? [$instance$.$instance$_obj] : []) ||  GEPPETTO.SceneController.isSelected($instance$.$instance$_swc != undefined ? [$instance$.$instance$_swc] : [])",
                        "false": {
                            "actions": ["$instance$.select()"],
                            "icon": "fa-hand-stop-o",
                            "label": "Unselected",
                            "tooltip": "Select"
                        },
                        "true": {
                            "actions": ["$instance$.deselect()"],
                            "icon": "fa-hand-rock-o",
                            "label": "Selected",
                            "tooltip": "Deselect"
                        },
                        "visibility": {
                            "condition": "GEPPETTO.SceneController.isVisible($instances$)",
                            "false": {
                                "id": "visibility",
                                "actions": ["GEPPETTO.SceneController.show($instances$);"],
                                "icon": "fa-eye-slash",
                                "label": "Hidden",
                                "tooltip": "Show"
                            },
                            "true": {
                                "id": "visibility",
                                "actions": ["GEPPETTO.SceneController.hide($instances$);"],
                                "icon": "fa-eye",
                                "label": "Visible",
                                "tooltip": "Hide"
                            }
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
                            "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_obj'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { instance.getType().resolve(function() { GEPPETTO.ControlPanel.refresh() }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                            "icon": "fa-eye-slash",
                            "label": "Hidden",
                            "tooltip": "Show obj"
                        },
                        "true": {
                            "id": "visibility_obj",
                            "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                            "icon": "fa-eye",
                            "label": "Visible",
                            "tooltip": "Hide obj"
                        }
                    },
                    "visibility_swc": {
                        "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_swc')",
                        "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_swc != undefined && $instance$.getType().$instance$_swc.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_swc != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_swc]); } return visible; })()",
                        "false": {
                            "id": "visibility_swc",
                            "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_swc'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { instance.getType().resolve(function() { GEPPETTO.ControlPanel.refresh() }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                            "icon": "fa-eye-slash",
                            "label": "Hidden",
                            "tooltip": "Show swc"
                        },
                        "true": {
                            "id": "visibility_swc",
                            "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                            "icon": "fa-eye",
                            "label": "Visible",
                            "tooltip": "Hide swc"
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
                        "id": "delete",
                        "actions": ["$instance$.delete();"],
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
                                "setTermInfo($variableid$['$variableid$' + '_meta'],'$variableid$');",
                            ],
                            "icon": "fa-info-circle",
                            "label": "Show info",
                            "tooltip": "Show info"
                        },
                        "query": {
                            actions: [
                                "Model.getDatasources()[0].fetchVariable('$variableid$', function(){ GEPPETTO.QueryBuilder.clearAllQueryItems(); GEPPETTO.QueryBuilder.switchView(false); GEPPETTO.QueryBuilder.addQueryItem({ term: $variableid$.getName(), id: '$variableid$'}); GEPPETTO.Spotlight.close(); GEPPETTO.QueryBuilder.open(); } );"
                            ],
                            icon: "fa-cog",
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
                                "GEPPETTO.SceneController.zoomTo($instances$)"
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
                    url: "http://vfbdev.inf.ed.ac.uk/search/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(fbbt)&fq=is_obsolete:false&fq=shortform_autosuggest:VFB_*%20OR%20shortform_autosuggest:FBbt_*&rows=250&bq=is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true",
                    crossDomain: true,
                    id: "short_form",
                    label: {field: "label", formatting: "$VALUE$ [$ID$]"},
                    explode_fields: [{field: "short_form", formatting: "$VALUE$ ($LABEL$)"}],
                    explode_arrays: [{field: "synonym", formatting: "$VALUE$ ($LABEL$)[$ID$]"}],
                    type: {
                        class: {
                            icon: "fa-dot-circle-o",
                            buttons: {
                                buttonOne: {
                                    actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ var instance = Instances.getInstance('$ID$.$ID$_meta'); setTermInfo(instance, instance.getParent().getId());});"],
                                    icon: "fa-info-circle",
                                    label: "Show info",
                                    tooltip: "Show info"
                                },
                                buttonTwo: {
                                    actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ GEPPETTO.QueryBuilder.clearAllQueryItems(); GEPPETTO.QueryBuilder.switchView(false); GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); GEPPETTO.Spotlight.close(); GEPPETTO.QueryBuilder.open(); } );"],
                                    icon: "fa-cog",
                                    label: "Add to query",
                                    tooltip: "Add to query"
                                }
                            }
                        },
                        individual: {
                            icon: "fa-square-o",
                            buttons: {
                                buttonOne: {
                                    actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ var instance = Instances.getInstance('$ID$'); var meta = Instances.getInstance('$ID$.$ID$_meta'); resolve3D('$ID$', function(){instance.select(); GEPPETTO.Spotlight.openToInstance(instance); setTermInfo(meta, meta.getParent().getId());}); }); "],
                                    icon: "fa-file-image-o",
                                    label: "Add to scene",
                                    tooltip: "Add to scene"
                                },
                                buttonTwo: {
                                    actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ GEPPETTO.QueryBuilder.clearAllQueryItems(); GEPPETTO.QueryBuilder.switchView(false); GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); GEPPETTO.Spotlight.close(); GEPPETTO.QueryBuilder.open(); } );"],
                                    icon: "fa-cog",
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

        //Foreground initialization
        GEPPETTO.ComponentFactory.addComponent('FOREGROUND', {}, document.getElementById("foreground-toolbar"));

        //Camera controls initialization
        GEPPETTO.ComponentFactory.addComponent('CAMERACONTROLS', {}, document.getElementById("camera-controls"));
        
        //Query control initialization
        GEPPETTO.ComponentFactory.addComponent('QUERY', {}, document.getElementById("querybuilder"), function () {
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
                    "actions": "Model.getDatasources()[0].fetchVariable('$entity$', function(){ var instance = Instances.getInstance('$entity$.$entity$_meta'); setTermInfo(instance, instance.getParent().getName());});",
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
                    "columnName": "controls",
                    "order": 4,
                    "locked": false,
                    "visible": true,
                    "customComponent": GEPPETTO.QueryResultsControlsComponent,
                    "displayName": "Controls",
                    "actions": "",
                    "cssClassName": "query-results-controls-column"
                },
                {
                    "columnName": "images",
                    "order": 5,
                    "locked": false,
                    "visible": true,
                    "customComponent": GEPPETTO.SlideshowImageComponent,
                    "displayName": "Images",
                    "actions": "Model.getDatasources()[0].fetchVariable('$entity$', function () { var meta = '$entity$' + '.' + '$entity$' + '_meta'; var inst = Instances.getInstance(meta); setTermInfo(inst, $entity$.getName()); resolve3D('$entity$'); });",
                    "cssClassName": "query-results-images-column"
                }
            ];
            GEPPETTO.QueryBuilder.setResultsColumnMeta(queryResultsColMeta);

            // which columns to display in the results
            GEPPETTO.QueryBuilder.setResultsColumns(['name', 'description', 'controls', 'images']);

            var queryResultsControlConfig = {
                "Common": {
                    "info": {
                        "id": "info",
                        "actions": [
                            "Model.getDatasources()[0].fetchVariable('$ID$', function(){ var instance = Instances.getInstance('$ID$.$ID$_meta'); setTermInfo(instance, instance.getParent().getId());});"
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
                        "tooltip": "FlyBase"
                    }
                }
            };
            GEPPETTO.QueryBuilder.setResultsControlsConfig(queryResultsControlConfig);

            // add datasource config to query control
            var queryBuilderDatasourceConfig = {
                VFB: {
                    url: "http://vfbdev.inf.ed.ac.uk/search/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(fbbt)&fq=is_obsolete:false&fq=shortform_autosuggest:VFB_*%20OR%20shortform_autosuggest:FBbt_*&rows=250&bq=is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true",
                    crossDomain: true,
                    id: "short_form",
                    label: {field: "label", formatting: "$VALUE$ [$ID$]"},
                    explode_fields: [{field: "short_form", formatting: "$VALUE$ ($LABEL$)"}],
                    explode_arrays: [{field: "synonym", formatting: "$VALUE$ ($LABEL$)[$ID$]"}],
                    type: {
                        "class": {
                            actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); } ); "],
                            icon: "fa-dot-circle-o"
                        },
                        individual: {
                            actions: ["Model.getDatasources()[0].fetchVariable('$ID$', function(){ GEPPETTO.QueryBuilder.addQueryItem({ term: '$LABEL$', id: '$ID$'}); } ); "],
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
                        getImageData: function (record) {
                            return record[3]
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
        
        //Loading spinner initialization
        GEPPETTO.Spinner.setLogo("gpt-fly");

        window.setupVFBCamera = function(){
        	if(GEPPETTO.Init.initialised){
        		GEPPETTO.Init.flipCameraY();
                GEPPETTO.Init.flipCameraZ();
                GEPPETTO.SceneController.setWireframe(true);
        	}
        };

        // VFB initialization routines
        window.initVFB = function () {

        	// camera setup
        	GEPPETTO.on(Events.Canvas_initialised,function(){
        		window.setupVFBCamera();
        	});
        	
        	window.setupVFBCamera();

            // widgets default dimensions and positions
            var getStackViewerDefaultWidth = function() { return Math.ceil(window.innerWidth / 4); };
            var getStackViewerDefaultHeight = function() { return Math.ceil(window.innerHeight/4) - 10; };
            var getTermInfoDefaultWidth = function() { return Math.ceil(window.innerWidth / 4); };
            var getTermInfoDefaultHeight = function() { return (window.innerHeight - Math.ceil(window.innerHeight/4) - 20); };
            var getTermInfoDefaultX = function() { return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); };
            var getStackViewerDefaultX = function() { return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); };
            var getStackViewerDefaultY = function() { return (window.innerHeight - Math.ceil(window.innerHeight/4)); };
            var getTermInfoDefaultY = function() {return 10;};
            var getButtonBarDefaultX = function() { return (Math.ceil(window.innerWidth / 2) - 45); };
            var getButtonBarDefaultY = function() { return 10; };

            // logic to assign colours to elements in the scene
            window.colours = ["0xb6b6b6", "0x00ff00", "0xff0000", "0x0000ff", "0x0084f6", "0x008d46", "0xa7613e", "0x4f006a", "0x00fff6", "0x3e7b8d", "0xeda7ff", "0xd3ff95", "0xb94fff", "0xe51a58", "0x848400", "0x00ff95", "0x61002c", "0xf68412", "0xcaff00", "0x2c3e00", "0x0035c1", "0xffca84", "0x002c61", "0x9e728d", "0x4fb912", "0x9ec1ff", "0x959e7b", "0xff7bb0", "0x9e0900", "0xffb9b9", "0x8461ca", "0x9e0072", "0x84dca7", "0xff00f6", "0x00d3ff", "0xff7258", "0x583e35", "0x003e35", "0xdc61dc", "0x6172b0", "0xb9ca2c", "0x12b0a7", "0x611200", "0x2c002c", "0x5800ca", "0x95c1ca", "0xd39e23", "0x84b058", "0xe5edb9", "0xf6d3ff", "0xb94f61", "0x8d09a7", "0x6a4f00", "0x003e9e", "0x7b3e7b", "0x3e7b61", "0xa7ff61", "0x0095d3", "0x3e7200", "0xb05800", "0xdc007b", "0x9e9eff", "0x4f4661", "0xa7fff6", "0xe5002c", "0x72dc72", "0xffed7b", "0xb08d46", "0x6172ff", "0xdc4600", "0x000072", "0x090046", "0x35ed4f", "0x2c0000", "0xa700ff", "0x00f6c1", "0x9e002c", "0x003eff", "0xf69e7b", "0x6a7235", "0xffff46", "0xc1b0b0", "0x727272", "0xc16aa7", "0x005823", "0xff848d", "0xb08472", "0x004661", "0x8dff12", "0xb08dca", "0x724ff6", "0x729e00", "0xd309c1", "0x9e004f", "0xc17bff", "0x8d95b9", "0xf6a7d3", "0x232309", "0xff6aca", "0x008d12", "0xffa758", "0xe5c19e", "0x00122c", "0xc1b958", "0x00c17b", "0x462c00", "0x7b3e58", "0x9e46a7", "0x4f583e", "0x6a35b9", "0x72b095", "0xffb000", "0x4f3584", "0xb94635", "0x61a7ff", "0xd38495", "0x7b613e", "0x6a004f", "0xed58ff", "0x95d300", "0x35a7c1", "0x00009e", "0x7b3535", "0xdcff6a", "0x95d34f", "0x84ffb0", "0x843500", "0x4fdce5", "0x462335", "0x002c09", "0xb9dcc1", "0x588d4f", "0x9e7200", "0xca4684", "0x00c146", "0xca09ed", "0xcadcff", "0x0058a7", "0x2ca77b", "0x8ddcff", "0x232c35", "0xc1ffb9", "0x006a9e", "0x0058ff", "0xf65884", "0xdc7b46", "0xca35a7", "0xa7ca8d", "0x4fdcc1", "0x6172d3", "0x6a23ff", "0x8d09ca", "0xdcc12c", "0xc1b97b", "0x3e2358", "0x7b6195", "0xb97bdc", "0xffdcd3", "0xed5861", "0xcab9ff", "0x3e5858", "0x729595", "0x7bff7b", "0x95356a", "0xca9eb9", "0x723e1a", "0x95098d", "0xf68ddc", "0x61b03e", "0xffca61", "0xd37b72", "0xffed9e", "0xcaf6ff", "0x58c1ff", "0x8d61ed", "0x61b972", "0x8d6161", "0x46467b", "0x0058d3", "0x58dc09", "0x001a72", "0xd33e2c", "0x959546", "0xca7b00", "0x4f6a8d", "0x9584ff", "0x46238d", "0x008484", "0xf67235", "0x9edc84", "0xcadc6a", "0xb04fdc", "0x4f0912", "0xff1a7b", "0x7bb0d3", "0x1a001a", "0x8d35f6", "0x5800a7", "0xed8dff", "0x969696", "0xffd300"];
            window.coli = 0;
            window.setSepCol = function (entityPath) {
                var c = coli;
                coli++;
                if (coli > 199) {
                    coli = 0;
                }
                Instances.getInstance(entityPath).setColor(colours[c], true).setOpacity(0.3, true);
                try {
                    Instances.getInstance(entityPath)[entityPath + '_swc'].setOpacity(1.0);
                } catch (ignore) {
                }
                if (c = 0) {
                    Instances.getInstance(entityPath).setOpacity(0.2, true);
                }
            };

            // custom handler for resolving 3d geometries
            window.resolve3D = function (path, callback) {
                var instance = undefined;
                try {
                    instance = Instances.getInstance(path + "." + path + "_swc");
                } catch (ignore) {
                }
                if (instance == undefined) {
                    try {
                        instance = Instances.getInstance(path + "." + path + "_obj");
                    } catch (ignore) {
                    }
                }
                if (instance != undefined) {
                    instance.getType().resolve(function () {
                        setSepCol(path);
                        if (callback != undefined) {
                            callback();
                        }
                    });
                }
                try{
                    instance = Instances.getInstance(path + "." + path + "_slices");
                    instance.getType().resolve();
                } catch (ignore) {
                }
            };

            // custom handler for term info clicks
            window.customHandler = function (node, path, widget) {
                var n;
                try {
                    n = eval(path);
                } catch (ex) {
                    node = undefined;
                }
                var meta = path + "." + path + "_meta";
                var target = widget;
                if (GEPPETTO.isKeyPressed("meta")) {
                    target = G.addWidget(1).addCustomNodeHandler(customHandler, 'click');
                }
                if (n != undefined) {
                    var metanode = Instances.getInstance(meta);
                    target.setData(metanode).setName(n.getName());
                } else {
                    // try to evaluate as path in Model
                    var entity = Model[path];
                    if(entity instanceof Query){
                        GEPPETTO.trigger('spin_logo');

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

                            GEPPETTO.trigger('stop_spin_logo');
                        };

                        // add query item + selection
                        GEPPETTO.QueryBuilder.addQueryItem({ term: widget.name, id: widget.data.getParent().getId(), queryObj: entity}, callback);
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
            GEPPETTO.on(Events.Select, function (instance) {
                var selection = G.getSelection();
                if (selection.length > 0 && instance.isSelected()) {
                    var latestSelection = instance;
                    var currentSelectionName = getTermInfoWidget().name;
                    if(latestSelection.getChildren().length > 0){
                        // it's a wrapper object - if name is different from current selection set term info
                        if(currentSelectionName != latestSelection.getName()) {
                            setTermInfo(latestSelection[latestSelection.getId() + "_meta"], latestSelection[latestSelection.getId() + "_meta"].getName());
                        }
                    } else {
                        // it's a leaf (no children) / grab parent if name is different from current selection set term info
                        var parent = latestSelection.getParent();
                        if(currentSelectionName != parent.getName()){
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
                    if (typeof sliceInstances[0] !== "undefined" && sliceInstances[0].getId() == 'VFB_00017894_slices'){
                        // TODO: load domain info with template meta
                        domainId[0]='VFB_00017894'; domainId[2]='VFB_00030621'; domainId[3]='VFB_00030622'; domainId[4]='VFB_00030609'; domainId[5]='VFB_00030625'; domainId[6]='VFB_00030619'; domainId[7]='VFB_00030900'; domainId[8]='VFB_00030605'; domainId[9]='VFB_00030600'; domainId[10]='VFB_00030602'; domainId[11]='VFB_00030613'; domainId[12]='VFB_00030617'; domainId[13]='VFB_00030616'; domainId[14]='VFB_00030631'; domainId[15]='VFB_00030615'; domainId[16]='VFB_00030606'; domainId[17]='VFB_00030901'; domainId[18]='VFB_00030902'; domainId[19]='VFB_00030903'; domainId[20]='VFB_00030620'; domainId[22]='VFB_00030612'; domainId[23]='VFB_00030611'; domainId[24]='VFB_00030629'; domainId[25]='VFB_00030624'; domainId[26]='VFB_00030633'; domainId[27]='VFB_00030623'; domainId[28]='VFB_00030628'; domainId[29]='VFB_00030614'; domainId[30]='VFB_00030608'; domainId[31]='VFB_00030632'; domainId[32]='VFB_00030626'; domainId[33]='VFB_00030630'; domainId[34]='VFB_00030627'; domainId[35]='VFB_00030610'; domainId[36]='VFB_00030838'; domainId[37]='VFB_00030601'; domainId[38]='VFB_00030603'; domainId[39]='VFB_00030618'; domainId[40]='VFB_00030599'; domainId[49]='VFB_00030840'; domainId[50]='VFB_00030604'; domainId[51]='VFB_00030607'; domainId[101]='VFB_00030849'; domainId[102]='VFB_00030856'; domainId[103]='VFB_00030866'; domainId[104]='VFB_00030867'; domainId[105]='VFB_00030868'; domainId[106]='VFB_00030869'; domainId[107]='VFB_00030870'; domainId[108]='VFB_00030871'; domainId[109]='VFB_00030872'; domainId[110]='VFB_00030873'; domainId[111]='VFB_00030874'; domainId[112]='VFB_00030875'; domainId[113]='VFB_00030876'; domainId[114]='VFB_00030877'; domainId[115]='VFB_00030878'; domainId[116]='VFB_00030879'; domainId[117]='VFB_00030880';
                        domainName[0]='adult brain'; domainName[2]='accessory medulla'; domainName[3]='lobula'; domainName[4]='nodulus'; domainName[5]='bulb'; domainName[6]='protocerebral bridge'; domainName[7]='lateral horn'; domainName[8]='lateral accessory lobe'; domainName[9]='saddle'; domainName[10]='cantle'; domainName[11]='antennal mechanosensory and motor center'; domainName[12]='inferior clamp'; domainName[13]='vest'; domainName[14]='inferior bridge'; domainName[15]='antler'; domainName[16]='crepine'; domainName[17]='pedunculus of adult mushroom body'; domainName[18]='vertical lobe of adult mushroom body'; domainName[19]='medial lobe of adult mushroom body'; domainName[20]='flange'; domainName[22]='lobula plate'; domainName[23]='ellipsoid body'; domainName[24]='adult antennal lobe'; domainName[25]='medulla'; domainName[26]='fan-shaped body'; domainName[27]='superior lateral protocerebrum'; domainName[28]='superior intermediate protocerebrum'; domainName[29]='superior medial protocerebrum'; domainName[30]='anterior ventrolateral protocerebrum'; domainName[31]='posterior ventrolateral protocerebrum'; domainName[32]='wedge'; domainName[33]='posterior lateral protocerebrum'; domainName[34]='anterior optic tubercle'; domainName[35]='gorget'; domainName[36]='calyx of adult mushroom body'; domainName[37]='superior posterior slope'; domainName[38]='inferior posterior slope'; domainName[39]='superior clamp'; domainName[40]='epaulette'; domainName[49]='adult gnathal ganglion'; domainName[50]='prow'; domainName[51]='gall'; domainName[101]='adult cerebral ganglion'; domainName[102]='adult subesophageal zone'; domainName[103]='adult central complex'; domainName[104]='adult mushroom body'; domainName[105]='inferior neuropils'; domainName[106]='lateral complex'; domainName[107]='optic lobe'; domainName[108]='superior neuropils'; domainName[109]='ventrolateral neuropils'; domainName[110]='ventromedial neuropils'; domainName[111]='central body'; domainName[112]='lobe system of adult mushroom body'; domainName[113]='clamp'; domainName[114]='lobula complex'; domainName[115]='ventrolateral protocerebrum'; domainName[116]='posterior slope'; domainName[117]='ventral complex';
                        config = {
                            serverUrl: 'http://vfbdev.inf.ed.ac.uk/fcgi/wlziipsrv.fcgi',
                            templateId: 'VFB_00017894',
                            templateDomainIds: domainId,
                            templateDomainNames: domainName
                        };
                    }else{
                        config = {
                            serverUrl: 'http://vfbdev.inf.ed.ac.uk/fcgi/wlziipsrv.fcgi',
                            templateId: 'NOTSET',
                            templateDomainIds: domainId,
                            templateDomainNames: domainName
                        };
                    }
                    G.addWidget(8).setConfig(config).setData({
                        instances: sliceInstances
                    });

                    // set initial position:
                    window.StackViewer1.setPosition(getStackViewerDefaultX(), getStackViewerDefaultY());
                    window.StackViewer1.setSize(getStackViewerDefaultHeight(), getStackViewerDefaultWidth());
                    window.StackViewer1.setName('Slice Viewer');
                    window.StackViewer1.setTrasparentBackground(true);
                    window.StackViewer1.showHistoryIcon(false)

                    // on change to instances reload stack:
                    GEPPETTO.on(Events.Instance_deleted, function(path){
                        console.log(path.split('.')[0] + ' deleted...');
                        if (window.StackViewer1 != undefined){
                            if(path!=undefined && path.length > 0){
                                    window.StackViewer1.removeSlice(path);
                            }else{
                                console.log('Removing instance issue: ' + path);
                            }
                        }		
                    });
                    GEPPETTO.on(Events.Instances_created, function(instances){
                        console.log('Instance created...');

                        if (window.StackViewer1 != undefined){
                            if(instances!=undefined && instances.length > 0){
                                instances.forEach(function (parentInstance){parentInstance.parent.getChildren().forEach(function (instance){if (instance.getName() == 'Stack Viewer Slices'){window.StackViewer1.addSlices(instance)}})});
                                console.log('Passing instance: ' + instances[0].parent.getId());
                                if (instances[0].parent.getId() == 'VFB_00017894'){
                                    var config;
                                    var domainId = [];
                                    var domainName = [];
                                    // TODO: load domain info with template meta
                                    domainId[0]='VFB_00017894'; domainId[2]='VFB_00030621'; domainId[3]='VFB_00030622'; domainId[4]='VFB_00030609'; domainId[5]='VFB_00030625'; domainId[6]='VFB_00030619'; domainId[7]='VFB_00030900'; domainId[8]='VFB_00030605'; domainId[9]='VFB_00030600'; domainId[10]='VFB_00030602'; domainId[11]='VFB_00030613'; domainId[12]='VFB_00030617'; domainId[13]='VFB_00030616'; domainId[14]='VFB_00030631'; domainId[15]='VFB_00030615'; domainId[16]='VFB_00030606'; domainId[17]='VFB_00030901'; domainId[18]='VFB_00030902'; domainId[19]='VFB_00030903'; domainId[20]='VFB_00030620'; domainId[22]='VFB_00030612'; domainId[23]='VFB_00030611'; domainId[24]='VFB_00030629'; domainId[25]='VFB_00030624'; domainId[26]='VFB_00030633'; domainId[27]='VFB_00030623'; domainId[28]='VFB_00030628'; domainId[29]='VFB_00030614'; domainId[30]='VFB_00030608'; domainId[31]='VFB_00030632'; domainId[32]='VFB_00030626'; domainId[33]='VFB_00030630'; domainId[34]='VFB_00030627'; domainId[35]='VFB_00030610'; domainId[36]='VFB_00030838'; domainId[37]='VFB_00030601'; domainId[38]='VFB_00030603'; domainId[39]='VFB_00030618'; domainId[40]='VFB_00030599'; domainId[49]='VFB_00030840'; domainId[50]='VFB_00030604'; domainId[51]='VFB_00030607'; domainId[101]='VFB_00030849'; domainId[102]='VFB_00030856'; domainId[103]='VFB_00030866'; domainId[104]='VFB_00030867'; domainId[105]='VFB_00030868'; domainId[106]='VFB_00030869'; domainId[107]='VFB_00030870'; domainId[108]='VFB_00030871'; domainId[109]='VFB_00030872'; domainId[110]='VFB_00030873'; domainId[111]='VFB_00030874'; domainId[112]='VFB_00030875'; domainId[113]='VFB_00030876'; domainId[114]='VFB_00030877'; domainId[115]='VFB_00030878'; domainId[116]='VFB_00030879'; domainId[117]='VFB_00030880';
                                    domainName[0]='adult brain'; domainName[2]='accessory medulla'; domainName[3]='lobula'; domainName[4]='nodulus'; domainName[5]='bulb'; domainName[6]='protocerebral bridge'; domainName[7]='lateral horn'; domainName[8]='lateral accessory lobe'; domainName[9]='saddle'; domainName[10]='cantle'; domainName[11]='antennal mechanosensory and motor center'; domainName[12]='inferior clamp'; domainName[13]='vest'; domainName[14]='inferior bridge'; domainName[15]='antler'; domainName[16]='crepine'; domainName[17]='pedunculus of adult mushroom body'; domainName[18]='vertical lobe of adult mushroom body'; domainName[19]='medial lobe of adult mushroom body'; domainName[20]='flange'; domainName[22]='lobula plate'; domainName[23]='ellipsoid body'; domainName[24]='adult antennal lobe'; domainName[25]='medulla'; domainName[26]='fan-shaped body'; domainName[27]='superior lateral protocerebrum'; domainName[28]='superior intermediate protocerebrum'; domainName[29]='superior medial protocerebrum'; domainName[30]='anterior ventrolateral protocerebrum'; domainName[31]='posterior ventrolateral protocerebrum'; domainName[32]='wedge'; domainName[33]='posterior lateral protocerebrum'; domainName[34]='anterior optic tubercle'; domainName[35]='gorget'; domainName[36]='calyx of adult mushroom body'; domainName[37]='superior posterior slope'; domainName[38]='inferior posterior slope'; domainName[39]='superior clamp'; domainName[40]='epaulette'; domainName[49]='adult gnathal ganglion'; domainName[50]='prow'; domainName[51]='gall'; domainName[101]='adult cerebral ganglion'; domainName[102]='adult subesophageal zone'; domainName[103]='adult central complex'; domainName[104]='adult mushroom body'; domainName[105]='inferior neuropils'; domainName[106]='lateral complex'; domainName[107]='optic lobe'; domainName[108]='superior neuropils'; domainName[109]='ventrolateral neuropils'; domainName[110]='ventromedial neuropils'; domainName[111]='central body'; domainName[112]='lobe system of adult mushroom body'; domainName[113]='clamp'; domainName[114]='lobula complex'; domainName[115]='ventrolateral protocerebrum'; domainName[116]='posterior slope'; domainName[117]='ventral complex';
                                    config = {
                                        serverUrl: 'http://vfbdev.inf.ed.ac.uk/fcgi/wlziipsrv.fcgi',
                                        templateId: 'VFB_00017894',
                                        templateDomainIds: domainId,
                                        templateDomainNames: domainName
                                    };
                                    window.StackViewer1.setConfig(config);
                                }
                            }
                        }	
                    });

                    // on colour change update:
                    GEPPETTO.on(Events.Color_set, function(instances){
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
                } else {
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
                return window.termInfoPopup;
            };

            window.setTermInfo = function (data, name) {
                getTermInfoWidget().setData(data).setName(name);
            };

            window.addTermInfo = function(){
                if(window.termInfoPopupId == undefined || (window.termInfoPopupId != undefined && window[window.termInfoPopupId] == undefined)) {
                    // init empty term info area
                    window.termInfoPopup = G.addWidget(1).setName('Click on image to show info').addCustomNodeHandler(customHandler, 'click');
                    window.termInfoPopup.setPosition(getTermInfoDefaultX(), getTermInfoDefaultY());
                    window.termInfoPopup.setSize(getTermInfoDefaultHeight(), getTermInfoDefaultWidth());
                    window.termInfoPopupId = window.termInfoPopup.getId();
                    window.termInfoPopup.showHistoryNavigationBar(true);
                    window.termInfoPopup.setTrasparentBackground(true);
                } else {
                    $('#' + window.termInfoPopupId).parent().effect('shake', {distance:5, times: 3}, 500);
                }
            };

            // button bar helper method
            window.addButtonBar = function() {
                var buttonBarConfig = {
                    "": {
                        "": {
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
                            }
                        }
                    }
                };
                G.addWidget(Widgets.BUTTONBAR).fromJSONObj(buttonBarConfig);
                ButtonBar1.setPosition(getButtonBarDefaultX(), getButtonBarDefaultY());
                ButtonBar1.showCloseButton(false);
                ButtonBar1.showTitleBar(false);
                ButtonBar1.setClass('transparent');
            };

            // add term info
            window.addTermInfo();
            window.addButtonBar();

            window.addEventListener('resize', function(event){
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
            });
        };


        GEPPETTO.on(Events.Experiment_loaded, function(){
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
