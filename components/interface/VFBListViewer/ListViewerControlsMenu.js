import React, { Component } from "react";
import Menu from "geppetto-client/js/components/interface/menu/Menu";
import { connect } from 'react-redux';
import controlsConfiguration from '../../configuration/VFBListViewer/controlsMenuConfiguration';

class ListViewerControlsMenu extends Component {
  constructor (props) {
    super(props);
    this.state = { selection : this.props.instanceSelection, instanceOnFocus : this.props.instanceOnFocus };
    this.menuHandler = this.menuHandler.bind(this);
    this.iterateConfList = this.iterateConfList.bind(this);
    this.visibleButton = this.visibleButton.bind(this);
    this.updateControlsConfiguraiton = this.updateControlsConfiguration.bind(this);
  }
  
  menuHandler (action, component) {
    let path = component.value.get("path").split(".")[0];
    let entity = Instances.getInstance(path);
    action(entity);
  }
  
  visibleButton (list,item) {
    if ( item.toggle ){
      let condition = item.toggle.condition(this.props.instance);
      list.push(item.toggle.options[condition]);
    } else {
      list.push(item);
    }
  }
  
  iterateConfList (list, item) {
    if ( item.list ) {
      item.list.map(subItem => {
        this.iterateConfList(list, subItem);
      })
    } else {
      this.visibleButton(list, item)
    }
  }
  
  updateControlsConfiguration () {
    var configuration = $.extend(true, {}, controlsConfiguration);
    let list = new Array();
    configuration.buttons.map((button, index) => {
      button.list.map(item => {
        this.iterateConfList(list, item);
      })
      
      button.list = list;
    });
    
    return configuration;
  }

  render () {
    let configuration = this.updateControlsConfiguration();
    return (
      <Menu
        configuration={configuration}
        menuClickHandler = { () => alert("Clicked") }
        menuHandler={ value => this.menuHandler(value, this.props.component) }/>
    );
  }
}

function mapStateToProps (state) {
  return {
    ...state,
    instanceSelection : state.generals.instanceSelection,
    instanceOnFocus : state.generals.instanceOnFocus,
    instanceVisibilityChanged : state.generals.instanceVisibilityChanged
  }
}
export default connect(mapStateToProps)(ListViewerControlsMenu);