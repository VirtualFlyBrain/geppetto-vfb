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

/**
 * The card title and hover note for a neuron left out of its connectome's
 * class graph, from the status and types the server gives (VFBquery
 * report.tsv). Older servers send neither: then just "no single type".
 */
function leftOut (n) {
  const types = Array.isArray(n.types) ? n.types.map(t => t.label || t.id) : [];
  const listed = types.join("; ");
  const prefix = "Not in the class graph: ";
  switch (n.status) {
  case "multi_leaf":
    return {
      title: (types.length || "several") + " types",
      note: prefix + "it has " + (types.length || "several") + " most specific types in this connectome" + (listed ? " (" + listed + ")" : "")
    };
  case "no_leaf":
    return {
      title: "general type only",
      note: prefix + "typed only to " + (listed || "general classes") + ", which "
        + (types.length > 1 ? "have" : "has") + " more specific types in this connectome"
    };
  case "only_axis":
    return {
      title: "lineage/transmitter only",
      note: prefix + "typed only to transmitter, lineage or similar classes" + (listed ? " (" + listed + ")" : "")
    };
  case "untyped":
    return { title: "untyped", note: prefix + "this neuron has no type" };
  default:
    return { title: "no single type", note: prefix + "this neuron has no single most specific type in this connectome" };
  }
}

/** "Class" for an FBbt term, "Individual" for a VFB neuron. */
function termKind (id) {
  return CLASS_ID.test(id || "") ? "Class" : "Individual";
}

/**
 * The connectome a neuron belongs to, from its label: "LC12_L (MaleCNS:49415)"
 * gives "MaleCNS". BANC labels are the bare id, "BANC_888:720575941548059681".
 * null for anything else, e.g. a class.
 */
function connectomeOf (label) {
  const match = (label || "").match(/\(([^:()\s]+):\d+\)|^([^:()\s]+):\d+/);
  return match ? match[1] || match[2] : null;
}

/**
 * A SOLR filter (fq) for search results from one connectome, plus neuron
 * types: labels hold the connectome as "(MaleCNS:49415)" or, for BANC, as the
 * bare "BANC_888:720575941548059681", and label is a whole-string field, so
 * this is a wildcard match on "<connectome>:".
 */
