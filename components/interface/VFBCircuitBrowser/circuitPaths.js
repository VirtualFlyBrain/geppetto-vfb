/**
 * Turns a VFBquery /circuit_paths response (VirtualFlyBrain/VFBquery#114) into
 * what the Circuit Browser draws.
 *
 * The response has one block per connectome. Each block holds the ranked paths
 * found there, either between neuron types ("class" level, when both ends are
 * FBbt classes) or between individual neurons ("neuron" level). Class-level
 * paths can carry example neuron paths (instance_graph=true).
 *
 * Plain CommonJS with no imports, so tests/jest/vfb/batch3 can load it in node.
 */

const CLASS_ID = /^FBbt_\d{8}$/;

/** "Class" for an FBbt term, "Individual" for a VFB neuron. */
function termKind (id) {
  return CLASS_ID.test(id || "") ? "Class" : "Individual";
}

/** A short dataset name from the connectome's site label. */
function datasetName (block) {
  const label = (block && block.label) || "";
  const tidy = label
    .replace(/^Neuprint web interface - /, "")
    .replace(/ web interface/, "")
    .trim();
  return tidy || (block && (block.symbol || block.dataset)) || "";
}

/** Share of input or output as a percentage that stays readable when small. */
function percent (fraction) {
  if (typeof fraction !== "number" || !isFinite(fraction)) {
    return "";
  }
  const p = fraction * 100;
  if (p >= 10) {
    return p.toFixed(0) + "%";
  }
  if (p >= 1) {
    return p.toFixed(1) + "%";
  }
  if (p >= 0.01) {
    return p.toFixed(2) + "%";
  }
  return "<0.01%";
}

/**
 * The datasets with paths, best top path first, plus what to tell the user:
 * the endpoint's warnings and per-dataset notes, and the datasets searched
 * that had no paths.
 */
function summariseResponse (data) {
  const blocks = data && Array.isArray(data.datasets) ? data.datasets : [];
  const best = block => Math.max(...block.paths.map(p => (typeof p.score === "number" ? p.score : 0)));
  const withPaths = blocks
    .filter(block => Array.isArray(block.paths) && block.paths.length > 0)
    .sort((a, b) => best(b) - best(a));
  const withoutPaths = blocks.filter(block => !Array.isArray(block.paths) || block.paths.length === 0);

  const messages = Array.isArray(data && data.warnings) ? data.warnings.slice() : [];
  blocks.forEach(block => {
    if (block.note) {
      messages.push(datasetName(block) + ": " + block.note);
    }
  });

  return { datasets: withPaths, withoutPaths, messages };
}

/**
 * The other datasets in which the same chain of classes was found, for the
 * class paths of this dataset.
 */
function alsoFoundIn (data, dataset) {
  const names = {};
  ((data && data.datasets) || []).forEach(block => {
    names[block.dataset] = datasetName(block);
  });
  const others = new Set();
  ((data && data.shared_class_paths) || []).forEach(shared => {
    if (Array.isArray(shared.datasets) && shared.datasets.includes(dataset)) {
      shared.datasets.filter(d => d !== dataset).forEach(d => others.add(names[d] || d));
    }
  });
  return Array.from(others);
}

/**
 * The paths to draw from one dataset block, with every node in one shape:
 * { id, kind, title, description }. With showNeurons, class-level paths are
 * replaced by their example neuron paths, each neuron typed by the class at the
 * same position in its class path.
 */
function pathsToDraw (block, showNeurons, terms) {
  const label = id => (terms && terms[id] && terms[id].label) || id;
  const neuronNode = n => ({
    id: n.id,
    kind: "neuron",
    title: n.class_symbol || n.class_label || "untyped",
    description: label(n.id),
    typeLabel: n.class_label || ""
  });
  const classNode = n => ({
    id: n.id,
    kind: "class",
    title: n.symbol || n.label || n.id,
    description: (n.label || n.id) + (n.neurons ? " (" + n.neurons + (n.neurons === 1 ? " neuron)" : " neurons)") : ""),
    typeLabel: n.label || "",
    neurons: n.neurons
  });

  if (block.level === "class" && showNeurons) {
    const drawn = [];
    block.paths.forEach(path => {
      (path.instances || []).forEach(instance => {
        const nodes = instance.neurons.map((id, i) => {
          const cls = path.nodes[i] || {};
          return neuronNode({ id, class: cls.id, class_label: cls.label, class_symbol: cls.symbol });
        });
        drawn.push({ score: instance.score, nodes, edges: instance.edges, classLevel: false });
      });
    });
    return drawn;
  }

  return block.paths.map(path => ({
    score: path.score,
    nodes: path.nodes.map(n => (block.level === "class" ? classNode(n) : neuronNode(n))),
    edges: path.edges,
    classLevel: block.level === "class"
  }));
}

