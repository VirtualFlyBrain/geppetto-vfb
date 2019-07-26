import React from 'react';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Collapsible from 'react-collapsible';
import HTMLViewer from 'geppetto-client/js/components/interface/htmlViewer/HTMLViewer';

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var anchorme = require('anchorme');
var Type = require('geppetto-client/js/geppettoModel/model/Type');
var ButtonBarComponent = require('geppetto-client/js/components/widgets/popup/ButtonBarComponent');

require('../../css/VFBTermInfo.less');
require('geppetto-client/js/components/widgets/popup/Popup.less');
require('geppetto-client/js/components/widgets/popup/vendor/slick.less');
require('geppetto-client/js/components/widgets/popup/vendor/slick-theme.less');


class VFBTermInfo extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      htmlTermInfo: undefined,
      activeSlide: undefined,
    }

    this.getHTML = this.getHTML.bind(this);
    this.setData = this.setData.bind(this);
    this.setName = this.setName.bind(this);
    this.getVariable = this.getVariable.bind(this);
    this.hookupImages = this.hookupImages.bind(this);
    this.addToHistory = this.addToHistory.bind(this);
    this.renderButtonBar = this.renderButtonBar.bind(this);
    this.hookupCustomHandler = this.hookupCustomHandler.bind(this);

    this.staticHistoryMenu = [];
    this.arrowsInitialized = false;
    this.name = undefined;
    this.buttonBar = undefined;
    this.sliderId = "termInfoSlider";
    this.contentTermInfo = {
      keys : [],
      values : []
    };
    this.contentBackup = {
      keys : [],
      values : []
    };

    this.innerHandler = { funct: undefined, event: 'click', meta: undefined, hooked: false, id: undefined };
  }


  close () {
    this.hide();
    this.props.termInfoHandler();
  }


  open () {
    this.show();
  }


  setData (anyInstance) {
    this.addToHistory(anyInstance.getName(), "setData", [anyInstance], this.props.id);

    this.getHTML(anyInstance, "vfbTermInfoWidgetInnerID");
    this.setName(anyInstance.name);
    this.setState({
      termInfoId: anyInstance.id,
      termInfoName: anyInstance.name
    });

    if (this.props.buttonBarConfiguration != null && this.props.buttonBarConfiguration != undefined) {
      this.renderButtonBar(anyInstance);
    }
  }

  setName (input) {
    this.name = input;
  }


  getHTML (anyInstance, id, counter) {
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

        // var id = this.getId() + "_" + type.getId() + "_el_" + i;
        var nameKey = v.getName();
        this.contentTermInfo.keys[i] = nameKey;
        var id = "VFBTermInfo_el_" + i;
        this.getHTML(v, id, i);
      }
    } else if (type.getMetaType() == GEPPETTO.Resources.HTML_TYPE) {
      var value = this.getVariable(anyInstance).getInitialValues()[0].value;
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        <div>
          <HTMLViewer id={id} content={value.html} />
        </div>
      </Collapsible>);
    } else if (type.getMetaType() == GEPPETTO.Resources.TEXT_TYPE) {
      var value = this.getVariable(anyInstance).getInitialValues()[0].value;
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        <div>
          <HTMLViewer id={id} content={anchorme(value.text, anchorOptions)} />
        </div>
      </Collapsible>);
    } else if (type.getMetaType() == GEPPETTO.Resources.IMAGE_TYPE) {
      if (this.getVariable(anyInstance).getInitialValues()[0] != undefined) {
        var value = this.getVariable(anyInstance).getInitialValues()[0].value;
        var prevCounter = this.contentTermInfo.keys.length;
        if (counter !== undefined) {
          prevCounter = counter;
        }
        if (value.eClass == GEPPETTO.Resources.ARRAY_VALUE) {
          // if it's an array we use slick to create a carousel
          var elements = [];
          for (var j = 0; j < value.elements.length; j++) {
            var image = value.elements[j].initialValue;
            elements.push(<div className="slider_image_container">
              {image.name}
              <a id={"slider_image_" + j} href="#" data-instancepath={image.reference}>
                <img id={"image_" + j} src={image.data}></img>
              </a>
            </div>);
          }

          const settings = {
            fade: true,
            centerMode: true,
            slideToShow: 1,
            slidesToScroll: 1,
            lazyLoad: "progressive",
            afterChange: current => (this.hookupImages(current))
          };
          this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
            <Slider {...settings}>
              {elements.map((element, key) => {
                var Element = React.cloneElement(element);
                /*
                 * The id in the following div is used to hookup the images into the slider
                 * with the handler that has to load the id linked to that image
                 */
                return (
                  <div id={this.sliderId + key} key={key}> {Element} </div>
                );
              })}
            </Slider>
          </Collapsible>);
        } else if (value.eClass == GEPPETTO.Resources.IMAGE) {
          // otherwise we just show an image
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

  /*
   * Method to hookup the images into the slider, avoided to re-call this logic on all the term info due
   * to performances but also to the fact that the query were appended eachother.
   */
  hookupImages (idKey) {
    this.innerHandler = { funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false, id: this.state.termInfoId };
    this.hookupCustomHandler(this.innerHandler, $("#" + this.sliderId + idKey), undefined);
  }


  addToHistory (label, method, args, id) {
    if (window.historyWidgetCapability == undefined) {
      window.historyWidgetCapability = [];

      if (window.historyWidgetCapability[id] == undefined) {
        window.historyWidgetCapability[id] = [];
      }
    }

    if (this.staticHistoryMenu == undefined) {
      this.staticHistoryMenu = [];
    }

    var elementPresentInHistory = false;
    for (var i = 0; i < window.historyWidgetCapability[id].length; i++) {
      if (window.historyWidgetCapability[id][i].label == label && window.historyWidgetCapability[id][i].method == method) {
        elementPresentInHistory = true;
        // moves it to the first position
        window.historyWidgetCapability[id].splice(0, 0, window.historyWidgetCapability[id].splice(i, 1)[0]);
        break;
      }
    }
    if (!elementPresentInHistory) {
      parent.historyWidgetCapability[id].unshift({
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


  hookupCustomHandler (handler, popupDOM, popup) {
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
          var that = this;
          if (that.listenerHooked == undefined){
            $(that).on(ev, function () {
            // invoke custom handler with instancepath as arg
              fun(node, path, popup);

              // stop default event handler of the anchor from doing anything
              return false;
            });
            that.listenerHooked = true; // avoids adding the a listener to anchor element with one already
          }
        }
      });
    }
  }


  renderButtonBar (anyInstance) {
    var that = this;
    var buttonBarContainer = 'button-bar-container-' + this.props.id;
    var barDiv = 'bar-div-' + this.props.id;
    if (this.buttonBar != undefined) {
      ReactDOM.unmountComponentAtNode(document.getElementById(barDiv));
      $("#" + buttonBarContainer).remove();
    }

    // $(this.refs.termInfoInnerRef).append("<div id='" + buttonBarContainer + "' class='button-bar-container'><div id='" + barDiv + "' class='button-bar-div'></div></div>");
    $("<div id='" + buttonBarContainer + "' class='button-bar-container'><div id='" + barDiv + "' class='button-bar-div'></div></div>").insertBefore(this.refs.termInfoInnerRef);
    $('#bar-div-vfbterminfowidget').css('width', this.refs.termInfoInnerRef.clientWidth);

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
        instancePath: instancePath, instance: instance, geppetto: GEPPETTO, resize: function () { 
          /*
           * that.setSize(that.size.height, that.size.width);
           * This was to handle the resize of the widget before, it's not required now since
           * FlexLayout will handle that.
           */
        }
      }),
      document.getElementById(barDiv)
    );

    $("#" + this.props.id).parent().css('z-index', originalZIndex);
  }


  getVariable (node) {
    if (node.getMetaType() == GEPPETTO.Resources.INSTANCE_NODE) {
      return node.getVariable();
    } else {
      return node;
    }
  }

  componentDidMount () {
    const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
    this.innerHandler = { funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false, id: this.state.termInfoId };
    this.hookupCustomHandler(this.innerHandler, $("#" + this.props.id), domTermInfo);
  }


  componentDidUpdate (prevProps, prevState) {
    const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
    if (this.state.termInfoId !== this.innerHandler.id) {
      this.innerHandler = { funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false };
      this.hookupCustomHandler(this.innerHandler, $("#" + this.props.id), domTermInfo);
    }
    if (document.getElementById('bar-div-vfbterminfowidget') !== null) {
      $('#bar-div-vfbterminfowidget').css('width', this.refs.termInfoInnerRef.clientWidth);
    }
  }

  render () {
    var toRender = undefined;
    if (this.contentTermInfo.values === undefined || this.contentTermInfo.values.length == 0){
      this.contentTermInfo.keys = this.contentBackup.keys.slice();
      this.contentTermInfo.values = this.contentBackup.values.slice();
    }
    if ((this.props.order !== undefined ) && (this.props.order.length > 0)) {
      this.contentBackup.keys = this.contentTermInfo.keys.slice();
      this.contentBackup.values = this.contentTermInfo.values.slice();
      var tempArray = [];
      for (var x = 0; x < this.props.order.length; x++) {
        var index = this.contentTermInfo.keys.indexOf(this.props.order[x]);
        if (index > -1) {
          tempArray.push(this.contentTermInfo.values[index]);
          this.contentTermInfo.keys.splice(index, 1);
          this.contentTermInfo.values.splice(index, 1);
        }
      }
      if (this.contentTermInfo.keys.length > 0) {
        for (var j = 0; j < this.contentTermInfo.keys.length; j++) {
          tempArray.push(this.contentTermInfo.values[j]);
        }
      }
      toRender = tempArray.map((item, key) => {
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
      this.contentBackup.keys = this.contentTermInfo.keys;
      this.contentTermInfo.keys = [];
      this.contentBackup.values = this.contentTermInfo.values;
      this.contentTermInfo.values = [];
    }
    return (
      <div id={this.props.id} ref="termInfoInnerRef">
        {toRender}
      </div>);
  }
}

export default class VFBTermInfoWidget extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      coordX: this.getTermInfoDefaultX(),
      coordY: this.getTermInfoDefaultY(),
      widgetHeight: this.getTermInfoDefaultHeight(),
      widgetWidth: this.getTermInfoDefaultWidth()
    }

    this.setTermInfo = this.setTermInfo.bind(this)
    this.closeHandler = this.closeHandler.bind(this);
    this.customHandler = this.customHandler.bind(this);
    this.updateHistory = this.updateHistory.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.getTermInfoDefaultX = this.getTermInfoDefaultX.bind(this);
    this.getTermInfoDefaultY = this.getTermInfoDefaultY.bind(this);
    this.getTermInfoDefaultWidth = this.getTermInfoDefaultWidth.bind(this);
    this.getTermInfoDefaultHeight = this.getTermInfoDefaultHeight.bind(this);

    this.buttonBarConfiguration = {
      "Events": ["color:set", "experiment:selection_changed", "experiment:visibility_changed"],
      "filter": function filter (instancePath) {
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
            "actions": ["(function(){var color = $instance$.getColor(); var instance = Instances.getInstance('$instance$.$instance$_obj'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { if(GEPPETTO.SceneController.isInstancePresent(instance)) { GEPPETTO.SceneController.show([instance]); } else { GEPPETTO.SceneController.display(instance); instance.setColor(color);}}})()"],
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
            "actions": ["(function(){var color = $instance$.getColor(); var instance = Instances.getInstance('$instance$.$instance$_swc'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { if(GEPPETTO.SceneController.isInstancePresent(instance)) { GEPPETTO.SceneController.show([instance]); } else { GEPPETTO.SceneController.display(instance); instance.setColor(color);}}})()"],
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

    this.buttonBarControls = {
      "VisualCapability": ['select',
                           'color',
                           'visibility_obj',
                           'visibility_swc',
                           'zoom',
                           'delete']
    };

    this.data = [];
    this.idWidget = "vfbterminfowidget";
  }

  getTermInfoDefaultWidth () {
    return Math.ceil(window.innerWidth / 4);
  }

  getTermInfoDefaultHeight () {
    return ((window.innerHeight - Math.ceil(window.innerHeight / 4)) - 65);
  }

  getTermInfoDefaultX () {
    return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10));
  }

  getTermInfoDefaultY () { 
    return 55;
  }


  closeHandler () {
    console.log("close handler called");
    this.props.termInfoHandler();
  }


  setTermInfo (data, name) {
    // check if to level has been passed:
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
  }


  customHandler (node, path, widget) {
    var Query = require('geppetto-client/js/geppettoModel/model/Query');
    var n = window[path];
    var otherId;
    var otherName;
    var target = widget;
    var that = this;
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
        this.props.queryBuilder.open();
        if (!GEPPETTO.isKeyPressed("shift")) {
          this.props.queryBuilder.switchView(false, false);
          this.props.queryBuilder.clearAllQueryItems();
        } else {
          this.props.queryBuilder.switchView(false, false);
        }

        GEPPETTO.trigger('spin_logo');
        $("body").css("cursor", "progress");
        $('#add-new-query-container')[0].hidden = true;
        $('#query-builder-items-container')[0].hidden = true;

        var callback = function () {
          // check if any results with count flag
          if (that.props.queryBuilder.props.model.count > 0) {
            // runQuery if any results
            that.props.queryBuilder.runQuery();
          } else {
            that.props.queryBuilder.switchView(false);
          }
          // show query component
          that.props.queryBuilder.open();
          $("body").css("cursor", "default");
          GEPPETTO.trigger('stop_spin_logo');
        };
        // add query item + selection
        if (window[otherId] == undefined) {
          window.fetchVariableThenRun(otherId, function () {
            that.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback) 
          });
        } else {
          setTimeout(function () {
            that.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback); 
          }, 100);
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
  }

  updateHistory (title) {
    try {
      if (window.historyWidgetCapability[this.idWidget] == undefined) {
        window.historyWidgetCapability[this.idWidget] = [];
      }
      if (window.vfbUpdatingHistory == undefined) {
        window.vfbUpdatingHistory = false;
      }
      if (window.vfbUpdatingHistory == false) {
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
        compositeInstances.forEach(function (compositeInstance) {
          if (!items.includes(compositeInstance.getId())) {
            items = items + ',' + compositeInstance.getId() 
          } 
        });
        items = items.replace(',,', ',').replace('i=,', 'i=');
        try {
          items = 'id=' + this.refs.termInfoRef.state.termInfoId.replace('_meta','') + '&' + items;
          title = title || this.refs.termInfoRef.state.termInfoName ;
        } catch (ignore) { }
        if (items != "i=") {
          if (window.history.state == null) {
            window.history.replaceState({ s:1, n:title, b:"", f:"" }, title, window.location.pathname + "?" + items);
          }
          var state = window.history.state.s;
          switch (state) {
          case 2:
            window.history.replaceState({ s:1, n:title, b:window.history.state.b, f:window.history.state.f }, title, window.location.pathname + "?" + items);
            break;
          case 0:
            window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.name, window.location.pathname + window.history.state.u);
            window.history.pushState({ s:1, n:title, b:window.history.state.n, f:"" }, title, window.location.pathname + "?" + items);
            break;
          default:
            if (!("?" + items).equals(window.location.search)) {
              window.history.replaceState({ s:1, n:window.history.state.n, b:window.history.state.b, f:title }, window.history.state.name, window.location.pathname + window.location.search);
              window.history.pushState({ s:1, n:title, b:window.history.state.n, f:"" }, title, window.location.pathname + "?" + items);
            }
          }
        }
        window.vfbUpdatingHistory = false;
      }
    } catch (ignore) {
      console.log("URL update error!");
      window.vfbUpdatingHistory = true; // block further updates
    }
  }

  componentDidUpdate () {

  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions);
    if ((this.props.termInfoName !== undefined) && (this.props.termInfoId !== undefined)) {
      this.setTermInfo(this.props.termInfoName, this.props.termInfoId);
    }
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions () {
    if (this.refs.termInfoRef !== undefined) {
      /*
       * this.refs.termInfoRef.setPosition(this.getTermInfoDefaultX(), this.getTermInfoDefaultY());
       * this.refs.termInfoRef.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
       */
    } else {
      this.setState({
        coordX: this.getTermInfoDefaultX(),
        coordY: this.getTermInfoDefaultY(),
        widgetHeight: this.getTermInfoDefaultHeight(),
        widgetWidth: this.getTermInfoDefaultWidth()
      });
    }
  }

  render () {
    return (
      <VFBTermInfo
        id={this.idWidget}
        ref="termInfoRef"
        order={this.props.order}
        closeHandler={this.closeHandler}
        customHandler={this.customHandler}
        showButtonBar={this.props.showButtonBar}
        updateWidgetHistory={this.updateHistory}
        buttonBarControls={this.buttonBarControls}
        termInfoHandler={this.props.termInfoHandler}
        buttonBarConfiguration={this.buttonBarConfiguration}/>
    );
  }
}
