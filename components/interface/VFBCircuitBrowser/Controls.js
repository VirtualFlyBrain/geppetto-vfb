import React, { Component } from 'react'
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Slider from '@material-ui/core/Slider';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import RoomIcon from '@material-ui/icons/Room';
import AdjustIcon from '@material-ui/icons/Adjust';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { connect } from "react-redux";
import { UPDATE_CIRCUIT_QUERY } from './../../../actions/generals';
import { getResultsSOLR } from "../../configuration/VFBCircuitBrowser/datasources/SOLRclient";
import axios from 'axios';
import { termKind, splitLabel, fieldsConnectome, connectomeFilter, hasConnectomeNeurons } from './circuitPaths';

/**
 * Create a local theme to override some default values in material-ui components
 */
const theme = createMuiTheme({
  props: { MuiSvgIcon: { htmlColor: 'white', } },
  overrides : {
    MuiSlider: {
      markLabelActive: { color: 'white' },
      markLabel: { color: 'white' }
    }
  },
  typography: { body1: { fontFamily : ['Barlow Condensed', 'Khand', "sans-serif"] } }
});

/**
 * Styling changes that can't be applied to theme to avoid making it global
 */
const styles = theme => ({
  root: { 
    position: "absolute",
    bottom: "0",
    zIndex: "100",
    width : "30rem",
    // Never wider or taller than the panel it sits in
    maxWidth : "100%",
    maxHeight : "100%",
    overflowY : "auto",
    background: "#413C3C",
    color : "white"
  },
  expanded: { minHeight : "15px !important", margin : "0px !important" },
  // Override default padding in Add Neuron button
  addNeuron : { padding : "0px" },
  reverseNeurons : { padding : "0 !important" },
  // Override default padding in Delete Neuron button
  deleteNeuron : { padding : "2vh 0px 0px 4px" },
  dottedIcon : { margin : "1rem 0 1rem 0 " },
  legend : {
    margin : 0,
    padding: "0.6rem 1rem",
    listStyleType : "none",
    position: "absolute",
    top : 0,
    right : 0,
    boxSizing : "border-box",
    // Leave the zoom buttons on the left clear, and scroll rather than run off a short panel
    maxWidth : "calc(100% - 4rem)",
    maxHeight : "100%",
    overflowY : "auto",
    backgroundColor : "#413C3C",
    fontFamily : "'Barlow Condensed', 'Khand', sans-serif",
    fontSize : "14px",
    zIndex: "100"
  },
  // First row: the dataset shown and the button that folds the key away
  legendHeader : { display : "flex", alignItems : "center", whiteSpace : "nowrap" },
  legendToggle : { marginLeft : "auto", padding : "0 0 0 0.6rem", transition : "transform 150ms" },
  legendToggleOpen : { transform : "rotate(180deg)" },
  // Colours sit side by side and wrap, rather than one to a row
  legendColour : { display : "inline-block", marginRight : "1.2rem", whiteSpace : "nowrap" },
  legendItem :{
    position: "relative",
    top: "2px",
    display : "inline-block",
    marginRight : "0.5rem",
    height : "1.3rem",
    width : "1.3rem"
  },
  weightInput : { 
    color : "white !important",
    height : "20px",
    border : "none !important",
    backgroundColor: "#80808040 !important",
    paddingLeft : "10px !important",
    fontSize : "15px !important"
  },
  weightInputDiv : { width : "100% !important" },
  refreshButton : {
    backgroundColor : "#0AB7FE",
    flexBasis: "100%",
    fontWeight : 600,
    fontSize: '12px',
    fontFamily: ['Barlow Condensed', 'Khand', "sans-serif"]
  },
  clearButton : {
    backgroundColor : "#E53935",
    flexBasis: "100%",
    fontWeight : 600,
    fontSize: '12px',
    fontFamily: ['Barlow Condensed', 'Khand', "sans-serif"]
  },
  slider : { color: '#0AB7FE' },
  typography : { fontSize : "15px" },
  // Class / Individual tag on search results and on the chosen term
  kindTag : {
    display : "inline-block",
    flexShrink : 0,
    marginRight : "6px",
    padding : "0 4px",
    borderRadius : "3px",
    fontSize : "11px",
    lineHeight : "16px",
    color : "white"
  },
  kindClass : { backgroundColor : "#0A7FB0" },
  kindIndividual : { backgroundColor : "#6D6D6D" },
  noNeuronsTag : {
    marginLeft : "6px",
    padding : "0 4px",
    borderRadius : "3px",
    fontSize : "11px",
    lineHeight : "16px",
    border : "1px solid #9E9E9E",
    color : "#BDBDBD"
  },
  legendSelect : {
    marginLeft : "6px",
    minWidth : 0,
    maxWidth : "20rem",
    textOverflow : "ellipsis",
    backgroundColor : "#80808040",
    color : "white",
    border : "none",
    fontFamily : "inherit",
    fontSize : "14px"
  },
  legendNote : { maxWidth : "24rem", whiteSpace : "normal" },
  // A search result: its tag, then the name over what the search adds in brackets
  option : { padding : "3px 8px", alignItems : "flex-start" },
  optionRow : { display : "flex", alignItems : "flex-start", width : "100%", minWidth : 0 },
  optionText : { flex : "1 1 auto", minWidth : 0, lineHeight : "16px" },
  optionName : { display : "block", overflow : "hidden", textOverflow : "ellipsis", whiteSpace : "nowrap" },
  optionDetail : { display : "block", overflow : "hidden", textOverflow : "ellipsis", whiteSpace : "nowrap", fontSize : "12px", color : "#757575" },
  optionNoNeurons : { flexShrink : 0, marginLeft : "6px" }
});

