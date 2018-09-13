import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import ButtonBar from '../../../js/components/interface/buttonBar/ButtonBar'
import WidgetCapability from '../../../js/components/widgets/WidgetCapability';
import SpotLight from '../../../js/components/interface/spotlight/spotlight';
import Tutorial from '../../../js/components/interface/tutorial/Tutorial';
import ControlPanel from '../../../js/components/interface/controlPanel/controlpanel';
import Logo from '../../../js/components/interface/logo/Logo'
import Canvas from '../../../js/components/interface/3dCanvas/Canvas';
import LinkButton from '../../../js/components/interface/linkButton/LinkButton';
import TermInfoWidget from './interface/TermInfoWidget';
import StackViewer from '../../../js/components/widgets/stackViewer/StackViewerComponent';

var Rnd = require('react-rnd').default;
var vfbDefaultTutorial = require('../tutorials/stackTutorial.json');
var GEPPETTO = require('geppetto');

export default class VFBMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            canvasAvailable: false,
            modelLoaded: (window.Model != undefined)
        }

        var that = this;
        GEPPETTO.on(GEPPETTO.Events.Model_loaded, function () {
            that.setState({modelLoaded: true});
        });

        this.getButtonBarDefaultX = this.getButtonBarDefaultX.bind(this);
        this.getButtonBarDefaultY = this.getButtonBarDefaultY.bind(this);
        this.getStackViewerDefaultX = this.getStackViewerDefaultX.bind(this);
        this.getStackViewerDefaultY = this.getStackViewerDefaultY.bind(this);

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
        }
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
    }

    componentWillMount() {
        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, "Initialising Virtual Fly Brain");
    }

    componentDidMount() {
        // Canvas initialization
        this.refs.vfbCanvas.flipCameraY();
        this.refs.vfbCanvas.flipCameraZ();
        this.refs.vfbCanvas.setWireframe(false);
        this.refs.vfbCanvas.displayAllInstances();
        this.refs.vfbCanvas.engine.controls.rotateSpeed = 3;
        this.refs.vfbCanvas.engine.setLinesThreshold(0);
        
        if(window.Model == undefined) {
            //Project.loadFromURL(window.location.origin + '/' + GEPPETTO_CONFIGURATION.contextPath + '/geppetto/extensions/geppetto-vfb/model/vfb.json');
            Project.loadFromURL(window.location.origin.replace(":8081", "") + '/' + '/project/vfb.json');
        }
    }

    render() {
        var TutorialWidget = WidgetCapability.createWidget(Tutorial);
        var ButtonBarWidget = WidgetCapability.createWidget(ButtonBar);
        var StackViewerWidget = WidgetCapability.createWidget(StackViewer);

        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        
        const logoStyle = { fontSize: '20px'};

        return (
            <div>
                <div>
                    <ButtonBarWidget
                        id="ButtonBarContainer"
                        componentType={'BUTTONBAR'}
                        configuration={this.buttonBarConfig}
                        position={{left: this.getButtonBarDefaultX(), top: this.getButtonBarDefaultY()}}
                        size={{height: 80, width: 340}} 
                        resizable={false}
                        draggable={false}
                        fixPosition={true}
                        help={false}
                        showHistoryIcon={false}
                        closable={false}
                        minimizable={false}
                        maximizable={false}
                        collapsable={false} />
                </div>
                <div>
                    <TutorialWidget
                        componentType={'TUTORIAL'}
                        tutorialData={vfbDefaultTutorial}
                        closeByDefault={false}
                        position={{left: 100, top: 70}}
                        size={{height: 100, width: 100}}
                        tutorialMessageClass="tutorialMessage"
                        showMemoryCheckbox={false}
                        tutorialsList={tutorialsList}
                        isStateLess={true}
                        resizable={false}
                        draggable={false}
                        fixPosition={true}
                        help={false}
                        showHistoryIcon={false}
                        closable={true}
                        minimizable={true}
                        maximizable={true}
                        collapsable={true} />
                </div>
                <div>
                    <Logo 
                        logo='gpt-fly'
                        propStyle={logoStyle} />
                </div>
                <div>
                    <LinkButton
                        left={41}
                        top={340}
                        icon='fa fa-github' 
                        url='https://github.com/VirtualFlyBrain/VFB2' />
                </div>
                <div>
                    <Canvas
                        id="CanvasContainer"
                        name={"Canvas"}
                        componentType={'Canvas'}
                        ref="vfbCanvas"
                        style={{ height: '100%', width: '100%' }} />
                </div>
                <div>
                    <SpotLight 
                        indexInstances={false} 
                        spotlightConfig={this.spotlightConfig}
                        spotlightDataSourceConfig={this.spotlightDataSourceConfig} />
                </div>
                <div>
                    <StackViewer
                        config={this.stackConfiguration}
                        voxel={this.voxel}
                        data={this.stackViewerData} />
                </div>
                <div>
                    <ControlPanel
                        enableInfiniteScroll={true} />
                </div>
                <div>
                    <TermInfoWidget />
                </div>
            </div>
        );
    }
}