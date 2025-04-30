import React from 'react';
import ReactDOM from 'react-dom';
import Slider from "react-slick";
import Collapsible from 'react-collapsible';
import HTMLViewer from '@geppettoengine/geppetto-ui/html-viewer/HTMLViewer';
import ButtonBarComponent from './ButtonBarComponent';
import { SHOW_GRAPH, UPDATE_CIRCUIT_QUERY } from './../../../actions/generals';
import { connect } from "react-redux";

var $ = require('jquery');
var GEPPETTO = require('geppetto');
var anchorme = require('anchorme');
var Type = require('@geppettoengine/geppetto-core/model/Type');
var Variable = require('@geppettoengine/geppetto-core/model/Variable').default;

const stylingConfiguration = require('../../configuration/VFBGraph/graphConfiguration').styling;
const GRAPHS = "Graph";
const CIRCUIT_BROWSER = "CircuitBrowser";

require('../../../css/VFBTermInfo.less');

const labelTypeToID = {
  // Fly anatomy ontology terms (FBbt)
  "Adult": "FBbt_00003004",
  "Anatomy": "CARO_0000000", 
  "Cholinergic": "FBbt_00007173",
  "Clone": "FBbt_00007683",
  "Cluster": "FBbt_00007004", // Preserved as not found in config
  "Dopaminergic": "FBbt_00005131",
  "Expression_pattern": "CARO_0030002",
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
  "Photoreceptor": "GO_0009881", // (photoreceptor activity)
  "Histaminergic": "FBbt_00007367", // Added from config
  "Tyraminergic": "FBbt_00100397", // Added from config
  "Channel": "VFBext_0000014", // Added from config
  
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
  
  // Structural terms with proper IDs from config
  "Expression_pattern_fragment": "VFBext_0000004", 
  "Synaptic_neuropil_subdomain": "FBbt_00040006", 
  "Template": "FBbt_00000001", // Still needs proper ID
  "Split": "VFBext_0000010", 
  
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

class VFBTermInfo extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      htmlTermInfo: undefined,
      activeSlide: undefined,
    }

    this.getHTML = this.getHTML.bind(this);
    this.setData = this.setData.bind(this);
    this.setName = this.setName.bind(this);
    this.setLinks = this.setLinks.bind(this);
    this.getVariable = this.getVariable.bind(this);
    this.hookupImages = this.hookupImages.bind(this);
    this.addToHistory = this.addToHistory.bind(this);
    this.sliderHandler = this.sliderHandler.bind(this);
    this.cleanButtonBar = this.cleanButtonBar.bind(this);
    this.renderButtonBar = this.renderButtonBar.bind(this);
    this.hookupCustomHandler = this.hookupCustomHandler.bind(this);

    this.staticHistoryMenu = [];
    this.arrowsInitialized = false;
    this.name = undefined;
    this.buttonBar = undefined;
    this.sliderId = "termInfoSlider";
    this.contentTermInfo = {
      keys: [],
      values: []
    };
    this.contentBackup = {
      keys: [],
      values: []
    };

    this.imagesData = {
      index: 0,
      list: []
    };
    
    this.linksConfiguration = require('../../configuration/VFBTermInfo/VFBTermInfoConfiguration').linksConfiguration;

    this.innerHandler = { funct: undefined, event: 'click', meta: undefined, hooked: false, id: undefined };
  }


  close () {
    this.hide();
    this.props.termInfoHandler();
  }


  open () {
    this.show();
  }


  setData (anyInstance) {
    for (const [key, conf] of Object.entries(this.linksConfiguration)) {
      if ( conf.visibility ){
        this.setLinks(anyInstance, key, conf.title, conf.superType);
      }
    }
    
    this.addToHistory(anyInstance.getName(), "setData", [anyInstance], this.props.id);
    this.getHTML(anyInstance, "vfbTermInfoWidgetInnerID");
    this.setName(anyInstance.name);
    this.setState({
      termInfoId: anyInstance.id,
      termInfoName: anyInstance.name
    });

    let instanceId = undefined;
    if (anyInstance.getId().indexOf("_meta") === -1 && anyInstance.getParent() === null) {
      instanceId = anyInstance.getId();
    } else {
      instanceId = anyInstance.getParent().getId();
    }

    if (this.props.buttonBarConfiguration != null && this.props.buttonBarConfiguration != undefined && window[instanceId] !== undefined) {
      this.renderButtonBar(anyInstance);
    } else {
      this.cleanButtonBar();
    }
  }
  
  /**
   * Adds Links to open up Graphs from VFB Term Info Component
   */
  setLinks (anyInstance, type, name, superType) {
    let links = new Array();
    
    // Here we create links based on the type, graph or circuit browser
    if ( type === GRAPHS ) {
      // Loop in graph configuration file for the different Graph configurations available.
      {stylingConfiguration.dropDownQueries.map( (item, index) => (
        /*
         *  Keep track of each possible graph in configuration (dropDownQueries).
         * We keep track of the instance, the configuration for the graph and the index of the
         * graph configuration
         */
        links.push({ "instance" : anyInstance, "item" : item, "index" : index })
      ))}
    } else if ( type == CIRCUIT_BROWSER ) {
      links.push({ "instance" : anyInstance })
    }
         
    // From the main instance passed as argument, we retrieved the property 'type'
    var instanceType = anyInstance;
    if (!(instanceType instanceof Type)) {
      instanceType = anyInstance.getType();
    }
    
    if ( typeof instanceType?.getVariables !== "function" ) {
      return;
    }
    
    // If there are no variables, we have an empty composite node, don't add any links
    if ( instanceType?.getVariables()?.length == 0 ){
      return;
    }
    
    // Look for root node, create a Variable object with the graphs configuration, and attach it to root type object
    if (instanceType.getMetaType() == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
      let variables = instanceType.getVariables();
      let present = false;
      let hasSuperType = false;
      
      let superTypes = anyInstance.getType().getSuperType();
      if ( anyInstance.parent != null && anyInstance.parent != undefined ){
        superTypes = anyInstance.getParent().getType().getSuperType();
      }
      
      for ( var i = 0 ; i < superTypes.length ; i++ ){
        if ( superTypes[i].wrappedObj.id == superType ){
          hasSuperType = true;
          break;
        }
      }
      
      // Check if link has been added already, if it has, don't add it again
      for ( var i = 0; i < variables.length; i++ ){
        if ( variables[i].types[0].wrappedObj.name === type ){
          present = true;
        }
      }  
    
      if ( !present && hasSuperType ) {
        var linkType = new Type({ wrappedObj : { name : type, eClass : type } })
      
        // Variable object holding the information for the links
        var linksVariable = new Variable({ wrappedObj : { name : name }, values : links });
        linksVariable.setTypes([linkType]);
      
        // Add links Variable to instance
        instanceType.getVariables().push(linksVariable);
      }
    }
  }

  setName (input) {
    this.name = input;
  }


  getHTML (anyInstance, id, counter) {
    var anchorOptions = {
      "attributes": {
        "target": "_blank",
        "class": "popup_link"
      },
      "html": true,
      ips: false,
      emails: true,
      urls: true,
      TLDs: 20,
      truncate: 0,
      defaultProtocol: "http://"
    };
    var type = anyInstance;
    if (!(type instanceof Type)) {
      type = anyInstance.getType();
    }
    
    let metaType = type.getMetaType();
    if (metaType == GEPPETTO.Resources.COMPOSITE_TYPE_NODE) {
      for (var i = 0; i < type.getVariables().length; i++) {
        var v = type.getVariables()[i];

        // var id = this.getId() + "_" + type.getId() + "_el_" + i;
        var nameKey = v.getName();
        this.contentTermInfo.keys[i] = nameKey;
        var id = "VFBTermInfo_el_" + i;
        this.getHTML(v, id, i);
      }
    } else if (metaType === GEPPETTO.Resources.HTML_TYPE) {
      var value = this.getVariable(anyInstance).getInitialValues()[0].value;
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        <div>
          <HTMLViewer id={id} content={value.html} />
        </div>
      </Collapsible>);
    } else if (metaType == GEPPETTO.Resources.TEXT_TYPE) {
      var value = this.getVariable(anyInstance).getInitialValues()[0].value;
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        <div>
          <HTMLViewer id={id} content={anchorme(value.text, anchorOptions)} />
        </div>
      </Collapsible>);
    } else if (metaType == GEPPETTO.Resources.IMAGE_TYPE) {
      if (this.getVariable(anyInstance).getInitialValues()[0] != undefined) {
        var value = this.getVariable(anyInstance).getInitialValues()[0].value;
        var prevCounter = this.contentTermInfo.keys.length;
        if (counter !== undefined) {
          prevCounter = counter;
        }
        if (value.eClass == GEPPETTO.Resources.ARRAY_VALUE) {
          // if it's an array we use slick to create a carousel
          var elements = [];
          this.imagesData.index = 0;
          this.imagesData.list = [];
          for (var j = 0; j < value.elements.length; j++) {
            var image = value.elements[j].initialValue;
            this.imagesData.list.push(image.reference);
            elements.push(<div className="slider_image_container">
              {image.name}
              <a id={"slider_image_" + j} href={location.protocol + '//' + location.host + location.pathname + "/" + image.reference} onClick={event => {
                event.stopPropagation();
                event.preventDefault();
                this.sliderHandler();
              }}>
                <img id={"image_" + j} src={image.data}></img>
              </a>
            </div>);
          }

          const settings = {
            fade: true,
            centerMode: true,
            slideToShow: 1,
            slidesToScroll: 1,
            lazyLoad: "progressive",
            afterChange: current => (this.hookupImages(current))
          };
          this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
            <Slider {...settings}>
              {elements.map((element, key) => {
                var Element = React.cloneElement(element);
                /*
                 * The id in the following div is used to hookup the images into the slider
                 * with the handler that has to load the id linked to that image
                 */
                return (
                  <div id={this.sliderId + key} key={key}> {Element} </div>
                );
              })}
            </Slider>
          </Collapsible>);
        } else if (value.eClass == GEPPETTO.Resources.IMAGE) {
          // otherwise we just show an image
          var image = value;
          this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
            <div className="popup-image">
              <a href={location.protocol + '//' + location.host + location.pathname + "/" + image.reference} onClick={event => {
                event.stopPropagation();
                event.preventDefault();
                this.props.customHandler(undefined, image.reference, undefined) 
              }}>
                <img src={image.data}></img>
              </a>
            </div>
          </Collapsible>);
        }
      }
    } else if ( metaType === GRAPHS ) {
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      let values = anyInstance.values;
      let graphs = new Array();
      for (var j = 0; j < values.length; j++) {
        graphs.push(<div><i className="popup-icon-link fa fa-cogs" ></i>
          <a style={{ cursor: "pointer" }} data-instancepath={ GRAPHS + "," + values[j].instance.parent.id + "," + values[j].index }> 
            { values[j].item.label(values[j].instance.parent.name) }
          </a>
          <br/>
        </div>
        );
      }
      
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        {graphs.map((graph, key) => {
          var Element = React.cloneElement(graph);
          /*
           * The id in the following div is used to hookup the images into the slider
           * with the handler that has to load the id linked to that image
           */
          return (
            <div key={key}> {Element} </div>
          );
        })}
      </Collapsible>);
    } else if ( metaType === CIRCUIT_BROWSER ) {
      var prevCounter = this.contentTermInfo.keys.length;
      if (counter !== undefined) {
        prevCounter = counter;
      }
      let values = anyInstance.values;
      let graphs = new Array();
      for (var j = 0; j < values.length; j++) {
        graphs.push(<div><i className="popup-icon-link fa fa-cogs" ></i>
          <a id="circuitBrowserLink" style={{ cursor: "pointer" }} data-instancepath={ CIRCUIT_BROWSER + "," + values[j].instance.parent.name + "," + values[j].instance.parent.id + "," + values[j].index }>
            { "Add " + values[j].instance.parent.name + " to Circuit Browser Query" }
          </a>
          <br/>
        </div>
        );
      }
        
      this.contentTermInfo.values[prevCounter] = (<Collapsible open={true} trigger={this.contentTermInfo.keys[prevCounter]}>
        {graphs.map((graph, key) => {
          var Element = React.cloneElement(graph);
          /*
           * The id in the following div is used to hookup the images into the slider
           * with the handler that has to load the id linked to that image
           */
          return (
            <div key={key}> {Element} </div>
          );
        })}
      </Collapsible>);
    }
  }

  /*
   * Method to hookup the images into the slider, avoided to re-call this logic on all the term info due
   * to performances but also to the fact that the query were appended eachother.
   */
  hookupImages (idKey) {
    this.imagesData.index = idKey;
  }

  sliderHandler () {
    this.props.customHandler(undefined, this.imagesData.list[this.imagesData.index], undefined);
  }


  addToHistory (label, method, args, id) {
    if (window.historyWidgetCapability == undefined) {
      window.historyWidgetCapability = [];

      if (window.historyWidgetCapability[id] == undefined) {
        window.historyWidgetCapability[id] = [];
      }
    }

    if (this.staticHistoryMenu == undefined) {
      this.staticHistoryMenu = [];
    }

    var elementPresentInHistory = false;
    for (var i = 0; i < window.historyWidgetCapability[id].length; i++) {
      if (window.historyWidgetCapability[id][i].label == label && window.historyWidgetCapability[id][i].method == method) {
        elementPresentInHistory = true;
        // moves it to the first position
        if (window.historyWidgetCapability[id].length <= 2) {
          window.historyWidgetCapability[id].splice(0, 0, window.historyWidgetCapability[id].splice(i, 1)[0]);
        } else {
          var extract = window.historyWidgetCapability[id].splice(i, window.historyWidgetCapability[id].length - 1);
          window.historyWidgetCapability[id] = extract.concat(window.historyWidgetCapability[id]);
        }
        break;
      }
    }
    if (!elementPresentInHistory) {
      parent.historyWidgetCapability[id].unshift({
        "label": label,
        "method": method,
        "arguments": args,
      });

      this.staticHistoryMenu.unshift({
        "label": label,
        "method": method,
        "arguments": args,
      });
    }
  }


  hookupCustomHandler (handler, popupDOM, popup) {
    if (handler.hooked === false) {
    // set hooked to avoid double triggers
      handler.hooked = true;
      // Find and iterate <a> element with an instancepath attribute
      popupDOM.find("a[data-instancepath]").each(function () {
        var fun = handler.funct;
        var ev = handler.event;
        var metaType = handler.meta;
        var path = $(this).attr("data-instancepath").replace(/\$/g, "");
        var node;

        try {
          node = eval(path);
        } catch (ex) {
        // if instance path doesn't exist set path to undefined
          node = undefined;
        }

        // hookup IF domain type is undefined OR it's defined and it matches the node type
        if (metaType === undefined || (metaType !== undefined && node !== undefined && node.getMetaType() === metaType)) {
        // hookup custom handler
          var that = this;
          $(that).off();
          $(that).on(ev, function () {
          // invoke custom handler with instancepath as arg
            fun(node, path, popup);
            // stop default event handler of the anchor from doing anything
            return false;
          });
        }
      });
    }
  }

  cleanButtonBar () {
    var buttonBarContainer = 'button-bar-container-' + this.props.id;
    var barDiv = 'bar-div-' + this.props.id;
    if (this.buttonBar !== undefined || this.buttonBar === null) {
      ReactDOM.unmountComponentAtNode(document.getElementById(barDiv));
      $("#" + buttonBarContainer).remove();
      this.buttonBar = undefined;
    }
  }

  renderButtonBar (anyInstance) {
    var that = this;
    var buttonBarContainer = 'button-bar-container-' + this.props.id;
    var barDiv = 'bar-div-' + this.props.id;
    if (this.buttonBar !== undefined) {
      ReactDOM.unmountComponentAtNode(document.getElementById(barDiv));
      $("#" + buttonBarContainer).remove();
    }

    $("<div id='" + buttonBarContainer + "' class='button-bar-container'><div id='" + barDiv + "' class='button-bar-div'></div></div>").insertBefore(this.refs.termInfoInnerRef);
    $('#bar-div-vfbterminfowidget').css('width', this.refs.termInfoInnerRef.clientWidth);

    var instance = null;
    var instancePath = '';

    if (this.props.buttonBarConfiguration.filter != null && this.props.buttonBarConfiguration.filter != undefined) {
      if (anyInstance != null && anyInstance != undefined) {
        instance = this.props.buttonBarConfiguration.filter(anyInstance);
        instancePath = instance.getPath();
      }
    }
    var originalZIndex = $("#" + this.id).parent().css("z-index");
    this.buttonBar = ReactDOM.render(
      React.createElement(ButtonBarComponent, {
        buttonBarConfig: this.props.buttonBarConfiguration, showControls: this.props.buttonBarControls,
        instancePath: instancePath, instance: instance, geppetto: GEPPETTO, resize: function () {
        /*
         * that.setSize(that.size.height, that.size.width);
         * This was to handle the resize of the widget before, it's not required now since
         * FlexLayout will handle that.
         */
        }
      }),
      document.getElementById(barDiv)
    );

    $("#" + this.props.id).parent().css('z-index', originalZIndex);
  }


  getVariable (node) {
    if (node.getMetaType() == GEPPETTO.Resources.INSTANCE_NODE) {
      return node.getVariable();
    } else {
      return node;
    }
  }

  componentDidMount () {
    const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
    this.innerHandler = { funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false, id: this.state.termInfoId };
    this.hookupCustomHandler(this.innerHandler, $("#" + this.props.id), domTermInfo);

    // Add click handlers to label tags
    this.attachLabelClickHandlers();
  }
  
  componentDidUpdate (prevProps, prevState) {
    const domTermInfo = ReactDOM.findDOMNode(this.refs.termInfoInnerRef);
    if (this.state.termInfoId !== this.innerHandler.id) {
      this.innerHandler = { funct: this.props.customHandler, event: 'click', meta: undefined, hooked: false };
      this.hookupCustomHandler(this.innerHandler, $("#" + this.props.id), domTermInfo);
    }
    if (document.getElementById('bar-div-vfbterminfowidget') !== null) {
      $('#bar-div-vfbterminfowidget').css('width', this.refs.termInfoInnerRef.clientWidth);
    }

    // Update click handlers for newly rendered labels
    this.attachLabelClickHandlers();
  }
  
  attachLabelClickHandlers () {
    // Select all label tags
    const labelElements = document.querySelectorAll('.label.types > .label[class*="label-"]');
    
    labelElements.forEach(label => {
      // Avoid attaching multiple handlers
      if (!label.dataset.handlerAttached) {
        label.dataset.handlerAttached = 'true';
        
        // Extract label type from class name
        const classNames = Array.from(label.classList);
        const labelClass = classNames.find(cls => cls.startsWith('label-'));
        
        if (labelClass) {
          const labelType = labelClass.replace('label-', '');
          
          // Attach click handler
          label.addEventListener ('click', event => {
            event.stopPropagation();
            const termID = labelTypeToID[labelType];
            
            if (termID) {
              if (window.Instances && window.Instances.getInstance(termID)) {
                window.setTermInfo(window.Instances.getInstance(termID)[termID + "_meta"], termID);
              } else {
                window.addVfbId(termID);
              }
            }
          });
        }
      }
    });
  }

  render () {
    var toRender = undefined;
    if (this.contentTermInfo.values === undefined || this.contentTermInfo.values.length == 0) {
      this.contentTermInfo.keys = this.contentBackup.keys.slice();
      this.contentTermInfo.values = this.contentBackup.values.slice();
    }
    if ((this.props.order !== undefined) && (this.props.order.length > 0)) {
      this.contentBackup.keys = this.contentTermInfo.keys.slice();
      this.contentBackup.values = this.contentTermInfo.values.slice();
      var tempArray = [];
      if ((this.props.exclude !== undefined) && (this.props.exclude.length > 0)) {
        for (var x = 0; x < this.props.exclude.length; x++) {
          var index = this.contentTermInfo.keys.indexOf(this.props.exclude[x]);
          if (index > -1) {
            this.contentTermInfo.keys.splice(index, 1);
            this.contentTermInfo.values.splice(index, 1);
          }
        }
      }
      for (var x = 0; x < this.props.order.length; x++) {
        var index = this.contentTermInfo.keys.indexOf(this.props.order[x]);
        if (index > -1) {
          tempArray.push(this.contentTermInfo.values[index]);
          this.contentTermInfo.keys.splice(index, 1);
          this.contentTermInfo.values.splice(index, 1);
        }
      }
      if (this.contentTermInfo.keys.length > 0) {
        for (var j = 0; j < this.contentTermInfo.keys.length; j++) {
          tempArray.push(this.contentTermInfo.values[j]);
        }
      }
      toRender = tempArray.map((item, key) => {
        var Item = React.cloneElement(item);
        return (
          <div key={key}> {Item} </div>
        );
      });
      this.contentTermInfo.keys = [];
      this.contentTermInfo.values = [];
    } else {
      toRender = this.contentTermInfo.values.map((item, key) => {
        var Item = React.cloneElement(item);
        return (
          <div key={key}> {Item} </div>
        );
      });
      this.contentBackup.keys = this.contentTermInfo.keys;
      this.contentTermInfo.keys = [];
      this.contentBackup.values = this.contentTermInfo.values;
      this.contentTermInfo.values = [];
    }
    return (
      <div id={this.props.id} ref="termInfoInnerRef">
        {toRender}
      </div>);
  }
}

