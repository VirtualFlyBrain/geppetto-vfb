import React, { Component } from 'react';
require('./VFBLoader.less');

export default class VFBLoader extends Component {
  constructor (props) {
    super(props)
  }

  /*
   * The fly logo is a pure reflection of generals.loading, which VFBLoadManager
   * (via LOAD_STATUS) is the single owner of. Spin on the false->true edge, stop
   * on true->false. No other code path should trigger spin_logo/stop_spin_logo --
   * that was the source of the logo spinning forever after a load or query.
   */
  syncLogo (loading) {
    if (loading) {
      GEPPETTO.trigger('spin_logo');
    } else {
      GEPPETTO.trigger('stop_spin_logo');
    }
  }

  componentDidUpdate (prevProps) {
    var was = prevProps && prevProps.generals && prevProps.generals.loading;
    var now = this.props.generals.loading;
    if (now !== was) {
      this.syncLogo(now);
    }
  }

  componentDidMount () {
    this.syncLogo(this.props.generals.loading);
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
