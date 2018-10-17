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
        this.openHandler = this.openHandler.bind(this);
    }

    closeHandler() {
        console.log("tutorial close handler called");
        this.props.tutorialHandler();
    }

    openHandler() {
        console.log(this.refs.tutorialRef);
    }

    render() {
        var TutorialWidget = WidgetCapability.createWidget(Tutorial);

        var tutorialsList = [
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/queryTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/spotlightTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/stackTutorial.json",
            "/org.geppetto.frontend/geppetto/extensions/geppetto-vfb/tutorials/termTutorial.json"];
        return (
                <TutorialWidget
                    id={'widgetTutorial'}
                    componentType={'TUTORIAL'}
                    tutorialData={vfbDefaultTutorial}
                    closeByDefault={false}
                    position={{left: 100, top: 70, position: "absolute"}}
                    size={{height: 300, width: 350}}
                    tutorialMessageClass="tutorialMessage"
                    showMemoryCheckbox={true}
                    tutorialsList={tutorialsList}
                    closeHandler={this.closeHandler}
                    isStateLess={true}
                    resizable={true}
                    draggable={true}
                    fixPosition={false}
                    help={true}
                    showHistoryIcon={true}
                    closable={true}
                    minimizable={true}
                    maximizable={true}
                    collapsable={true}
                    ref="tutorialRef" />
        );
    }
}