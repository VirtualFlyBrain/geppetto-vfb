/*
 * How the Circuit Browser reads a /circuit_paths response
 * (components/interface/VFBCircuitBrowser/circuitPaths.js). No browser needed:
 * the fixtures are cut down from live responses for LC12 -> giant fiber neuron.
 */
const {
  termKind, connectomeOf, connectomeFilter, datasetName, percent, summariseResponse, alsoFoundIn, buildGraph, nodeIds
} = require('../../../../components/interface/VFBCircuitBrowser/circuitPaths');

const LC12 = { id: 'FBbt_00100484', label: 'lobula columnar neuron LC12', symbol: 'LC12', neurons: 381 };
const PVLP100 = { id: 'FBbt_20002158', label: 'adult posterior ventrolateral protocerebrum neuron 100', symbol: 'PVLP100', neurons: 3 };
const PVLP097 = { id: 'FBbt_20002155', label: 'adult posterior ventrolateral protocerebrum neuron 097', symbol: 'PVLP097', neurons: 14 };
const CB3513 = { id: 'FBbt_20003513', label: 'adult CB3513 neuron', symbol: 'CB3513', neurons: 4 };
const GF = { id: 'FBbt_00004020', label: 'giant fiber neuron', symbol: 'DNp01', neurons: 2 };

const edge = (source, target, synapses, inprop_in, extra) => ({
  source: source.id || source, target: target.id || target, synapses, inprop_in, inprop_out: 0.01, ...extra
});

const flywire = {
  dataset: 'flywire783', label: 'FlyWire web interface v783', symbol: 'fw', level: 'class',
  neurons_left_out: 7765,
  paths: [
    {
      score: 0.00078, hops: 2, nodes: [LC12, PVLP100, GF],
      edges: [edge(LC12, PVLP100, 2614, 0.263449, { pairs: 432 }), edge(PVLP100, GF, 344, 0.0333, { pairs: 6 })],
      instances: [{
        score: 9.2e-6,
        neurons: ['VFB_fw011554', 'VFB_fw005842', 'VFB_fw036981'],
        edges: [edge('VFB_fw011554', 'VFB_fw005842', 6, 0.00267618), edge('VFB_fw005842', 'VFB_fw036981', 16, 0.0034)]
      }]
    },
    {
      score: 0.00017, hops: 3, nodes: [LC12, PVLP097, CB3513, GF],
      edges: [edge(LC12, PVLP097, 29830, 0.716873, { pairs: 2631 }), edge(PVLP097, CB3513, 74, 0.0073, { pairs: 9 }), edge(CB3513, GF, 179, 0.017, { pairs: 4 })],
      instances: []
    }
  ]
};
const banc = {
  dataset: 'BANC888', label: 'BANC web interface v888', symbol: 'BANC', level: 'class',
  paths: [{ score: 0.00003, hops: 2, nodes: [LC12, PVLP100, GF], edges: [edge(LC12, PVLP100, 10, 0.01), edge(PVLP100, GF, 10, 0.01)] }]
};
const male = {
  dataset: 'male_cns_v1_0', label: 'Neuprint web interface - male-cns:v1.0', symbol: 'mc', level: 'class', paths: []
};
const response = {
  datasets: [banc, flywire, male],
  shared_class_paths: [{ classes: [LC12.id, PVLP100.id, GF.id], datasets: ['flywire783', 'male_cns_v1_0'] }],
  warnings: []
};

