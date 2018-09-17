import React, { Component } from 'react';
import Tutorial from '../../../../js/components/interface/tutorial/Tutorial';
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';

var Rnd = require('react-rnd').default;
var vfbDefaultTutorial = require('../../tutorials/stackTutorial.json');
var GEPPETTO = require('geppetto');

export default class TutorialWidget extends React.Component {

    constructor(props) {
        super(props);

        //this.state = {
        //}

        this.hide = this.hide.bind(this);
    }

    hide() {
        console.log("hide called by the tutorial component through parent class");
    }

    render() {
        var TutorialWidget = WidgetCapability.createWidget(Tutorial);

        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        return (
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
        );
    }
}