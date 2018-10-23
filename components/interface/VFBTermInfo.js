import React from 'react';
import Slider from "react-slick";
import Collapsible from './Collapsible';
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var anchorme = require('anchorme');
var slick = require('slick-carousel');
var Type = require('../../../../js/geppettoModel/model/Type');
var ButtonBarComponent = require('../../../../js/components/widgets/popup/ButtonBarComponent');

require('../../css/VFBTermInfo.less');
require('../../../../js/components/widgets/popup/Popup.less');
require('../../../../js/components/widgets/popup/vendor/slick.less');
require('../../../../js/components/widgets/popup/vendor/slick-theme.less');

class VFBTermInfo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            htmlTermInfo: undefined
        }

        this.getHTML = this.getHTML.bind(this);
        this.setData = this.setData.bind(this);
        this.getOrder = this.getOrder.bind(this);
        this.getVariable = this.getVariable.bind(this);
        this.setRawMessage = this.setRawMessage.bind(this);

        this.contentTermInfo = {
            keys : [],
            values : []
        };
        this.orderItems = [];
    };

    close() {
        this.dialog.parent().hide();
        this.props.termInfoHandler();
        this.props.closeHandler();
    };

    open() {
        this.dialog.parent().show();
    };


    componentDidMount() {
        var dialog = this.dialog.parent();
		var closeButton = dialog.find("button.ui-dialog-titlebar-close");
		closeButton.off("click");
		closeButton.click(this.close.bind(this));
    };

    getOrder() {
        if(this.props.order !== undefined) {
            for(var i=0; i<this.props.order; i++) {
                this.orderItems.push(this.props.order[i].toLowerCase());
            }
        }
    }

    setData(anyInstance, filter) {
        this.getOrder();
        this.getHTML(anyInstance, "", filter);
        this.setState({htmlTermInfo: anyInstance.id});
        //this.setRawMessage(this.getHTML(anyInstance, "", filter));
    }

    setRawMessage(msg) {
        //$("#" + this.id).html(msg);
        GEPPETTO.CommandController.log("Set new Message for " + this.id, true);

        if (this.customHandlers.length > 0) {
            // msg has changed, set hooked attribute on handlers to false
            for (var i = 0; i < this.customHandlers.length; i++) {
                this.customHandlers[i].hooked = false;
            }

            // trigger routine that hooks up handlers
            hookupCustomHandlers(this.customHandlers, $("#" + this.id), this);
            GEPPETTO.CommandController.log("Hooked up custom handlers for " + this.id, true);
        }

        return this;
    }

    getVariable(node) {
        if (node.getMetaType() == GEPPETTO.Resources.INSTANCE_NODE) {
            return node.getVariable();
        } else {
            return node;
        }
    }

    getHTML(anyInstance, id, counter) {
        var anchorOptions = {
            "attributes": {
                "target": "_blank",
                "class": "popup_link"
            },
            "html": true,
            ips: false,
            emails: true,
            urls: true,
            TLDs: 20,
            truncate: 0,
            defaultProtocol: "http://"
        };
        var type = anyInstance;
        if (!(type instanceof Type)) {
            type = anyInstance.getType();
        }

        if (type.getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
            for (var i = 0; i < type.getVariables().length; i++) {
                var v = type.getVariables()[i];

                //var id = this.getId() + "_" + type.getId() + "_el_" + i;
                var nameKey = v.getName();
                this.contentTermInfo.keys[i] = nameKey;
                var id = "VFBTermInfo_el_" + i;
                this.getHTML(v, id, i);
            }
        }
        else if (type.getMetaType() == GEPPETTO.Resources.HTML_TYPE) {
            var value = this.getVariable(anyInstance).getInitialValues()[0].value;
            var prevCounter = this.contentTermInfo.keys.length;
            if(counter !== undefined) {
                prevCounter = counter;
            }
            this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                <div className="popup-html"> {value.html} </div>
            </Collapsible>);
        }
        else if (type.getMetaType() == GEPPETTO.Resources.TEXT_TYPE) {
            var value = this.getVariable(anyInstance).getInitialValues()[0].value;
            var prevCounter = this.contentTermInfo.keys.length;
            if(counter !== undefined) {
                prevCounter = counter;
            }
            this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                <div className="popup-text"> {anchorme(value.text, anchorOptions)} </div>
            </Collapsible>);
        }
        else if (type.getMetaType() == GEPPETTO.Resources.IMAGE_TYPE) {
            if (this.getVariable(anyInstance).getInitialValues()[0] != undefined) {
                var value = this.getVariable(anyInstance).getInitialValues()[0].value;
                var prevCounter = this.contentTermInfo.keys.length;
                if(counter !== undefined) {
                    prevCounter = counter;
                }
                if (value.eClass == GEPPETTO.Resources.ARRAY_VALUE) {
                    //if it's an array we use slick to create a carousel
                    var elements = "";
                    for (var j = 0; j < value.elements.length; j++) {
                        var image = value.elements[j].initialValue;
                        elements += (<div className="popup-slick-image">
                            {image.name}
                            <a href="" onClick="" instancepath={image.reference}>
                                <img className="popup-image" src={image.data}></img>
                            </a>
                        </div>);
                    }
                    var settings = {
                        fade: true,
                        centerMode: true,
                        slideToShow: 1,
                        slidesToScroll: 1
                    };
                    this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                        <Slider {...settings}>
                            {elements}
                        </Slider>
                    </Collapsible>);
                }
                else if (value.eClass == GEPPETTO.Resources.IMAGE) {
                    //otherwise we just show an image
                    var image = value;
                    this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                        <div className="popup-image">
                            <a href='' instancepath={image.reference}>
                                <img className="popup-image" src={image.data}></img>
                            </a>
                        </div>
                    </Collapsible>);
                }
            }
        }
    }

    render() {
        var toRender = undefined;
        if((this.orderItems !== undefined ) && (this.orderItems.length > 0)) {
            for(var x=0; x<this.props.order.length; x++) {
                var index = this.contentTermInfo.keys.indexOf(this.orderItems[x]);
                if(index > -1) {
                    toRender += this.contentTermInfo.values[index];
                    this.contentTermInfo.keys.splice(index, index);
                    this.contentTermInfo.values.splice(index, index);
                }
            }
            if(this.contentTermInfo.keys.length > 0) {
                for(var j=0; j < this.contentTermInfo.keys.length; j++) {
                    toRender += this.contentTermInfo.values[j];
                }
            }
            this.contentTermInfo.keys = [];
            this.contentTermInfo.values = [];
        } else {
            for(var z=0; z < this.contentTermInfo.keys.length; z++) {
                toRender += this.contentTermInfo.values[z];
            }
            this.contentTermInfo.keys = [];
            this.contentTermInfo.values = [];
        }
        return(
            <div>
                {toRender}
            </div>);
    };
}

