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
import { DatasourceTypes } from '@geppettoengine/geppetto-ui/search/datasources/datasources';
import { getResultsSOLR } from "@geppettoengine/geppetto-ui/search/datasources/SOLRclient";

/**
 * Create a local theme to override some default values in material-ui components
 */
const theme = createMuiTheme({
  props: { MuiSvgIcon: { htmlColor: 'white', } },
  overrides : {
    MuiSlider: {
      markLabelActive: { color: 'white' },
      markLabel: { color: 'white' },
      markActive: { color: 'red' }
    },
    MuiButton: {
      label: {
        fontSize: '12px',
        fontFamily: ['Barlow Condensed', 'Khand', "sans-serif"]
      },
      button : { padding : "" }
    }
  },
  typography: {
    body1: {
      fontSize: 15,
      fontFamily : ['Barlow Condensed', 'Khand', "sans-serif"]
    }
  }
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
    padding: "2vh",
    listStyleType : "none",
    position: "absolute",
    right : "1rem",
    backgroundColor : "#413C3C",
    fontFamily : "'Barlow Condensed', 'Khand', sans-serif",
    zIndex: "100"
  },
  legendItem :{
    position: "relative",
    top: "2px",
    display : "inline-block",
    marginRight : "5vh",
    height : "2vh",
    width : "2vh"
  },
  weightInput : { 
    color : "white !important",
    height : "20px",
    border : "none !important",
    backgroundColor: "#80808040 !important",
    paddingLeft : "10px !important"
  },
  weightInputDiv : { width : "100% !important" }
});

/**
 * Read configuration from circuitBrowserConfiguration
 */
const configuration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').configuration;
const restPostConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').locationCypherQuery;
const stylingConfiguration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').styling;

const searchConfiguration = require('./../../configuration/VFBMain/searchConfiguration').searchConfiguration;
const datasourceConfiguration = require('./../../configuration/VFBMain/searchConfiguration').datasourceConfiguration;

/**
 * Create custom marks for Hops slider.
 * Only show the label for the minimum and maximum hop, hide the rest
 */
const customMarks = () => {
  let marks = new Array(configuration.maxHops);
  for ( var i = 0; i < marks.length; i++ ) {
    if ( i == 0 || i == marks.length - 1 ) {
      marks[i] = { value : i + 1, label : (i + 1).toString() };
    } else {
      marks[i] = { value : i + 1 };
    }
  }
  
  return marks;
}

class AutocompleteResults extends Component {
  constructor (props) {
    super(props);
    this.state = { filteredResults: {} };
    this.handleResults = this.handleResults.bind(this);
  }
  
  /**
   * Receives SOLR results and creates an map with those results that match the input text
   */
  handleResults (status, data, value){
    let results = {};
    console.log("Status ", status)
    console.log("Data ", data)
    console.log("Value ", value)
    data?.map(result => {
      // Match results by short_form id
      if ( result?.short_form?.toLowerCase().includes(value?.toLowerCase()) ){
        results[result?.label] = result;
      } else if ( result?.label?.toLowerCase().includes(value?.toLowerCase()) ){
        results[result?.label] = result;
      }
    });
    
    console.log("Results ", results)
      
    this.setState({ filteredResults : results });
  }
  
  getFilteredResults (){
    return this.state.filteredResults;
  }
  
  render () {
    const label = "Neuron " + (this.props.index + 1) .toString();

    return (
      <Autocomplete
        fullWidth
        freeSolo
        disableClearable
        disablePortal
        autoHighlight
        value={this.props.field.label}
        id={this.props.index.toString()}
        ListboxProps={{ style: { maxHeight: "10rem" } }}
        onChange={this.props.resultSelectedChanged}
        options={Object.keys(this.state.filteredResults).map(option => this.state.filteredResults[option].label)}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            key={this.props.field.id}
            className={label.replace(/ +/g, "").toLowerCase()}
            onChange={this.props.neuronTextfieldModified}
            inputProps={{ ...params.inputProps, id: this.props.index, style: { height : "20px", color: "white" ,paddingLeft : "10px", border : "none", backgroundColor: "#80808040" } }}
            InputLabelProps={{ ...params.inputProps,style: { color: "white", paddingLeft : "10px" } }}
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
    this.hops = this.props.hops;
    this.addNeuron = this.addNeuron.bind(this);
    this.reverseNeurons = this.reverseNeurons.bind(this);
    this.neuronTextfieldModified = this.neuronTextfieldModified.bind(this);
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
    this.neuronFields = [...this.props.neurons];
    this.setState( { expanded : !this.props.resultsAvailable() } );
    this.circuitQuerySelected = this.props.circuitQuerySelected;
    this.setInputValue = {};
  }
  
  componentDidUpdate () {}

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
    this.forceUpdate();
  }

  /**
   * Validates neurons ID's are valid, checks there's at least 8 numbers in it
   */
  fieldsValidated (neurons) {
    var pattern = /^[a-zA-Z0-9].*_[a-zA-Z0-9]{8}$/;
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
    getResultsSOLR( target.value, this.autocompleteRef[this.setInputValue].current.handleResults,searchConfiguration.sorter,datasourceConfiguration );
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
    // Create a setTimeout interval, to avoid performing searches on every stroke
    setTimeout(this.typingTimeout, 10, event.target);
  }
  