/**
 * Nodes and links for react-force-graph, laid out left to right: the source on
 * the left, the target on the right, each node in the column for its place
 * along the first (best) path it appears in and in that path's row. A node on
 * several paths is drawn once.
 *
 * options: { showNeurons, terms: { id: { label, facets } }, styling,
 *            nodeWidth, nodeHeight, columnWidth, rowHeight }
 */
function buildGraph (block, options) {
  const opts = options || {};
  const terms = opts.terms || {};
  const colours = (opts.styling && opts.styling.nodeColorsByLabel) || {};
  const columnWidth = opts.columnWidth || 250;
  const rowHeight = opts.rowHeight || 150;
  const paths = pathsToDraw(block, !!opts.showNeurons, terms);

  const nodes = [];
  const links = [];
  const byId = new Map();
  const legendLabels = [];
  if (paths.length === 0) {
    return { nodes, links, legendLabels };
  }

  const maxHops = Math.max(1, ...paths.map(p => p.nodes.length - 1));
  const width = maxHops * columnWidth;
  const sources = [];
  const targets = [];

  paths.forEach((path, rank) => {
    const last = path.nodes.length - 1;
    path.nodes.forEach((n, i) => {
      if (byId.has(n.id)) {
        return;
      }
      const facets = (terms[n.id] && terms[n.id].facets) || [];
      const nodeColorLabels = [];
      Object.entries(colours).forEach(([facet, colour]) => {
        if (facets.includes(facet)) {
          nodeColorLabels.push(colour);
          if (!legendLabels.includes(facet)) {
            legendLabels.push(facet);
          }
        }
      });
      const node = {
        id: n.id,
        // Used by the click handler to open the term
        title: n.id,
        kind: n.kind,
        classLabel: n.title,
        name: n.description,
        typeLabel: n.typeLabel,
        nodeColorLabels,
        width: opts.nodeWidth,
        height: opts.nodeHeight,
        rank,
        positionX: (last > 0 ? i / last : 0) * width - width / 2,
        positionY: 0
      };
      if (i === 0) {
        sources.push(node);
      } else if (i === last) {
        targets.push(node);
      } else {
        node.positionY = (rank - (paths.length - 1) / 2) * rowHeight;
      }
      byId.set(n.id, node);
      nodes.push(node);
    });
  });

  // Several sources or targets (a broad class's leaf classes) are stacked
  [sources, targets].forEach(ends => {
    ends.forEach((node, i) => {
      node.positionY = (i - (ends.length - 1) / 2) * rowHeight;
    });
  });

  const seen = new Map();
  paths.forEach(path => {
    (path.edges || []).forEach(edge => {
      const key = edge.source + "->" + edge.target;
      const source = byId.get(edge.source);
      const target = byId.get(edge.target);
      if (seen.has(key) || !source || !target) {
        return;
      }
      const lines = [
        source.classLabel + " → " + target.classLabel,
        "Synapses: " + edge.synapses
      ];
      if (typeof edge.pairs === "number") {
        lines.push("Connected neuron pairs: " + edge.pairs);
      }
      if (typeof edge.inprop_in === "number") {
        lines.push("Share of " + target.classLabel + " input: " + percent(edge.inprop_in));
      }
      if (typeof edge.inprop_out === "number") {
        lines.push("Share of " + source.classLabel + " output: " + percent(edge.inprop_out));
      }
      const link = {
        source,
        target,
        targetNode: target,
        weight: edge.synapses,
        inprop: edge.inprop_in,
        weightLabel: edge.synapses + (typeof edge.inprop_in === "number" ? " · " + percent(edge.inprop_in) : ""),
        label: lines.join("<br/>")
      };
      seen.set(key, link);
      links.push(link);

      (source.neighbors = source.neighbors || []).push(target);
      (target.neighbors = target.neighbors || []).push(source);
      (source.links = source.links || []).push(link);
      (target.links = target.links || []).push(link);
    });
  });

  return { nodes, links, legendLabels };
}

/** Every node id in a dataset block, including example neurons. */
function nodeIds (block) {
  const ids = new Set();
  (block.paths || []).forEach(path => {
    path.nodes.forEach(n => ids.add(n.id));
    (path.instances || []).forEach(instance => instance.neurons.forEach(id => ids.add(id)));
  });
  return Array.from(ids);
}

module.exports = {
  termKind,
  datasetName,
  percent,
  summariseResponse,
  alsoFoundIn,
  pathsToDraw,
  buildGraph,
  nodeIds
};
