import React, { Component } from 'react';
import ListViewer from '@geppettoengine/geppetto-ui/list-viewer/ListViewer';
import listViewerConf from '../../configuration/VFBListViewer/listViewerConfiguration';
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
    
    let id = "", instance = "", meta_instance = "", html = "", htmlLabels = "", matchAnchor = "", matchSpan = "", type, tags;
    // Match Visual Types from ModelFactory
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].metaType === VISUAL_TYPE || entities[i].metaType === COMPOSITE_VISUAL_TYPE ) {
        id = entities[i].path.split(".")[0];
        if (idsList.includes(id) && visuals[entities[i].path] === undefined ){
          visuals[id] = entities[i];
          instance = Instances.getInstance(id);
          visuals[id].name = instance.name;
          
          meta_instance = Instances.getInstance(id)[id + "_meta"];

          // Retrieve the HTML type from the Instance, it's in the form of an HTML element saved as a string
          html = meta_instance.getTypes().map(function (t) {
            return t.type.getInitialValue().value
          })[0].html;

          htmlLabels = meta_instance.getTypes().map(function (t) {
            return t.label.getInitialValue().value
          })[0].html;
          
          // Extract HTML element anchor text from html string
          visuals[id].types = html?.match(/<a[^>]*>(.*?)<\/a>/g)?.map(function (val){
            return val?.replace(/<a[^>]*>/g, '').replace(/<\/?a>/g,'');
          }).join();
          
          // Extract HTML element anchor text from html string
          visuals[id].tags = htmlLabels?.match(/<span[^>]*>(.*?)<\/span>/g)?.map(function (val){
            return val?.replace(/<span[^>]*>/g, '')?.replace(/<\/?span>/g,'');
          }).join();
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
        filterFn={() => console.log("Filtering")}
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
