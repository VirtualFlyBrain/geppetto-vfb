import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sceneTerms, buildNeuroglassState, neuroglassUrl, neuroglassAvailable } from '../utils/neuroglass';

// Wait for bursts of loads/deletes to settle before rebuilding the viewer
const DEBOUNCE_TIME = 300;
// Below this width only the 3D panel is shown, as in the v3 widget
const MOBILE_MAX_WIDTH = 1199;
const DESKTOP_LAYOUT = "4panel-alt";
const MOBILE_LAYOUT = "3d";

const messageStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "1em",
  textAlign: "center",
  color: "#a0a0a0"
};

/**
 * Neuroglass viewer embedded as a tab. It shows the terms of the 3D scene (the
 * same set as Tools > Open in Neuroglass and the share link) and rebuilds when
 * terms are added to or removed from the scene. The whole Neuroglancer state
 * travels in the iframe URL, so a rebuild reloads the viewer.
 */
class VFBNeuroglassViewer extends Component {
  constructor (props) {
    super(props);
    this.state = {
      src: "",
      message: "Loading Neuroglass viewer...",
      isMobile: false
    };
    this.buildRequest = 0;
    this.debounceTimer = undefined;
    this.mediaQuery = undefined;
    this.scheduleUpdate = this.scheduleUpdate.bind(this);
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
  }

  componentDidMount () {
    this.mediaQuery = window.matchMedia("(max-width: " + MOBILE_MAX_WIDTH + "px)");
    this.mediaQuery.addListener(this.mediaQueryChanged);
    // idsList can change before the term's visual instances are in the model
    GEPPETTO.on(GEPPETTO.Events.Instances_created, this.scheduleUpdate, this);
    this.setState({ isMobile: this.mediaQuery.matches }, this.scheduleUpdate);
  }

  /*
   * Focus changes alone don't rebuild: that would reload the viewer on every
   * click. The focused term is picked up as the selected layer on the next build.
   */
  componentDidUpdate (prevProps, prevState) {
    if (prevProps.idsList !== this.props.idsList
        || prevState.isMobile !== this.state.isMobile
        || (this.props.visible && !prevProps.visible)) {
      this.scheduleUpdate();
    }
  }

  componentWillUnmount () {
    clearTimeout(this.debounceTimer);
    // Drop any build still in flight
    this.buildRequest++;
    this.mediaQuery.removeListener(this.mediaQueryChanged);
    GEPPETTO.off(GEPPETTO.Events.Instances_created, this.scheduleUpdate, this);
  }

  mediaQueryChanged (event) {
    this.setState({ isMobile: event.matches });
  }

  scheduleUpdate () {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.updateSource(), DEBOUNCE_TIME);
  }

  async updateSource () {
    // Rebuilt when it is shown again; no point loading a hidden viewer
    if (this.props.visible === false) {
      return;
    }
    const templateId = window.templateID;
    if (!templateId) {
      this.setState({ src: "", message: "Load a template to see the scene in Neuroglass." });
      return;
    }
    if (!neuroglassAvailable(templateId)) {
      this.setState({ src: "", message: "Neuroglass data (precomputed) is not available yet for template " + templateId + "." });
      return;
    }
    const request = ++this.buildRequest;
    const focusId = this.props.instanceOnFocus?.getId?.();
    const result = await buildNeuroglassState(sceneTerms(), templateId, focusId, this.state.isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT);
    // A newer build started, or the component went away, while this one waited
    if (request !== this.buildRequest) {
      return;
    }
    if (result.missing.length > 0) {
      console.warn("[Neuroglass] no precomputed data for: " + result.missing.join(", "));
    }
    if (result.state === null) {
      this.setState({ src: "", message: "None of the terms in the scene has Neuroglass data (precomputed) yet." });
    } else {
      this.setState({ src: neuroglassUrl(result.state) });
    }
  }

  render () {
    const { src, message } = this.state;
    if (src === "") {
      return <div id="VFBNeuroglass_component" style={messageStyle}>{message}</div>;
    }
    return (
      <div id="VFBNeuroglass_component" style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
        <iframe
          src={src}
          style={{ width: "100%", height: "100%", border: "none", backgroundColor: "#000" }}
          title="Neuroglass Viewer"
          allow="accelerometer; camera; gyroscope; microphone; web-share"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    );
  }
}

function mapStateToProps (state) {
  return {
    idsList : state.generals.idsList,
    instanceOnFocus : state.generals.instanceOnFocus
  };
}

export default connect(mapStateToProps, null, null, { forwardRef : true })(VFBNeuroglassViewer);