// Height of a row of the results list, and the most rows shown before it scrolls
const OPTION_HEIGHT = 38;
const MAX_OPTIONS_SHOWN = 8;
// The list's paper margins and padding, with a little clearance from the panel edge
const LIST_SURROUND = 28;

/**
 * The panel the query box sits in, and the box itself, for a search field.
 */
const fieldSurroundings = field => {
  const box = field && field.closest ? field.closest(".MuiAccordion-root") : null;
  return { box, panel : box ? box.offsetParent : null };
};

/**
 * The results list as wide as the whole query box rather than the search
 * field, and opening above the field when the panel has no room below it.
 * It is drawn in the panel rather than inside the query box, so the box can
 * scroll on a short panel without cutting the list off.
 */
const ResultsPopper = props => {
  const { box, panel } = fieldSurroundings(props.anchorEl);
  const width = box ? box.clientWidth - 16 : props.style?.width;
  return (
    <Popper
      {...props}
      container={panel}
      disablePortal={!panel}
      style={{ ...props.style, width }}
      placement="bottom-start"
      modifiers={{
        // Keep it inside the query box sideways, and inside the panel up and down
        preventOverflow : { boundariesElement : box || "scrollParent", priority : ["left", "right"], padding : 8 },
        flip : { boundariesElement : panel || "viewport", padding : 0 }
      }}
    />
  );
};

/**
 * "Class" for a neuron type, "Individual" for a neuron. Solr's facets say
 * which when we have them; otherwise go by the id (FBbt_ classes, VFB_ neurons).
 */
const kindOf = (id, facets) => {
  if ( Array.isArray(facets) ) {
    if ( facets.includes("Class") ) {
      return "Class";
    }
    if ( facets.includes("Individual") ) {
      return "Individual";
    }
  }
  return termKind(id);
};

const KindTag = ({ kind, classes }) => (
  <span
    className={classes.kindTag + " " + (kind === "Class" ? classes.kindClass : classes.kindIndividual) + " circuitTermKind"}
    title={kind === "Class" ? "Class: a neuron type, searched in every connectome that has it" : "Individual: one neuron, in its own connectome"}
  >{kind}</span>
);

/**
 * Read configuration from circuitBrowserConfiguration
 */
const configuration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').configuration;
const stylingConfiguration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').styling;
const circuitPathsConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').circuitPathsConfig;
const searchConfiguration = require('./../../configuration/VFBCircuitBrowser/datasources/SOLRclient').searchConfiguration;
const defaultDatasourceConfiguration = require('./../../configuration/VFBCircuitBrowser/datasources/SOLRclient').datasourceConfiguration;
const datasourceConfiguration = JSON.parse(JSON.stringify(defaultDatasourceConfiguration));

/**
 * Create custom marks for Paths slider.
 * Only show the label for the minimum and maximum paths, hide the rest
 */
