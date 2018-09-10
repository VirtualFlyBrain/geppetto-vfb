import React, { Component } from 'react';
import ButtonBar from '../../../../js/components/interface/buttonBar/ButtonBar'
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';
import SpotLight from '../../../../js/components/interface/spotlight/spotlight';
import Tutorial from '../../../../js/components/interface/tutorial/Tutorial';

var Rnd = require('react-rnd').default;
var vfbDefaultTutorial = require('../../tutorials/stackTutorial.json');
var GEPPETTO = require('geppetto');

export default class VFBToolBar extends React.Component {

    constructor(props) {
        super(props);

        this.getButtonBarDefaultX = this.getButtonBarDefaultX.bind(this);
        this.getButtonBarDefaultY = this.getButtonBarDefaultY.bind(this);

        this.buttonBarConfig = {
            "searchBtn": {
                "actions": [
                    "GEPPETTO.Spotlight.open();"
                ],
                "icon": "fa fa-search",
                "label": "",
                "tooltip": "Search"
            },
            "queryBtn": {
                "actions": [
                    "GEPPETTO.QueryBuilder.open();"
                ],
                "icon": "fa fa-quora",
                "label": "",
                "tooltip": "Open Query"
            },
            "controlPanelBtn": {
                "actions": [
                    "GEPPETTO.ControlPanel.open();"
                ],
                "icon": "fa fa-list",
                "label": "",
                "tooltip": "Layers"
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
                "tooltip": "Show slice viewer"
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
    }

    getButtonBarDefaultX() {
        return (Math.ceil(window.innerWidth / 2) - 175);
    };

    getButtonBarDefaultY() {
        return 10;
    };

    render() {
        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        var TutorialWidget = WidgetCapability.createWidget(Tutorial);

        return (
            <div>
                <ButtonBar
                    id="ButtonBarContainer"
                    configuration={this.buttonBarConfig}
                    position={{
                        x: this.getButtonBarDefaultX(), 
                        y: this.getButtonBarDefaultY(),
                        style: {
                            border: 'none !important',
                            marginRight: 5,
                            marginLeft: 5,
                            minWidth: 35,
                            minHeight: 35,
                        }}}>
                </ButtonBar>

                <SpotLight 
                    indexInstances={false} 
                    spotlightConfig={this.spotlightConfig}
                    spotlightDataSourceConfig={this.spotlightDataSourceConfig} />
                
                <Rnd
					enableResizing={{
						top: false, right: false, bottom: false, 
						left: false, topRight: false, bottomRight: false, 
						bottomLeft: false, topLeft: false}}
					default={{ 
						x: 100, y: 70, 
						height: 350, width: 350}}
					className="tutorial-widget"
					disableDragging={true}
					maxHeight={350} minHeight={150}
					maxWidth={350} minWidth={150}
					ref={c => { this.rnd = c; }} >
                    <Tutorial
                        tutorialData={vfbDefaultTutorial}
                        closeByDefault={true}
                        tutorialMessageClass="tutorialMessage"
                        showMemoryCheckbox={false}
                        tutorialsList={tutorialsList} />
                </Rnd>
            </div>
        );
    }
}