import React, { Component } from 'react';
import Canvas from '../../../../js/components/interface/3dCanvas/Canvas';

export default class VFBCanvas extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>
                <Canvas
                    id="CanvasContainer"
                    name={"Canvas"}
                    componentType={'Canvas'}
                    ref={"canvas"}
                    style={{ height: '100%', width: '100%' }} />
            </div>
        );
    }
}
