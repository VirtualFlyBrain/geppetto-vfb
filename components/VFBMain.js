import React, { Component } from 'react';
import VFBToolBar from './interface/VFBToolBar';
import StackWidget from './interface/StackWidget';
import TutorialWidget from './interface/TutorialWidget';
import Logo from '../../../js/components/interface/logo/Logo';
import Canvas from '../../../js/components/interface/3dCanvas/Canvas';
import QueryBuilder from '../../../js/components/interface/query/query';
import ButtonBar from '../../../js/components/interface/buttonBar/ButtonBar';
import SpotLight from '../../../js/components/interface/spotlight/spotlight';
import LinkButton from '../../../js/components/interface/linkButton/LinkButton';
import ControlPanel from '../../../js/components/interface/controlPanel/controlpanel';
import HTMLViewer from '../../../js/components/interface/htmlViewer/HTMLViewer';
import VFBTermInfoWidget from './interface/VFBTermInfo';

// import NewWidget from '../../../js/components/widgets/NewWidget'; For future use.
require('../css/base.less');
require('../css/VFBMain.less');
//require('../css/base.css');
var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Rnd = require('react-rnd').default;
var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");

export default class VFBMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            canvasAvailable: false,
            modelLoaded: (window.Model != undefined),
            termInfoVisible: true, // All states handled by the button bar
            stackViewerVisible: true,
            tutorialWidgetVisible: false,
            spotlightVisible: true,
            controlPanelVisible: true,
            wireframeVisible: false,
            queryBuilderVisible: true, // END buttonbar states
            idSelected: undefined,
            htmlFromToolbar: undefined
        };

        this.clearQS = this.clearQS.bind(this);
        this.addVfbId = this.addVfbId.bind(this);
        this.resolve3D = this.resolve3D.bind(this);
        this.setSepCol = this.setSepCol.bind(this);
        this.customSorter = this.customSorter.bind(this);
        this.hasVisualType = this.hasVisualType.bind(this);
        this.tutorialHandler = this.tutorialHandler.bind(this)
        this.termInfoHandler = this.termInfoHandler.bind(this);
        this.closeHtmlViewer = this.closeHtmlViewer.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.buttonBarHandler = this.buttonBarHandler.bind(this);
        this.renderHTMLViewer = this.renderHTMLViewer.bind(this);
        this.stackViewerRequest = this.stackViewerRequest.bind(this);
        this.stackViewerHandler = this.stackViewerHandler.bind(this);
        this.addToQueryCallback = this.addToQueryCallback.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.fetchVariableThenRun = this.fetchVariableThenRun.bind(this);
        this.getButtonBarDefaultX = this.getButtonBarDefaultX.bind(this);
        this.getButtonBarDefaultY = this.getButtonBarDefaultY.bind(this);
        this.getStackViewerDefaultX = this.getStackViewerDefaultX.bind(this);
        this.getStackViewerDefaultY = this.getStackViewerDefaultY.bind(this);
        this.handleSceneAndTermInfoCallback = this.handleSceneAndTermInfoCallback.bind(this);

        this.htmlToolbarRef = this.htmlToolbarRef.bind(this);

        this.coli = 1;
        this.vfbLoadBuffer = [];
        this.tutorialRender = undefined;
        this.termInfoRender = undefined;
        this.htmlToolbarRender = undefined;
        this.urlIdsLoaded = false;
        this.idInitialized = false;

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

        this.colours = require('./configuration/colours.json');
        this.tutorialsList = require('./configuration/tutorialsList.json');

        this.buttonBarConfig = require('../components/configuration/buttonBarConfiguration').buttonBarConfig;

        this.spotlightConfig = require('./configuration/spotlightConfiguration').spotlightConfig;

        this.controlPanelColMeta = require('./configuration/controlPanelConfiguration').controlPanelColMeta;
        this.controlPanelConfig = require('./configuration/controlPanelConfiguration').controlPanelConfig;
        this.controlPanelControlConfigs = require('./configuration/controlPanelConfiguration').controlPanelControlConfigs;
        this.controlPanelColumns = require('./configuration/controlPanelConfiguration').controlPanelColumns;

        this.queryResultsColMeta = require('./configuration/queryBuilderConfiguration').queryResultsColMeta;
        this.queryResultsColumns = require('./configuration/queryBuilderConfiguration').queryResultsColumns;
        this.queryResultsControlConfig = require('./configuration/queryBuilderConfiguration').queryResultsControlConfig;

        this.queryBuilderDatasourceConfig = {
            VFB: {
                url: "https://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&rows=250&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E100.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=*$SEARCH_TERM$*%20OR%20$SEARCH_TERM$&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", crossDomain: true,
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
                                actions: ["window.addVfbId('$ID$');$(\"#spotlight\").hide();"],
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

        this.idForTermInfo = undefined;

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
        var variables = GEPPETTO.ModelFactory.getTopLevelVariablesById(variableId);
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
                this.refs.termInfoWidgetRef.setTermInfo(meta, meta.getParent().getId());
                this.resolve3D(variableIds[singleId], function () {
                    GEPPETTO.SceneController.deselectAll();
                    if ((instance != undefined) && (typeof instance.select === "function")){
                        instance.select();
                         this.refs.termInfoWidgetRef.setTermInfo(meta, meta.getParent().getId());
                    }
                    //this.refs.termInfoWidgetRef.setTermInfo(meta, meta.getParent().getId());
                }.bind(this));
            } else {
                this.refs.termInfoWidgetRef.setTermInfo(meta, meta.getParent().getId());
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
        var ImportType = require('./../../../js/geppettoModel/model/ImportType');
        var rootInstance = Instances.getInstance(path);
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
                        var templateID = anchorElement.attr('data-instancepath');
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
                    var templateID = anchorElement.attr('data-instancepath');
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
                this.refs.vfbCanvas.display([instance]);
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

    updateDimensions() {
        if(this.refs.buttonBarRef !== undefined) {
            this.refs.buttonBarRef.updatePosition({x: this.getButtonBarDefaultX(), y: this.getButtonBarDefaultY()});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // Reopen stackViewer from button bar if previously has been closed.
        if((prevState.stackViewerVisible !== this.state.stackViewerVisible) && (prevState.stackViewerVisible !== undefined)) {
            this.refs.stackViewerRef.addStackWidget();
        }

        if((prevState.termInfoVisible !== this.state.termInfoVisible) && (this.termInfoRender !== undefined) && (this.state.termInfoVisible === true)) {
            this.refs.termInfoWidgetRef.refs.termInfoRef.open();
        }

        if((prevState.tutorialWidgetVisible !== this.state.tutorialWidgetVisible) && (this.state.tutorialWidgetVisible !== false) && (this.tutorialRender !== undefined)) {
            this.refs.tutorialWidgetRef.refs.tutorialRef.open(true);
        }

        if((prevState.wireframeVisible !== this.state.wireframeVisible)) {
            this.refs.vfbCanvas.setWireframe(!this.refs.vfbCanvas.getWireframe());
        }

        if((prevState.controlPanelVisible !== this.state.controlPanelVisible)) {
            this.refs.controlpanelRef.open();
        }

        if((prevState.spotlightVisible !== this.state.spotlightVisible)) {
            this.refs.spotlightRef.open();
        }

        if((prevState.queryBuilderVisible !== this.state.queryBuilderVisible)) {
            this.refs.querybuilderRef.open();
        }

        if(this.state.htmlFromToolbar !== undefined) {
            document.addEventListener('mousedown', this.handleClickOutside);
        }
    };

    componentWillMount() {
        if((window.Model == undefined) && (this.state.modelLoaded == false)) {
            Project.loadFromURL(window.location.origin.replace('https:','http:') + '/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto/extensions/geppetto-vfb/model/vfb.json');
            // Project.loadFromURL(window.location.origin.replace(":8081", ":8989") + '/' + 'vfb.json');            // Project.loadFromURL(window.location.origin.replace(":8081", ":8989") + '/' + 'vfb.json');
            // Local deployment for development. Uncomment the line below.
            // Project.loadFromURL(window.location.origin.replace(":8081", "") + '/' + 'project/vfb.json');
            // Project.loadFromURL(window.location.origin.replace(":8081", ":8989") + '/' + 'vfb.json');
            this.setState({modelLoaded: true});
        }

        if(this.state.htmlFromToolbar !== undefined) {
            document.addEventListener('mousedown', this.handleClickOutside);
        }
    };

    componentWillUnmount() {
        if(this.state.htmlFromToolbar !== undefined) {
            document.removeEventListener('mousedown', this.handleClickOutside);
        }

        window.removeEventListener("resize", this.updateDimensions);
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);

        GEPPETTO.G.setIdleTimeOut(-1);

        // Global functions linked to VFBMain functions
        window.resolve3D = function(globalID) {
            this.resolve3D(globalID);
        }.bind(this);

        window.stackViewerRequest = function(idFromStack) {
            this.stackViewerRequest(idFromStack);
        }.bind(this);

        window.addVfbId = function(idFromOutside) {
            this.addVfbId(idFromOutside);
        }.bind(this);

        window.setTermInfo = function(meta, id) {
            this.refs.termInfoWidgetRef.setTermInfo(meta, id);
        }.bind(this);

        window.fetchVariableThenRun = function(idsList, cb, label) {
            this.fetchVariableThenRun(idsList, cb, label);
        }.bind(this);

        window.addToQueryCallback = function(variableId, label) {
            this.addToQueryCallback(variableId, label)
        }.bind(this);

        window.resolve3D = function(externalID) {
            this.resolve3D(externalID);
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
        if((this.props.location.search.indexOf("id=") == -1) && (this.props.location.search.indexOf("i=") == -1)) {
            var that = this;
            console.log("Loading default Adult Brain VFB_00017894 template.");
            GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
                that.addVfbId("VFB_00017894");
            });
        }

        if(this.props.location.search.indexOf("id=") > -1) {
            var idsList = this.props.location.search;
            var regex3D = /i=/gi;
            var results3D, starts3DString = [], ends3DString = [];
            while((results3D = regex3D.exec(idsList))) {
                starts3DString.push(results3D.index + results3D[0].length);
                if(results3D.input.substring(results3D.index).indexOf("&") > -1) {
                    ends3DString.push(results3D.input.substring(results3D.index).indexOf("&") + results3D.index);
                } else {
                    ends3DString.push(results3D.input.length);
                }
            }

            var resultsTermInfo, startsTermInfoString = [], endsTermInfoString = [];
            var regexTermInfo = /id=/gi;
            while((resultsTermInfo = regexTermInfo.exec(idsList))) {
                startsTermInfoString.push(resultsTermInfo.index + resultsTermInfo[0].length);
                if(resultsTermInfo.input.substring(resultsTermInfo.index).indexOf("&") > -1) {
                    endsTermInfoString.push(resultsTermInfo.input.substring(resultsTermInfo.index).indexOf("&") + resultsTermInfo.index);
                } else {
                    endsTermInfoString.push(resultsTermInfo.input.length);
                }
                
            }
            for(var i=0 ; i < startsTermInfoString.length ; i++) {
                var idsTermInfoSubstring = idsList.substring(startsTermInfoString[i], endsTermInfoString[i]).split(",");
            }
            this.idForTermInfo = idsTermInfoSubstring[idsTermInfoSubstring.length - 1];

            for(var i=0 ; i < starts3DString.length ; i++) {
                var ids3DSubstring = idsList.substring(starts3DString[i], ends3DString[i]).split(",");
                var that = this;
                console.log("Loading IDS to add to term info from url");
                GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
                    ids3DSubstring.push(this.idForTermInfo);
                    that.addVfbId(ids3DSubstring);
                });
            }
        } else {
            var idsList = this.props.location.search.replace("?i=", "");
            if((idsList.length > 0) && (this.state.modelLoaded == true) && (this.urlIdsLoaded == false)) {
                this.urlIdsLoaded = true;
                var idArray = idsList.split(",");
                var that = this;
                console.log("Loading IDS to add to the scene from url");
                GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
                    that.addVfbId(idArray);
                });
            }
        }

        // Selection listener
        GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
            var selection = GEPPETTO.SceneController.getSelection();
            if (selection.length > 0 && instance.isSelected()) {
                var latestSelection = instance;
                var currentSelectionName = "";
                if (this.refs.termInfoWidgetRef != undefined) {
                    currentSelectionName = this.refs.termInfoWidgetRef.refs.termInfoRef.name;
                }
                if (latestSelection.getChildren().length > 0) {
                    // it's a wrapper object - if name is different from current selection set term info
                    if (currentSelectionName != latestSelection.getName()) {
                        this.refs.termInfoWidgetRef.setTermInfo(latestSelection[latestSelection.getId() + "_meta"], latestSelection[latestSelection.getId() + "_meta"].getName());
                    }
                } else {
                    // it's a leaf (no children) / grab parent if name is different from current selection set term info
                    var parent = latestSelection.getParent();
                    if (parent != null && currentSelectionName != parent.getName()) {
                        this.refs.termInfoWidgetRef.setTermInfo(parent[parent.getId() + "_meta"], parent[parent.getId() + "_meta"].getName());
                    }
                }
            }
            if (window.StackViewer1 != undefined) {
                this.refs.stackViewerRef.updateStackWidget();
            }
        }.bind(this));
        
        GEPPETTO.on(GEPPETTO.Events.Websocket_disconnected, function () {
        	console.log("Reloading websocket connection by reloading page");
        	window.location.reload();
        });
    };

    // Children handlers
    buttonBarHandler(buttonState) {
        if(buttonState !== "stackViewerVisible") {
            var tempState = this.state[buttonState];
            this.setState({
                [buttonState] : !tempState
            });
        }
    }

    tutorialHandler() {
        if(this.state.tutorialWidgetVisible == true) {
            this.setState({
                tutorialWidgetVisible: false
            });
        }
    }

    termInfoHandler() {
        if(this.state.termInfoVisible == true) {
            this.setState({
                termInfoVisible: false
            });
        }
    };

    stackViewerHandler(childrenState) {
        if(childrenState !== undefined) {
            this.setState({ stackViewerVisible: childrenState });
        } else {
            this.setState({ stackViewerVisible: !(this.state.stackViewerVisible) });
        }
    };

    stackViewerRequest(variableId) {
        this.addVfbId([variableId]);
    };

    renderHTMLViewer(htmlChild) {
        if(htmlChild !== undefined) {
            this.setState({
                htmlFromToolbar: htmlChild
            });
        }
    };

    handleClickOutside() {
        if(this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({htmlFromToolbar: undefined});
        }
    };

    htmlToolbarRef(node) {
        this.wrapperRef = node;
    }

    closeHtmlViewer() {
        this.setState({htmlFromToolbar: undefined});
    }

    render() {
        if((this.state.tutorialWidgetVisible == true) && (this.tutorialRender == undefined)) {
            this.tutorialRender = <TutorialWidget tutorialHandler={this.tutorialHandler} ref="tutorialWidgetRef" />
        }

        if((this.state.termInfoVisible == true) && (this.termInfoRender == undefined)) {
            this.termInfoRender = <VFBTermInfoWidget
                                    termInfoHandler={this.termInfoHandler}
                                    ref="termInfoWidgetRef"
                                    showButtonBar={true}
                                    order={['Name',
                                            'Alternative Names',
                                            'Query For',
                                            'Depicts',
                                            'Thumbnail',
                                            'Relationship',
                                            'Description',
                                            'References',
                                            'Aligned To',
                                            'Download']} />
        }
        // else if((this.state.termInfoVisible == true) && (this.termInfoRender != undefined)){
        //     this.refs.termInfoWidgetRef.refs.termInfoRef.open(true);
        // }

        this.htmlToolbarRender = (this.state.htmlFromToolbar !== undefined) ?
            <Rnd enableResizing={{
                top: false, right: false, bottom: false, left: false,
                topRight: false, bottomRight: false, bottomLeft: false,
                topLeft: false
                }}
                default={{ x: 50, y: 50, 
                        height: window.innerHeight - 100,
                        width: window.innerWidth - 100}}
                className="htmlViewerVFB"
                disableDragging={true}
                maxHeight={window.innerHeight - 100} minHeight={100}
                maxWidth={window.innerWidth - 100} minWidth={100}
                ref={d => { this.rnd2 = d; }} >
                <div onClick={this.closeHtmlViewer} className="closeHTMLViewer fa fa-times"></div>
                <div ref={this.htmlToolbarRef}>
                    <HTMLViewer
                        id="HTMLViewerContainer"
                        name={"HTMLViewer"}
                        componentType={'HTMLViewer'}
                        content={this.state.htmlFromToolbar}
                        style={{ width: window.innerWidth - 150, 
                                height: window.innerHeight - 150, 
                                float: 'center' }}
                        ref="htmlViewer" /> 
                </div>
            </Rnd> : undefined;

        return (
            <div style={{height: '100%', width: '100%'}}>
                <VFBToolBar htmlOutputHandler={this.renderHTMLViewer}/>
                <Rnd
                    enableResizing={{
                        top: false, right: false, bottom: false,
                        left: false, topRight: false, bottomRight: false,
                        bottomLeft: false, topLeft: false}}
                    default={{
                        x: this.getButtonBarDefaultX(), y: this.getButtonBarDefaultY(),
                        height: 35, width: 340}}
                    className="new-widget"
                    disableDragging={true}
                    maxHeight={35} minHeight={35}
                    maxWidth={350} minWidth={150}
                    ref="buttonBarRef" >
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
                    top={325}
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

                <div id="termInfoDiv">
                    {this.termInfoRender}
                </div>

                <div id="tutorialDiv">
                    {this.tutorialRender}
                </div>

                {this.htmlToolbarRender}
            </div>
        );
    }
}
