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
    var status = this.props.generals.loadStatus || {};
    if (!status.active) {
      return null;
    }
    return (
      <div>
        <ProgressBar status={status} />
      </div>
    )
  }
}

const ProgressBar = props => {
  var status = props.status;
  var pct = status.total > 0 ? Math.round((status.settled / status.total) * 100) : 0;
  var failedCount = status.failed ? status.failed.length : 0;
  var label = (status.message || "Loading ...") + (failedCount > 0 ? " (" + failedCount + " couldn't load)" : "");
  return (
    <div className="progress-bar" datalabel={label}>
      <Filler pct={pct} />
    </div>
  )
};

const Filler = props => (
  <div className="filler" style={{ width: `${props.pct}%` }}></div>
);
