import React, { Component } from 'react';
import ButtonBar from '../../../js/components/interface/buttonBar/ButtonBar'
import WidgetCapability from '../../../js/components/widgets/WidgetCapability';
import SpotLight from '../../../js/components/interface/spotlight/spotlight';
import Tutorial from '../../../js/components/interface/tutorial/Tutorial';
import ControlPanel from '../../../js/components/interface/controlPanel/controlpanel';
import Logo from '../../../js/components/interface/logo/Logo'
import Canvas from '../../../js/components/interface/3dCanvas/Canvas';
import LinkButton from '../../../js/components/interface/linkButton/LinkButton';
import TermInfoWidget from './interface/TermInfoWidget';
import StackWidget from './interface/StackWidget';
import StackViewer from '../../../js/components/widgets/stackViewer/StackViewerComponent';
import TutorialWidget from './interface/TutorialWidget';
import NewWidget from '../../../js/components/widgets/NewWidget';

var $ = require('jquery');
var Rnd = require('react-rnd').default;
var ImportType = require('./../../../js/geppettoModel/model/ImportType');
var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");
var vfbDefaultTutorial = require('../tutorials/stackTutorial.json');
var GEPPETTO = require('geppetto');

export default class VFBMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            canvasAvailable: false,
            modelLoaded: (window.Model != undefined),
            tutorialOpened: false,
            termInfoOpened: true,
            stackViewerOpened: true,
            idSelected: undefined
        };

        this.addVfbId = this.addVfbId.bind(this);
        this.resolve3D = this.resolve3D.bind(this);
        this.setSepCol = this.setSepCol.bind(this);
        this.fetchVariableThenRun = this.fetchVariableThenRun.bind(this);
        this.getButtonBarDefaultX = this.getButtonBarDefaultX.bind(this);
        this.getButtonBarDefaultY = this.getButtonBarDefaultY.bind(this);
        this.getStackViewerDefaultX = this.getStackViewerDefaultX.bind(this);
        this.getStackViewerDefaultY = this.getStackViewerDefaultY.bind(this);
        this.termInfoHandler = this.termInfoHandler.bind(this);
        this.hasVisualType = this.hasVisualType.bind(this);
        this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);
        this.customSorter = this.customSorter.bind(this);

        this.coli = 1;
        this.colours = ["0x5b5b5b", "0x00ff00", "0xff0000", "0x0000ff", "0x0084f6", "0x008d46", "0xa7613e", "0x4f006a", "0x00fff6", "0x3e7b8d", "0xeda7ff", "0xd3ff95", "0xb94fff", "0xe51a58", "0x848400", "0x00ff95", "0x61002c", "0xf68412", "0xcaff00", "0x2c3e00", "0x0035c1", "0xffca84", "0x002c61", "0x9e728d", "0x4fb912", "0x9ec1ff", "0x959e7b", "0xff7bb0", "0x9e0900", "0xffb9b9", "0x8461ca", "0x9e0072", "0x84dca7", "0xff00f6", "0x00d3ff", "0xff7258", "0x583e35", "0x003e35", "0xdc61dc", "0x6172b0", "0xb9ca2c", "0x12b0a7", "0x611200", "0x2c002c", "0x5800ca", "0x95c1ca", "0xd39e23", "0x84b058", "0xe5edb9", "0xf6d3ff", "0xb94f61", "0x8d09a7", "0x6a4f00", "0x003e9e", "0x7b3e7b", "0x3e7b61", "0xa7ff61", "0x0095d3", "0x3e7200", "0xb05800", "0xdc007b", "0x9e9eff", "0x4f4661", "0xa7fff6", "0xe5002c", "0x72dc72", "0xffed7b", "0xb08d46", "0x6172ff", "0xdc4600", "0x000072", "0x090046", "0x35ed4f", "0x2c0000", "0xa700ff", "0x00f6c1", "0x9e002c", "0x003eff", "0xf69e7b", "0x6a7235", "0xffff46", "0xc1b0b0", "0x727272", "0xc16aa7", "0x005823", "0xff848d", "0xb08472", "0x004661", "0x8dff12", "0xb08dca", "0x724ff6", "0x729e00", "0xd309c1", "0x9e004f", "0xc17bff", "0x8d95b9", "0xf6a7d3", "0x232309", "0xff6aca", "0x008d12", "0xffa758", "0xe5c19e", "0x00122c", "0xc1b958", "0x00c17b", "0x462c00", "0x7b3e58", "0x9e46a7", "0x4f583e", "0x6a35b9", "0x72b095", "0xffb000", "0x4f3584", "0xb94635", "0x61a7ff", "0xd38495", "0x7b613e", "0x6a004f", "0xed58ff", "0x95d300", "0x35a7c1", "0x00009e", "0x7b3535", "0xdcff6a", "0x95d34f", "0x84ffb0", "0x843500", "0x4fdce5", "0x462335", "0x002c09", "0xb9dcc1", "0x588d4f", "0x9e7200", "0xca4684", "0x00c146", "0xca09ed", "0xcadcff", "0x0058a7", "0x2ca77b", "0x8ddcff", "0x232c35", "0xc1ffb9", "0x006a9e", "0x0058ff", "0xf65884", "0xdc7b46", "0xca35a7", "0xa7ca8d", "0x4fdcc1", "0x6172d3", "0x6a23ff", "0x8d09ca", "0xdcc12c", "0xc1b97b", "0x3e2358", "0x7b6195", "0xb97bdc", "0xffdcd3", "0xed5861", "0xcab9ff", "0x3e5858", "0x729595", "0x7bff7b", "0x95356a", "0xca9eb9", "0x723e1a", "0x95098d", "0xf68ddc", "0x61b03e", "0xffca61", "0xd37b72", "0xffed9e", "0xcaf6ff", "0x58c1ff", "0x8d61ed", "0x61b972", "0x8d6161", "0x46467b", "0x0058d3", "0x58dc09", "0x001a72", "0xd33e2c", "0x959546", "0xca7b00", "0x4f6a8d", "0x9584ff", "0x46238d", "0x008484", "0xf67235", "0x9edc84", "0xcadc6a", "0xb04fdc", "0x4f0912", "0xff1a7b", "0x7bb0d3", "0x1a001a", "0x8d35f6", "0x5800a7", "0xed8dff", "0x969696", "0xffd300"];
        this.vfbLoadBuffer = [];

        this.buttonBarConfig = {
            "searchBtn": {
                "actions": [
                    ""
                ],
                "icon": "fa fa-search",
                "label": "",
                "tooltip": "Search"
            },
            "queryBtn": {
                "actions": [
                    ""
                ],
                "icon": "fa fa-quora",
                "label": "",
                "tooltip": "Open Query"
            },
            "controlPanelBtn": {
                "actions": [
                    ""
                ],
                "icon": "fa fa-list",
                "label": "",
                "tooltip": "Layers"
            },
            "infoBtn": {
                "actions": [
                    ""
                ],
                "icon": "fa fa-info",
                "label": "",
                "tooltip": "Show term info"
            },
            "stackBtn": {
                "actions": [
                    ""
                ],
                "icon": "gpt-stack",
                "label": "",
                "tooltip": "Show slice viewer"
            },
            "meshBtn": {
                "condition": "",
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
                "actions": [
                    ""
                ],
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
            serverUrl: 'http://www.virtualflybrain.org/fcgi/wlziipsrv.fcgi',
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

        //var that = this;
        //GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
        //    that.setState({modelLoaded: true});
        //});
    }

    getButtonBarDefaultX() {
        return (Math.ceil(window.innerWidth / 2) - 175);
    };

    getButtonBarDefaultY() {
        return 10;
    };

    getStackViewerDefaultX() { 
        return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10)); 
    };

    getStackViewerDefaultY() {
        return 200;
    };

    handleNewId() {
        return;
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
        GEPPETTO.SceneController.deselectAll();

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

    // End of logic to add VFB Ids to scene

    // Component react update handlers

    componentWillMount() {
        //GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, "Initialising Virtual Fly Brain");
        console.log("component will mount");
    };

    componentDidUpdate() {
        console.log("component did update called");
        var idsList = this.props.location.search.replace("?id=", "");
        if((idsList.length > 1) && (this.state.modelLoaded == true)) {
            var idArray = idsList.split(",");
            var that = this;
            GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
                that.addVfbId(idArray);
            });
        }
    };

    componentWillUpdate() {
        console.log("component will update called");
    };

    componentDidMount() {
        // Canvas initialization
        this.refs.vfbCanvas.flipCameraY();
        this.refs.vfbCanvas.flipCameraZ();
        this.refs.vfbCanvas.setWireframe(false);
        this.refs.vfbCanvas.displayAllInstances();
        this.refs.vfbCanvas.engine.controls.rotateSpeed = 3;
        this.refs.vfbCanvas.engine.setLinesThreshold(0);

        var idsList = this.props.location.search.replace("?id=", "");
        if((idsList.length > 1) && (this.state.modelLoaded == true)) {
            this.addVfbId(idsList);
        }

        if((window.Model == undefined) && (this.state.modelLoaded == false)) {
            //Project.loadFromURL(window.location.origin + '/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto/extensions/geppetto-vfb/model/vfb.json');
            Project.loadFromURL(window.location.origin.replace(":8081", "") + '/' + '/project/vfb.json');
            this.setState({modelLoaded: true});
        }
    };

    // Children handlers
    termInfoHandler(childrenState) {
        console.log("term info has been closed");
        if(childrenState !== undefined) {
            this.setState({ termInfoOpened: childrenState });
        } else {
            this.setState({ termInfoOpened: !(this.state.termInfoOpened) });
        }       
    };

    render() {

        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        
        const logoStyle = { fontSize: '20px'};

        var tutorialRendered = this.state.tutorialOpened ? <TutorialWidget /> : <div id="tutorialContainerEmpty"> </div>;
        //var termInfoRendered = (this.state.termInfoOpened) ? <TermInfoWidget ref="termInfoRef" idSelected={this.state.idSelected} termInfoHandler={this.termInfoHandler} /> : <div id="terminfo-empty"> </div>; 
        return (
            <div>
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
                        configuration={this.buttonBarConfig} />
                </Rnd>

                {tutorialRendered}

                <Logo 
                    logo='gpt-fly'
                    propStyle={logoStyle} />

                <LinkButton
                    left={41}
                    top={340}
                    icon='fa fa-github' 
                    url='https://github.com/VirtualFlyBrain/VFB2' />

                <Canvas
                    id="CanvasContainer"
                    name={"Canvas"}
                    componentType={'Canvas'}
                    ref="vfbCanvas"
                    style={{ height: '100%', width: '100%' }} />

                <SpotLight 
                    indexInstances={false} 
                    spotlightConfig={this.spotlightConfig}
                    spotlightDataSourceConfig={this.spotlightDataSourceConfig} />

                <ControlPanel
                    enableInfiniteScroll={true} />

                <StackWidget
                    ref="stackViewRef" />

                <TermInfoWidget 
                    ref="termInfoRef" 
                    idSelected={this.state.idSelected} 
                    termInfoHandler={this.termInfoHandler} />
            </div>
        );
    }
}