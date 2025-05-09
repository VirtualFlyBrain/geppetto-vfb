var coli = 1;

// Label type to ID mapping
const labelTypeToID = {
  // Anatomy terms
  "Adult": "FBbt_00003004",
  "Anatomy": "CARO_0000000", 
  "Cholinergic": "FBbt_00007173",
  "Clone": "FBbt_00007683",
  "Dopaminergic": "FBbt_00005131",
  "GABAergic": "FBbt_00007228",
  "Ganglion": "FBbt_00005137",
  "Glutamatergic": "FBbt_00100291",
  "Larva": "FBbt_00001727",
  "Motor_neuron": "FBbt_00005123",
  "Muscle": "FBbt_00005074",
  "Nervous_system": "FBbt_00005093",
  "Neuromere": "FBbt_00005140",
  "Neuron": "FBbt_00005106",
  "Neuron_projection_bundle": "FBbt_00005099",
  "Octopaminergic": "FBbt_00007364",
  "Peptidergic": "FBbt_00004101",
  "Sensory_neuron": "FBbt_00005124",
  "Serotonergic": "FBbt_00005133",
  "Synaptic_neuropil_block": "FBbt_00041000",
  "Synaptic_neuropil_domain": "FBbt_00040007", 
  "Synaptic_neuropil": "FBbt_00040005",
  "Synaptic_neuropil_subdomain": "FBbt_00040006", 
  "Glial_cell": "FBbt_00005144",
  "Cell": "FBbt_00007002",
  "Thermosensory_system": "FBbt_00007691",
  "Neuroblast": "FBbt_00005146",
  "GMC": "FBbt_00005149",
  "Mechanosensory_system": "FBbt_00007687",
  "Visual_system": "FBbt_00047735",
  "Olfactory_system": "FBbt_00007688",
  "Auditory_system": "FBbt_00007685",
  "Gustatory_system": "FBbt_00007690",
  "Proprioceptive_system": "FBbt_00052154",
  "Chemosensory_system": "FBbt_00007689",
  "Hygrosensory_system": "FBbt_00110660",
  "Nociceptive_system": "FBbt_00052155",
  "Histaminergic": "FBbt_00007367",
  "Tyraminergic": "FBbt_00100397",
  "secondary_neuron": "FBbt_00047096",

  // Structural terms
  "Channel": "VFBext_0000014", // Added from config
  "Expression_pattern": "CARO_0030002",
  "Expression_pattern_fragment": "VFBext_0000004", 
  "Template": "VFBext_0000007", 
  "Split": "VFBext_0000010", 
  "Pub": "FBcv_0000212", 
  "DataSet": "FBcv_0003023",
  "Class": "BFO_0000001",

  // scRNAseq
  "Cluster": "FBcv_0009003", 
  "Sample": "FBcv_0003024", 
  "Assay": "FBcv_0003025", 
  
  // Gene Ontology terms from gene_functions.tsv and GO database
  "Serotonin_receptor": "GO:0099589", // serotonin receptor activity (updated from GO_0004993)
  "Dopamine_receptor": "GO:0004952", // dopamine neurotransmitter receptor activity
  "GABA_receptor": "GO:0016917", // GABA receptor activity (updated from GO_0004890)
  "Glutamate_receptor": "GO:0008066", // glutamate receptor activity
  "Acetylcholine_receptor": "GO:0015464", // acetylcholine receptor activity
  "Histamine_receptor": "GO:0019182", // histamine-gated chloride channel activity (updated from GO_0004969)
  "Octopamine_receptor": "GO:0004989", // octopamine receptor activity
  "Olfactory_receptor": "GO:0004984", // olfactory receptor activity
  "Tyramine_receptor": "GO:0008226", // tyramine receptor activity (updated from GO_0008227)
  "Peptide_or_protein_hormone_receptor": "GO:0016500", // protein-hormone receptor activity
  "Ion_channel": "GO:0005216", // ion channel activity
  "Mechanosensory_ion_channel": "GO:0008381", // mechanosensitive ion channel activity
  "Thermosensory_ion_channel": "GO:0097603", // temperature-gated ion channel activity (updated from GO_0005104)
  "Enzyme": "GO:0003824", // catalytic activity
  "Transcription_factor": "GO:0140110", // transcription regulator activity (updated from GO_0003700)
  "GPCR": "GO:0004930", // G protein-coupled receptor activity  
  "Calcium_binding": "GO:0005509", // calcium ion binding
  "Odorant_binding": "GO:0005549", // odorant binding
  "Hormone": "GO:0005179", // hormone activity
  "Neuropeptide": "GO:0005184", // neuropeptide hormone activity
  "Gustatory_receptor": "GO:0008527", // taste receptor activity
  "Photoreceptor": "GO_0009881", // (photoreceptor activity)
  
  // Sequence Ontology terms for genetic elements and features
  "Gene": "SO_0000704", // gene
  "Allele": "SO_0001023", // allele
  "Insertion": "SO_0000667", // insertion site
  "Transgenic_Construct": "SO_0000804", // transgenic transposable element
  "FBtr": "SO_0000673", // transcript
  "FBpp": "SO_0000104", // protein
  "FBcl": "SO_0000151", // clone
  "FBsf": "SO_0000148", // supercontig/scaffold
  "FBte": "SO_0000101", // transposable element
  "FBto": "SO_0001218", // transgenic insertion
  "FBlc": "SO_0000317", // cDNA clone
  "FBba": "SO_0000318", // bacterial artificial chromosome
  "FBsn": "SO_0000101", // transposable element (natural)

  // Lineage
  "lineage_MBp": "FBbt_00007113",
  "lineage_VPNd1": "FBbt_00049153",
  "lineage_VLPl&p1": "FBbt_00049157",
  "lineage_VLPa1": "FBbt_00049159",
  "lineage_VLPp&l1": "FBbt_00049161",
  "lineage_SMPad1": "FBbt_00049463",
  "lineage_SLPpl3": "FBbt_00050006",
  "lineage_VPNl&d1": "FBbt_00050012",
  "lineage_DM1": "FBbt_00050018",
  "lineage_ALv2": "FBbt_00050035",
  "lineage_ALlv1": "FBbt_00050038",
  "lineage_SLPav3": "FBbt_00050056",
  "lineage_DM5": "FBbt_00050059",
  "lineage_SLPpl2": "FBbt_00050068",
  "lineage_DM3": "FBbt_00050100",
  "lineage_VLPl1": "FBbt_00050103",
  "lineage_VESa1": "FBbt_00050118",
  "lineage_DM2": "FBbt_00050121",
  "lineage_EBa1": "FBbt_00050136",
  "lineage_DM6": "FBbt_00050142",
  "lineage_SLPal4": "FBbt_00050154",
  "lineage_LALv1": "FBbt_00050166",
  "lineage_PBp1": "FBbt_00050169",
  "lineage_SLPal5": "FBbt_00050175",
  "lineage_SMPad2": "FBbt_00050201",
  "lineage_PSp1": "FBbt_00050213",
  "lineage_VPNp1": "FBbt_00050249",
  "lineage_DM4": "FBbt_00050252",
  "lineage_LHl3": "FBbt_00050255",
  "lineage_MBp1": "FBbt_00050270",
  "lineage_LHp3": "FBbt_00052820",
  "lineage_ALad1": "FBbt_00067346",
  "lineage_ALl1": "FBbt_00067347",
  "lineage_ALv1": "FBbt_00067348",
  "lineage_SMPad3": "FBbt_00100540",
  "lineage_VLPa2": "FBbt_00100543",
  "lineage_AOTUv3": "FBbt_00100545",
  "lineage_AOTUv4": "FBbt_00100546",
  "lineage_AOTUv2": "FBbt_00100547",
  "lineage_CREa2": "FBbt_00100548",
  "lineage_AOTUv1": "FBbt_00100549",
  "lineage_WEDd1": "FBbt_00100550",
  "lineage_CREa1": "FBbt_00100551",
  "lineage_PSa1": "FBbt_00100553",
  "lineage_FLAa2": "FBbt_00100555",
  "lineage_FLAa3": "FBbt_00100556",
  "lineage_FLAa1": "FBbt_00100560",
  "lineage_VESa2": "FBbt_00100563",
  "lineage_LALa1": "FBbt_00100564",
  "lineage_WEDa2": "FBbt_00100565",
  "lineage_WEDa1": "FBbt_00100566",
  "lineage_PSp2": "FBbt_00100571",
  "lineage_SMPpv1": "FBbt_00100577",
  "lineage_SIPp1": "FBbt_00100578",
  "lineage_VLPp2": "FBbt_00100579",
  "lineage_SMPpm1": "FBbt_00100584",
  "lineage_PSp3": "FBbt_00100586",
  "lineage_VLPd1": "FBbt_00100590",
  "lineage_SLPal1": "FBbt_00100591",
  "lineage_LHl2": "FBbt_00100592",
  "lineage_SLPal2": "FBbt_00100593",
  "lineage_LHd1": "FBbt_00100594",
  "lineage_SMPpd1": "FBbt_00100595",
  "lineage_SLPpm2": "FBbt_00100596",
  "lineage_SLPpm3": "FBbt_00100597",
  "lineage_CLp1": "FBbt_00100598",
  "lineage_SMPp&v1": "FBbt_00100599",
  "lineage_SLPpl1": "FBbt_00100600",
  "lineage_VLPd&p1": "FBbt_00100601",
  "lineage_SLPad1": "FBbt_00100602",
  "lineage_LHp2": "FBbt_00100603",
  "lineage_SLPp&v1": "FBbt_00100604",
  "lineage_SLPpm1": "FBbt_00100605",
  "lineage_LHd2": "FBbt_00100606",
  "lineage_SMPpv2": "FBbt_00100608",
  "lineage_DL1": "FBbt_00100609",
  "lineage_DL2": "FBbt_00100610",
  "lineage_CLp2": "FBbt_00100611",
  "lineage_VLPl&d1": "FBbt_00100612",
  "lineage_VLPl2": "FBbt_00100613",
  "lineage_LHa1": "FBbt_00100614",
  "lineage_SIPa1": "FBbt_00100615",
  "lineage_SLPal3": "FBbt_00100616",
  "lineage_SLPav1": "FBbt_00100618",
  "lineage_SLPa&l1": "FBbt_00100619",
  "lineage_LHl4": "FBbt_00100620",
  "lineage_SLPav2": "FBbt_00100621",
  "lineage_VLPl4": "FBbt_00100622",
  "lineage_LHl1": "FBbt_00100623",
  "lineage_VPNp&v1": "FBbt_00100625",
  "lineage_VLPp1": "FBbt_00100626",
  "lineage_LHp1": "FBbt_00100628",
  "lineage_LHa2": "FBbt_00100630",
  "lineage_LHa3": "FBbt_00100631",
  "lineage_VLPl&p2": "FBbt_00100633",
  "lineage_CREl1": "FBbt_00100645",
  "lineage_WEDd2": "FBbt_00100735",
  "lineage_LHa4": "FBbt_00110359",
  "lineage_SLPpm4": "FBbt_00110368",
  "lineage_SMPpd2": "FBbt_00110374",
  "lineage_VPNd2": "FBbt_00110383",
  "lineage_VPNd3": "FBbt_00110386",
  "lineage_VPNd4": "FBbt_00110389",
  "lineage_VPNp2": "FBbt_00110392",
  "lineage_VPNp3": "FBbt_00110395",
  "lineage_VPNp4": "FBbt_00110398",
  "lineage_VPNv1": "FBbt_00110401",
  "lineage_VPNv2": "FBbt_00110404",
  "lineage_VPNv3": "FBbt_00110407",
  "lineage_SMPad4": "FBbt_00110411",
  "lineage_MBp2": "FBbt_00110558",
  "lineage_MBp3": "FBbt_00110561",
  "lineage_MBp4": "FBbt_00110564",
  "lineage_BLD6": "FBbt_00049153",
  "lineage_BLVa4": "FBbt_00049155",
  "lineage_BLVp2": "FBbt_00049157",
  "lineage_DALl2": "FBbt_00049159",
  "lineage_DPLpv": "FBbt_00049161",
  "lineage_BLVa2c": "FBbt_00050006",
  "lineage_BLAl2": "FBbt_00050012",
  "lineage_DPMm1": "FBbt_00050018",
  "lineage_BAla2": "FBbt_00050035",
  "lineage_BAlp4": "FBbt_00050038",
  "lineage_BLVa2a": "FBbt_00050056",
  "lineage_CM1": "FBbt_00050059",
  "lineage_CP6": "FBbt_00050068",
  "lineage_DPMpm2": "FBbt_00050100",
  "lineage_BAla3": "FBbt_00050118",
  "lineage_DPMpm1": "FBbt_00050121",
  "lineage_DALv2": "FBbt_00050136",
  "lineage_CM3": "FBbt_00050142",
  "lineage_BAmv1": "FBbt_00050166",
  "lineage_CM6": "FBbt_00050169",
  "lineage_BLAd5": "FBbt_00050175",
  "lineage_DPMl2": "FBbt_00050213",
  "lineage_BLD5": "FBbt_00050249",
  "lineage_CM4": "FBbt_00050252",
  "lineage_BLVa2b": "FBbt_00050255",
  "lineage_CP5": "FBbt_00052820",
  "lineage_BAmv3": "FBbt_00067346",
  "lineage_BAlc": "FBbt_00067347",
  "lineage_BAla1": "FBbt_00067348",
  "lineage_DAMv1": "FBbt_00100498",
  "lineage_DAMv2": "FBbt_00100512",
  "lineage_DAMd1": "FBbt_00100540",
  "lineage_DAMd2": "FBbt_00100541",
  "lineage_DAMd3": "FBbt_00100542",
  "lineage_DALv1": "FBbt_00100543",
  "lineage_DALcl1": "FBbt_00100545",
  "lineage_DALcl2": "FBbt_00100546",
  "lineage_DALl1": "FBbt_00100547",
  "lineage_DALcm1": "FBbt_00100548",
  "lineage_DALcm2": "FBbt_00100549",
  "lineage_DALd": "FBbt_00100550",
  "lineage_BAmd1": "FBbt_00100551",
  "lineage_BAmv2": "FBbt_00100553",
  "lineage_BAmas1": "FBbt_00100555",
  "lineage_BAmas2": "FBbt_00100556",
  "lineage_BAla4": "FBbt_00100560",
  "lineage_BAlp1": "FBbt_00100563",
  "lineage_BAlp2": "FBbt_00100564",
  "lineage_BAlp3": "FBbt_00100565",
  "lineage_BAlv": "FBbt_00100566",
  "lineage_CM2": "FBbt_00100568",
  "lineage_CM5": "FBbt_00100571",
  "lineage_TRdm": "FBbt_00100572",
  "lineage_TRdl": "FBbt_00100573",
  "lineage_TRvm": "FBbt_00100574",
  "lineage_TRvl": "FBbt_00100575",
  "lineage_TRco": "FBbt_00100576",
  "lineage_DPMpl1": "FBbt_00100577",
  "lineage_DPMpl2": "FBbt_00100578",
  "lineage_DPMpl3": "FBbt_00100579",
  "lineage_DPMm2": "FBbt_00100584",
  "lineage_DPMm3": "FBbt_00100585",
  "lineage_DPMl1": "FBbt_00100586",
  "lineage_DPLam": "FBbt_00100590",
  "lineage_DPLal1": "FBbt_00100591",
  "lineage_DPLal2": "FBbt_00100592",
  "lineage_DPLal3": "FBbt_00100593",
  "lineage_DPLd": "FBbt_00100594",
  "lineage_DPLc1": "FBbt_00100595",
  "lineage_DPLc2": "FBbt_00100596",
  "lineage_DPLc3": "FBbt_00100597",
  "lineage_DPLc4": "FBbt_00100598",
  "lineage_DPLc5": "FBbt_00100599",
  "lineage_DPLl1": "FBbt_00100600",
  "lineage_DPLl2": "FBbt_00100601",
  "lineage_DPLl3": "FBbt_00100602",
  "lineage_DPLp1": "FBbt_00100603",
  "lineage_DPLp2": "FBbt_00100604",
  "lineage_DPLm1": "FBbt_00100605",
  "lineage_DPLm2": "FBbt_00100606",
  "lineage_DPLcv": "FBbt_00100607",
  "lineage_CP1": "FBbt_00100608",
  "lineage_CP2": "FBbt_00100609",
  "lineage_CP3": "FBbt_00100610",
  "lineage_CP4": "FBbt_00100611",
  "lineage_BLAv1": "FBbt_00100612",
  "lineage_BLAv2": "FBbt_00100613",
  "lineage_BLAd1": "FBbt_00100614",
  "lineage_BLAd2": "FBbt_00100615",
  "lineage_BLAd3": "FBbt_00100616",
  "lineage_BLAd4": "FBbt_00100617",
  "lineage_BLAl1": "FBbt_00100618",
  "lineage_BLAvm": "FBbt_00100619",
  "lineage_BLD1": "FBbt_00100620",
  "lineage_BLD2": "FBbt_00100621",
  "lineage_BLD3": "FBbt_00100622",
  "lineage_BLD4": "FBbt_00100623",
  "lineage_BLP1": "FBbt_00100625",
  "lineage_BLP2": "FBbt_00100626",
  "lineage_BLP3": "FBbt_00100627",
  "lineage_BLP4": "FBbt_00100628",
  "lineage_BLP5": "FBbt_00100629",
  "lineage_BLVa1": "FBbt_00100630",
  "lineage_BLVa2": "FBbt_00100631",
  "lineage_BLVa3": "FBbt_00100632",
  "lineage_BLVp1": "FBbt_00100633",
  "lineage_DALv3": "FBbt_00100645",
  "lineage_BAmd2": "FBbt_00100735",
  "lineage_DPLc6": "FBbt_00110374",
  "lineage_NB1-1": "FBbt_00001371",
  "lineage_NB2-5": "FBbt_00001374",
  "lineage_NB3-5": "FBbt_00001375",
  "lineage_NB5-2": "FBbt_00001376",
  "lineage_NB5-6": "FBbt_00001377",
  "lineage_NB7-1": "FBbt_00001380",
  "lineage_NB7-4": "FBbt_00001381",
  "lineage_NB1-2": "FBbt_00001384",
  "lineage_NB2-2": "FBbt_00001385",
  "lineage_NB3-2": "FBbt_00001388",
  "lineage_NB4-2": "FBbt_00001389",
  "lineage_NB5-3": "FBbt_00001390",
  "lineage_NB6-2": "FBbt_00001391",
  "lineage_NB7-2": "FBbt_00001392",
  "lineage_NB3-1": "FBbt_00001394",
  "lineage_NB4-1": "FBbt_00001397",
  "lineage_NB6-1": "FBbt_00001398",
  "lineage_NB6-4": "FBbt_00001399",
  "lineage_NB1-3": "FBbt_00001404",
  "lineage_NB2-1": "FBbt_00001410",
  "lineage_NB2-4": "FBbt_00001411",
  "lineage_NB3-4": "FBbt_00001414",
  "lineage_NB4-4": "FBbt_00001415",
  "lineage_NB5-4": "FBbt_00001416",
  "lineage_MNB": "FBbt_00001419",
  "lineage_NB2-3": "FBbt_00001421",
  "lineage_NB3-3": "FBbt_00001422",
  "lineage_NB4-3": "FBbt_00001423",
  "lineage_NB5-1": "FBbt_00001424",
  "lineage_NB5-5": "FBbt_00001425",
  "lineage_NB7-3": "FBbt_00001426",
  "lineage_NB5-7": "FBbt_00111737",
  "lineage_16": "FBbt_00001371",
  "lineage_17": "FBbt_00001374",
  "lineage_9": "FBbt_00001375",
  "lineage_6": "FBbt_00001376",
  "lineage_3": "FBbt_00001380",
  "lineage_23": "FBbt_00001381",
  "lineage_1": "FBbt_00001384",
  "lineage_10": "FBbt_00001385",
  "lineage_7": "FBbt_00001388",
  "lineage_13": "FBbt_00001389",
  "lineage_5": "FBbt_00001390",
  "lineage_19": "FBbt_00001391",
  "lineage_11": "FBbt_00001392",
  "lineage_4": "FBbt_00001394",
  "lineage_14": "FBbt_00001397",
  "lineage_12": "FBbt_00001398",
  "lineage_2": "FBbt_00001410",
  "lineage_18": "FBbt_00001411",
  "lineage_25": "FBbt_00001414",
  "lineage_24": "FBbt_00001415",
  "lineage_22": "FBbt_00001416",
  "lineage_0": "FBbt_00001419",
  "lineage_15": "FBbt_00001421",
  "lineage_8": "FBbt_00001422",
  "lineage_21": "FBbt_00001423",
  "lineage_26": "FBbt_00001424",
  "lineage_20": "FBbt_00111737"
};

