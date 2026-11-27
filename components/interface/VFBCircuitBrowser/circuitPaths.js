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
 * class graph (no single most specific type). It is shown by the types it
 * does have, "/"-separated: a general type, several specific ones, or only
 * transmitter or lineage classes. The card gives each type's symbol where it
 * has one (graphs built since report.tsv gained symbols), the hover the
 * full labels. Users looking at neuron paths need the types, not why the
 * class graph left the neuron out. Servers without the
 * types (before VFBquery#151) give neither: then "no single type".
 */
function leftOut (n) {
  const types = (Array.isArray(n.types) ? n.types : []).filter(t => t && (t.label || t.id));
  if (types.length) {
    return {
      title: types.map(t => t.symbol || t.label || t.id).join(" / "),
      note: types.map(t => t.label || t.id).join(" / ")
    };
  }
  if (n.status === "untyped") {
    return { title: "untyped", note: "This neuron has no type" };
  }
  return { title: "no single type", note: "This neuron has no single most specific type in this connectome" };
}

/**
 * Splits text into lines no wider than maxWidth (measured with measure(text)),
 * breaking after the last space that fits, or mid-word if a word is too long.
 */
function wrapLines (text, maxWidth, measure) {
  const lines = [];
  let rest = String(text || "").trim();
  while (rest.length) {
    let fit = rest.length;
    while (fit > 1 && measure(rest.substr(0, fit)) > maxWidth) {
      fit--;
    }
    let line = rest.substr(0, fit);
    if (fit < rest.length && rest.charAt(fit) !== " " && line.lastIndexOf(" ") > 0) {
      line = line.substr(0, line.lastIndexOf(" "));
    }
    lines.push(line.trim());
    rest = rest.substr(line.length).trim();
  }
  return lines;
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
 * The connectome that searches in field `editing` are limited to: that of the
 * first neuron chosen in any other field. Worked out afresh for each search, so
 * swapping that neuron for a class, or for a neuron from another connectome,
 * changes or lifts the filter. Text still being typed (id equal to the label)
 * does not count.
 */
function fieldsConnectome (fields, editing) {
  for (let i = 0; i < (fields || []).length; i++) {
    const field = fields[i];
    if (i === Number(editing) || !field || !field.id || field.id === field.label) {
      continue;
    }
    const connectome = connectomeOf(field.label);
    if (connectome) {
      return connectome;
    }
  }
  return null;
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

/**
 * A search result's label in two parts for the results list: the name that
 * matched, and what the search adds after it in brackets (the type's full
 * label for a synonym, otherwise the id). "LC12_L (MaleCNS:49415) (VFB_jrmc26km)"
 * gives "LC12_L (MaleCNS:49415)" and "VFB_jrmc26km".
 */
function splitLabel (label) {
  const text = String(label || "").trim();
  if ( !text.endsWith(")") ) {
    return { name : text, detail : "" };
  }
  // Walk back to the bracket that opens the last group
  let depth = 0;
  for ( let i = text.length - 1; i > 0; i-- ) {
    if ( text[i] === ")" ) {
      depth++;
    } else if ( text[i] === "(" ) {
      depth--;
      if ( depth === 0 ) {
        const name = text.substring(0, i).trim();
        return name ? { name, detail : text.substring(i + 1, text.length - 1).trim() } : { name : text, detail : "" };
      }
    }
  }
  return { name : text, detail : "" };
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

/** Link width for a connection: grows with log(synapses), but gently. */
function linkWidth (synapses) {
  return synapses > 1 ? 1 + 1.5 * Math.log10(synapses) : 1;
}

// Space kept between a link or a label and a card it does not belong to
const CARD_MARGIN = 12;
// Link labels, in graph units
const LABEL_FONT_SIZE = 13;
// The longest arrowhead, so a heavy link's head does not swamp its target card
const MAX_ARROW_LENGTH = 20;

/**
 * A link's line as react-force-graph draws it: straight, or for a curvature a
 * quadratic curve whose control point sits curvature x length off the middle.
 */
function linkCurve (sx, sy, ex, ey, curvature) {
  const dx = ex - sx;
  const dy = ey - sy;
  const chord = Math.sqrt(dx * dx + dy * dy);
  const a = Math.atan2(dy, dx);
  const d = chord * (curvature || 0);
  const cx = (sx + ex) / 2 + d * Math.cos(a - Math.PI / 2);
  const cy = (sy + ey) / 2 + d * Math.sin(a - Math.PI / 2);
  const at = t => ({
    x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex,
    y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey
  });
  const angleAt = t => Math.atan2(
    2 * (1 - t) * (cy - sy) + 2 * t * (ey - cy),
    2 * (1 - t) * (cx - sx) + 2 * t * (ex - cx)
  );
  let length = chord;
  if (d) {
    length = 0;
    let last = at(0);
    for (let i = 1; i <= 32; i++) {
      const p = at(i / 32);
      length += Math.sqrt((p.x - last.x) * (p.x - last.x) + (p.y - last.y) * (p.y - last.y));
      last = p;
    }
  }
  return { at, angleAt, length, chord };
}

const inCard = (p, x, y, width, height, margin) => Math.abs(p.x - x) < width / 2 + margin && Math.abs(p.y - y) < height / 2 + margin;

/**
 * Where a link leaves its source card and reaches its target card, as
 * fractions along its line.
 */
function cardCrossings (curve, s, t, nodeWidth, nodeHeight) {
  const steps = 200;
  let leaves = 0;
  let reaches = 1;
  for (let i = 0; i <= steps; i++) {
    if (!inCard(curve.at(i / steps), s.x, s.y, nodeWidth, nodeHeight, 0)) {
      leaves = i / steps;
      break;
    }
  }
  for (let i = steps; i >= 0; i--) {
    if (!inCard(curve.at(i / steps), t.x, t.y, nodeWidth, nodeHeight, 0)) {
      reaches = i / steps;
      break;
    }
  }
  return { leaves, reaches: Math.max(leaves, reaches) };
}

/**
 * Where to draw a link's arrowhead and label so the head's tip lands on the
 * edge of the target card (react-force-graph measures from its node circle,
 * radius nodeRadius, not from the card) and the label sits midway between the
 * source card and the arrowhead. Follows the link's curve when it has one.
 */
function linkPlacement (link, nodeWidth, nodeHeight, nodeRadius) {
  const arrowLength = Math.min(MAX_ARROW_LENGTH, Math.max(8, 3 * linkWidth(link.weight)));
  const s = link.source;
  const t = link.target;
  const dx = (t && t.x) - (s && s.x);
  const dy = (t && t.y) - (s && s.y);
  const chord = Math.sqrt(dx * dx + dy * dy);
  if (!chord) {
    return { arrowLength, arrowRelPos: 0.75, labelAt: 0.5, labelFrom: 0.5, labelTo: 0.5 };
  }
  let length = chord;
  let leaves;
  let reaches;
  if (link.curvature) {
    const curve = linkCurve(s.x, s.y, t.x, t.y, link.curvature);
    const crossings = cardCrossings(curve, s, t, nodeWidth, nodeHeight);
    length = curve.length;
    leaves = crossings.leaves;
    reaches = crossings.reaches;
  } else {
    // Distance from a card's centre to its edge along the link
    const ux = Math.abs(dx / chord);
    const uy = Math.abs(dy / chord);
    const edge = Math.min(ux ? nodeWidth / 2 / ux : Infinity, uy ? nodeHeight / 2 / uy : Infinity);
    leaves = Math.min(1, edge / chord);
    reaches = Math.max(leaves, 1 - edge / chord);
  }
  const tip = reaches * length;
  const free = length - 2 * nodeRadius - arrowLength;
  const arrowRelPos = free > 0 ? Math.min(1, Math.max(0, (tip - nodeRadius - arrowLength) / free)) : 1;
  const labelFrom = leaves;
  const labelTo = Math.max(leaves, reaches - arrowLength / length);
  const labelAt = Math.min(1, Math.max(0, (labelFrom + labelTo) / 2));
  return { arrowLength, arrowRelPos, labelAt, labelFrom, labelTo };
}

/**
 * The curvature for a link so it passes clear of every card but its own: the
 * straight line if that is clear, otherwise the gentlest bow, to either side,
 * whose curve misses them all. The curve itself is checked, as a bow that
 * clears one card can run behind another.
 */
function routeLink (link, nodes, nodeWidth, nodeHeight) {
  const sx = link.source.positionX, sy = link.source.positionY;
  const ex = link.target.positionX, ey = link.target.positionY;
  if (Math.abs(ex - sx) < 1 && Math.abs(ey - sy) < 1) {
    return 0;
  }
  const others = nodes.filter(node => node !== link.source && node !== link.target);
  const hits = curvature => {
    const curve = linkCurve(sx, sy, ex, ey, curvature);
    let count = 0;
    for (let i = 1; i < 48; i++) {
      const p = curve.at(i / 48);
      if (others.some(node => inCard(p, node.positionX, node.positionY, nodeWidth, nodeHeight, CARD_MARGIN))) {
        count++;
      }
    }
    return count;
  };
  let best = 0;
  let fewest = hits(0);
  if (!fewest) {
    return 0;
  }
  // Try first the side away from the cards in the way (canvas y points down)
  const dx = ex - sx;
  const lineAt = x => (Math.abs(dx) < 1 ? sy : sy + (ey - sy) * (x - sx) / dx);
  const below = others.reduce((sum, node) => {
    const along = Math.abs(dx) < 1 ? 0.5 : (node.positionX - sx) / dx;
    return along > 0 && along < 1 && Math.abs(node.positionY - lineAt(node.positionX)) < nodeHeight ? sum + node.positionY - lineAt(node.positionX) : sum;
  }, 0);
  const first = (below >= 0 ? 1 : -1) * (Math.sign(dx) || 1);
  for (let bow = 0.06; bow <= 0.9001; bow += 0.06) {
    for (const side of [first, -first]) {
      const count = hits(side * bow);
      if (!count) {
        return Number((side * bow).toFixed(2));
      }
      if (count < fewest) {
        fewest = count;
        best = Number((side * bow).toFixed(2));
      }
    }
  }
  return best;
}

/**
 * Sets each link's label position (labelPos: x, y, angle) on its line, between
 * its source card and its arrowhead: the middle if the label is clear there of
 * the cards and of the labels already placed, otherwise the nearest clear spot
 * along the link. Width is estimated, as there is no canvas here to measure on.
 * level: write the labels level rather than along their links, for a graph
 * drawn top to bottom, where most links run up and down.
 */
function placeLabels (links, nodes, nodeWidth, nodeHeight, nodeRadius, level) {
  const placed = [];
  const boxAt = (curve, t, text) => {
    const p = curve.at(t);
    let angle = level ? 0 : curve.angleAt(t);
    // Keep the text upright
    if (angle > Math.PI / 2) {
      angle -= Math.PI;
    } else if (angle < -Math.PI / 2) {
      angle += Math.PI;
    }
    const w = text.length * LABEL_FONT_SIZE * 0.56 + LABEL_FONT_SIZE * 0.4;
    const h = LABEL_FONT_SIZE * 1.3;
    const c = Math.abs(Math.cos(angle));
    const sn = Math.abs(Math.sin(angle));
    return { x: p.x, y: p.y, angle, t, halfWidth: (c * w + sn * h) / 2, halfHeight: (sn * w + c * h) / 2 };
  };
  const clashes = box => {
    const cards = nodes.filter(node => Math.abs(box.x - node.positionX) < nodeWidth / 2 + box.halfWidth + 2
      && Math.abs(box.y - node.positionY) < nodeHeight / 2 + box.halfHeight + 2).length;
    const labels = placed.filter(other => Math.abs(box.x - other.x) < box.halfWidth + other.halfWidth + 2
      && Math.abs(box.y - other.y) < box.halfHeight + other.halfHeight + 2).length;
    return cards + labels;
  };
  links.forEach(link => {
    const s = { x: link.source.positionX, y: link.source.positionY };
    const t = { x: link.target.positionX, y: link.target.positionY };
    const curve = linkCurve(s.x, s.y, t.x, t.y, link.curvature);
    const { labelFrom, labelTo } = linkPlacement({ weight: link.weight, curvature: link.curvature, source: s, target: t }, nodeWidth, nodeHeight, nodeRadius);
    const middle = (labelFrom + labelTo) / 2;
    const half = (labelTo - labelFrom) / 2;
    const text = link.weightLabel || "";
    let best = null;
    let fewest = Infinity;
    for (const shift of [0, -0.2, 0.2, -0.4, 0.4, -0.6, 0.6, -0.8, 0.8]) {
      const box = boxAt(curve, middle + shift * half, text);
      const count = clashes(box);
      if (count < fewest) {
        fewest = count;
        best = box;
      }
      if (!count) {
        break;
      }
    }
    placed.push(best);
    link.labelPos = { x: best.x, y: best.y, angle: best.angle, t: best.t };
    link.labelBox = { halfWidth: best.halfWidth, halfHeight: best.halfHeight };
  });
}

/**
 * Draws a link's label (placeLabels) on a canvas, upright along the link, on
 * a patch of the background colour so the line does not run through the text.
 */
function drawLinkLabel (ctx, link, background) {
  if (!link.labelPos || !link.weightLabel) {
    return;
  }
  ctx.save();
  ctx.font = LABEL_FONT_SIZE + "px Sans-Serif";
  const width = ctx.measureText(link.weightLabel).width + LABEL_FONT_SIZE * 0.4;
  const height = LABEL_FONT_SIZE * 1.3;
  ctx.translate(link.labelPos.x, link.labelPos.y);
  ctx.rotate(link.labelPos.angle);
  ctx.fillStyle = background || "black";
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.fillText(link.weightLabel, 0, 0);
  ctx.restore();
}

/**
 * Gives each path a lane (a row, or a column when drawn top to bottom) for
 * the nodes it is first to use, and returns each node's lane as a number of
 * lanes from the centre line. A direct link between the query's ends keeps
 * the centre line to itself, with the other paths either side; otherwise the
 * lanes are centred on it. Which path gets which lane is chosen to leave the
 * fewest links running behind a card, then the shortest hops between lanes,
 * then the better paths nearer the centre. position(along, lane) gives a
 * node's place, for checking links against cards.
 */
function assignLanes (paths, sharedEnds, position, nodeWidth, nodeHeight) {
  const owner = new Map();
  const along = new Map();
  const needing = [];
  let direct = false;
  paths.forEach((path, rank) => {
    const last = path.nodes.length - 1;
    path.nodes.forEach((n, i) => {
      if (!along.has(n.id)) {
        along.set(n.id, last > 0 ? i / last : 0);
      }
    });
    const fresh = path.nodes.filter(n => !sharedEnds.has(n.id) && !owner.has(n.id));
    fresh.forEach(n => owner.set(n.id, rank));
    if (fresh.length) {
      needing.push(rank);
    } else if (path.nodes.length === 2 && path.nodes.every(n => sharedEnds.has(n.id))) {
      direct = true;
    }
  });
  const count = needing.length;
  const offsets = direct
    ? Array.from({ length: count }, (_, i) => (i % 2 ? 1 : -1) * (Math.floor(i / 2) + 1))
    : Array.from({ length: count }, (_, i) => i - (count - 1) / 2).sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);

  const edges = [];
  const seen = new Set();
  paths.forEach(path => (path.edges || []).forEach(edge => {
    const key = edge.source + "->" + edge.target;
    if (!seen.has(key) && along.has(edge.source) && along.has(edge.target) && edge.source !== edge.target) {
      seen.add(key);
      edges.push(edge);
    }
  }));
  const ids = Array.from(along.keys());
  const laneFor = order => {
    const lane = new Map();
    ids.forEach(id => lane.set(id, sharedEnds.has(id) ? 0 : order[needing.indexOf(owner.get(id))]));
    return lane;
  };
  const cost = order => {
    const lane = laneFor(order);
    const at = new Map(ids.map(id => [id, position(along.get(id), lane.get(id))]));
    let blocked = 0;
    let hops = 0;
    edges.forEach(edge => {
      const a = at.get(edge.source);
      const b = at.get(edge.target);
      hops += Math.abs(lane.get(edge.source) - lane.get(edge.target));
      for (let i = 1; i < 24; i++) {
        const p = { x: a.x + (b.x - a.x) * i / 24, y: a.y + (b.y - a.y) * i / 24 };
        if (ids.some(id => id !== edge.source && id !== edge.target && inCard(p, at.get(id).x, at.get(id).y, nodeWidth, nodeHeight, CARD_MARGIN))) {
          blocked++;
          break;
        }
      }
    });
    // Weighted so the better a path, the more it costs to move it off the centre
    const spread = order.reduce((sum, offset, i) => sum + (count - i) * Math.abs(offset), 0);
    return blocked * 1000 + hops + spread * 0.01;
  };

  let best = offsets;
  if (count > 1 && count <= 6) {
    // Few enough lanes to try every arrangement
    let least = cost(offsets);
    const arrange = (done, left) => {
      if (!left.length) {
        const c = cost(done);
        if (c < least - 1e-9) {
          least = c;
          best = done;
        }
        return;
      }
      left.forEach((offset, i) => arrange(done.concat(offset), left.slice(0, i).concat(left.slice(i + 1))));
    };
    arrange([], offsets);
  } else if (count > 6) {
    // Too many to try them all: put each path next to a better path it shares a node with
    const free = offsets.slice();
    const order = [];
    needing.forEach((rank, n) => {
      const shared = paths[rank].nodes.filter(node => owner.has(node.id) && owner.get(node.id) !== rank && needing.indexOf(owner.get(node.id)) < n)
        .map(node => order[needing.indexOf(owner.get(node.id))]);
      let pick = 0;
      if (shared.length) {
        const near = shared.reduce((sum, v) => sum + v, 0) / shared.length;
        free.forEach((v, i) => {
          if (Math.abs(v - near) < Math.abs(free[pick] - near)) {
            pick = i;
          }
        });
      }
      order.push(free.splice(pick, 1)[0]);
    });
    best = order;
  }
  return { lane: laneFor(best), along };
}

/**
 * Nodes and links for react-force-graph, laid out left to right: the source on
 * the left, the target on the right, each node in the column for its place
 * along the first (best) path it appears in, ordered within its column to cut
 * down crossing links. A node on several paths is drawn once.
 *
 * options: { showNeurons, terms: { id: { label, facets } }, styling,
 *            nodeWidth, nodeHeight, nodeRadius, columnWidth, rowHeight, vertical }
 */
function buildGraph (block, options) {
  const opts = options || {};
  const terms = opts.terms || {};
  const colours = (opts.styling && opts.styling.nodeColorsByLabel) || {};
  // Drawn left to right, or top to bottom for a panel taller than it is wide
  const vertical = !!opts.vertical;
  const columnWidth = opts.columnWidth || 250;
  const rowHeight = opts.rowHeight || 110;
  const paths = pathsToDraw(block, !!opts.showNeurons, terms);

  const nodes = [];
  const links = [];
  const byId = new Map();
  const legendLabels = [];
  if (paths.length === 0) {
    return { nodes, links, legendLabels, extent: null };
  }

  const maxHops = Math.max(1, ...paths.map(p => p.nodes.length - 1));
  const nodeWidth = opts.nodeWidth || 120;
  const nodeHeight = opts.nodeHeight || 80;
  const nodeRadius = opts.nodeRadius || 50;
  // The query's ends, when every path starts or finishes at the same node
  const sharedEnds = new Set();
  const firstId = paths[0].nodes[0].id;
  const lastId = paths[0].nodes[paths[0].nodes.length - 1].id;
  if (paths.every(p => p.nodes[0].id === firstId)) {
    sharedEnds.add(firstId);
  }
  if (firstId !== lastId && paths.every(p => p.nodes[p.nodes.length - 1].id === lastId)) {
    sharedEnds.add(lastId);
  }
  // Along the paths, and across them from lane to lane
  const length = maxHops * (vertical ? nodeHeight + 80 : columnWidth);
  const laneGap = vertical ? nodeWidth + 30 : rowHeight;
  const position = (along, lane) => (vertical
    ? { x: lane * laneGap, y: along * length - length / 2 }
    : { x: along * length - length / 2, y: lane * laneGap });
  const lanes = assignLanes(paths, sharedEnds, position, nodeWidth, nodeHeight);

  paths.forEach((path, rank) => {
    path.nodes.forEach(n => {
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
      // Each path's nodes are spaced evenly from the source's side to the target's
      const lane = lanes.lane.get(n.id) || 0;
      const at = position(lanes.along.get(n.id), lane);
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
        lane,
        positionX: at.x,
        positionY: at.y
      };
      byId.set(n.id, node);
      nodes.push(node);
    });
  });

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
      link.curvature = routeLink(link, nodes, nodeWidth, nodeHeight);
      seen.set(key, link);
      links.push(link);

      (source.neighbors = source.neighbors || []).push(target);
      (target.neighbors = target.neighbors || []).push(source);
      (source.links = source.links || []).push(link);
      (target.links = target.links || []).push(link);
    });
  });

  placeLabels(links, nodes, nodeWidth, nodeHeight, nodeRadius, vertical);

  // What the drawing covers: the cards, the bowed links and the labels
  const extent = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  const cover = (x, y, halfWidth, halfHeight) => {
    extent.minX = Math.min(extent.minX, x - halfWidth);
    extent.maxX = Math.max(extent.maxX, x + halfWidth);
    extent.minY = Math.min(extent.minY, y - halfHeight);
    extent.maxY = Math.max(extent.maxY, y + halfHeight);
  };
  nodes.forEach(node => cover(node.positionX, node.positionY, nodeWidth / 2, nodeHeight / 2));
  links.forEach(link => {
    if (link.curvature) {
      const curve = linkCurve(link.source.positionX, link.source.positionY, link.target.positionX, link.target.positionY, link.curvature);
      for (let i = 1; i < 8; i++) {
        const p = curve.at(i / 8);
        cover(p.x, p.y, 6, 6);
      }
    }
    cover(link.labelPos.x, link.labelPos.y, link.labelBox.halfWidth, link.labelBox.halfHeight);
  });

  return { nodes, links, legendLabels, extent };
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
  wrapLines,
  linkWidth,
  linkPlacement,
  linkCurve,
  drawLinkLabel,
  hasConnectomeNeurons,
  termName,
  splitLabel,
  leftOut,
  connectomeOf,
  fieldsConnectome,
  connectomeFilter,
  datasetName,
  percent,
  summariseResponse,
  alsoFoundIn,
  pathsToDraw,
  buildGraph,
  nodeIds
};
