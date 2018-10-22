import React, { Component } from 'react';
import Collapsible from './Collapsible';
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';

require('../../css/VFBTermInfo.less');
var $ = require('jquery');
var GEPPETTO = require('geppetto');
var Type = require('../../../../js/geppettoModel/model/Type');

class VFBTermInfo extends React.Component {

    constructor(props) {
        super(props);

        this.getHTML = this.getHTML.bind(this);
        this.setData = this.setData.bind(this);
        this.getVariable = this.getVariable.bind(this);
        this.setRawMessage = this.setRawMessage.bind(this);
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

    setData(anyInstance, filter) {
        //this.setRawMessage(this.getHTML(anyInstance, "", filter));
        this.forceUpdate();
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

    getHTML(anyInstance, id, filter) {
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
        var html = "";

        //let's check the filter
        if (filter != undefined && type.getMetaType() != GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
            if ($.inArray(type.getMetaType(), filter) == -1) {
                //this type is not in the filter!
                return html;
            }
        }

        if (type.getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
            for (var i = 0; i < type.getVariables().length; i++) {
                var v = type.getVariables()[i];

                if (filter != undefined) {
                    if ($.inArray(v.getType().getMetaType(), filter) == -1) {
                        //this type is not in the filter!
                        continue;
                    }
                }

                //var id = this.getId() + "_" + type.getId() + "_el_" + i;
                var id = "VFBTermInfo_el_" + i;
                if (filter == undefined) {
                    //Titles are only displayed if there's no filter..maybe random, make it a separate parameter
                    html += "<div class='popup-title' data-toggle='collapse' data-target='#" + id + "'>" + v.getName() + "</div><div id='" + id + "_chevron" + "' data-toggle='collapse' data-target='#" + id + "' class='popup-chevron fa fa-chevron-circle-down '></div>"
                }
                html += this.getHTML(v, id, filter);
            }
        }
        else if (type.getMetaType() == GEPPETTO.Resources.HTML_TYPE) {
            var value = this.getVariable(anyInstance).getInitialValues()[0].value;
            html += "<div id='" + id + "' class='collapse in popup-html'>" + value.html + "</div>";
        }
        else if (type.getMetaType() == GEPPETTO.Resources.TEXT_TYPE) {
            var value = this.getVariable(anyInstance).getInitialValues()[0].value;
            html += "<div id='" + id + "' class='collapse in popup-text'>" + anchorme(value.text, anchorOptions) + "</div>";
        }
        else if (type.getMetaType() == GEPPETTO.Resources.IMAGE_TYPE) {
            if (this.getVariable(anyInstance).getInitialValues()[0] != undefined) {
                var value = this.getVariable(anyInstance).getInitialValues()[0].value;
                if (value.eClass == GEPPETTO.Resources.ARRAY_VALUE) {
                    //if it's an array we use slick to create a carousel
                    var elements = "";
                    for (var j = 0; j < value.elements.length; j++) {
                        var image = value.elements[j].initialValue;
                        elements += "<div class='popup-slick-image'>" + image.name + "<a href='' instancepath='" + image.reference + "'><img  class='popup-image' src='" + image.data + "'/></a></div>";
                    }
                    html += "<div id='" + id + "' class='slickdiv popup-slick collapse in' data-slick='{\"fade\": true,\"centerMode\": true, \"slidesToShow\": 1, \"slidesToScroll\": 1}' >" + elements + "</div>";
                }
                else if (value.eClass == GEPPETTO.Resources.IMAGE) {
                    //otherwise we just show an image
                    var image = value;
                    html += "<div id='" + id + "' class='popup-image collapse in'><a href='' instancepath='" + image.reference + "'><img  class='popup-image' src='" + image.data + "'/></a></div>";
                }
            }
        }
        return html;
    }

    render() {
        return(
            <div>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
                <Collapsible open={true} trigger={'Hello'}>
                    <p>World</p>
                </Collapsible>
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
            //this.forceUpdate();
            //this.refs.termInfoRef.setData(data).setName(name);
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
                title={"dario test"}
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