const customMarks = () => {
  let marks = new Array(configuration.maxPaths);
  for ( var i = 0; i < marks.length; i++ ) {
    if ( i == 0 || i == marks.length - 1 ) {
      marks[i] = { value : i + 1, label : (i + 1).toString() };
    } else {
      marks[i] = { value : i + 1 };
    }
  }
  
  return marks;
}

const pattern = /^[a-zA-Z0-9].*_[a-zA-Z0-9]{8}$/;

/*
 * The neuron types with neurons in the circuit graphs being served, from
 * /circuit_paths/terms, fetched once. Until it arrives (or if it fails, when
 * it is asked for again next time) every type can be chosen.
 */
let knownTerms = null;
let knownTermsRequest = null;
const loadKnownTerms = () => {
  if ( !knownTermsRequest ) {
    knownTermsRequest = axios.get(circuitPathsConfig.url + "/terms", { timeout : 30000 })
      .then(response => {
        knownTerms = new Set(response.data.terms || []);
      })
      .catch(() => {
        knownTermsRequest = null;
      });
  }
  return knownTermsRequest;
};

class AutocompleteResults extends Component {
  constructor (props) {
    super(props);
    this.state = { filteredResults: {}, listHeight : OPTION_HEIGHT * 4 };
    this.listOpened = this.listOpened.bind(this);
    this.handleResults = this.handleResults.bind(this);
    this.fieldLabel = this.props.field.label;
  }
  
  /**
   * Receives SOLR results and creates an map with those results that match the input text
   */
  handleResults (status, data, value){
    let results = {};
    data?.map(result => {
      results[result?.label] = result;
    });
          
    this.setState({ filteredResults : results });
  }
  
  /**
   * The results list takes the room the panel has above or below the field,
   * whichever is larger, up to MAX_OPTIONS_SHOWN rows.
   */
  listOpened (event) {
    const field = event?.target?.closest ? event.target.closest(".MuiAutocomplete-root") : null;
    const { panel } = fieldSurroundings(field);
    if ( !field || !panel ) {
      return;
    }
    const at = field.getBoundingClientRect();
    const within = panel.getBoundingClientRect();
    // Less the list's own margins and padding, so it fits on the side it opens
    const room = Math.max(at.top - within.top, within.bottom - at.bottom) - LIST_SURROUND;
    const listHeight = Math.max(OPTION_HEIGHT * 2, Math.min(OPTION_HEIGHT * MAX_OPTIONS_SHOWN, Math.floor(room)));
    if ( listHeight !== this.state.listHeight ) {
      this.setState({ listHeight });
    }
  }

  clearResults () {
    this.setState({ filteredResults : {} });  
  }
  
  getFilteredResults (){
    return this.state.filteredResults;
  }
  
  shouldComponentUpdate (nextProps, nextState) {
    this.fieldLabel = nextProps.getLatestNeuronFields()[this.props.index].label;
    return true;
  }
  
  render () {
    const { classes } = this.props;
    // The first field is where paths start, the last where they end
    const label = (this.props.index === 0 ? "From" : "To") + ": neuron or neuron type";
    // Kept as neuron1/neuron2 for the tests
    const fieldClass = "neuron" + (this.props.index + 1).toString();
    const results = this.state.filteredResults;
    const usable = option => {
      const result = results[option];
      return hasConnectomeNeurons(result?.short_form, kindOf(result?.short_form, result?.facets_annotation), knownTerms);
    };
    // Types with no connectome neurons are listed last, and cannot be chosen
    const options = Object.keys(results).map(option => results[option].label)
      .sort((a, b) => Number(!usable(a)) - Number(!usable(b)));
    // Tag the chosen term; text still being typed has its label equal to its id
    const fieldId = this.props.field?.id;
    const fieldKind = fieldId && fieldId.match(pattern) && this.fieldLabel && this.fieldLabel !== fieldId ? termKind(fieldId) : null;
    
    return (
      <Autocomplete
        fullWidth
        freeSolo
        disableClearable
        clearOnEscape
        autoHighlight
        clearOnBlur
        value={this.fieldLabel}
        id={this.props.index.toString()}
        PopperComponent={ResultsPopper}
        onOpen={this.listOpened}
        classes={{ option : classes.option }}
        ListboxProps={{ style: { maxHeight: this.state.listHeight + "px", fontSize: "15px", padding : "4px 0" } }}
        onChange={this.props.resultSelectedChanged}
        options={options}
        getOptionDisabled={option => !usable(option)}
        renderOption={option => {
          const result = results[option];
          const { name, detail } = splitLabel(option);
          return (
            <span className={classes.optionRow + " circuitOption"} title={option}>
              <KindTag kind={kindOf(result?.short_form, result?.facets_annotation)} classes={classes} />
              <span className={classes.optionText}>
                <span className={classes.optionName + " circuitOptionName"}>{name}</span>
                { detail ? <span className={classes.optionDetail + " circuitOptionDetail"}>{" (" + detail + ")"}</span> : null }
              </span>
              {usable(option) ? null
                : <span className={classes.noNeuronsTag + " " + classes.optionNoNeurons + " circuitNoNeurons"} title="No neurons of this type in any connectome, so it has no circuit paths">no connectome neurons</span>}
            </span>
          );
        }}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            key={this.props.field.id}
            className={fieldClass}
            onChange={this.props.neuronTextfieldModified}
            onBlur={this.props.textFieldLoseFocus}
            InputProps={{ ...params.InputProps, startAdornment : fieldKind ? <KindTag kind={fieldKind} classes={classes} /> : null }}
            inputProps={{ ...params.inputProps, id: this.props.index, title: this.fieldLabel || undefined, style: { height : "20px", color: "white" ,paddingLeft : "10px", fontSize: "15px", border : "none", backgroundColor: "#80808040" } }}
            InputLabelProps={{ ...params.inputProps,style: { color: "white", paddingLeft : "10px", fontSize: "15px" } }}
          />
        )}
      />
    )
  }
}

