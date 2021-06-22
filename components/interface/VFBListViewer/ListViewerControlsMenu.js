import React, { Component } from "react";
import Menu from "@geppettoengine/geppetto-ui/menu/Menu";
import { connect } from 'react-redux';
import { ChromePicker } from 'react-color';
import { setTermInfo, SHOW_LIST_VIEWER, INSTANCE_DELETED } from './../../../actions/generals';

const controlsConfiguration = require('../../configuration/VFBListViewer/controlsMenuConfiguration').default;
const ACTIONS = controlsConfiguration.actions;

/**
 * Menu component to display controls for VFB List Viewer
 */
class ListViewerControlsMenu extends Component {
  constructor (props) {
    super(props);
    this.state = { displayColorPicker : false }
    this.menuHandler = this.menuHandler.bind(this);
    this.iterateConfList = this.iterateConfList.bind(this);
    this.visibleButton = this.visibleButton.bind(this);
    this.updateControlsConfiguraiton = this.updateControlsConfiguration.bind(this);
    this.monitorMouseClick = this.monitorMouseClick.bind(this);

    // Keep track of color picker action and ID
    this.colorPickerBtnId = '';
    this.colorPickerActionFn = '';
    this.colorPickerContainer = undefined;
  }
  
  /**
   * Close color picker when clicking outside of it
   */
  monitorMouseClick (e) {
    if ((this.colorPickerContainer !== undefined && this.colorPickerContainer !== null) && !this.colorPickerContainer.contains(e.target) && this.state.displayColorPicker === true) {
      this.setState({ displayColorPicker: false });
    }
  }

  componentDidMount () {
    // Add event listener to detect when clicking outside of color picker
    document.addEventListener('mousedown', this.monitorMouseClick, false);
  }
  
