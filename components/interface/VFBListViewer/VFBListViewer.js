import React, { Component } from 'react';
import ListViewer from '@geppettoengine/geppetto-ui/list-viewer/ListViewer';
import listViewerConf from '../../configuration/VFBListViewer/listViewerConfiguration';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';

require('../../../css/VFBListViewer.less');

const VISUAL_TYPE = "VisualType";
const COMPOSITE_VISUAL_TYPE = "CompositeVisualType";

/**
 * Wrapper class that connects geppetto-client's ListViewer component with VFB.
 */
class VFBListViewer extends Component {

  constructor (props) {
    super(props);
  }
  
  filter (pathObj) {
    const { path, type } = pathObj;
    return false
  }
  
  /**
   * Retrieve configuration to display as column headers
   * 
   */
  getColumnConfiguration () {
    return listViewerConf;
  }
    
  /**
   * Retrieve instances to display in component
   */
  getInstances () {
    // Retrieve all instances from the ModelFactory
    let entities = GEPPETTO.ModelFactory.allPaths;
    var visuals = {};
    
    const { instanceDeleted, idsMap, idsList } = this.props;
    
    // Match Visual Types from ModelFactory
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].metaType === VISUAL_TYPE || entities[i].metaType === COMPOSITE_VISUAL_TYPE ) {
        if (idsList.includes(entities[i].path.split(".")[0]) && visuals[entities[i].path] === undefined ){
          visuals[entities[i].path.split(".")[0]] = entities[i];
        }
      }
    }
    return Object.values(visuals);  
  }
  
  render () {
    let instances = this.getInstances();
    return <div id="VFBLayers_component" style= { { backgroundColor : "rgb(53, 51, 51)" } } >
      <ListViewer
        instances={instances}
        className = "vfbListViewer"
        handler={this}
        filter={() => true}
        columnConfiguration={this.getColumnConfiguration()}
        infiniteScroll={true}
      />
    </div>
  }
}


function mapStateToProps (state) {
  return { 
    instanceDeleted : state.generals.ui.canvas.instanceDeleted,
    instanceOnFocus : state.generals.instanceOnFocus,
    idsMap : state.generals.idsMap,
    idsList : state.generals.idsList
  }
}

export default connect(mapStateToProps)(VFBListViewer);
