/* global DecompressionStream */
/*
 * Open the current 3D scene in Neuroglass (MetaCell's Neuroglancer-based viewer).
 *
 * Mirrors the v3 Neuroglass widget (MetaCell/virtual-fly-brain,
 * frontend/src/utils/neuroglassStateConfig.js, PR #236 version): one layer per
 * term in the scene, each read from the term's precomputed.zip in its image
 * folder through Neuroglancer's zip kvstore, e.g.
 *   https://www.virtualflybrain.org/data/VFB/i/0010/1567/VFB_00101567/precomputed.zip|zip:|neuroglancer-precomputed:
 * Templates and expression patterns are image layers, neurons, clones and
 * painted domains are segmentation layers (segment 1 + mesh). The layer type is
 * read from the zip's own info: with type 'auto' Neuroglancer drops the colour
 * and segment fields when it resolves the type (checked 2026-11-06), so a
 * neuron came up with no segment selected and no mesh.
 *
 * The zips exist only for the templates the precomputed job has converted
 * (docs/25-precomputed.md in vfb-k8s), so each term's zip is checked first and
 * the ones without one are left out.
 */

/* VFB's own Neuroglass instance; the embed view needs no login. */
export const NEUROGLASS_URL = "https://vfb.neuroglass.io/embed";
export const PRECOMPUTED_BASE_URL = "https://www.virtualflybrain.org/data";

/*
 * Templates with precomputed data. The view is the v3 one for JRC2018U: nm
 * space, centred on the template, anterior view. Other templates get no
 * position, so Neuroglancer centres on the first layer.
 */
const TEMPLATE_VIEWS = {
  VFB_00101567: {
    position: [314000, 147000, 87000],
    crossSectionScale: 500,
    projectionOrientation: [0, 0, 0, 1],
    projectionScale: 700000
  },
  VFB_00200000: { projectionOrientation: [0, 0, 0, 1] }
};

const DIMENSIONS = {
  x: [1e-9, "m"],
  y: [1e-9, "m"],
  z: [1e-9, "m"]
};

const LAYER_SHADER = [
  "#uicontrol invlerp contrast",
  "#uicontrol vec3 color color",
  "void main() {",
  "  float contrast_value = contrast();",
  "  if (VOLUME_RENDERING) {",
  "    emitRGBA(vec4(color * contrast_value, contrast_value));",
  "  }",
  "  else {",
  "    emitRGB(color * contrast_value);",
  "  }",
  "}"
].join("\n");

const DEFAULT_CONTRAST_RANGE = [0, 123];

/*
 * VFB_00101567 -> VFB/i/0010/1567/<template>/precomputed.zip, the same layout
 * as the other image files (thumbnail.png, volume.nrrd).
 */
export function precomputedZipUrl (termId, templateId) {
  const match = /^VFB_([A-Za-z0-9]{4})([A-Za-z0-9]{4})$/.exec(termId || "");
  if (!match) {
    return null;
  }
  return PRECOMPUTED_BASE_URL + "/VFB/i/" + match[1] + "/" + match[2] + "/" + templateId + "/precomputed.zip";
}

function toHexByte (value) {
  const v = Math.max(0, Math.min(255, Math.round(value)));
  return v.toString(16).padStart(2, "0");
}

/*
 * Geppetto colours come as "#rrggbb", "0xrrggbb" or {r, g, b} (0-1 or 0-255).
 */
export function colourToHex (colour) {
  if (typeof colour === "string") {
    const hex = colour.replace(/^#|^0x/i, "");
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return "#" + hex.toLowerCase();
    }
    return "#ffffff";
  }
  if (colour && typeof colour === "object") {
    let { r = 1, g = 1, b = 1 } = colour;
    if (r <= 1 && g <= 1 && b <= 1) {
      r *= 255;
      g *= 255;
      b *= 255;
    }
    return "#" + toHexByte(r) + toHexByte(g) + toHexByte(b);
  }
  return "#ffffff";
}

function callSafely (fn, fallback) {
  try {
    const value = fn();
    return value === undefined ? fallback : value;
  } catch (ignore) {
    return fallback;
  }
}

/*
 * The terms in the scene, template first: the same set the share link (i=)
 * lists, i.e. the composite instances of everything with geometry.
 */
export function sceneTerms () {
  const terms = [];
  const seen = {};
  const add = function (instance) {
    const id = callSafely(() => instance.getId(), null);
    if (!id || seen[id]) {
      return;
    }
    seen[id] = true;
    terms.push({
      id: id,
      colour: colourToHex(callSafely(() => instance.getColor(), "#ffffff")),
      visible: callSafely(() => typeof instance.isVisible !== "function" || instance.isVisible(), true)
    });
  };

  if (window.templateID && window.Instances) {
    const template = callSafely(() => window.Instances.getInstance(window.templateID), null);
    if (template) {
      add(template);
    } else {
      terms.push({ id: window.templateID, colour: "#ffffff", visible: true });
      seen[window.templateID] = true;
    }
  }

  const visuals = callSafely(() => GEPPETTO.ModelFactory.getAllInstancesWithCapability(GEPPETTO.Resources.VISUAL_CAPABILITY, window.Instances), []);
  visuals.forEach(function (visual) {
    const candidates = [visual, callSafely(() => visual.getParent(), null)];
    candidates.forEach(function (candidate) {
      if (candidate && callSafely(() => candidate.getType().getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE, false)) {
        add(candidate);
      }
    });
  });
  return terms;
}