var getStackViewerDefaultX = function () {
  return (Math.ceil(window.innerWidth / 1.826));
};

var getStackViewerDefaultY = function () {
  return (Math.ceil(window.innerHeight / 3.14));
};

// Logic to add VFB ids into the scene starts here
var setSepCol = function (entityPath) {
  if (entityPath.indexOf(window.templateID) < 0) {
    var c = coli;
    coli++;
    if (coli > 199) {
      coli = 1;
    }
  } else {
    c = 0;
  }
  if (Instances.getInstance(entityPath).setColor != undefined) {
    Instances.getInstance(entityPath).setColor(this.colours[c], true).setOpacity(0.3, true);
    try {
      Instances.getInstance(entityPath)[entityPath + '_swc'].setOpacity(1.0);
    } catch (ignore) {
    }
    if (c == 0) {
      Instances.getInstance(entityPath).setOpacity(0.4, true);
    }
  } else {
    console.log('Issue setting colour for ' + entityPath);
  }
};

var hasVisualType = function (variableId) {
  var counter = 0;
  var instance = undefined;
  var extEnum = {
    0 : { extension: "_swc" },
    1 : { extension: "_obj" },
    2 : { extension: "_slice" }
  };
  while ((instance == undefined) && (counter < 3)) {
    try {
      instance = Instances.getInstance(variableId + "." + variableId + extEnum[counter].extension);
    } catch (ignore) { }
    counter++;
  }
  if (instance != undefined) {
    return true;
  } else {
    return false;
  }
};

module.exports = {
  setSepCol,
  getStackViewerDefaultX,
  getStackViewerDefaultY,
  hasVisualType,
  labelTypeToID
};