/**
 * Controls component used in VFBCircuitBrowser.
 */
class Controls extends Component {

  constructor (props) {
    super(props);
    this.state = {
      typingTimeout: 0,
      expanded : true,
      key : 1
    };
    this.weight = this.props.weight;
    this.paths = this.props.paths;
    this.addNeuron = this.addNeuron.bind(this);
    this.reverseNeurons = this.reverseNeurons.bind(this);
    this.neuronTextfieldModified = this.neuronTextfieldModified.bind(this);
    this.textFieldLoseFocus = this.textFieldLoseFocus.bind(this);
    this.typingTimeout = this.typingTimeout.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.weightChange = this.weightChange.bind(this);
    this.fieldsValidated = this.fieldsValidated.bind(this);
    this.deleteNeuronField = this.deleteNeuronField.bind(this);
    this.getUpdatedNeuronFields = this.getUpdatedNeuronFields.bind(this);
    this.resultSelectedChanged = this.resultSelectedChanged.bind(this);
    this.setNeurons = this.setNeurons.bind(this);
    this.circuitQuerySelected = this.props.circuitQuerySelected;
    this.autoCompleteInput = React.createRef();
    this.neuronFields = [{ id : "", label : "" } , { id : "", label : "" }];
    this.createRefs = this.createRefs.bind(this);
    this.createRefs();
  }
  
  createRefs () { 
    this.autocompleteRef = {};
    for ( var i = 0 ; i < configuration.minNeurons; i++ ){
      this.autocompleteRef[i.toString()] = React.createRef();
    }
  }
  
  componentDidMount () {
    this.mounted = true;
    loadKnownTerms().then(() => this.mounted && this.forceUpdate());
    this.neuronFields = [...this.props.neurons];
    this.setState( { expanded : !this.props.resultsAvailable() } );
    this.circuitQuerySelected = this.props.circuitQuerySelected;
    this.setInputValue = {};
  }
  
  componentDidUpdate () {}

  componentWillUnmount () {
    this.mounted = false;
  }

  /**
   * Deletes neuron field, updates control component right after
   */
  deleteNeuronField (event) {
    let id = parseInt(event.target.id);
    if ( event.target.id === "" ) {
      id = parseInt(event.target.parentElement.id);
    }
    
    // remove neuron textfield
    let neurons = this.neuronFields;
    neurons.splice(id,1);
    this?.props?.circuitQuerySelected?.splice(id, 1);
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, neurons);
    delete this.autocompleteRef[id.toString()];
    this.neuronFields = neurons;
    if ( !this.neuronFields.find( neuron => neuron.id != "") ) {
      // reset configuration of fq to default
      datasourceConfiguration.query_settings.fq = defaultDatasourceConfiguration.query_settings.fq;
    }

