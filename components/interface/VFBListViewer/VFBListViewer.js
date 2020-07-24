import React, { Component } from 'react';
import ListViewer from 'geppetto-client/js/components/interface/listViewer/ListViewer';
import listViewerConf from '../../configuration/VFBListViewer/listViewerConfiguration';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from 'react-redux';

class VFBListViewer extends Component {

  constructor (props) {
    super(props);
    this.state = { update: 0, searchText : '', loading : false }
  }

  componentDidUpdate () {
  }
  
  filter (pathObj) {
    const { path, type } = pathObj;
    return false
  }
  
  getColumnConfiguration () {
    return listViewerConf;
  }
  
  clickShowInfo () {}
  
  getInstances () {
    let entities = GEPPETTO.ModelFactory.allPaths;
    var visuals = [];
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].metaType === "VisualType") {
        visuals.push(entities[i]);
      }
    }
    return visuals;  
  }
  
  render () {
    let instances = this.getInstances();
    return <div style= { { position : "absolute" , width : "100%", backgroundColor : "#4f4f4f" } } >
      { this.state.loading
        ? <CircularProgress
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            margin: 'auto',
            color: "#11bffe",
            size: "55rem"
          }}/>
        : <ListViewer
          instances={instances}
          handler={this}
          filter={() => true} 
          columnConfiguration={this.getColumnConfiguration()}
        />
      }
    </div>
  }
}


function mapStateToProps (state) {
  return { instanceOnFocus : state.generals.instanceOnFocus }
}

export default connect(mapStateToProps)(VFBListViewer);
