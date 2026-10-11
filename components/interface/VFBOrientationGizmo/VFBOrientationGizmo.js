import React, { Component } from 'react';

/*
 * Anatomical orientation gizmo for the 3D viewer.
 *
 * A small axis triad drawn on its own transparent canvas in the top-right
 * corner of the 3D viewer, rotating with the main camera. Each positive image
 * axis (X red, Y green, Z blue) carries the letter of the anatomical direction
 * it points to (L/R, A/P, S/I), so the same triad reads correctly on every
 * template even though their axis orders differ.
 *
 * The letters come from the template's stack-viewer meta: uk.ac.vfb.geppetto
 * puts a three-letter orientation code in subDomains[0][3] of the template's
 * `_slices` variable (body axes, superior/inferior for dorsal/ventral). If the
 * code is missing the gizmo simply does not appear.
 *
 * Rendering is done with the three.js instance the Geppetto engine exposes
 * (engine.THREE), so no second copy of three is bundled. That instance is
 * r87 in production, so only API that exists there is used.
 */

const SIZE = 74;
const MARGIN = 8;
const OPACITY = 0.4;
const IDLE_OPACITY = 0.16;
const IDLE_MS = 1500;
const POLL_MS = 1000;
const AXIS_COLOURS = [0xe5484d, 0x3ec26b, 0x4a8ff0];

export default class VFBOrientationGizmo extends Component {
  constructor (props) {
    super(props);
    this.code = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.group = null;
    this.lastQuaternion = null;
    this.lastMove = 0;
    this.frame = null;
    this.poll = null;
    this.tick = this.tick.bind(this);
  }

  componentDidMount () {
    this.poll = setInterval(() => this.check(), POLL_MS);
  }

  componentWillUnmount () {
    clearInterval(this.poll);
    this.teardown();
  }

  /*
   * Return the Geppetto 3D engine if the viewer is mounted and live, else null.
   */
  getEngine () {
    const canvas = this.props.getCanvas ? this.props.getCanvas() : undefined;
    if (!canvas || !canvas.engine || !canvas.engine.camera || !canvas.engine.renderer) {
      return null;
    }
    const dom = canvas.engine.renderer.domElement;
    if (!dom || !dom.isConnected) {
      return null;
    }
    return canvas.engine;
  }

  /*
   * Read the orientation code from the template's `_slices` meta, or null.
   */
  readOrientation () {
    const templateID = window.templateID;
    if (templateID === undefined || window[templateID] === undefined) {
      return null;
    }
    try {
      const slices = window[templateID][templateID + '_slices'];
      if (!slices) {
        return null;
      }
      const value = slices.getValue();
      const wrapped = typeof value.getWrappedObj === 'function' ? value.getWrappedObj() : value.wrappedObj;
      const config = JSON.parse(wrapped.value.data);
      const code = config.subDomains && config.subDomains[0] ? config.subDomains[0][3] : null;
      return (typeof code === 'string' && code.length === 3) ? code.toUpperCase() : null;
    } catch (e) {
      return null;
    }
  }

  check () {
    const engine = this.getEngine();
    if (!engine) {
      this.teardown();
      return;
    }
    const code = this.readOrientation();
    if (!code) {
      this.teardown();
      return;
    }
    if (code !== this.code || !this.renderer) {
      this.teardown();
      this.build(engine, code);
    }
  }

  build (engine, code) {
    const THREE = engine.THREE;
    const host = engine.renderer.domElement.parentNode;
    if (!host || !THREE) {
      return;
    }
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'vfb-orientation-gizmo';
    canvas.title = 'Anatomical orientation: ' + code;
    Object.assign(canvas.style, {
      position: 'absolute',
      top: MARGIN + 'px',
      right: MARGIN + 'px',
      width: SIZE + 'px',
      height: SIZE + 'px',
      pointerEvents: 'none',
      opacity: OPACITY,
      transition: 'opacity 0.4s ease',
      zIndex: 5
    });
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(SIZE, SIZE, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.45, 1.45, 1.45, -1.45, 0.1, 10);
    camera.position.set(0, 0, 5);
    // r87's lookAt takes a Vector3 only; three numbers give a NaN matrix and a blank gizmo.
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const dir = new THREE.Vector3();
      dir.setComponent(i, 1);
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.8, 10),
        new THREE.MeshBasicMaterial({ color: AXIS_COLOURS[i] })
      );
      bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      bar.position.copy(dir).multiplyScalar(0.4);
      group.add(bar);

      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.letterTexture(THREE, code.charAt(i), AXIS_COLOURS[i]),
        depthTest: false
      }));
      sprite.scale.set(0.68, 0.68, 1);
      sprite.position.copy(dir).multiplyScalar(1.08);
      group.add(sprite);
    }
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: 0xdfe3ea })));
    scene.add(group);

    this.code = code;
    this.canvas = canvas;
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.group = group;
    this.lastQuaternion = null;
    this.lastMove = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  letterTexture (THREE, letter, colour) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fillStyle = '#' + colour.toString(16).padStart(6, '0');
    ctx.fill();
    ctx.fillStyle = '#0b0d12';
    ctx.font = 'bold 78px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 64, 68);
    const texture = new THREE.CanvasTexture(c);
    texture.minFilter = THREE.LinearFilter;
    if (THREE.SRGBColorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    return texture;
  }

  tick () {
    const engine = this.getEngine();
    if (!engine || !this.renderer) {
      this.teardown();
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
    const q = engine.camera.quaternion;
    const now = performance.now();
    if (this.lastQuaternion === null || !this.lastQuaternion.equals(q)) {
      this.lastQuaternion = q.clone();
      this.lastMove = now;
      /*
       * engine.THREE is Geppetto's three r87, where the inverse of a
       * quaternion is inverse(); invert() only arrived in r123. Calling
       * the missing one threw on every animation frame and failed the
       * whole term-info test batch.
       */
      const gq = this.group.quaternion.copy(q);
      if (typeof gq.invert === 'function') {
        gq.invert();
      } else {
        gq.inverse();
      }
      this.renderer.render(this.scene, this.camera);
      this.canvas.style.opacity = OPACITY;
    } else if (now - this.lastMove > IDLE_MS && this.canvas.style.opacity !== String(IDLE_OPACITY)) {
      this.canvas.style.opacity = IDLE_OPACITY;
    }
  }

  teardown () {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    if (this.group) {
      this.group.traverse(obj => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (obj.material.map) {
            obj.material.map.dispose();
          }
          obj.material.dispose();
        }
      });
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.code = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.group = null;
    this.lastQuaternion = null;
  }

  render () {
    return null;
  }
}