    this.forceUpdate();
  }
  
  /**
   * Add neuron textfield
   */
  addNeuron () {
    let neuronFields = this.neuronFields;
    // Add emptry string for now to text field
    neuronFields.push({ id : "", label : "" });
    // User has added the maximum number of neurons allowed in query search
    this.neuronFields = neuronFields;
    this.autocompleteRef[(neuronFields.length - 1).toString()] = React.createRef();
    this.forceUpdate();
  }
  
  /**
   * Reverse neurons textfield
   */
  reverseNeurons () {
    let neuronFields = this.neuronFields;
    [neuronFields[0], neuronFields[neuronFields.length - 1]] = [neuronFields[neuronFields.length - 1], neuronFields[0]]
    // User has added the maximum number of neurons allowed in query search
    this.neuronFields = neuronFields;
    this.autocompleteRef[(neuronFields.length - 1).toString()] = React.createRef();
    datasourceConfiguration.query_settings.fq = defaultDatasourceConfiguration.query_settings.fq;
    this.forceUpdate();
  }

  /**
   * Validates neurons ID's are valid, checks there's at least 8 numbers in it
   */
  fieldsValidated (neurons) {
    for ( var i = 0 ; i < neurons.length ; i++ ){
      if ( neurons?.[i].id == "" ) {
        return false;
      } else if ( !neurons?.[i].id?.match(pattern) ) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Waits some time before performing new search, this to avoid performing search everytime
   * enters a new character in neuron fields
   */
  typingTimeout (target) {
    this.setInputValue = target.id;
    if ( target.id === "" ) {
      this.setInputValue = target.parentElement.id;
    }
    let neurons = this.neuronFields;

    if ( neurons[parseInt(target.id)] ) {
      neurons[parseInt(target.id)] = { id : target.value, label : target.value };
    } else {
      neurons.push({ id : target.value, label : target.value });
    }

    this.neuronFields = neurons;
    const callback = this.wrapResultsCallback(this.autocompleteRef[this.setInputValue].current.handleResults, this.setInputValue);
    getResultsSOLR( target.value, callback, searchConfiguration.sorter, this.searchSettings(this.setInputValue) );
  }
  
  textFieldLoseFocus (event) {
    var pattern = /^[a-zA-Z0-9].*_[a-zA-Z0-9]{8}$/;
    console.log("Event ", event.target);
    
    const matchNeuron = this.neuronFields[event.target.id];
    if ( matchNeuron.id == "" || !matchNeuron.id.match(pattern) || ( matchNeuron.id == matchNeuron.label )) {
      this.neuronFields[event.target.id] = { id : "", label : "" };
      this.props.clearNeurons(this.neuronFields);
    }
  }
  
  
  /**
   * The search settings for field `editing`, limited in SOLR to the connectome
   * of a neuron chosen in another field (and to neuron types), so the row limit
   * does not cut that connectome's neurons out of the results.
   */
  searchSettings (editing) {
    const connectome = fieldsConnectome(this.neuronFields, editing);
    if ( !connectome ) {
      return datasourceConfiguration;
    }
    const settings = JSON.parse(JSON.stringify(datasourceConfiguration));
    settings.query_settings.fq.push(connectomeFilter(connectome));
    return settings;
  }

  /**
   * Wraps the autocomplete handleResults callback to filter results by connectome.
   * When a neuron has been chosen in another field, searches in field `editing` only
   * show neurons from the same connectome, as paths between neurons stay within one.
   * Neuron types (classes) are always offered: a type is searched in the neuron's connectome.
   */
  wrapResultsCallback (handleResults, editing) {
    const connectome = fieldsConnectome(this.neuronFields, editing);
    return function (status, data, value) {
      if ( connectome && data ) {
        data = data.filter(item => kindOf(item.short_form, item.facets_annotation) === "Class"
          || (item.label && item.label.includes(connectome + ':')));
      }
      handleResults(status, data, value);
    };
  }

  /**
   * Neuron text field has been modified.
   */
  neuronTextfieldModified (event) {
    this.resultsHeight = event.target.offsetTop + 15;
    // Remove old typing timeout interval
    if (this.state.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.setInputValue = event.target.id;
    if ( event.target.id.id === "" ) {
      this.setInputValue = event.target.parentElement.id;
    }
    let neurons = this.neuronFields;

    if ( neurons[parseInt(event.target.id)] ) {
      neurons[parseInt(event.target.id)] = { id : event.target.value, label : event.target.value };
    } else {
      neurons.push({ id : event.target.value, label : event.target.value });
    }

    if ( event?.nativeEvent?.inputType === "deleteContentBackward" && neurons?.find( (neuron, index) => neuron.id === "" && index.toString() === event.target.id )){
      this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, neurons);
    } else {
      const callback = this.wrapResultsCallback(this.autocompleteRef[this.setInputValue].current.handleResults, this.setInputValue);
      getResultsSOLR( event.target.value, callback, searchConfiguration.sorter, this.searchSettings(this.setInputValue) );
    }
    this.neuronFields = neurons;

    if ( !this.neuronFields.find( neuron => neuron.id != "") ) {
      // reset configuration of fq to default
      this.autocompleteRef[this.setInputValue].current.clearResults();
      datasourceConfiguration.query_settings.fq = defaultDatasourceConfiguration.query_settings.fq;
    }
  }
  
  /**
   * Handle SOLR result selection, activated by selecting from drop down menu under textfield
   */
  resultSelectedChanged (event, value, index) {
    // Copy neurons and add selection to correct array index
    let neurons = this.neuronFields;
    let textFieldId = event.target.id.toString().split("-")[0];
    let result = this.autocompleteRef[textFieldId].current.getFilteredResults()[value];
    let shortForm = result && result.short_form;
    neurons[index] = { id : shortForm, label : value };

    // Keep track of query selected, and send an event to redux store that circuit has been updated
    this.circuitQuerySelected = neurons;
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, neurons);

    // If text fields contain valid ids, perform query
    if ( this.fieldsValidated(neurons) ) {
      this.neuronFields = neurons;
    }
  }
  
  /**
   * Paths slider has been dragged, value has changed
   */
  sliderChange (event, value ) {
    this.paths = value;
  }
  
  weightChange (event ) {
    this.weight = event.target.value;
  }

  setNeurons () {
    this.neuronFields = [{ id : "", label : "" } , { id : "", label : "" }];
    while (this?.props?.circuitQuerySelected.length > 0) {
      this?.props?.circuitQuerySelected.pop();
    }
    datasourceConfiguration.query_settings.fq = defaultDatasourceConfiguration.query_settings.fq;
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, [])
    this.setState({ key: Math.random() });
  }
  
  clearGraph () {
    datasourceConfiguration.query_settings.fq = defaultDatasourceConfiguration.query_settings.fq;
    this.props.clearGraph()
  }
  
  /**
   * Update neuron fields if there's a query preselected.
   */
  getUpdatedNeuronFields () {
    let neuronFields = this.neuronFields;
    let added = false;
    for ( var i = 0; i < this.props.circuitQuerySelected.length; i++ ){
      var fieldExists = this.neuronFields.find(entry =>
        entry.id === this.props.circuitQuerySelected[i] || entry.id === this.props.circuitQuerySelected?.[i]?.id
      );

      if ( !fieldExists) {
        const selected = this.props.circuitQuerySelected[i];
        const selectedId = selected.id ? selected.id : selected;
        const selectedLabel = selected.label ? selected.label : selected;
        const emptyIndex = neuronFields.findIndex( field => field.id === "");
        if ( emptyIndex >= 0 ) {
          neuronFields[emptyIndex] = { id : selectedId, label : selectedLabel };
          added = true;
          fieldExists = true;
          break;
        } else {
          neuronFields.pop();
          neuronFields.push({ id : selectedId, label : selectedLabel });
        }

        if ( this.props.circuitQuerySelected.length > neuronFields.length && !fieldExists && selected?.id != "") {
          if ( this.props.circuitQuerySelected !== "" ) {
            neuronFields.push({ id : selectedId, label : selectedLabel });
          }
        }
      }
    }

    return neuronFields;
  }
  
  render () {
    let self = this;
    const { classes } = this.props;
    this.circuitQuerySelected = this.props.circuitQuerySelected;
    let neuronFields = this.getUpdatedNeuronFields();
    
    let expanded = this.state.expanded;
    if ( this.props.resultsAvailable() ){
      expanded = true;
    }
    
    let disabledRun = !self.fieldsValidated(self.neuronFields);
    const summary = this.props.datasetSummary;
    // Open unless the user has folded the key away
    const legendOpen = this.props.legendOpen !== false;
    
    // Show delete icon on neuron text fields only if there's more than the minimum allowed
    let deleteIconVisible = neuronFields.length > configuration.minNeurons;
    // The grid item size with the neuron textfield will depend on whether or not delete icon is visible
    let neuronColumnSize = deleteIconVisible ? 11 : 12 ;
    // Only show Add Neuron button if the maximum hasn't been reached
    let addNeuronDisabled = neuronFields.length >= configuration.maxNeurons;
    
    return (
      <ThemeProvider theme={theme}>
        <div>
          <div style={ { position: "absolute", width: ".75vh", height: "10vh",zIndex: "100" } }>
            <i style={ { zIndex : "1000" , cursor : "pointer", top : "10px", left : "10px" } } className={stylingConfiguration.controlIcons.home} onClick={self.props.resetCamera }></i>
            <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "20px", left : "10px" } } className={stylingConfiguration.controlIcons.zoomIn} onClick={self.props.zoomIn }></i>
            <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "5px", left : "10px" } } className={stylingConfiguration.controlIcons.zoomOut} onClick={self.props.zoomOut }></i>
          </div>
          { this.props.resultsAvailable()
            ? <ul className={classes.legend} id="circuitBrowserLegend">
              <li className={classes.legendHeader}>
                Dataset
                <select
                  id="circuitBrowserDataset"
                  className={classes.legendSelect}
                  value={this.props.dataset || ""}
                  onChange={event => this.props.selectDataset(event.target.value)}
                >
                  { (this.props.datasets || []).map(option => (
                    <option key={option.dataset} value={option.dataset}>{option.name + " (" + option.paths + (option.paths === 1 ? " path)" : " paths)")}</option>
                  ))}
                </select>
                <IconButton
                  id="circuitBrowserLegendToggle"
                  size="small"
                  color="inherit"
                  className={classes.legendToggle + (legendOpen ? " " + classes.legendToggleOpen : "")}
                  onClick={this.props.toggleLegend}
                  aria-expanded={legendOpen}
                  aria-label={legendOpen ? "Hide the key" : "Show the key"}
                  title={legendOpen ? "Hide the key" : "Show the key"}
                >
                  <ExpandMoreIcon fontSize="large" />
                </IconButton>
              </li>
              { legendOpen && summary?.level === "class"
                ? <li>
                  <label>
                    <input
                      type="checkbox"
                      id="circuitBrowserShowNeurons"
                      checked={!!this.props.showNeurons}
                      onChange={event => this.props.toggleNeurons(event.target.checked)}
                    /> Show example neurons (slower)
                  </label>
                </li>
                : null
              }
              { legendOpen && summary?.alsoFoundIn?.length
                ? <li className={classes.legendNote}>Some of these paths are also found in {summary.alsoFoundIn.join(", ")}</li>
                : null
              }
              { legendOpen && summary?.level === "class" && summary?.neuronsLeftOut
                ? <li className={classes.legendNote}>{summary.neuronsLeftOut} neurons without a type in this dataset are not included</li>
                : null
              }
              { legendOpen && this.props.message
                ? <li className={classes.legendNote}>{this.props.message}</li>
                : null
              }
              { (legendOpen ? this.props.legend : []).map((label, index) => (
                <li key={label} className={classes.legendColour}><div className={classes.legendItem} style={{ backgroundColor : stylingConfiguration.nodeColorsByLabel[label] }}></div>{label}</li>
              ))
              }
              { legendOpen ? <li>Links: synapses · share of target's input →</li> : null }
            </ul>
            : null
          }
          <Accordion key={this.state.key} className={classes.root} defaultExpanded={expanded} >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon fontSize="large" />}
              onClick={() => self.setState({ expanded : !expanded })}
              classes={{ expanded: classes.expanded }}
              IconButtonProps={{ style: { padding : "0px", margin : "0px" } }}
            >
              <div className={classes.column}>
                <Typography classes={{ root : classes.typography }}>Connectivity query</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails classes={{ root : classes.details }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item container sm={1} justifyContent="center" alignItems="center">
                  <div>
                    <AdjustIcon />
                    <MoreVertIcon classes={{ root : classes.dottedIcon }}/>
                    <RoomIcon />
                  </div>
                </Grid>
                <Grid style={ { marginRight : "1vh !important" } } id="neuronFieldsGrid" item sm={9}>
                  { neuronFields.map((field, index) => (
                    <Grid container alignItems="center" justifyContent="center" key={"TextFieldContainer" + index}>
                      <Grid item sm={neuronColumnSize} key={"TextFieldItem" + index}>
                        <AutocompleteResults
                          field={field}
                          index={index}
                          neuronTextfieldModified={this.neuronTextfieldModified}
                          textFieldLoseFocus={this.textFieldLoseFocus}
                          getLatestNeuronFields={this.getUpdatedNeuronFields}
                          resultSelectedChanged={(event, value) => this.resultSelectedChanged(event, value, index)}
                          classes={classes}
                          ref={this.autocompleteRef[index.toString()]}
                        />
                      </Grid>
                      { deleteIconVisible ? <Grid item sm={1}>
                        <IconButton
                          key={"TextFieldIcon-" + index}
                          onClick={self.deleteNeuronField}
                          fontSize="small"
                          id={"deleteNeuron" + ( index ).toString()}
                          classes = {{ root : classes.deleteNeuron }}>
                          <DeleteIcon id={index.toString()}/>
                        </IconButton>
                      </Grid>
                        : null
                      }
                    </Grid>
                  ))}
                </Grid>
                <Grid item container justifyContent="center" alignItems="center" sm={1}>
                  <IconButton
                    id="reverseNeurons"
                    color="inherit"
                    size="medium"
                    className={classes.reverseNeurons}
                    onClick={this.reverseNeurons}
                    style={ { paddingLeft : "1vh" } }
                  >
                    <SwapVertIcon fontSize="large" />
                  </IconButton>
                </Grid>
                { addNeuronDisabled 
                  ? null
                  : <Grid container style={ { marginTop : "1vh" } } justifyContent="space-between" alignItems="center">
                    <Grid item sm={2} classes={{ root : classes.addNeuron }}>
                      <IconButton
                        id="addNeuron"
                        color="inherit"
                        size="small"
                        onClick={this.addNeuron}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </Grid>
                    <Grid item sm={10} classes={{ root : classes.addNeuron }}>
                      <Typography classes={{ root : classes.typography }}>Add Neuron</Typography>
                    </Grid>
                  </Grid>
                }
              </Grid>
            </AccordionDetails>
            <Divider />
            <AccordionActions>
              <Grid container justifyContent="space-between" alignItems="center" >
                <Grid container spacing={1}>
                  <Grid item sm={3}>
                    <Typography classes={{ root : classes.typography }}># Paths</Typography>
                  </Grid>
                  <Grid item sm={9}>
                    <Slider
                      aria-labelledby="discrete-slider-always"
                      defaultValue={this.paths}
                      onChangeCommitted={this.sliderChange}
                      step={1}
                      marks={customMarks()}
                      valueLabelDisplay="auto"
                      min={configuration.minPaths}
                      max={configuration.maxPaths}
                      classes={{ root : classes.slider }}
                    />  
                  </Grid>
                </Grid>
                <Grid container spacing={1} alignItems="flex-end">
                  <Grid item sm={3}>
                    <Typography classes={{ root : classes.typography }} title="Minimum synapses per connection">Min Weight</Typography>
                  </Grid>
                  <Grid item sm={9}>
                    <Input className={classes.weightInputDiv} label="Graph weight" defaultValue={this.weight} onChange={this.weightChange} inputProps={{ 'aria-label': 'description', id : "weightField", className : classes.weightInput }} />
                  </Grid>
                  <Grid item container justifyContent="flex-end" sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      classes={{ root : classes.refreshButton }}
                      id="refreshCircuitBrowser"
                      onClick={() => this.props.updateGraph(this.neuronFields, this.paths, this.weight)}
                      disabled={disabledRun}
                    >Run Query</Button>  
                  </Grid>
                  <Grid item container justifyContent="flex-end" sm={6}>
                    <Button
                      variant="contained"
                      color="secondary"
                      classes={{ root : classes.clearButton }}
                      id="clearCircuitBrowser"
                      onClick={this.clearGraph.bind(this)}
                    >Clear</Button>  
                  </Grid>
                </Grid>
              </Grid>
            </AccordionActions>
          </Accordion>
        </div>
      </ThemeProvider>
    )
  }
}

Controls.propTypes = { classes: PropTypes.object.isRequired };

function mapStateToProps (state) {
  return { ...state }
}

function mapDispatchToProps (dispatch) {
  return { vfbCircuitBrowser: (type, neurons) => dispatch ( { type : type, data : { instance : neurons } }), }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(withStyles(styles)(Controls));
