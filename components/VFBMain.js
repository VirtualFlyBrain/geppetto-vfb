import React, { Component } from 'react';
import VFBCanvas from './interface/VFBCanvas';
import VFBToolBar from './interface/VFBToolBar';

export default class VFBMain extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            canvasAvailable: false
        };
    }

    render() {
        return (
            <div>
                <VFBToolBar />
                <VFBCanvas />
            </div>
        );
    };
}