  /**
   * Handle SOLR result selection, activated by selecting from drop down menu under textfield 
   */
  resultSelectedChanged (event, value, index) {
    // Copy neurons and add selection to correct array index
    let neurons = this.neuronFields;
    let textFieldId = event.target.id.toString().split("-")[0];
    let shortForm = this.autocompleteRef[textFieldId].current.getFilteredResults()[value] && this.autocompleteRef[textFieldId].current.getFilteredResults()[value].short_form;
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
   * Hops slider has been dragged, value has changed
   */
  sliderChange (event, value ) {
    this.hops = value;
  }
  
  weightChange (event ) {
    this.weight = event.target.value;
  }

  setNeurons () {
    this.neuronFields = [{ id : "", label : "" } , { id : "", label : "" }];
    while (this?.props?.circuitQuerySelected.length > 0) {
      this?.props?.circuitQuerySelected.pop();
    }
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, [])
    this.setState({ key: Math.random() });
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
        for ( var j = 0 ; j < neuronFields.length ; j++ ) {
          if ( neuronFields?.[j].id === "" ) {
            neuronFields[j] = { id : this.props.circuitQuerySelected[i].id ? this.props.circuitQuerySelected[i].id : this.props.circuitQuerySelected[i], label : this.props.circuitQuerySelected[i].label ? this.props.circuitQuerySelected[i].label : this.props.circuitQuerySelected[i] };
            added = true;
            fieldExists = true;
            break;
          }
        }
        
        if ( this.props.circuitQuerySelected.length > neuronFields.length && !fieldExists && this.props.circuitQuerySelected?.[i]?.id != "") {
          if ( this.props.circuitQuerySelected !== "" ) {
            neuronFields.push({ id : this.props.circuitQuerySelected[i].id ? this.props.circuitQuerySelected[i].id : this.props.circuitQuerySelected[i], label : this.props.circuitQuerySelected[i].label ? this.props.circuitQuerySelected[i].label : this.props.circuitQuerySelected[i] });
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
            <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "5px", left : "10px" } } className={stylingConfiguration.controlIcons.zoomOut} onClick={self.props.clear }></i>
          </div>
          { this.props.resultsAvailable()
            ? <ul className={classes.legend} id="circuitBrowserLegend">
              { this.props.legend.map((label, index) => (
                <li><div className={classes.legendItem} style={{ backgroundColor : stylingConfiguration.nodeColorsByLabel[label] }}></div>{label}</li> 
              ))
              }
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
                <Typography >Configure circuit</Typography>
              </div>
            </AccordionSummary>
            <AccordionDetails classes={{ root : classes.details }}>
              <Grid container justify="space-between" alignItems="center">
                <Grid item sm={1} justify="center" alignItems="center">
                  <div>
                    <AdjustIcon />
                    <MoreVertIcon classes={{ root : classes.dottedIcon }}/>
                    <RoomIcon />
                  </div>
                </Grid>
                <Grid style={ { marginRight : "1vh !important" } } id="neuronFieldsGrid" item sm={9}>
                  { neuronFields.map((field, index) => (
                    <Grid container alignItems="center" justify="center" key={"TextFieldContainer" + index}>
                      <Grid item sm={neuronColumnSize} key={"TextFieldItem" + index}>
                        <AutocompleteResults
                          field={field}
                          index={index}
                          neuronTextfieldModified={this.neuronTextfieldModified}
                          resultSelectedChanged={(event, value) => this.resultSelectedChanged(event, value, index)}
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
                <Grid item justify="space-between" alignItems="center" sm={1}>
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
                  : <Grid container style={ { marginTop : "1vh" } } justify="space-between" alignItems="center">
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
                      <Typography>Add Neuron</Typography>
                    </Grid>
                  </Grid>
                }
              </Grid>
            </AccordionDetails>
            <Divider />
            <AccordionActions>
              <Grid container justify="space-between" alignItems="center" >
                <Grid container spacing={1}>
                  <Grid item sm={3}>
                    <Typography># Paths</Typography>
                  </Grid>
                  <Grid item sm={9}>
                    <Slider
                      aria-labelledby="discrete-slider-always"
                      defaultValue={this.hops}
                      onChangeCommitted={this.sliderChange}
                      step={1}
                      marks={customMarks()}
                      valueLabelDisplay="auto"
                      min={configuration.minHops}
                      max={configuration.maxHops}
                    />  
                  </Grid>
                </Grid>
                <Grid container spacing={1} alignItems="flex-end">
                  <Grid item sm={3}>
                    <Typography>Min Weight</Typography>
                  </Grid>
                  <Grid item sm={9}>
                    <Input className={classes.weightInputDiv} label="Graph weight" defaultValue={this.weight} onChange={this.weightChange} inputProps={{ 'aria-label': 'description', id : "weightField", className : classes.weightInput }} />
                  </Grid>
                  <Grid item container justify="flex-end" sm={6}>
                    <Button
                      color="primary"
                      variant="contained"
                      className="MuiGrid-grid-sm-12"
                      id="refreshCircuitBrowser"
                      onClick={() => this.props.updateGraph(this.neuronFields, this.hops, this.weight)}
                    >Refresh</Button>  
                  </Grid>
                  <Grid item container justify="flex-end" sm={6}>
                    <Button
                      color="secondary"
                      variant="contained"
                      className="MuiGrid-grid-sm-12"
                      id="clearCircuitBrowser"
                      onClick={() => this.props.clearGraph()}
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