  /**
   * Handles menu option selection
   */
  menuHandler (action, component) {
    switch (action.handlerAction){
    case ACTIONS.SHOW:
      this.props.instance.show();
      if ( window["StackViewer1"] !== null ) {
        window["StackViewer1"]?.updateStackWidget();
      }
      break;
    case ACTIONS.HIDE:
      this.props.instance.hide();
      if ( window["StackViewer1"] !== null ) {
        window["StackViewer1"]?.updateStackWidget();
      }
      break;
    case ACTIONS.SELECT:
      this.props.instance.select();
      break;
    case ACTIONS.DESELECT:
      this.props.instance.deselect();
      break;
    case ACTIONS.ZOOM_TO:
      GEPPETTO.SceneController.zoomTo([this.props.instance]);
      break;
    case ACTIONS.DELETE:
      this.props.instance.delete();   
      break;
    case ACTIONS.INFO:
      var self = this;
      /**
       * Needs a 100 ms delay before calling the setTermInfo method, this is due to Menu taking 
       * a few ms to close.
       */
      setTimeout ( () => { 
        self.props.setTermInfo(self.props.instance, true);
      }, 100);
      break;
    case ACTIONS.COLOR:
      this.setState({ displayColorPicker: true });
      break;
    case ACTIONS.SHOW_VOLUME:
      var color = this.props.instance.getColor();
      var instance = this.props.instance[this.props.instance.getId() + "_obj"];
      if ( instance === undefined ) {
        instance = this.props.instance.getType()[this.props.instance.getId() + "_obj"];
      }
      if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) {
        var self = this;
        instance.getType().resolve(function () {
          self.props.instance.setColor(color);
          if ( instance.getInstancePath !== undefined ) {
            GEPPETTO.trigger('experiment:visibility_changed', instance);
            GEPPETTO.ControlPanel.refresh();
          }
        });
      } else { 
        if (GEPPETTO.SceneController.isInstancePresent(instance)) { 
          GEPPETTO.SceneController.show([instance]);
        } else { 
          GEPPETTO.SceneController.display(instance); instance.setColor(color);
        }
      }
      break;
    case ACTIONS.HIDE_VOLUME:
      var instance = this.props.instance[this.props.instance.getId() + "_obj"];
      if ( instance === undefined ) {
        instance = this.props.instance.getType()[this.props.instance.getId() + "_obj"];
      }
      instance.hide();
      break;
    case ACTIONS.SHOW_SKELETON:
      var color = this.props.instance.getColor();
      var instance = this.props.instance[this.props.instance.getId() + "_swc"];
      if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) {
        var col = instance.getParent().getColor();
        instance.getType().resolve( function () { 
          instance.setColor(col);
          GEPPETTO.trigger('experiment:visibility_changed', instance);
          GEPPETTO.ControlPanel.refresh();
        });
      } else {
        if (GEPPETTO.SceneController.isInstancePresent(instance)) {
          GEPPETTO.SceneController.show([instance]);
        } else {
          GEPPETTO.SceneController.display(instance);
          instance.setColor(color);
        }
      }
      break;
    case ACTIONS.HIDE_SKELETON:
      GEPPETTO.SceneController.hide([this.props.instance[this.props.instance.getId() + "_swc"]]);
      break;
    }
  }
  
  /**
   * Pick button in configuration to display, some buttons have multiple options to display based on a 
   * condition.
   * E.g.: 
   * { toggle : {
   *   condition : {},
   *   false : { button1 }, 
   *   true : { button 2}
   * }
   */
  visibleButton (list,item) {
    // Button configuration has two options, perform condition to determine which button to use 
    if ( item.toggle ){
      let condition = item.toggle.condition(this.props.instance);
      if ( item.toggle.isVisible !== undefined) {
        let visible = item.toggle.isVisible(this.props.instance);
        if ( visible ) {
          list.push(item.toggle.options[condition]);
        }
      } else {
        list.push(item.toggle.options[condition]);
      }
    } else {
      if ( item.isVisible !== undefined) {
        let visible = item.isVisible(this.props.instance);
        if ( visible ) {
          list.push(item);
        }
      } else { 
        list.push(item);
      }
    }
  }
  
  
  /**
   * Iterate through button list in Menu configuration
   */
  iterateConfList (list, item) {
    if ( item.list ) {
      // List of buttons found
      item.list.map(subItem => {
        this.iterateConfList(list, subItem);
      })
    } else {
      // Single button detected
      this.visibleButton(list, item)
    }
  }
  
  /**
   * Update Menu configuration. This needs to happen since the Menu configuration have
   * some options (hide/show, select/deselect) that depend on whether the Instance is
   * selected/visible or not.
   */
  updateControlsConfiguration () {
    // Create deep clone of configuration
    var configuration = $.extend(true, {}, controlsConfiguration);
    let list = new Array();
    let self = this;
    /**
     * Loop through configuration buttons and create button list with correct visibility buttons.
     * Some buttons in configuration have two set of options and a condition. 
     * E.G.
     * For the selection button, there's two configuration options based on whether Instance
     * is already selected or not. 
     */ 
    configuration.buttons.map((button, index) => {
      if ( self.props.instance.getColor !== undefined ) {
        button.activeColor = self.props.instance.getColor();
        button.list.map(item => {
          // Iterate through button list in configuration, store new configuration in 'list' array
          this.iterateConfList(list, item);
        })
      
        // Replace buttons list in configuration with updated one
        button.list = list;
      }
      if (self.props.instance.isVisible()) {
        button.icon.props.className = "fa fa-eye-slash";
      } else {
        button.icon.props.className = "fa fa-eye";
      }
    });
        
    return configuration;
  }

  render () {
    // Update Menu Configuration
    let configuration = this.updateControlsConfiguration();
    return (
      <div id="LayersControls_Menu">
        <Menu
          configuration={configuration}
          menuHandler={ value => this.menuHandler(value) }/>
        { this.state.displayColorPicker === true
          ? <div
            className="btnBar-color-picker"
            ref={ref => this.colorPickerContainer = ref}
            style={{ left: this.state.pickerPosition }}>
            <ChromePicker
              color={ this.props.instance.getColor() }
              onChangeComplete={ (color, event) => {
                this.props.instance.setColor(color.hex);
                this.setState({ displayColorPicker: true });
              }}
              style={{ zIndex: 10 }}/>
          </div>
          : undefined }
      </div>
    );
  }
}

function mapStateToProps (state) {
  return { ... state }
}

function mapDispatchToProps (dispatch) {
  return { setTermInfo: (instance, visible) => dispatch(setTermInfo(instance, visible )) }
}

export default connect(mapStateToProps, mapDispatchToProps)(ListViewerControlsMenu);
