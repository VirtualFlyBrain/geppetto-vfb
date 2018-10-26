import React from 'react';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Collapsible from './Collapsible';
import WidgetCapability from '../../../../js/components/widgets/WidgetCapability';
import HTMLViewer from '../../../../js/components/interface/htmlViewer/HTMLViewer';

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
        this.getVariable = this.getVariable.bind(this);
        this.addToHistory = this.addToHistory.bind(this);
        this.renderButtonBar = this.renderButtonBar.bind(this);
        this.setRawMessage = this.setRawMessage.bind(this);
        this.hookupCustomHandler = this.hookupCustomHandler.bind(this);
        //this.renderButtonBar = this.renderButtonBar.bind(this);

        this.contentTermInfo = {
            keys : [],
            values : []
        };
        this.tempArray = [];
        this.staticHistoryMenu = [];
        this.arrowsInitialized = false;
        this.buttonBar = undefined;
    };

    close() {
        this.dialog.parent().hide();
        this.props.termInfoHandler();
        this.props.closeHandler();
    };

    open() {
        this.dialog.parent().show();
    };

    addToHistory(label, method, args, id) {
        if (parent.historyWidgetCapability == undefined) {
            parent.historyWidgetCapability = [];
        }

        if (this.staticHistoryMenu == undefined) {
            this.staticHistoryMenu = [];
        }

		var elementPresentInHistory = false;
		for (var i = 0; i < parent.historyWidgetCapability.length; i++) {
			if (parent.historyWidgetCapability[i].label == label && parent.historyWidgetCapability[i].method == method) {
				elementPresentInHistory = true;
				//moves it to the first position
				parent.historyWidgetCapability.splice(0, 0, parent.historyWidgetCapability.splice(i, 1)[0]);
				break;
			}
		}
		if (!elementPresentInHistory) {
			parent.historyWidgetCapability.unshift({
				"label": label,
				"method": method,
				"arguments": args,
			});
			
			this.staticHistoryMenu.unshift({
				"label": label,
				"method": method,
				"arguments": args,
			});
		}

		this.props.updateWidgetHistory();
	}

    hookupCustomHandler(handler, popupDOM, popup) {
        if (handler.hooked === false) {
            // set hooked to avoid double triggers
            handler.hooked = true;
            // Find and iterate <a> element with an instancepath attribute
            popupDOM.find("a[data-instancepath]").each(function () {
                var fun = handler.funct;
                var ev = handler.event;
                var metaType = handler.meta;
                var path = $(this).attr("data-instancepath").replace(/\$/g, "");
                var node;

                try {
                    node = eval(path);
                } catch (ex) {
                    // if instance path doesn't exist set path to undefined
                    node = undefined;
                }

                // hookup IF domain type is undefined OR it's defined and it matches the node type
                if (metaType === undefined || (metaType !== undefined && node !== undefined && node.getMetaType() === metaType)) {
                    // hookup custom handler
                    $(this).on(ev, function () {
                        // invoke custom handler with instancepath as arg
                        fun(node, path, popup);

                        // stop default event handler of the anchor from doing anything
                        return false;
                    });
                }
            });
        }
    };

    componentDidMount() {
        var dialog = this.dialog.parent();
		var closeButton = dialog.find("button.ui-dialog-titlebar-close");
		closeButton.off("click");
        closeButton.click(this.close.bind(this));

        const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
        var innerHandler = {funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false};
        this.hookupCustomHandler(innerHandler, $("#" + this.props.id), domTermInfo);

        window.updateHistoryWidget = function(historyInstance) {
            this.setData(historyInstance);
        }.bind(this);

    };

    componentDidUpdate(prevProps, prevState) {
        const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
        var innerHandler = {funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false};
        this.hookupCustomHandler(innerHandler, $("#" + this.props.id), domTermInfo);
    }

    setData(anyInstance, filter) {
        this.addToHistory(anyInstance.getName(), "setData", [anyInstance, filter], this.props.id);

        this.getHTML(anyInstance, "", filter);
        this.setState({htmlTermInfo: anyInstance.id});

        if (this.props.buttonBarConfiguration != null && this.props.buttonBarConfiguration != undefined) {
            this.renderButtonBar(anyInstance);
        }
        //this.setRawMessage(this.getHTML(anyInstance, "", filter));
    }

    renderButtonBar(anyInstance) {
        var that = this;
        var buttonBarContainer = 'button-bar-container-' + this.props.id;
        var barDiv = 'bar-div-' + this.props.id;
        if (this.buttonBar != undefined) {
            ReactDOM.unmountComponentAtNode(document.getElementById(barDiv));
            $("#" + buttonBarContainer).remove();
        }

        this.$el.parent().append("<div id='" + buttonBarContainer + "' class='button-bar-container'><div id='" + barDiv + "' class='button-bar-div'></div></div>");

        var instance = null;
        var instancePath = '';

        if (this.props.buttonBarConfiguration.filter != null && this.props.buttonBarConfiguration.filter != undefined) {
            if (anyInstance != null && anyInstance != undefined) {
                instance = this.props.buttonBarConfiguration.filter(anyInstance);
                instancePath = instance.getPath();
            }
        }
        var originalZIndex = $("#" + this.id).parent().css("z-index");
        this.buttonBar = ReactDOM.render(
            React.createElement(ButtonBarComponent, {
                buttonBarConfig: this.props.buttonBarConfiguration, showControls: this.props.buttonBarControls,
                instancePath: instancePath, instance: instance, geppetto: GEPPETTO, resize: function () { that.setSize(that.size.height, that.size.width); }
            }),
            document.getElementById(barDiv)
        );

        $("#" + this.props.id).parent().css('z-index', originalZIndex);
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
            this.hookupCustomHandler(this.customHandlers, $("#" + this.id), this);
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
                <div>
                    <HTMLViewer id="vfbTermInfoHtmlViewer" content={value.html} />
                </div>
            </Collapsible>);
        }
        else if (type.getMetaType() == GEPPETTO.Resources.TEXT_TYPE) {
            var value = this.getVariable(anyInstance).getInitialValues()[0].value;
            var prevCounter = this.contentTermInfo.keys.length;
            if(counter !== undefined) {
                prevCounter = counter;
            }
            this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                <div>
                    <HTMLViewer id="vfbTermInfoHtmlViewer" content={anchorme(value.text, anchorOptions)} />
                </div>
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
                    var elements = [];
                    for (var j = 0; j < value.elements.length; j++) {
                        var image = value.elements[j].initialValue;
                        elements.push(<div className="popup-slick-image">
                            {image.name}
                            <a href="#" data-instancepath={image.reference}>
                                <img src={image.data}></img>
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
                            {elements.map((element, key) => {
                                var Element = React.cloneElement(element);
                                var imageId = "image_"+key;
                                return(
                                    <div id={imageId} key={key}> {Element} </div>
                                );
                            })}
                        </Slider>
                    </Collapsible>);
                }
                else if (value.eClass == GEPPETTO.Resources.IMAGE) {
                    //otherwise we just show an image
                    var image = value;
                    this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
                        <div className="popup-image">
                            <a href='#' data-instancepath={image.reference}>
                                <img src={image.data}></img>
                            </a>
                        </div>
                    </Collapsible>);
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if ((this.arrowsInitialized === false) && (window.historyWidgetCapability != undefined) && (window.historyWidgetCapability.length > 1)) {
            this.showHistoryNavigationBar(true);
            this.arrowsInitialized = true;
        }
    }

    render() {
        var toRender = undefined;
        if((this.props.order !== undefined ) && (this.props.order.length > 0)) {
            var tempArray2 = [];
            for(var x=0; x<this.props.order.length; x++) {
                var index = this.contentTermInfo.keys.indexOf(this.props.order[x]);
                if(index > -1) {
                    tempArray2.push(this.contentTermInfo.values[index]);
                    this.contentTermInfo.keys.splice(index, 1);
                    this.contentTermInfo.values.splice(index, 1);
                }
            }
            if(this.contentTermInfo.keys.length > 0) {
                for(var j=0; j < this.contentTermInfo.keys.length; j++) {
                    tempArray2.push(this.contentTermInfo.values[j]);
                }
            }
            toRender = tempArray2.map((item, key) => {
                var Item = React.cloneElement(item);
                return (
                <div key={key}> {Item} </div>
                );
            });
            this.contentTermInfo.keys = [];
            this.contentTermInfo.values = [];
        } else {
            toRender = this.contentTermInfo.values.map((item, key) => {
                var Item = React.cloneElement(item);
                return (
                <div key={key}> {Item} </div>
                );
            });
            this.contentTermInfo.keys = [];
            this.contentTermInfo.values = [];
        }
        return(
            <div ref="termInfoInnerRef">
                {toRender}
            </div>);
    };
}

