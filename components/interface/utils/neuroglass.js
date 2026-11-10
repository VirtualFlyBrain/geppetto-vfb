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
 * Templates with precomputed data, in nm space, centred on the template,
 * anterior view. JRC2018U is the v3 view. JRC2018U VNC is 660x1290x382 at
 * 0.4 um, so its centre is (132000, 258000, 76400) nm; the zoom is the one
 * Robbie set by hand (2026-11-10). Without a crossSectionScale Neuroglancer
 * opens the slices at 1 nm per pixel, i.e. far too zoomed in.
 */
const TEMPLATE_VIEWS = {
  VFB_00101567: {
    position: [314000, 147000, 87000],
    crossSectionScale: 500,
    projectionOrientation: [0, 0, 0, 1],
    projectionScale: 700000
  },
  VFB_00200000: {
    position: [132000, 258000, 76400],
    crossSectionScale: 755,
    projectionOrientation: [0, 0, 0, 1],
    projectionScale: 226000
  }
};

const VOLUME_SAMPLE_ALPHA = 0.03;

const DIMENSIONS = {
  x: [1e-9, "m"],
  y: [1e-9, "m"],
  z: [1e-9, "m"]
};

/*
 * 3D rendering, tuned on a real scene (template + medulla + neurons + a GAL4
 * pattern, 2026-11-06). The v3 widget's settings turn the template's volume
 * render into an opaque grey cloud: every sample has alpha = contrast, so the
 * ray saturates at the front of the brain and everything inside shows as a
 * dark shadow. The "alpha" control scales the per-sample opacity in the 3D
 * (volume) branch only, so the 2D slices are unchanged, and the gain
 * (log2 exposure) sets how bright the cloud is. A domain or tract is drawn as
 * a silhouette shell, so the neurons inside it stay visible; neurons are thin
 * and stay opaque.
 */
const LAYER_SHADER = [
  "#uicontrol invlerp contrast",
  "#uicontrol vec3 color color",
  "#uicontrol float alpha slider(min=0, max=1, default=" + VOLUME_SAMPLE_ALPHA + ")",
  "void main() {",
  "  float contrast_value = contrast();",
  "  if (VOLUME_RENDERING) {",
  "    emitRGBA(vec4(color * contrast_value, contrast_value * alpha));",
  "  }",
  "  else {",
  "    emitRGB(color * contrast_value);",
  "  }",
  "}"
].join("\n");

const DEFAULT_CONTRAST_RANGE = [0, 123];
/*
 * log2 exposure of the volume renders: a faint grey ghost of the template,
 * expression patterns dimmed but still the data
 */
const TEMPLATE_VOLUME_GAIN = -6;
const EXPRESSION_VOLUME_GAIN = -3;
/* meshSilhouetteRendering power for domains and tracts */
const REGION_SILHOUETTE = 4;

/*
 * Gross types (the label-<Type> classes v2 puts on a term's label) whose mesh
 * is a filled region rather than a neuron, so it is drawn as a silhouette.
 */
const REGION_TYPES = [
  "Synaptic_neuropil",
  "Synaptic_neuropil_domain",
  "Synaptic_neuropil_subdomain",
  "Synaptic_neuropil_block",
  "Neuron_projection_bundle",
  "Ganglion",
  "Neuromere"
];

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
 * The gross types of a loaded term, read from the label-<Type> classes of its
 * <id>_meta.label HTML (e.g. "label-Synaptic_neuropil_domain", "label-Neuron"),
 * which is what the Term Info header shows as type badges.
 */
export function grossTypes (id) {
  const html = callSafely(function () {
    const value = window.Instances.getInstance(id + "." + id + "_meta.label").getValue();
    return value.html || value.value.html;
  }, "") || "";
  const types = [];
  const pattern = /\blabel-([A-Za-z0-9_]+)/g;
  let match = pattern.exec(html);
  while (match) {
    types.push(match[1]);
    match = pattern.exec(html);
  }
  return types;
}

export function isRegion (term) {
  const types = term.types || [];
  if (types.indexOf("Neuron") !== -1) {
    return false;
  }
  return types.some(type => REGION_TYPES.indexOf(type) !== -1);
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
      label: callSafely(() => instance.getName(), null) || id,
      colour: colourToHex(callSafely(() => instance.getColor(), "#ffffff")),
      visible: callSafely(() => typeof instance.isVisible !== "function" || instance.isVisible(), true),
      types: grossTypes(id)
    });
  };

  if (window.templateID && window.Instances) {
    const template = callSafely(() => window.Instances.getInstance(window.templateID), null);
    if (template) {
      add(template);
    } else {
      terms.push({ id: window.templateID, label: window.templateID, colour: "#ffffff", visible: true, types: ["Template"] });
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

function buildLayer (term, source, type, templateId) {
  const layer = {
    type: type,
    source: source + "|zip:|neuroglancer-precomputed:",
    tab: "rendering",
    name: term.layerName || term.id
  };
  if (type === "image") {
    Object.assign(layer, {
      opacity: 1,
      blend: "additive",
      shader: LAYER_SHADER,
      shaderControls: {
        contrast: { range: DEFAULT_CONTRAST_RANGE },
        color: term.colour,
        alpha: VOLUME_SAMPLE_ALPHA
      },
      volumeRenderingDepthSamples: 256,
      volumeRendering: "on",
      volumeRenderingGain: term.id === templateId ? TEMPLATE_VOLUME_GAIN : EXPRESSION_VOLUME_GAIN
    });
  } else if (type === "segmentation") {
    Object.assign(layer, {
      segments: ["1"],
      segmentColors: { "1": term.colour },
      segmentDefaultColor: term.colour
    });
    if (isRegion(term)) {
      layer.meshSilhouetteRendering = REGION_SILHOUETTE;
    }
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

/*
 * Layer names are what users see in Neuroglass's layer tabs, so use each term's
 * label rather than its VFB id. Neuroglancer needs the names to be unique: a
 * label that repeats gets its id added, e.g. "medulla [VFB_00102107]".
 */
function nameLayers (terms) {
  const counts = {};
  terms.forEach(function (term) {
    const label = String(term.label || term.id).trim() || term.id;
    counts[label] = (counts[label] || 0) + 1;
  });
  return terms.map(function (term) {
    const label = String(term.label || term.id).trim() || term.id;
    return Object.assign({}, term, { layerName: counts[label] > 1 ? label + " [" + term.id + "]" : label });
  });
}

export function buildNeuroglassState (rawTerms, templateId, focusId) {
  const terms = nameLayers(rawTerms);
  return Promise.all(terms.map(function (term) {
    const url = precomputedZipUrl(term.id, templateId);
    if (!url) {
      return Promise.resolve(null);
    }
    return zipLayerType(url).then(type => (type ? buildLayer(term, url, type, templateId) : null));
  })).then(function (results) {
    const layers = results.filter(layer => layer !== null);
    const missing = terms.filter((term, i) => results[i] === null).map(term => term.id);
    if (layers.length === 0) {
      return { state: null, missing: missing };
    }
    const focusTerm = terms.find((term, i) => term.id === focusId && results[i] !== null);
    const selected = focusTerm ? focusTerm.layerName : layers[0].name;
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

/*
 * True when the scene's template has Neuroglass (precomputed) data, so the
 * 3D viewer's Neuroglass button is only offered where it can work.
 */
export function neuroglassAvailable (templateId) {
  return Boolean(templateId && TEMPLATE_VIEWS[templateId]);
}