function connectomeFilter (connectome) {
  const escaped = connectome.replace(/([+\-&|!(){}[\]^"~*?:\\/\s])/g, "\\$1");
  return "(facets_annotation:Class AND facets_annotation:Neuron) OR label:*" + escaped + "\\:*";
}

/**
 * False for a neuron type with no neurons in the circuit graphs, given the
 * terms from /circuit_paths/terms (known: a Set, or null while not loaded, when
 * every term is allowed). Searching from such a class finds nothing.
 */
function hasConnectomeNeurons (id, kind, known) {
  return !(known && kind === "Class" && CLASS_ID.test(id || "") && !known.has(id));
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
 * A query term's name for messages: the label chosen in the search box
 * without the id the search adds to it ("Kenyon cell (FBbt_00003686)"), or
 * the id if there is no label.
 */
function termName (end) {
  const id = (end && end.id) || "";
  const label = ((end && end.label) || "").replace(" (" + id + ")", "").trim();
  return label && label !== id ? label : id;
}

const NOT_FOUND = /^(\S+) was not found in any searched dataset$/;

/**
 * The datasets with paths, best top path first, plus what to tell the user:
 * the endpoint's warnings and per-dataset notes, and the datasets searched
 * that had no paths. ends ([{ id, label }], the query terms) name the terms
 * the endpoint reports by id only.
 */
function summariseResponse (data, ends) {
  const blocks = data && Array.isArray(data.datasets) ? data.datasets : [];
  const best = block => Math.max(...block.paths.map(p => (typeof p.score === "number" ? p.score : 0)));
  const withPaths = blocks
    .filter(block => Array.isArray(block.paths) && block.paths.length > 0)
    .sort((a, b) => best(b) - best(a));
  const withoutPaths = blocks.filter(block => !Array.isArray(block.paths) || block.paths.length === 0);

  const names = {};
  (ends || []).forEach(end => {
    if (end && end.id) {
      names[end.id] = termName(end);
    }
  });
  const messages = (Array.isArray(data && data.warnings) ? data.warnings : []).map(warning => {
    const missing = warning.match(NOT_FOUND);
    return missing
      ? (names[missing[1]] || missing[1]) + " has no neurons in the connectomes searched, so it has no paths."
      : warning;
  });
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
  /*
   * A neuron without a class was left out of the dataset's class graph (see
   * leftOut). Neuron-level paths still pass through it.
   */
  const neuronNode = n => {
    const hasClass = !!(n.class_symbol || n.class_label);
    const why = hasClass ? null : leftOut(n);
    return {
      id: n.id,
      kind: "neuron",
      title: hasClass ? n.class_symbol || n.class_label : why.title,
      description: label(n.id),
      typeLabel: hasClass ? n.class_label : why.note
    };
  };
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
 * Orders the nodes in each column to cut down crossing links (the barycentre
 * heuristic): each node moves towards the mean height of its neighbours in the
 * column before it, sweeping left to right, then right to left, a few times.
 * Starts from path rank, so the best paths stay near the top. Sets positionY.
 */
function orderColumns (columns, paths, byId, rowHeight) {
  const neighbours = new Map();
  paths.forEach(path => {
    (path.edges || []).forEach(edge => {
      const a = byId.get(edge.source);
      const b = byId.get(edge.target);
      if (a && b && a !== b) {
        (neighbours.get(a) || neighbours.set(a, []).get(a)).push(b);
        (neighbours.get(b) || neighbours.set(b, []).get(b)).push(a);
      }
    });
  });
  const place = column => column.forEach((node, i) => {
    node.positionY = (i - (column.length - 1) / 2) * rowHeight;
  });
  const sortBy = (column, before) => {
    const keyed = column.map((node, i) => {
      const near = (neighbours.get(node) || []).filter(n => before(n.column));
      const key = near.length ? near.reduce((sum, n) => sum + n.positionY, 0) / near.length : node.positionY;
      return { node, key, i };
    });
    keyed.sort((a, b) => a.key - b.key || a.i - b.i);
    keyed.forEach((k, i) => {
      column[i] = k.node;
    });
    place(column);
  };

  columns.forEach(place);
  for (let sweep = 0; sweep < 4; sweep++) {
    for (let c = 1; c < columns.length; c++) {
      sortBy(columns[c], col => col < c);
    }
    for (let c = columns.length - 2; c >= 0; c--) {
      sortBy(columns[c], col => col > c);
    }
  }
}

/**
 * Nodes and links for react-force-graph, laid out left to right: the source on
 * the left, the target on the right, each node in the column for its place
 * along the first (best) path it appears in, ordered within its column to cut
 * down crossing links. A node on several paths is drawn once.
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
  const columns = Array.from({ length: maxHops + 1 }, () => []);

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
      // Shorter paths are spread over the same columns as the longest
      const column = last > 0 ? Math.round(i / last * maxHops) : 0;
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
        column,
        positionX: column / maxHops * width - width / 2,
        positionY: 0
      };
      byId.set(n.id, node);
      nodes.push(node);
      columns[column].push(node);
    });
  });

  orderColumns(columns, paths, byId, rowHeight);

  // Link tooltips name a neuron by its own label, not its class
  const linkName = node => (node.kind === "neuron" ? node.name : node.classLabel);
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
        linkName(source) + " → " + linkName(target),
        "Synapses: " + edge.synapses
      ];
      if (typeof edge.pairs === "number") {
        lines.push("Connected neuron pairs: " + edge.pairs);
      }
      if (typeof edge.inprop_in === "number") {
        lines.push("Share of " + linkName(target) + " input: " + percent(edge.inprop_in));
      }
      if (typeof edge.inprop_out === "number") {
        lines.push("Share of " + linkName(source) + " output: " + percent(edge.inprop_out));
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
  hasConnectomeNeurons,
  termName,
  leftOut,
  connectomeOf,
  connectomeFilter,
  datasetName,
  percent,
  summariseResponse,
  alsoFoundIn,
  pathsToDraw,
  buildGraph,
  nodeIds
};
