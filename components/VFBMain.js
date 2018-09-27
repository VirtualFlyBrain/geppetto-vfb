import React, { Component } from 'react';
import VFBToolBar from './interface/VFBToolBar';
import StackWidget from './interface/StackWidget';
import TermInfoWidget from './interface/TermInfoWidget';
import TutorialWidget from './interface/TutorialWidget';
import Logo from '../../../js/components/interface/logo/Logo';
import Canvas from '../../../js/components/interface/3dCanvas/Canvas';
import QueryBuilder from '../../../js/components/interface/query/query';
import ButtonBar from '../../../js/components/interface/buttonBar/ButtonBar';
import SpotLight from '../../../js/components/interface/spotlight/spotlight';
import LinkButton from '../../../js/components/interface/linkButton/LinkButton';
import ControlPanel from '../../../js/components/interface/controlPanel/controlpanel';


// import NewWidget from '../../../js/components/widgets/NewWidget'; For future use.
require('./VFBMain.less');
require('../css/VFB.css');
var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;
var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
var ImportType = require('./../../../js/geppettoModel/model/ImportType');

export default class VFBMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            canvasAvailable: false,
            modelLoaded: (window.Model != undefined),
            infoBtn: true, // All states handled by the button bar
            stackBtn: true, 
            tutorialBtn: false,
            searchBtn: true,
            controlPanelBtn: true,
            meshBtn: false,
            queryBtn: true, // END buttonbar states
            idSelected: undefined
        };

        this.clearQS = this.clearQS.bind(this);
        this.addVfbId = this.addVfbId.bind(this);
        this.resolve3D = this.resolve3D.bind(this);
        this.setSepCol = this.setSepCol.bind(this);
        this.customSorter = this.customSorter.bind(this);
        this.hasVisualType = this.hasVisualType.bind(this);
        this.termInfoHandler = this.termInfoHandler.bind(this);
        this.buttonBarHandler = this.buttonBarHandler.bind(this);
        this.stackViewerRequest = this.stackViewerRequest.bind(this);
        this.stackViewerHandler = this.stackViewerHandler.bind(this);
        this.addToQueryCallback = this.addToQueryCallback.bind(this);
        this.fetchVariableThenRun = this.fetchVariableThenRun.bind(this);
        this.getButtonBarDefaultX = this.getButtonBarDefaultX.bind(this);
        this.getButtonBarDefaultY = this.getButtonBarDefaultY.bind(this);
        this.getStackViewerDefaultX = this.getStackViewerDefaultX.bind(this);
        this.getStackViewerDefaultY = this.getStackViewerDefaultY.bind(this);
        this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);

        this.coli = 1;
        this.colours = ["0x5b5b5b", "0x00ff00", "0xff0000", "0x0000ff", "0x0084f6", "0x008d46", "0xa7613e", "0x4f006a", "0x00fff6", "0x3e7b8d", "0xeda7ff", "0xd3ff95", "0xb94fff", "0xe51a58", "0x848400", "0x00ff95", "0x61002c", "0xf68412", "0xcaff00", "0x2c3e00", "0x0035c1", "0xffca84", "0x002c61", "0x9e728d", "0x4fb912", "0x9ec1ff", "0x959e7b", "0xff7bb0", "0x9e0900", "0xffb9b9", "0x8461ca", "0x9e0072", "0x84dca7", "0xff00f6", "0x00d3ff", "0xff7258", "0x583e35", "0x003e35", "0xdc61dc", "0x6172b0", "0xb9ca2c", "0x12b0a7", "0x611200", "0x2c002c", "0x5800ca", "0x95c1ca", "0xd39e23", "0x84b058", "0xe5edb9", "0xf6d3ff", "0xb94f61", "0x8d09a7", "0x6a4f00", "0x003e9e", "0x7b3e7b", "0x3e7b61", "0xa7ff61", "0x0095d3", "0x3e7200", "0xb05800", "0xdc007b", "0x9e9eff", "0x4f4661", "0xa7fff6", "0xe5002c", "0x72dc72", "0xffed7b", "0xb08d46", "0x6172ff", "0xdc4600", "0x000072", "0x090046", "0x35ed4f", "0x2c0000", "0xa700ff", "0x00f6c1", "0x9e002c", "0x003eff", "0xf69e7b", "0x6a7235", "0xffff46", "0xc1b0b0", "0x727272", "0xc16aa7", "0x005823", "0xff848d", "0xb08472", "0x004661", "0x8dff12", "0xb08dca", "0x724ff6", "0x729e00", "0xd309c1", "0x9e004f", "0xc17bff", "0x8d95b9", "0xf6a7d3", "0x232309", "0xff6aca", "0x008d12", "0xffa758", "0xe5c19e", "0x00122c", "0xc1b958", "0x00c17b", "0x462c00", "0x7b3e58", "0x9e46a7", "0x4f583e", "0x6a35b9", "0x72b095", "0xffb000", "0x4f3584", "0xb94635", "0x61a7ff", "0xd38495", "0x7b613e", "0x6a004f", "0xed58ff", "0x95d300", "0x35a7c1", "0x00009e", "0x7b3535", "0xdcff6a", "0x95d34f", "0x84ffb0", "0x843500", "0x4fdce5", "0x462335", "0x002c09", "0xb9dcc1", "0x588d4f", "0x9e7200", "0xca4684", "0x00c146", "0xca09ed", "0xcadcff", "0x0058a7", "0x2ca77b", "0x8ddcff", "0x232c35", "0xc1ffb9", "0x006a9e", "0x0058ff", "0xf65884", "0xdc7b46", "0xca35a7", "0xa7ca8d", "0x4fdcc1", "0x6172d3", "0x6a23ff", "0x8d09ca", "0xdcc12c", "0xc1b97b", "0x3e2358", "0x7b6195", "0xb97bdc", "0xffdcd3", "0xed5861", "0xcab9ff", "0x3e5858", "0x729595", "0x7bff7b", "0x95356a", "0xca9eb9", "0x723e1a", "0x95098d", "0xf68ddc", "0x61b03e", "0xffca61", "0xd37b72", "0xffed9e", "0xcaf6ff", "0x58c1ff", "0x8d61ed", "0x61b972", "0x8d6161", "0x46467b", "0x0058d3", "0x58dc09", "0x001a72", "0xd33e2c", "0x959546", "0xca7b00", "0x4f6a8d", "0x9584ff", "0x46238d", "0x008484", "0xf67235", "0x9edc84", "0xcadc6a", "0xb04fdc", "0x4f0912", "0xff1a7b", "0x7bb0d3", "0x1a001a", "0x8d35f6", "0x5800a7", "0xed8dff", "0x969696", "0xffd300"];
        this.vfbLoadBuffer = [];
        this.tutorialRender = undefined;
        this.spotlightRender = undefined;
        this.controlpanelRender = undefined;
        this.querybuilderRender = undefined;
        //this.logoStyle = { fontSize: '33px'};
        this.tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];

        this.buttonBarConfig = {
            "searchBtn": {
                "icon": "fa fa-search",
                "label": "",
                "tooltip": "Search"
            },
            "queryBtn": {
                "icon": "fa fa-quora",
                "label": "",
                "tooltip": "Open Query"
            },
            "controlPanelBtn": {
                "icon": "fa fa-list",
                "label": "",
                "tooltip": "Layers"
            },
            "infoBtn": {
                "icon": "fa fa-info",
                "label": "",
                "tooltip": "Show term info"
            },
            "stackBtn": {
                "icon": "gpt-stack",
                "label": "",
                "tooltip": "Show slice viewer"
            },
            "meshBtn": {
                "condition": "true",
                "false": {
                    "actions": [
                        ""
                    ],
                    "icon": "gpt-sphere_solid",
                    "label": "",
                    "tooltip": "Show wireframe"
                },
                "true": {
                    "actions": [
                        ""
                    ],
                    "icon": "gpt-sphere_wireframe-jpg",
                    "label": "",
                    "tooltip": "Hide wireframe"
                }
            },
            "tutorialBtn": {
                "icon": "fa fa-question",
                "label": "",
                "tooltip": "Open tutorial"
            }
        };

        this.spotlightConfig = {
            "SpotlightBar": {
                "DataSources": {},
                "CompositeType": {
                    "type": {
                        "actions": [
                            "window.setTermInfo($variableid$['$variableid$' + '_meta'],'$variableid$');GEPPETTO.Spotlight.close();",
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

        this.spotlightDataSourceConfig = {
            VFB: {
                url: "http://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&rows=250&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E110.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", crossDomain: true,
                crossDomain: true,
                id: "short_form",
                label: { field: "label", formatting: "$VALUE$" },
                explode_fields: [{ field: "short_form", formatting: "$VALUE$ ($LABEL$)" }],
                explode_arrays: [{ field: "synonym", formatting: "$VALUE$ ($LABEL$)" }],
                type: {
                    property: {
                        icon: "fa-file-text-o",
                        buttons: {
                            buttonOne: {
                                actions: ["window.addVfbId('$ID$');"],
                                icon: "fa-info-circle",
                                label: "Show info",
                                tooltip: "Show info"
                            }
                        }
                    },
                    class: {
                        icon: "fa-file-text-o",
                        buttons: {
                            buttonOne: {
                                actions: ["window.addVfbId('$ID$');"],
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
                                actions: ["window.addVfbId('$ID$');"],
                                icon: "fa-file-image-o",
                                label: "Add to scene",
                                tooltip: "Add to scene"
                            },
                            buttonTwo: {
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
                    }.bind(this),
                    queryTokenizer: function (q) {
                        return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
                    }.bind(this),
                    sorter: function (a, b) {
                        var term = $('#typeahead').val();
                        return this.customSorter(a, b, term);
                    }.bind(this)
                }
            }
        };

        this.stackConfiguration = {
            serverUrl: 'https://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
            templateId: 'NOTSET'
        };

        this.voxel = {
            x: 0.622,
            y: 0.622,
            z: 0.622
        };

        this.stackViewerData = {
            id: "StackViewerWidget_"
        };

        this.controlPanelColMeta = [
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
                "actions": "window.addVfbId('$entity$');"
            },
            {
                "columnName": "type",
                "order": 3,
                "locked": false,
                "customComponent": GEPPETTO.LinkArrayComponent,
                "displayName": "Type",
                "source": "$entity$.$entity$_meta.getTypes().map(function (t) {return t.type.getInitialValue().value})",
                "actions": "window.addVfbId('$entity$');",
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

        this.controlPanelConfig = {
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
                    "actions": ["if($instance$.parent != null){$instance$.parent.deselect();$instance$.parent.delete();}else{$instance$.deselect();$instance$.delete();};setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());"],
                    "icon": "fa-trash-o",
                    "label": "Delete",
                    "tooltip": "Delete"
                }
            }
        };

        this.controlPanelControlConfigs = {
            "Common": ['info', 'delete'],
            "VisualCapability": ['select', 'color', 'visibility', 'zoom', 'visibility_obj', 'visibility_swc']
        };

        this.controlPanelColumns = ['name', 'type', 'controls', 'image'];

        this.queryResultsColMeta = [
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
                "actions": "window.addVfbId('$entity$');",
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
                "actions": "window.addVfbId('$entity$');",
                "cssClassName": "query-results-images-column"
            },
            {
                "columnName": "score",
                "order": 7,
                "locked": false,
                "visible": true,
                "displayName": "Score",
                "cssClassName": "query-results-score-column"
            }
        ];

        // which columns to display in the results
        this. queryResultsColumns = ['name', 'description', 'type', 'images', 'score'];

        this.queryResultsControlConfig = {
            "Common": {
                "info": {
                    "id": "info",
                    "actions": [
                        "window.addVfbId('$ID$');"
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

        // add datasource config to query control
        this.queryBuilderDatasourceConfig = {
            VFB: {
                url: "http://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&rows=250&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E100.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", crossDomain: true,
                crossDomain: true,
                id: "short_form",
                label: { field: "label", formatting: "$VALUE$" },
                explode_fields: [{ field: "short_form", formatting: "$VALUE$ ($LABEL$)" }],
                explode_arrays: [{ field: "synonym", formatting: "$VALUE$ ($LABEL$)" }],
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
                    getItem: function (record, header, field) {
                        var recordIndex = header.indexOf(field);
                        return record[recordIndex]
                    },
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
                    getScore: function (record) {
                        return record[5]
                    },
                    getRecords: function (payload) {
                        return payload.results.map(function (item) {
                            return item.values
                        })
                    },
                    getHeaders: function (payload) {
                        return payload.header;
                    }
                },
                bloodhoundConfig: {
                    datumTokenizer: function (d) {
                        return Bloodhound.tokenizers.nonword(d.label.replace('_', ' '));
                    }.bind(this),
                    queryTokenizer: function (q) {
                        return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
                    }.bind(this),
                    sorter: function (a, b) {
                        var term = $("#query-typeahead").val();
                        return this.customSorter(a, b, term);
                    }.bind(this)
                }
            }
        };

        this.urlIdsLoaded = false;

        window.redirectURL = '$PROTOCOL$//$HOST$/?i=$TEMPLATE$,$VFB_ID$&id=$VFB_ID$';
    }

    getButtonBarDefaultX() {
        return (Math.ceil(window.innerWidth / 2) - 175);
    };

    getButtonBarDefaultY() {
        return 55;
    };

    getStackViewerDefaultX() {
        return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); 
    };

    getStackViewerDefaultY() {
        return 200;
    };

    customSorter(a, b, InputString) {
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

    // Logic to add VFB ids into the scene starts here

    setSepCol(entityPath) {
        if (entityPath.indexOf(window.templateID) < 0) {
            var c = this.coli;
            this.coli++;
            if (this.coli > 199) {
                this.coli = 1;
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
            if (c = 0) {
                Instances.getInstance(entityPath).setOpacity(0.2, true);
            }
        } else {
            console.log('Issue setting colour for ' + entityPath);
        }
    };

    clearQS() {
        if (this.refs.spotlightRef) {
            $("#spotlight").hide();
            $('#spotlight #typeahead')[0].placeholder = "Search for the item you're interested in...";
        }
        if (this.refs.querybuilderRef && (!GEPPETTO.isKeyPressed("shift")))
        {
            this.refs.querybuilderRef.close();
        }
        this.refs.stackViewerRef.checkConnection();
    };

    addToQueryCallback(variableId, label) {
        // Failsafe check with old and new logic - to be refactored when finished
        if (typeof (variableId) == "string") {
            this.clearQS();
            this.refs.querybuilderRef.switchView(false, true);
            this.refs.querybuilderRef.addQueryItem({
                term: (label != undefined) ? label : window[variableId].getName(),
                id: variableId
            });
        } else {
            for (var singleId = 0; variableId.length > singleId; singleId++) {
                this.clearQS();
                this.refs.querybuilderRef.switchView(false, true);
                this.refs.querybuilderRef.addQueryItem({
                    term: (label != undefined) ? label : window[variableId[singleId]].getName(),
                    id: variableId[singleId]
                });
            }
        }
        this.refs.querybuilderRef.open();
    };

    addVfbId(idsList) {
        if(this.state.modelLoaded === true) {
            if(typeof (idsList) == "string") {
                if(idsList.indexOf(',') > -1) {
                    var idArray = idsList.split(",");
                    idsList = idArray;
                }
                else {
                    idsList = [idsList];
                }
            }
            idsList = Array.from(new Set(idsList));
            if (idsList != null && idsList.length > 0) {
                for (var singleId = 0; idsList.length > singleId; singleId++) {
                    if ($.inArray(idsList[singleId], this.vfbLoadBuffer) == -1) {
                        this.vfbLoadBuffer.push(idsList[singleId]);
                    }

                    if (window[idsList[singleId]] != undefined) {
                        this.handleSceneAndTermInfoCallback(idsList[singleId]);
                        idsList.splice($.inArray(idsList[singleId], idsList), 1);
                        this.vfbLoadBuffer.splice($.inArray(idsList[singleId], this.vfbLoadBuffer), 1);
                    }
                }
                if (idsList.length > 0) {
                    this.fetchVariableThenRun(idsList, this.handleSceneAndTermInfoCallback);
                    this.setState({
                        idSelected: idsList[idsList.length - 1]
                    });
                }
            }
        } else {
            console.log("model has not been loaded, in the old initialization here I was triggering a setTimeout to call recursively this same function addvfbid");
            //setTimeout(function () { this.addVfbId(idsList); }, 1000);
        }

        
    };

    fetchVariableThenRun(variableId, callback, label) {
        GEPPETTO.SceneController.deselectAll(); // signal something is happening!
        var variables = GEPPETTO.ModelFactory.getTopLevelVariablesById([variableId]);
        if (!variables.length > 0) {
            Model.getDatasources()[0].fetchVariable(variableId, function () {
                if (callback != undefined)
                    callback(variableId, label);
            });
        } else {
            if (callback != undefined)
                callback(variableId, label);
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
                this.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
                continue;
            }
            if (this.hasVisualType(variableIds[singleId])) {
                var instance = Instances.getInstance(variableIds[singleId]);
                this.resolve3D(variableIds[singleId], function () {
                    GEPPETTO.SceneController.deselectAll();
                    if ((instance != undefined) && (typeof instance.select === "function"))
                        instance.select();
                    this.refs.termInfoRef.setTermInfo(meta, meta.getParent().getId());
                }.bind(this));
            } else {
                this.refs.termInfoRef.setTermInfo(meta, meta.getParent().getId());
            }
            // if the element is not invalid (try-catch) or it is part of the scene then remove it from the buffer
            if (window[variableIds[singleId]] != undefined) {
                this.vfbLoadBuffer.splice($.inArray(variableIds[singleId], window.vfbLoadBuffer), 1);
            }
        }
        if (this.vfbLoadBuffer.length > 0) {
            GEPPETTO.trigger('spin_logo');
        } else {
            GEPPETTO.trigger('stop_spin_logo');
        }
    };

    hasVisualType(variableId) {
        var counter = 0;
        var instance = undefined;
        var extEnum = {
            0 : {extension: "_swc"},
            1 : {extension: "_obj"},
            2 : {extension: "_slice"}
        };
        while ((instance == undefined) && (counter < 3)) {
            try {
                instance = Instances.getInstance(variableId + "." + variableId + extEnum[counter].extension);
            } catch (ignore) { }
            counter++;
        }
        if(instance != undefined) {
            return true;
        } else {
            return false;
        }
    };

    resolve3D(path, callback) {
        var rootInstance = Instances.getInstance(path);
        this.refs.termInfoRef.updateHistory(rootInstance.getName());
        GEPPETTO.SceneController.deselectAll();

        if (window.templateID == undefined) {
            var superTypes = rootInstance.getType().getSuperType();
            for (var i = 0; i < superTypes.length; i++) {
                if (superTypes[i].getId() == 'Template') {
                    window.templateID = rootInstance.getId();
                }
            }
            // Assume the template associated with the first item loaded and ensure the template is added to the cue for loading.
            if (window.templateID == undefined) {
                var meta = rootInstance[rootInstance.getId() + '_meta'];
                if (meta != undefined) {
                    if (typeof meta.getType().template != "undefined") {
                        var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
                        var domObj = $(templateMarkup);
                        var anchorElement = domObj.filter('a');
                        // extract ID
                        var templateID = anchorElement.attr('instancepath');
                        this.addVfbId(templateID);
                    }
                }
            }
        } else {
            // check if the user is adding to the scene something belonging to another template
            var superTypes = rootInstance.getType().getSuperType();
            var templateID = "unknown";
            for (var i = 0; i < superTypes.length; i++) {
                if (superTypes[i].getId() == window.templateID) {
                    templateID = superTypes[i].getId()
                }
                if (superTypes[i].getId() == 'Class') {
                    templateID = window.templateID;
                    return; // Exit if Class - Class doesn't have image types.
                }
            }

            var meta = rootInstance[rootInstance.getId() + '_meta'];
            if (meta != undefined) {
                if (typeof meta.getType().template != "undefined") {
                    var templateMarkup = meta.getType().template.getValue().wrappedObj.value.html;
                    var domObj = $(templateMarkup);
                    var anchorElement = domObj.filter('a');
                    // extract ID
                    var templateID = anchorElement.attr('instancepath');
                    if (window.EMBEDDED) {
                        var curHost = parent.document.location.host;
                        var curProto = parent.document.location.protocol;
                    } else {
                        var curHost = document.location.host;
                        var curProto = document.location.protocol;
                    }
                    if (templateID != window.templateID) {
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
        var flagRendering = true;
        // check if we have swc
        try {
            instance = Instances.getInstance(path + "." + path + "_swc");
            if (!window[path][path + '_swc'].visible && typeof window[path][path + '_swc'].show == "function") {
                window[path][path + '_swc'].show();
                flagRendering = false;
            }
        } catch (ignore) {
        }
        // if no swc check if we have obj
        if (instance == undefined) {
            try {
                instance = Instances.getInstance(path + "." + path + "_obj");
                if ((!window[path][path + '_obj'].visible) && (typeof window[path][path + '_obj'].show == "function") && (flagRendering)) {
                    window[path][path + '_obj'].show();
                }
            } catch (ignore) {
            }
        }
        // if anything was found resolve type (will add to scene)
        if (instance != undefined) {
            var postResolve = () => {
                this.setSepCol(path);
                if (callback != undefined) {
                    callback();
                }
            };

            if (typeof (instance) != 'undefined' && instance.getType() instanceof ImportType) {
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
            if (typeof (instance) != 'undefined' && instance.getType() instanceof ImportType) {
                instance.getType().resolve();
            }
        } catch (ignore) {
            // any alternative handling goes here
        }
    };

    componentDidUpdate(prevProps, prevState) {
        // Reopen Terminfo from button bar if previously has been closed.
        if((this.state.infoBtn === true) && (prevState.infoBtn !== this.state.infoBtn) && (prevState.infoBtn !== undefined)) {
            this.refs.termInfoRef.addTermInfo();
        }
        // Reopen stackViewer from button bar if previously has been closed.
        if((prevState.stackBtn !== this.state.stackBtn) && (prevState.stackBtn !== undefined)) {
            this.refs.stackViewerRef.addStackWidget();
        }

        if((prevState.meshBtn !== this.state.meshBtn)) {
            this.refs.vfbCanvas.setWireframe(!this.refs.vfbCanvas.getWireframe());
        }

        if((prevState.controlPanelBtn !== this.state.controlPanelBtn)) {
            $('#controlpanel').show();
        }

        if((prevState.searchBtn !== this.state.searchBtn)) {
            $('#spotlight').show();
        }

        if((prevState.queryBtn !== this.state.queryBtn)) {
            $('#querybuilder').show();
        }
    };

    componentWillUpdate(nextProps, nextState) {
        console.log("component will update called");
    };

    componentWillMount() {
        if((window.Model == undefined) && (this.state.modelLoaded == false)) {
            Project.loadFromURL(window.location.origin.replace('https:','http:') + '/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto/extensions/geppetto-vfb/model/vfb.json');
            // Local deployment for development. Uncomment the line below.
            // Project.loadFromURL(window.location.origin.replace(":8081", "") + '/' + 'project/vfb.json');
            this.setState({modelLoaded: true});
        }
    };

    componentDidMount() {
        // Global functions linked to VFBMain functions
        window.stackViewerRequest = function(idFromStack) {
            this.stackViewerRequest(idFromStack);
        }.bind(this);

        window.addVfbId = function(idFromOutside) {
            this.addVfbId(idFromOutside);
        }.bind(this);

        window.setTermInfo = function(meta, id) {
            this.refs.termInfoRef.setTermInfo(meta, id);
        }.bind(this);

        window.fetchVariableThenRun = function(idsList, cb, label) {
            this.fetchVariableThenRun(idsList, cb, label);
        }.bind(this);

        window.addToQueryCallback = function(variableId, label) {
            this.addToQueryCallback(variableId, label)
        }.bind(this);

        // Canvas initialization
        this.refs.vfbCanvas.flipCameraY();
        this.refs.vfbCanvas.flipCameraZ();
        this.refs.vfbCanvas.setWireframe(false);
        this.refs.vfbCanvas.displayAllInstances();
        this.refs.vfbCanvas.engine.controls.rotateSpeed = 3;
        this.refs.vfbCanvas.engine.setLinesThreshold(0);
        
        //Control panel initialization and filter which instances to display
        if(this.refs.controlpanelRef !== undefined) {
            this.refs.controlpanelRef.setColumnMeta(this.controlPanelColMeta);
            this.refs.controlpanelRef.setColumns(this.controlPanelColumns);
            this.refs.controlpanelRef.setControlsConfig(this.controlPanelConfig);
            this.refs.controlpanelRef.setControls(this.controlPanelControlConfigs);
            this.refs.controlpanelRef.setDataFilter(function (entities) {
                var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, entities);
                var visualParents = [];
                for (var i = 0; i < visualInstances.length; i++) {
                    if (visualInstances[i].getParent() != null) {
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
        }

        // Query builder initialization
        this.refs.querybuilderRef.setResultsColumnMeta(this.queryResultsColMeta);
        this.refs.querybuilderRef.setResultsColumns(this.queryResultsColumns);
        this.refs.querybuilderRef.setResultsControlsConfig(this.queryResultsControlConfig);
        this.refs.querybuilderRef.addDataSource(this.queryBuilderDatasourceConfig);

        // Loading ids passed through the browser's url
        var idsList = this.props.location.search.replace("?i=", "");
        if((idsList.length > 0) && (this.state.modelLoaded == true) && (this.urlIdsLoaded == false)) {
            this.urlIdsLoaded = true;
            var idArray = idsList.split(",");
            var that = this;
            console.log("Loading IDS from url");
            GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
                that.addVfbId(idArray);
            });
        }

        // Selection listener
        GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
            var selection = GEPPETTO.SceneController.getSelection();
            if (selection.length > 0 && instance.isSelected()) {
                var latestSelection = instance;
                var currentSelectionName = "";
                if (this.refs.termInfoRef.getTermInfoWidget() != undefined) {
                    currentSelectionName = this.refs.termInfoRef.getTermInfoWidget().name;
                }
                if (latestSelection.getChildren().length > 0) {
                    // it's a wrapper object - if name is different from current selection set term info
                    if (currentSelectionName != latestSelection.getName()) {
                        this.refs.termInfoRef.setTermInfo(latestSelection[latestSelection.getId() + "_meta"], latestSelection[latestSelection.getId() + "_meta"].getName());
                    }
                } else {
                    // it's a leaf (no children) / grab parent if name is different from current selection set term info
                    var parent = latestSelection.getParent();
                    if (parent != null && currentSelectionName != parent.getName()) {
                        this.refs.termInfoRef.setTermInfo(parent[parent.getId() + "_meta"], parent[parent.getId() + "_meta"].getName());
                    }
                }
            }
            if (window.StackViewer1 != undefined) {
                this.refs.stackViewerRef.updateStackWidget();
            }
        }.bind(this));
    };

    // Children handlers
    buttonBarHandler(buttonState) {
        if((buttonState !== "infoBtn") || (buttonState !== "stackBtn")) {
            var tempState = this.state[buttonState];
            this.setState({
                [buttonState] : !tempState
            });
        }
    }

    termInfoHandler(childrenState) {
        console.log("term info has been closed");
        if(childrenState !== undefined) {
            this.setState({ infoBtn: childrenState });
        } else {
            this.setState({ infoBtn: !(this.state.infoBtn) });
        }       
    };

    stackViewerHandler(childrenState) {
        console.log("term info has been closed");
        if(childrenState !== undefined) {
            this.setState({ stackBtn: childrenState });
        } else {
            this.setState({ stackBtn: !(this.state.infoBtn) });
        }
    };

    stackViewerRequest(variableId) {
        this.addVfbId([variableId]);
    };

    render() {

        this.tutorialRender = this.state.tutorialBtn ? <TutorialWidget />  : undefined;

        return (
            <div style={{height: '100%', width: '100%'}}>
                <VFBToolBar />
                <Rnd
                    enableResizing={{
                        top: false, right: false, bottom: false,
                        left: false, topRight: false, bottomRight: false,
                        bottomLeft: false, topLeft: false}}
                    default={{
                        x: this.getButtonBarDefaultX(), y: this.getButtonBarDefaultY(),
                        height: 80, width: 340}}
                    className="new-widget"
                    disableDragging={true}
                    maxHeight={80} minHeight={50}
                    maxWidth={350} minWidth={150}
                    ref={c => { this.rnd = c; }} >
                    <ButtonBar
                        id="ButtonBarContainer"
                        configuration={this.buttonBarConfig}
                        buttonBarHandler={this.buttonBarHandler} />
                </Rnd>

                <Logo
                    logo='gpt-fly'
                    id="geppettologo" />

                <LinkButton
                    left={41}
                    top={365}
                    icon='fa fa-github' 
                    url='https://github.com/VirtualFlyBrain/VFB2' />

                <div id="sim">
                    <Canvas
                        id="CanvasContainer"
                        name={"Canvas"}
                        ref="vfbCanvas" />
                </div>

                <div id="spotlight" style={{top: 0}}>
                <SpotLight ref="spotlightRef" indexInstances={false} spotlightConfig={this.spotlightConfig}
                    spotlightDataSourceConfig={this.spotlightDataSourceConfig} icon={"styles.Modal"}
                    useBuiltInFilter={false} />
                </div>

                <div id="controlpanel" style={{top: 0}}>
                    <ControlPanel ref="controlpanelRef" icon={"styles.Modal"} enableInfiniteScroll={true} 
                        useBuiltInFilter={false} controlPanelColMeta={this.controlPanelColMeta}
                        controlPanelConfig={this.controlPanelConfig} columns={this.controlPanelColumns}
                        controlPanelControlConfigs={this.controlPanelControlConfigs}/>
                </div>

                <div id="querybuilder" style={{top: 0}}>
                    <QueryBuilder ref="querybuilderRef" icon={"styles.Modal"} useBuiltInFilter={false} />
                </div>

                <StackWidget
                    ref="stackViewerRef" 
                    canvasRef={this.refs.vfbCanvas}
                    stackViewerHandler={this.stackViewerHandler} />

                <TermInfoWidget
                    ref="termInfoRef"
                    idSelected={this.state.idSelected}
                    termInfoHandler={this.termInfoHandler} />

                {this.tutorialRender}
            </div>
        );
    }
}