export default class VFBTermInfoWidget extends React.Component {

    constructor(props) {
        super(props);

        this.setTermInfo = this.setTermInfo.bind(this)
        this.closeHandler = this.closeHandler.bind(this);
        this.getTermInfoDefaultX = this.getTermInfoDefaultX.bind(this);
        this.getTermInfoDefaultY = this.getTermInfoDefaultY.bind(this);
        this.getTermInfoDefaultWidth = this.getTermInfoDefaultWidth.bind(this);
        this.getTermInfoDefaultHeight = this.getTermInfoDefaultHeight.bind(this);
    }

    getTermInfoDefaultWidth() {
        return Math.ceil(window.innerWidth / 4);
    };

    getTermInfoDefaultHeight() {
        return ((window.innerHeight - Math.ceil(window.innerHeight / 4)) - 65);
    };

    getTermInfoDefaultX() {
        return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10));
    };

    getTermInfoDefaultY() { 
        return 55;
    };

    closeHandler() {
        console.log("close handler called");
        //this.props.tutorialHandler();
    };

    setTermInfo(data, name) {
        //check if to level has been passed:
        if (data.parent == null) {
            if (data[data.getId() + '_meta'] != undefined) {
                data = data[data.getId() + '_meta'];
                console.log('meta passed to term info for ' + data.parent.getName());
            }
        }
        if (this.refs.termInfoRef != undefined) {
            this.refs.termInfoRef.setData(data).setName(name);
        }
        //this.updateHistory(name);
        GEPPETTO.SceneController.deselectAll();
        if (typeof data.getParent().select === "function") {
            data.getParent().select(); // Select if visual type loaded.
        }
    };

    render() {
        var VFBTermInfoWidget = WidgetCapability.createWidget(VFBTermInfo);

        return (
            <VFBTermInfoWidget
                id={'vfbterminfowidget'}
                componentType={'VFBTERMINFO'}
                title={"Virtual Fly Brain Term Info"}
                order={this.props.order}
                showButtonBar={this.props.showButtonBar}
                closeByDefault={false}
                position={{ left: this.getTermInfoDefaultX(), top: this.getTermInfoDefaultY(), position: "absolute" }}
                size={{ height: this.getTermInfoDefaultHeight(), width: this.getTermInfoDefaultWidth() }}
                closeHandler={this.closeHandler}
                termInfoHandler={this.props.termInfoHandler}
                isStateLess={false}
                resizable={true}
                draggable={true}
                fixPosition={false}
                help={false}
                showHistoryIcon={true}
                closable={true}
                minimizable={true}
                maximizable={true}
                collapsable={true}
                ref="termInfoRef" />
        );
    }
}
