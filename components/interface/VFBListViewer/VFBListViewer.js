import React, { Component } from 'react';
import ListViewer from '@geppettoengine/geppetto-ui/list-viewer/ListViewer';
import listViewerConf from '../../configuration/VFBListViewer/listViewerConfiguration';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';

const VISUAL_TYPE = "VisualType";

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
    var visuals = [];
    // Match Visual Types from ModelFactory
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].metaType === VISUAL_TYPE) {
        visuals.push(entities[i]);
      }
    }
    return visuals;  
  }
  
  render () {
    let instances = this.getInstances();
    return <div id="VFBLayers_component" style= { { backgroundColor : "rgb(53, 51, 51)" } } >
      <ListViewer
        instances={instances}
        handler={this}
        filter={() => true}
        columnConfiguration={this.getColumnConfiguration()}
        showPagination={false}
      />
    </div>
  }
}


function mapStateToProps (state) {
  return { instanceOnFocus : state.generals.instanceOnFocus }
}

export default connect(mapStateToProps)(VFBListViewer);