describe('Circuit paths parsing', () => {
  it('tells classes from individuals by id', () => {
    expect(termKind('FBbt_00100484')).toBe('Class');
    expect(termKind('VFB_jrmc26km')).toBe('Individual');
  });

  it('shortens dataset labels', () => {
    expect(datasetName(flywire)).toBe('FlyWire v783');
    expect(datasetName(male)).toBe('male-cns:v1.0');
  });

  it('keeps small shares readable', () => {
    expect(percent(0.263449)).toBe('26%');
    expect(percent(0.0333)).toBe('3.3%');
    expect(percent(0.00267618)).toBe('0.27%');
    expect(percent(0.00001)).toBe('<0.01%');
  });

  it('offers only datasets with paths, best path first', () => {
    const summary = summariseResponse(response);
    expect(summary.datasets.map(b => b.dataset)).toEqual(['flywire783', 'BANC888']);
    expect(summary.withoutPaths.map(b => b.dataset)).toEqual(['male_cns_v1_0']);
  });

  it('passes on the endpoint warnings', () => {
    const summary = summariseResponse({ datasets: [], warnings: ['FBbt_99999999 was not found in any searched dataset'] });
    expect(summary.datasets).toEqual([]);
    expect(summary.messages).toEqual(['FBbt_99999999 was not found in any searched dataset']);
  });

  it('names the other datasets where the same class path was found', () => {
    expect(alsoFoundIn(response, 'flywire783')).toEqual(['male-cns:v1.0']);
    expect(alsoFoundIn(response, 'BANC888')).toEqual([]);
  });

  it('draws each class once, source left and target right', () => {
    const graph = buildGraph(flywire, {});
    expect(graph.nodes.map(n => n.classLabel)).toEqual(['LC12', 'PVLP100', 'DNp01', 'PVLP097', 'CB3513']);
    const x = Object.fromEntries(graph.nodes.map(n => [n.classLabel, n.positionX]));
    expect(x.LC12).toBeLessThan(x.PVLP097);
    expect(x.PVLP097).toBeLessThan(x.CB3513);
    expect(x.CB3513).toBeLessThan(x.DNp01);
    expect(graph.nodes[0].name).toBe('lobula columnar neuron LC12 (381 neurons)');
    // The node title is the id the click handler opens
    expect(graph.nodes[0].title).toBe('FBbt_00100484');
  });

  it('labels links with synapses and share of input, pairs in the tooltip', () => {
    const graph = buildGraph(flywire, {});
    expect(graph.links).toHaveLength(5);
    expect(graph.links[0].weightLabel).toBe('2614 · 26%');
    expect(graph.links[0].label).toContain('Connected neuron pairs: 432');
    expect(graph.nodes[0].neighbors.map(n => n.classLabel)).toEqual(['PVLP100', 'PVLP097']);
  });

  it('shows example neurons typed by their class', () => {
    const terms = { VFB_fw011554: { label: 'LO.PVLP.1465 (FlyWire:720575940642770592)', facets: ['Cholinergic', 'Visual_system'] } };
    const styling = { nodeColorsByLabel: { Visual_system: '#0000aa', Cholinergic: '#bebada', GABAergic: '#1f78b4' } };
    const graph = buildGraph(flywire, { showNeurons: true, terms, styling });
    expect(graph.nodes.map(n => n.classLabel)).toEqual(['LC12', 'PVLP100', 'DNp01']);
    expect(graph.nodes[0].name).toBe('LO.PVLP.1465 (FlyWire:720575940642770592)');
    expect(graph.nodes[1].name).toBe('VFB_fw005842');
    expect(graph.nodes[0].nodeColorLabels).toEqual(['#0000aa', '#bebada']);
    expect(graph.legendLabels).toEqual(['Visual_system', 'Cholinergic']);
    expect(graph.links[0].label).toContain('LO.PVLP.1465 (FlyWire:720575940642770592) → VFB_fw005842');
  });

  it('collects every id to look up, example neurons included', () => {
    const ids = nodeIds(flywire);
    expect(ids).toContain('FBbt_20003513');
    expect(ids).toContain('VFB_fw036981');
    expect(ids).toHaveLength(8);
  });

  it('draws neuron-level paths with the neuron class as the title', () => {
    const block = {
      dataset: 'male_cns_v1_0', level: 'neuron', label: 'Neuprint web interface - male-cns:v1.0',
      paths: [{
        score: 6.2e-6, hops: 2,
        nodes: [
          { id: 'VFB_jrmc26km', class: LC12.id, class_label: LC12.label, class_symbol: 'LC12' },
          { id: 'VFB_jrmc1kei', class: PVLP100.id, class_label: PVLP100.label, class_symbol: 'PVLP100' },
          { id: 'VFB_jrmc30mz', class: GF.id, class_label: GF.label, class_symbol: 'DNp01' }
        ],
        edges: [edge('VFB_jrmc26km', 'VFB_jrmc1kei', 45, 0.00498173), edge('VFB_jrmc1kei', 'VFB_jrmc30mz', 31, 0.00124518)]
      }]
    };
    const graph = buildGraph(block, { terms: { VFB_jrmc26km: { label: 'LC12_L (MaleCNS:49415)' } } });
    expect(graph.nodes.map(n => n.classLabel)).toEqual(['LC12', 'PVLP100', 'DNp01']);
    expect(graph.nodes[0].name).toBe('LC12_L (MaleCNS:49415)');
    expect(graph.links[0].weightLabel).toBe('45 · 0.50%');
    expect(graph.links[0].label).not.toContain('pairs');
    // Link tooltips name the neurons, not their classes
    expect(graph.links[0].label).toContain('LC12_L (MaleCNS:49415) → VFB_jrmc1kei');
    expect(graph.links[0].label).toContain('Share of VFB_jrmc1kei input');
  });

  it('marks a neuron left out of the class graph as having no single type', () => {
    const block = {
      dataset: 'flywire783', level: 'neuron', label: 'FlyWire web interface v783',
      paths: [{
        score: 1e-5, hops: 1,
        nodes: [
          { id: 'VFB_fw005285', class: null },
          { id: 'VFB_fw036981', class: GF.id, class_label: GF.label, class_symbol: 'DNp01' }
        ],
        edges: [edge('VFB_fw005285', 'VFB_fw036981', 12, 0.018)]
      }]
    };
    const terms = { VFB_fw005285: { label: 'SMP.PRW.8 (FlyWire:720575940619451989)' } };
    const graph = buildGraph(block, { terms });
    expect(graph.nodes[0].classLabel).toBe('no single type');
    expect(graph.nodes[0].typeLabel).toContain('Not in the class graph');
    expect(graph.nodes[1].classLabel).toBe('DNp01');
    expect(graph.links[0].label).toContain('SMP.PRW.8 (FlyWire:720575940619451989) → VFB_fw036981');
  });
  it('reads the connectome from a neuron label, BANC included', () => {
    expect(connectomeOf('LC12_L (MaleCNS:49415)')).toBe('MaleCNS');
    expect(connectomeOf('LPC2 (FlyEM-HB:5813000992)')).toBe('FlyEM-HB');
    expect(connectomeOf('ME.31828 (FlyWire:720575940638778943)')).toBe('FlyWire');
    expect(connectomeOf('BANC_888:720575941548059681')).toBe('BANC_888');
    expect(connectomeOf('giant fiber neuron')).toBeNull();
    expect(connectomeOf(undefined)).toBeNull();
  });

  it('filters a search to one connectome in SOLR, escaping the name', () => {
    expect(connectomeFilter('MaleCNS')).toBe('(facets_annotation:Class AND facets_annotation:Neuron) OR label:*MaleCNS\\:*');
    expect(connectomeFilter('FlyEM-HB')).toContain('label:*FlyEM\\-HB\\:*');
    expect(connectomeFilter('BANC_888')).toContain('label:*BANC_888\\:*');
  });

  it('orders each column so links do not cross where they need not', () => {
    const n = id => ({ id, class: GF.id, class_label: GF.label, class_symbol: id });
    const path = ids => ({
      score: 1e-5, hops: ids.length - 1, nodes: ids.map(n),
      edges: ids.slice(1).map((id, i) => edge(ids[i], id, 10, 0.01))
    });
    // Path rank alone puts X, Y, Z in rows and T1 above T2, so Y->T2 crosses Z->T1
    const block = { dataset: 'BANC888', level: 'neuron', paths: [path(['A', 'X', 'T1']), path(['A', 'Y', 'T2']), path(['A', 'Z', 'T1'])] };
    const graph = buildGraph(block, {});
    const crossings = graph.links.filter((a, i) => graph.links.slice(i + 1).some(b =>
      a.source.column === b.source.column && a.target.column === b.target.column
      && (a.source.positionY - b.source.positionY) * (a.target.positionY - b.target.positionY) < 0));
    expect(crossings).toHaveLength(0);
    // Nodes in a column never share a position
    const spots = graph.nodes.map(node => node.positionX + ',' + node.positionY);
    expect(new Set(spots).size).toBe(spots.length);
  });
});
