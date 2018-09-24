import React, { Component } from 'react';
import Tutorial from '../../../../js/components/interface/tutorial/Tutorial';
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';

var vfbDefaultTutorial = require('../../tutorials/stackTutorial.json');
var GEPPETTO = require('geppetto');

export default class TutorialWidget extends React.Component {

    constructor(props) {
        super(props);

        //this.state = {
        //}

        this.closeHandler = this.closeHandler.bind(this);
    }

    closeHandler() {
        console.log("tutorial close handler called");
    }

    render() {
        var TutorialWidget = WidgetCapability.createWidget(Tutorial);

        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        return (
            <div id="tutorial">
                <TutorialWidget
                    componentType={'TUTORIAL'}
                    tutorialData={vfbDefaultTutorial}
                    closeByDefault={false}
                    position={{left: 100, top: 70}}
                    size={{height: 400, width: 400}}
                    tutorialMessageClass="tutorialMessage"
                    showMemoryCheckbox={false}
                    tutorialsList={tutorialsList}
                    isStateLess={true}
                    resizable={true}
                    draggable={false}
                    fixPosition={true}
                    help={true}
                    showHistoryIcon={false}
                    closable={true}
                    minimizable={true}
                    maximizable={true}
                    collapsable={true} />
            </div>
        );
    }
}