export default class VFBTermInfoWidget extends React.Component {

    constructor(props) {
        super(props);

        this.setTermInfo = this.setTermInfo.bind(this)
        this.closeHandler = this.closeHandler.bind(this);
        this.customHandler = this.customHandler.bind(this);
        this.updateHistory = this.updateHistory.bind(this);
        this.getTermInfoDefaultX = this.getTermInfoDefaultX.bind(this);
        this.getTermInfoDefaultY = this.getTermInfoDefaultY.bind(this);
        this.getTermInfoDefaultWidth = this.getTermInfoDefaultWidth.bind(this);
        this.getTermInfoDefaultHeight = this.getTermInfoDefaultHeight.bind(this);

        this.buttonBarConfiguration = {
            "Events": ["color:set", "experiment:selection_changed", "experiment:visibility_changed"],
            "filter": function filter(instancePath) {
                if (typeof (instancePath) == "string") {
                    return Instances.getInstance(instancePath).getParent();
                }
                return instancePath.getParent();
            },
            "VisualCapability": {
                "select": {
                    "id": "select",
                    "condition": "GEPPETTO.SceneController.isSelected($instance$.$instance$_obj != undefined ? [$instance$.$instance$_obj] : []) ||  GEPPETTO.SceneController.isSelected($instance$.$instance$_swc != undefined ? [$instance$.$instance$_swc] : [])",
                    "false": {
                        "actions": ["$instance$.select()"],
                        "icon": "fa-hand-stop-o",
                        "label": "Unselected",
                        "tooltip": "Select",
                        "id": "select",
                    },
                    "true": {
                        "actions": ["$instance$.deselect()"],
                        "icon": "fa-hand-rock-o",
                        "label": "Selected",
                        "tooltip": "Deselect",
                        "id": "deselect",
                    }
                },
                "color": {
                    "id": "color",
                    "actions": ["$instance$.setColor('$param$');"],
                    "icon": "fa-tint",
                    "label": "Color",
                    "tooltip": "Color"
                },
                "zoom": {
                    "id": "zoom",
                    "actions": ["GEPPETTO.SceneController.zoomTo($instances$)"],
                    "icon": "fa-search-plus",
                    "label": "Zoom",
                    "tooltip": "Zoom"
                },
                "visibility_obj": {
                    "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_obj')",
                    "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_obj != undefined && $instance$.getType().$instance$_obj.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_obj != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_obj]); } return visible; })()",
                    "false": {
                        "id": "visibility_obj",
                        "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_obj'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                        "icon": "gpt-shapehide",
                        "label": "Hidden",
                        "tooltip": "Show 3D Volume"
                    },
                    "true": {
                        "id": "visibility_obj",
                        "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                        "icon": "gpt-shapeshow",
                        "label": "Visible",
                        "tooltip": "Hide 3D Volume"
                    }
                },
                "visibility_swc": {
                    "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_swc')",
                    "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_swc != undefined && $instance$.getType().$instance$_swc.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_swc != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_swc]); } return visible; })()",
                    "false": {
                        "id": "visibility_swc",
                        "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_swc'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                        "icon": "gpt-3dhide",
                        "label": "Hidden",
                        "tooltip": "Show 3D Skeleton"
                    },
                    "true": {
                        "id": "visibility_swc",
                        "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                        "icon": "gpt-3dshow",
                        "label": "Visible",
                        "tooltip": "Hide 3D Skeleton"
                    }
                },
                "delete": {
                    "showCondition": "$instance$.getId()!=window.templateID",
                    "id": "delete",
                    "actions": ["if($instance$.parent != null){$instance$.parent.deselect();$instance$.parent.delete();}else{$instance$.deselect();$instance$.delete();};setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());"],
                    "icon": "fa-trash-o",
                    "label": "Delete",
                    "tooltip": "Delete"
                }
            }
        };

        this.buttonBarControls = { "VisualCapability": ['select',
                                                        'color',
                                                        'visibility_obj',
                                                        'visibility_swc',
                                                        'zoom',
                                                        'delete']};

        this.data = [];
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
            this.data.unshift(data);
            this.refs.termInfoRef.setData(data);
            this.refs.termInfoRef.setName(data.name);
        }
        this.updateHistory(data.name);
        GEPPETTO.SceneController.deselectAll();
        if (typeof data.getParent().select === "function") {
            data.getParent().select(); // Select if visual type loaded.
        }
    };

    updateNavigationHistoryBar() {
        this.refs.termInfoRef.updateNavigationHistoryBar();
    }

    customHandler(node, path, widget) {
        var Query = require('./../../../../js/geppettoModel/model/Query');
        var n = window[path];
        var otherId;
        var otherName;
        var target = widget;
        var meta = path + "." + path + "_meta";
        if (n != undefined) {
            var metanode = Instances.getInstance(meta);
            if ((this.data.length > 0) && (this.data[0] == metanode)) {
                window.resolve3D(path);
            } else {
                this.data.unshift(metanode);
                this.refs.termInfoRef.setData(metanode);
                this.refs.termInfoRef.setName(metanode.name);
            }
        } else {
            // check for passed ID:
            if (path.indexOf(',') > -1) {
                otherId = path.split(',')[1];
                otherName = path.split(',')[2];
                path = path.split(',')[0];
            } else {
                if (this.data.length) {
                    otherId = this.data[0].getParent();
                } else {
                    otherId = this.data.getParent();
                }
                otherName = otherId.name;
                otherId = otherId.id;
            }
            // try to evaluate as path in Model
            var entity = Model[path];
            if (typeof (entity) != 'undefined' && entity instanceof Query) {
                // clear query builder unless ctrl pressed them add to compound.
                GEPPETTO.QueryBuilder.open();
                if (!GEPPETTO.isKeyPressed("shift")) {
                    GEPPETTO.QueryBuilder.switchView(false, false);
                    GEPPETTO.QueryBuilder.clearAllQueryItems();
                } else {
                    GEPPETTO.QueryBuilder.switchView(false, false);
                }

                GEPPETTO.trigger('spin_logo');
                $("body").css("cursor", "progress");

                var callback = function () {
                    // check if any results with count flag
                    if (GEPPETTO.QueryBuilder.props.model.count > 0) {
                        // runQuery if any results
                        GEPPETTO.QueryBuilder.runQuery();
                    } else {
                        GEPPETTO.QueryBuilder.switchView(false);
                    }
                    // show query component
                    GEPPETTO.QueryBuilder.open();
                    $("body").css("cursor", "default");
                    GEPPETTO.trigger('stop_spin_logo');
                };
                // add query item + selection
                if (window[otherId] == undefined) {
                    window.fetchVariableThenRun(otherId, function () { GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback) });
                } else {
                    setTimeout(function () { GEPPETTO.QueryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback); }, 100);
                }
            } else {
                Model.getDatasources()[0].fetchVariable(path, function () {
                    var m = Instances.getInstance(meta);
                    this.refs.termInfoRef.setData(m);
                    this.refs.termInfoRef.setName(m.name);
                    window.resolve3D(path);
                }.bind(this));
            }
        }
    };

    updateHistory(title) {
        try {
            if (parent.historyWidgetCapability == undefined) {
                parent.historyWidgetCapability = [];
            }
            if (window.vfbUpdatingHistory == undefined) {
                window.vfbUpdatingHistory = false;
            }
            if (window.vfbUpdatingHistory == false && parent.location.toString().indexOf('virtualflybrain.org') > 0 && parent.location.toString().indexOf('virtualflybrain.org') < 25) {
                window.vfbUpdatingHistory = true;
                // Update the parent windows history with current instances (i=) and popup selection (id=)
                var visualInstances = GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, Instances);
                var visualParents = [];
                for (var i = 0; i < visualInstances.length; i++) {
                    if (visualInstances[i].getParent() != null) {
                        visualParents.push(visualInstances[i].getParent());
                    }
                }
                visualInstances = visualInstances.concat(visualParents);
                var compositeInstances = [];
                for (var i = 0; i < visualInstances.length; i++) {
                    if (visualInstances[i] != null && visualInstances[i].getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
                        compositeInstances.push(visualInstances[i]);
                    }
                }

                var items = 'i=';
                if (window.templateID) {
                    items = items + ',' + window.templateID;
                }
                compositeInstances.forEach(function (compositeInstance) { if (!items.includes(compositeInstance.getId())) { items = items + ',' + compositeInstance.getId() } });
                items = items.replace(',,', ',').replace('i=,', 'i=');
                try {
                    items = 'id=' + this.refs.termInfoRef.data.split('.')[0] + '&' + items;
                } catch (ignore) { };
                if (items != "i=") {
                    parent.historyWidgetCapability.pushState({}, title, parent.location.pathname + "?" + items);
                }
                window.vfbUpdatingHistory = false;
            }
        } catch (ignore) {
            window.vfbUpdatingHistory = true; // block further updates
        };
    };

    componentDidUpdate() {
        if ((parent.historyWidgetCapability != undefined) && (parent.historyWidgetCapability.length > 1)) {
            this.refs.termInfoRef.showHistoryNavigationBar(true);
        }
    }

    render() {
        var VFBTermInfoWidget = WidgetCapability.createWidget(VFBTermInfo);

        return (
            <VFBTermInfoWidget
                id={'vfbterminfowidget'}
                componentType={'VFBTERMINFO'}
                title={"Click on image to show info"}
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
                ref="termInfoRef"
                buttonBarConfiguration={this.buttonBarConfiguration}
                buttonBarControls={this.buttonBarControls}
                customHandler={this.customHandler}
                updateWidgetHistory={this.updateHistory} />
        );
    }
}
