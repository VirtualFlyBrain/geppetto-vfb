import React, { Component } from 'react';
import NeuroglassLogo from '../../configuration/VFBMain/neuroglass-logo.png';
import { openSceneInNeuroglass, neuroglassAvailable } from '../utils/neuroglass';

/*
 * "Open in Neuroglass" button on the 3D viewer itself (bottom-right corner),
 * the same action as Tools > Open in Neuroglass. It uses Neuroglass's own logo
 * (with MetaCell's agreement) so it is clear where the scene will open.
 *
 * Like the orientation gizmo it attaches to the viewer's own DOM node, found by
 * polling, because the Geppetto Canvas is re-created as layouts change. It is
 * only shown while the scene's template has Neuroglass data.
 */

const SIZE = 30;
const MARGIN = 8;
const POLL_MS = 1000;

export default class VFBNeuroglassButton extends Component {
  constructor (props) {
    super(props);
    this.button = null;
    this.poll = null;
  }

  componentDidMount () {
    this.poll = setInterval(() => this.check(), POLL_MS);
  }

  componentWillUnmount () {
    clearInterval(this.poll);
    this.teardown();
  }

  host () {
    const canvas = this.props.getCanvas ? this.props.getCanvas() : undefined;
    if (!canvas || !canvas.engine || !canvas.engine.renderer) {
      return null;
    }
    return canvas.engine.renderer.domElement.parentNode;
  }

  check () {
    const host = this.host();
    if (!host || !neuroglassAvailable(window.templateID)) {
      this.teardown();
      return;
    }
    if (this.button && this.button.parentNode === host) {
      return;
    }
    this.teardown();
    this.build(host);
  }

  build (host) {
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'vfb-neuroglass-button';
    button.title = 'Open this 3D scene in Neuroglass';
    button.setAttribute('aria-label', 'Open this 3D scene in Neuroglass');
    Object.assign(button.style, {
      position: 'absolute',
      bottom: MARGIN + 'px',
      right: MARGIN + 'px',
      width: SIZE + 'px',
      height: SIZE + 'px',
      padding: '3px',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      borderRadius: '4px',
      background: 'rgba(0, 0, 0, 0.45)',
      cursor: 'pointer',
      opacity: 0.75,
      transition: 'opacity 0.2s ease',
      zIndex: 5
    });
    const img = document.createElement('img');
    img.src = NeuroglassLogo;
    img.alt = '';
    Object.assign(img.style, { width: '100%', height: '100%', display: 'block' });
    button.appendChild(img);
    button.addEventListener('mouseenter', () => {
      button.style.opacity = 1;
    });
    button.addEventListener('mouseleave', () => {
      button.style.opacity = 0.75;
    });
    button.addEventListener('click', event => {
      event.stopPropagation();
      openSceneInNeuroglass(new URLSearchParams(window.location.search).get('id'));
    });
    host.appendChild(button);
    this.button = button;
  }

  teardown () {
    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }
    this.button = null;
  }

  render () {
    return null;
  }
}
