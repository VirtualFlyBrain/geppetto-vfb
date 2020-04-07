import React, { Component } from 'react'
import GeppettoGraphVisualization from 'geppetto-client/js/components/interface/graph-visualization/Graph'

export default class VFBGraph extends Component {

  constructor (props) {
    super(props);
    
    this.graphData = require('../../configuration/VFBGraph/graphConfiguration').graph;
  }

  render () {
    return (
      <GeppettoGraphVisualization
        data={this.graphData}
        nodeLabel={node => node.properties.short_form}
        linkLabel={link => link.type}
      />
    )
  }
}