function buildLayer (term, source, type) {
  const layer = {
    type: type,
    source: source + "|zip:|neuroglancer-precomputed:",
    tab: "rendering",
    name: term.id
  };
  if (type === "image") {
    Object.assign(layer, {
      opacity: 1,
      blend: "additive",
      shader: LAYER_SHADER,
      shaderControls: {
        contrast: { range: DEFAULT_CONTRAST_RANGE },
        color: term.colour
      },
      volumeRenderingDepthSamples: 256,
      volumeRendering: "on"
    });
  } else if (type === "segmentation") {
    Object.assign(layer, {
      segments: ["1"],
      segmentColors: { "1": term.colour },
      segmentDefaultColor: term.colour
    });
  }
  if (!term.visible) {
    layer.visible = false;
  }
  return layer;
}

/*
 * The pipeline writes "info" as the zip's first entry (deflated, sizes in the
 * local header), so the first 4 KB hold the layer type. A 404 means the term
 * has no zip for this template. The data host sends
 * Access-Control-Allow-Origin: * and answers Range requests.
 */
const ZIP_LOCAL_HEADER = 0x04034b50;

function inflateRaw (bytes) {
  if (typeof DecompressionStream !== "function") {
    return Promise.reject(new Error("no DecompressionStream"));
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).arrayBuffer();
}

export function layerTypeFromZipHead (buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 30 || view.getUint32(0, true) !== ZIP_LOCAL_HEADER) {
    return Promise.reject(new Error("not a zip"));
  }
  const method = view.getUint16(8, true);
  const size = view.getUint32(18, true);
  const nameLength = view.getUint16(26, true);
  const extraLength = view.getUint16(28, true);
  const name = new TextDecoder().decode(new Uint8Array(buffer, 30, nameLength));
  const start = 30 + nameLength + extraLength;
  if (name !== "info" || start + size > buffer.byteLength) {
    return Promise.reject(new Error("info is not the first entry"));
  }
  const bytes = new Uint8Array(buffer, start, size);
  const content = method === 0 ? Promise.resolve(bytes) : method === 8 ? inflateRaw(bytes) : Promise.reject(new Error("compression " + method));
  return content.then(data => JSON.parse(new TextDecoder().decode(data)).type);
}

/*
 * Resolves to "image", "segmentation", "auto" (the zip is there but its type
 * could not be read) or null (no zip).
 */
function zipLayerType (url) {
  return fetch(url, { headers: { Range: "bytes=0-4095" } })
    .then(function (response) {
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.arrayBuffer()
        .then(layerTypeFromZipHead)
        .then(type => (type === "image" || type === "segmentation" ? type : "auto"))
        .catch(() => "auto");
    })
    .catch(function () {
      // e.g. a browser that preflights Range: fall back to a plain HEAD
      return fetch(url, { method: "HEAD" })
        .then(response => (response.ok ? "auto" : null))
        .catch(() => null);
    });
}

export function buildNeuroglassState (terms, templateId, focusId) {
  return Promise.all(terms.map(function (term) {
    const url = precomputedZipUrl(term.id, templateId);
    if (!url) {
      return Promise.resolve(null);
    }
    return zipLayerType(url).then(type => (type ? buildLayer(term, url, type) : null));
  })).then(function (results) {
    const layers = results.filter(layer => layer !== null);
    const missing = terms.filter((term, i) => results[i] === null).map(term => term.id);
    if (layers.length === 0) {
      return { state: null, missing: missing };
    }
    const selected = focusId && layers.some(layer => layer.name === focusId) ? focusId : layers[0].name;
    const state = Object.assign(
      { dimensions: DIMENSIONS },
      TEMPLATE_VIEWS[templateId] || {},
      {
        layers: layers,
        showSlices: false,
        selectedLayer: { visible: false, layer: selected },
        layout: "4panel-alt",
        layerListPanel: { visible: false }
      }
    );
    return { state: state, missing: missing };
  });
}

export function neuroglassUrl (state) {
  return NEUROGLASS_URL + "#!" + encodeURIComponent(JSON.stringify(state));
}

function showMessage (win, text) {
  if (!win) {
    window.alert(text);
    return;
  }
  win.document.title = "Neuroglass";
  win.document.body.style.fontFamily = "sans-serif";
  win.document.body.style.padding = "2em";
  win.document.body.textContent = text;
}

/*
 * Menu action. The tab is opened straight away, inside the click, so pop-up
 * blockers allow it; it is pointed at Neuroglass once the zips are checked.
 */
export function openSceneInNeuroglass (focusId) {
  const win = window.open("", "_blank");
  if (win) {
    win.opener = null;
    showMessage(win, "Preparing the scene for Neuroglass...");
  }
  const templateId = window.templateID;
  if (!templateId) {
    showMessage(win, "Load a template first: there is nothing in the 3D scene to open in Neuroglass.");
    return Promise.resolve(null);
  }
  if (!TEMPLATE_VIEWS[templateId]) {
    showMessage(win, "Neuroglass data (precomputed) is not available yet for template " + templateId + ".");
    return Promise.resolve(null);
  }
  return buildNeuroglassState(sceneTerms(), templateId, focusId).then(function (result) {
    if (!result.state) {
      showMessage(win, "None of the terms in the scene has Neuroglass data (precomputed) yet.");
      return result;
    }
    if (result.missing.length > 0) {
      console.warn("[Neuroglass] no precomputed data for: " + result.missing.join(", "));
    }
    const url = neuroglassUrl(result.state);
    if (win) {
      win.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
    return result;
  });
}
