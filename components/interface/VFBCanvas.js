import React, { Component } from 'react';
import Logo from '../../../../js/components/interface/logo/Logo'
import Canvas from '../../../../js/components/interface/3dCanvas/Canvas';
import LinkButton from '../../../../js/components/interface/linkButton/LinkButton';

export default class VFBCanvas extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const logoStyle = { fontSize: '20px'};
        
        return (
            <div>
                <Logo 
                    logo='gpt-fly'
                    propStyle={logoStyle} />
                <LinkButton
                    left={41} 
                    top={360}
                    icon='fa fa-github' 
                    url='https://github.com/VirtualFlyBrain/VFB2' />
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
