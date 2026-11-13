import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  sceneTerms,
  buildNeuroglassState,
  neuroglassUrl,
  neuroglassAvailable,
  watchOpacityChanges,
  OPACITY_SET_EVENT
} from '../utils/neuroglass';

// Wait for bursts of changes (loads, nested select/show/hide events) to settle
const DEBOUNCE_TIME = 300;
// Below this width only the 3D panel is shown, as in the v3 widget
const MOBILE_MAX_WIDTH = 1199;
const DESKTOP_LAYOUT = "4panel-alt";
const MOBILE_LAYOUT = "3d";

/*
 * Scene changes the viewer follows, besides terms added to or removed from the
 * scene (idsList): colour, show/hide, selection and opacity. Instances_created
 * is there because idsList can change before the term's visual instances are
 * in the model.
 */
function sceneEvents () {
  return [
    GEPPETTO.Events.Instances_created,
    GEPPETTO.Events.Instance_deleted,
    GEPPETTO.Events.Color_set,
    GEPPETTO.Events.Visibility_changed,
    GEPPETTO.Events.Select,
    OPACITY_SET_EVENT
  ];
}

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
 * same set as Tools > Open in Neuroglass and the share link) with their colour,
 * visibility, opacity and selection, and follows the scene as it changes.
 *
 * The whole Neuroglancer state travels in the iframe URL. The first state loads
 * the iframe; later ones only replace the URL's #! part, which Neuroglass
 * applies without reloading or refetching, so the scene doesn't flash. It does
 * reset the camera to the template view, since the embed offers no way to read
 * the camera back.
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
    this.iframe = null;
    // URL of the state the iframe shows now
    this.currentUrl = "";
    this.scheduleUpdate = this.scheduleUpdate.bind(this);
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.setIframe = this.setIframe.bind(this);
  }

  componentDidMount () {
    this.mediaQuery = window.matchMedia("(max-width: " + MOBILE_MAX_WIDTH + "px)");
    this.mediaQuery.addListener(this.mediaQueryChanged);
    watchOpacityChanges();
    sceneEvents().forEach(event => GEPPETTO.on(event, this.scheduleUpdate, this));
    this.setState({ isMobile: this.mediaQuery.matches }, this.scheduleUpdate);
  }

  /*
   * Focus changes alone don't rebuild: each rebuild resets the Neuroglass
   * camera. Focusing a term in VFB selects it too, and the selection is
   * followed. The focused term becomes the selected layer on the next build.
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
    sceneEvents().forEach(event => GEPPETTO.off(event, this.scheduleUpdate, this));
  }

  mediaQueryChanged (event) {
    this.setState({ isMobile: event.matches });
  }

  setIframe (iframe) {
    this.iframe = iframe;
  }

  scheduleUpdate () {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.updateSource(), DEBOUNCE_TIME);
  }

  showMessage (message) {
    this.currentUrl = "";
    this.setState({ src: "", message: message });
  }

  /*
   * Point the iframe at a new state. Once it shows Neuroglass, only the hash
   * changes: location.replace with a URL that differs in the fragment alone is
   * applied in place and adds no history entry to the VFB page.
   */
  showState (url) {
    if (url === this.currentUrl) {
      return;
    }
    const loaded = this.state.src !== "" && this.iframe && this.iframe.contentWindow;
    this.currentUrl = url;
    if (loaded) {
      try {
        this.iframe.contentWindow.location.replace(url);
        return;
      } catch (error) {
        console.warn("[Neuroglass] in-place update failed, reloading the viewer", error);
      }
    }
    this.setState({ src: url });
  }

  async updateSource () {
    // Rebuilt when it is shown again; no point loading a hidden viewer
    if (this.props.visible === false) {
      return;
    }
    const templateId = window.templateID;
    if (!templateId) {
      this.showMessage("Load a template to see the scene in Neuroglass.");
      return;
    }
    if (!neuroglassAvailable(templateId)) {
      this.showMessage("Neuroglass data (precomputed) is not available yet for template " + templateId + ".");
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
      this.showMessage("None of the terms in the scene has Neuroglass data (precomputed) yet.");
    } else {
      this.showState(neuroglassUrl(result.state));
    }
  }

  render () {
    const { src, message } = this.state;
    if (src === "") {
      return <div id="VFBNeuroglass_component" style={messageStyle}>{message}</div>;
    }
    /*
     * src only changes when the iframe is (re)loaded; in-place updates go
     * through showState, so React never touches the attribute in between.
     */
    return (
      <div id="VFBNeuroglass_component" style={{ height: "100%", width: "100%", backgroundColor: "#000" }}>
        <iframe
          ref={this.setIframe}
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
