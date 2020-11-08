import React, { Component } from 'react';
require('./VFBLoader.less');

export default class VFBLoader extends Component {
  constructor (props) {
    super(props)
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.props.generals.loading) {
      GEPPETTO.trigger('stop_spin_logo');
    }
  }

  componentDidMount () {
    var that = this;
    GEPPETTO.on('stop_spin_logo', function () {
      if (that.props.generals.loading) {
        GEPPETTO.trigger('spin_logo');
      }
    });
  }

  render () {
    if (!this.props.generals.loading) {
      return null;
    }
    return (
      <div>
        <ProgressBar params={this.props.generals} />
      </div>
    )
  }
}

const ProgressBar = props => {
  let instancesToLoad = props.params.idsToLoad;
  let instancesLoaded = props.params.idsLoaded + 1;
  return (
    <div className="progress-bar" datalabel={"Loading " + String(instancesLoaded) + "/" + String(instancesToLoad) + " ..."}>
      <Filler stepsLoaded={props.params.stepsLoaded} stepsToLoad={props.params.stepsToLoad} />
    </div>
  )
};

const Filler = props => (
  <div className="filler" style={{ width: `${props.stepsLoaded * (100 / props.stepsToLoad)}%` }}></div>
);