class VFBTermInfoWidget extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      coordX: this.getTermInfoDefaultX(),
      coordY: this.getTermInfoDefaultY(),
      widgetHeight: this.getTermInfoDefaultHeight(),
      widgetWidth: this.getTermInfoDefaultWidth()
    }

    this.setTermInfo = this.setTermInfo.bind(this)
    this.closeHandler = this.closeHandler.bind(this);
    this.customHandler = this.customHandler.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.getTermInfoDefaultX = this.getTermInfoDefaultX.bind(this);
    this.getTermInfoDefaultY = this.getTermInfoDefaultY.bind(this);
    this.getTermInfoDefaultWidth = this.getTermInfoDefaultWidth.bind(this);
    this.getTermInfoDefaultHeight = this.getTermInfoDefaultHeight.bind(this);

    this.buttonBarConfiguration = require('../../configuration/VFBTermInfo/VFBTermInfoConfiguration').buttonBarConfiguration;
    this.buttonBarControls = require('../../configuration/VFBTermInfo/VFBTermInfoConfiguration').buttonBarControls;

    this.data = [];
    this.idWidget = "vfbterminfowidget";
  }

  getTermInfoDefaultWidth () {
    return Math.ceil(window.innerWidth / 4);
  }

  getTermInfoDefaultHeight () {
    return ((window.innerHeight - Math.ceil(window.innerHeight / 4)) - 65);
  }

  getTermInfoDefaultX () {
    return (window.innerWidth - (Math.ceil(window.innerWidth / 4) + 10));
  }

  getTermInfoDefaultY () {
    return 55;
  }


  closeHandler () {
    console.log("close handler called");
    this.props.termInfoHandler();
  }


  setTermInfo (data, name) {
    // check if to level has been passed:
    if (data.parent == null) {
      if (data[data.getId() + '_meta'] != undefined) {
        data = data[data.getId() + '_meta'];
        console.log('meta passed to term info for ' + data.parent.getName());
      }
    }
    if (this.refs.termInfoRef != undefined) {
      for ( var i = 0, nodePresent = false; i < this.data.length; i++) {
        if (this.data[i].getId() === data.getId()) {
          nodePresent = true;
          this.data.unshift(this.data.splice(i, 1)[0]);
        }
      }
      if (nodePresent === false) {
        this.data.unshift(data);
      }
      this.refs.termInfoRef.setData(data);
      this.refs.termInfoRef.setName(data.name);
    }
    if (this.props.focusTermRef !== undefined) {
      this.props.focusTermRef.setInstance(data);
    }
    GEPPETTO.SceneController.deselectAll();
    if (typeof data.getParent().select === "function") {
      data.getParent().select(); // Select if visual type loaded.
    }

    if (this.props.onLoad !== undefined) {
      let parent = data.getParent();
      if (parent !== null) {
        this.props.onLoad(parent.getId());
      } else {
        this.props.onLoad(data.getId());
      }
    }
  }


  customHandler (node, path, widget) {
    try {
      // handling path consisting of a list. Note: first ID is assumed to be the template followed by a single ID (comma separated) 
      if (path.indexOf("[") == 0) {
        var templateID = path.split(',')[0].replace('[','');
        var instanceID = path.split(',')[1].replace(']','');
        if (templateID != window.templateID) {
          // open new window with the new template and the instance ID
          window.ga('vfb.send', 'event', 'request', 'newtemplate', templateID);
          if (confirm("The image you requested is aligned to another template. \nClick OK to open in a new tab or Cancel to just view the image metadata.")) {
            if (window.EMBEDDED) {
              var curHost = parent.document.location.host;
              var curProto = parent.document.location.protocol;
            } else {
              var curHost = document.location.host;
              var curProto = document.location.protocol;
            }
            var targetWindow = '_blank';
            var newUrl = window.redirectURL.replace(/\$VFB_ID\$/gi, instanceID).replace(/\$TEMPLATE\$/gi, templateID).replace(/\$HOST\$/gi, curHost).replace(/\$PROTOCOL\$/gi, curProto);  
            window.ga('vfb.send', 'event', 'opening', 'newtemplate', path);
            window.open(newUrl, targetWindow);
          } else {
            window.ga('vfb.send', 'event', 'cancelled', 'newtemplate', path);
          }
          // passing only the instance ID for processing 
          path = instanceID;
        } else {
          // as same template pass only the instance ID for processing 
          path = instanceID;
        }
      }
      if (path.indexOf(GRAPHS) === 0 ) {
        // Show Graph
        const { vfbGraph } = this.props;
        /*
         * Path contains the instance and the index of the drop down query options
         * Path is of type : "instance_path, query_index"
         */
        vfbGraph(SHOW_GRAPH, Instances.getInstance(path.split(',')[1]), path.split(',')[2], true, true);
        
        // Notify VFBMain UI needs to be updated
        this.props.uiUpdated();
        return;
      }
      if (path.indexOf(CIRCUIT_BROWSER) === 0 ) {
        // Show Circuit Browser
        const { vfbCircuitBrowser } = this.props;
        const selectedQuery = { label : path.split(',')[1] + " (" + path.split(',')[2] + ")" , id : path.split(',')[2] };
        /*
         * Path contains the instancE ID passed to the circuit browser
         */
        vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, selectedQuery, true);
        
        // Notify VFBMain UI needs to be updated
        this.props.uiUpdated();
        return;
      }
      var Query = require('@geppettoengine/geppetto-core/model/Query');
      var otherId;
      var otherName;
      var target = widget;
      var that = this;
      var meta = path + "." + path + "_meta";
      var n = window[meta];

      if (n != undefined) {
        var metanode = Instances.getInstance(meta);
        if ((this.data.length > 0) && (this.data[0] == metanode)) {
          for ( var i = 0, nodePresent = false; i < this.data.length; i++) {
            if (this.data[i].getId() === metanode.getId()) {
              nodePresent = true;
              this.data.unshift(this.data.splice(i, 1)[0]);
            }
          }
          if (nodePresent === false) {
            this.data.unshift(metanode);
          }
        }
        this.setTermInfo(metanode, metanode.name);
        window.resolve3D(path);
      } else {
        // check for passed ID:
        if (path.indexOf(',') > -1) {
          otherId = path.split(',')[1];
          otherName = path.split(',')[2];
          path = path.split(',')[0];
        } else {
          if (this.data.length) {
            otherId = this.data[0].getParent();
          } else {
            otherId = this.data.getParent();
          }
          otherName = otherId.name;
          otherId = otherId.id;
        }
        // try to evaluate as path in Model
        var entity = Model[path];
        if (typeof (entity) != 'undefined' && entity instanceof Query) {
          // clear query builder unless ctrl pressed them add to compound.
          console.log('Query requested: ' + path + " " + otherName);
          GEPPETTO.trigger('spin_logo');

          this.props.queryBuilder.open();
          this.props.queryBuilder.switchView(false, false);
          if (GEPPETTO.isKeyPressed("shift") && confirm("You selected a query with shift pressed indicating you wanted to combine with an existing query. \nClick OK to see combined results or Cancel to just view the results of this query alone.\nNote: If shift is not pressed please press and release to clear the flag.")) {
            console.log('Query stacking requested.');
          } else {
            this.props.queryBuilder.clearAllQueryItems();
            $('#add-new-query-container')[0].hidden = true;
            $('#query-builder-items-container')[0].hidden = true;
          }
          
          /**
           *  Fire event to set the Shift key as not pressed, this is needed since the presence of the 
           *  confirm() dialog prevents the DOM to un-set the 'shift' key.
           */
          var e = new KeyboardEvent('keyup', { bubbles : true, cancelable : true, shiftKey : false });
          document.querySelector("body").dispatchEvent(e);
          
          $("body").css("cursor", "progress");


          $('#add-new-query-container')[0].hidden = true;
          $('#query-builder-items-container')[0].hidden = true;
          $("#query-builder-footer").show();
          $("#run-query-btn").hide();
          
          setTimeout(function () {
            $("#query-error-message").text("Pulling a large number of results (2 mins max). Click anywhere to run in background or Esc to quit.").show();
          }, 10000);

          var callback = function () {
            // check if any results with count flag
            if (that.props.queryBuilder.props.model.count > 0) {
              // runQuery if any results
              that.props.queryBuilder.runQuery();
            } else {
              that.props.queryBuilder.switchView(false);
            }
            // show query component
            that.props.queryBuilder.open();
            $("body").css("cursor", "default");
            GEPPETTO.trigger('stop_spin_logo');
          };
          // add query item + selection
          if (window[otherId] == undefined) {
            window.fetchVariableThenRun(otherId, function () {
              that.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback)
            });
          } else {
            setTimeout(function () {
              that.props.queryBuilder.addQueryItem({ term: otherName, id: otherId, queryObj: entity }, callback);
            }, 100);
          }
        } else {
          Model.getDatasources()[3].fetchVariable(path, function () {
            var m = Instances.getInstance(meta);
            this.setTermInfo(m, m.name);
            window.addVfbId(path);
          }.bind(this));
        }
      }
    } catch (e) {
      // error handling link
      console.error("Issue loading: " + path);
      console.error(e.message);
      console.trace();
    }
    return;
  }

  componentDidUpdate () {

  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions);
    if ((this.props.termInfoName !== undefined) && (this.props.termInfoId !== undefined)) {
      // Whatever the instance is, extract the meta component
      let instance = this.props.termInfoName;
      if (instance.getId().indexOf("_meta") === -1 && instance.getParent() !== null) {
        instance = instance.getParent();
          
        let meta = instance[instance.getId() + '_meta'];
        if ( meta ){
          instance = meta;
        }
      }
      this.setTermInfo(instance, this.props.termInfoId);
    }
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions () {
    if (this.refs.termInfoRef !== undefined) {
      /*
       * this.refs.termInfoRef.setPosition(this.getTermInfoDefaultX(), this.getTermInfoDefaultY());
       * this.refs.termInfoRef.setSize(this.getTermInfoDefaultHeight(), this.getTermInfoDefaultWidth());
       */
    } else {
      this.setState({
        coordX: this.getTermInfoDefaultX(),
        coordY: this.getTermInfoDefaultY(),
        widgetHeight: this.getTermInfoDefaultHeight(),
        widgetWidth: this.getTermInfoDefaultWidth()
      });
    }
  }

  render () {
    return (
      <VFBTermInfo
        id={this.idWidget}
        ref="termInfoRef"
        order={this.props.order}
        exclude={this.props.exclude}
        closeHandler={this.closeHandler}
        customHandler={this.customHandler}
        showButtonBar={this.props.showButtonBar}
        buttonBarControls={this.buttonBarControls}
        termInfoHandler={this.props.termInfoHandler}
        buttonBarConfiguration={this.buttonBarConfiguration} />
    );
  }
}

function mapStateToProps (state) {
  return { ...state }
}

function mapDispatchToProps (dispatch) {
  return { 
    vfbCircuitBrowser: (type, instance, visible) => dispatch ( { type : type, data : { instance : instance, visible : visible } }),
    vfbGraph: (type, path, index, visible, sync) => dispatch ( { type : type, data : { instance : path, queryIndex : index, visible : visible, sync : sync } })
  }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(VFBTermInfoWidget);
