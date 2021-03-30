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
  addNeuron : { padding : "8px 5px 0px 2px" },
  // Override default padding in Delete Neuron button
  deleteNeuron : { padding : "4px 0px 0px 4px" },
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
  weightInput : { color : "white !important" }
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

/**
 * Controls component used in VFBCircuitBrowser.
 */
class Controls extends Component {

  constructor (props) {
    super(props);
    this.state = {
      typingTimeout: 0,
      expanded : true,
      neuronFields : [{ id : "", label : "" } , { id : "", label : "" }],
      filteredResults : {}
    };
    this.weight = this.props.weight;
    this.hops = this.props.hops;
    this.addNeuron = this.addNeuron.bind(this);
    this.neuronTextfieldModified = this.neuronTextfieldModified.bind(this);
    this.typingTimeout = this.typingTimeout.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.weightChange = this.weightChange.bind(this);
    this.fieldsValidated = this.fieldsValidated.bind(this);
    this.deleteNeuronField = this.deleteNeuronField.bind(this);
    this.getUpdatedNeuronFields = this.getUpdatedNeuronFields.bind(this);
    this.handleResults = this.handleResults.bind(this);
    this.resultSelectedChanged = this.resultSelectedChanged.bind(this);
    this.circuitQuerySelected = this.props.circuitQuerySelected;
  }
  
  componentDidMount () {
    let neurons = [...this.props.neurons];
    this.setState( { expanded : !this.props.resultsAvailable(), neuronFields : neurons } );
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
    let neurons = this.state.neuronFields;
    neurons.splice(id,1);
    
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, neurons);
    
    // Update state with one fewer neuron textfield
    this.setState( { neuronFields : neurons } );
  }
  
  /**
   * Add neuron textfield
   */
  addNeuron () {
    let neuronFields = this.state.neuronFields;
    // Add emptry string for now to text field
    neuronFields.push({ id : "", label : "" });
    // User has added the maximum number of neurons allowed in query search
    if ( configuration.maxNeurons <= neuronFields.length ) {
      this.setState({ neuronFields : neuronFields });
    } else {
      this.setState({ neuronFields : neuronFields });
    }
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
   * Receives SOLR results and creates an map with those results that match the input text
   */
  handleResults (status, data, value) {
    let results = {};
    data?.map(result => {
      // Match results by short_form id
      if ( result?.short_form?.toLowerCase().includes(value?.toLowerCase()) ){
        results[result?.label] = result;
      } else if ( result?.label?.toLowerCase().includes(value?.toLowerCase()) ){
        results[result?.label] = result;
      }
    });
      
    this.setState({ filteredResults : results })
  }
  
  /**
   * Waits some time before performing new search, this to avoid performing search everytime
   * enters a new character in neuron fields
   */
  typingTimeout (target) {
    this.setInputValue = target.id;
    getResultsSOLR( target.value, this.handleResults,searchConfiguration.sorter,datasourceConfiguration );
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
    setTimeout(this.typingTimeout, 500, event.target);
  }
  
  /**
   * Handle SOLR result selection, activated by selecting from drop down menu under textfield 
   */
  resultSelectedChanged (event, value) {
    // Copy neurons and add selection to correct array index
    let neurons = this.state.neuronFields;
    neurons[this.setInputValue] = { id : this.state.filteredResults?.[value].short_form, label : value };
    
    // Keep track of query selected, and send an event to redux store that circuit has been updated
    this.circuitQuerySelected = neurons;
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, neurons);
    
    // If text fields contain valid ids, perform query
    if ( this.fieldsValidated(neurons) ) {
      this.setState( { neuronFields : neurons } );
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

  /**
   * Update neuron fields if there's a query preselected.
   */
  getUpdatedNeuronFields () {
    let neuronFields = this.state.neuronFields;
    let added = false;
    for ( var i = 0; i < this.props.circuitQuerySelected.length; i++ ){
      var fieldExists = this.state.neuronFields.filter(entry =>
        entry.id === this.props.circuitQuerySelected[i]
      );

      if ( !fieldExists) { 
        for ( var j = 0 ; j < neuronFields.length ; j++ ) {
          if ( this.state.neuronFields?.[j].id === "" ) {
            neuronFields[j] = { id : this.props.circuitQuerySelected[i], label : "" };
            added = true;
            break;
          }
        }
        
        if ( this.props.circuitQuerySelected.length > neuronFields.length && !fieldExists) {
          if ( neuronFields.length < configuration.maxNeurons && this.props.circuitQuerySelected !== "" ) {
            neuronFields.push({ id : this.props.circuitQuerySelected[i], label : "" });
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
    let neuronFields = this.getUpdatedNeuronFields()
    
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
          <div style={ { position: "absolute", width: "2vh", height: "100px",zIndex: "100" } }>
            <i style={ { zIndex : "1000" , cursor : "pointer", top : "10px", left : "10px" } } className={stylingConfiguration.controlIcons.home} onClick={self.props.resetCamera }></i>
            <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "20px", left : "10px" } } className={stylingConfiguration.controlIcons.zoomIn} onClick={self.props.zoomIn }></i>
            <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "5px", left : "10px" } } className={stylingConfiguration.controlIcons.zoomOut} onClick={self.props.zoomOut }></i>
          </div>
          { this.props.resultsAvailable()
            ? <ul className={classes.legend}>
              { this.props.legend.map((label, index) => (
                <li><div className={classes.legendItem} style={{ backgroundColor : stylingConfiguration.nodeColorsByLabel[label] }}></div>{label}</li> 
              ))
              }
            </ul>
            : null
          }
          <Accordion className={classes.root} defaultExpanded={expanded} >
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
              <Grid container justify="center" alignItems="center" >
                <Grid item sm={1} >
                  <div>
                    <AdjustIcon />
                    <MoreVertIcon classes={{ root : classes.dottedIcon }}/>
                    <RoomIcon />
                  </div>
                </Grid>
                <Grid item sm={11}>
                  { neuronFields.map((field, index) => {
                    let label = "Neuron " + (index + 1) .toString();
                    return <Grid container alignItems="center" justify="center" key={"TextFieldContainer" + index}>
                      <Grid item sm={neuronColumnSize} key={"TextFieldItem" + index}>
                        <Autocomplete
                          freeSolo
                          fullWidth
                          disableClearable
                          autoHighlight
                          value={field.label}
                          id={index.toString()}
                          onChange={this.resultSelectedChanged}
                          options={Object.keys(this.state.filteredResults).map(option => this.state.filteredResults[option].label)}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label={"Neuron " + ( index + 1 ).toString()}
                              key={field.id}
                              onChange={this.neuronTextfieldModified}
                              inputProps={{ ...params.inputProps, style: { color: "white" , paddingLeft : "10px" } }}
                              InputLabelProps={{ ...params.inputProps,style: { color: "white", paddingLeft : "10px" } }}
                            />
                          )}
                        />
                      </Grid>
                      { deleteIconVisible ? <Grid item sm={1}>
                        <IconButton
                          key={"TextFieldIcon-" + index}
                          onClick={self.deleteNeuronField}
                          fontSize="small"
                          classes = {{ root : classes.deleteNeuron }}>
                          <DeleteIcon id={index.toString()}/>
                        </IconButton>
                      </Grid>
                        : null
                      }
                    </Grid>
                  })}
                </Grid>
                <Grid item sm={12}>
                  { addNeuronDisabled 
                    ? null
                    : <Button
                      color="inherit"
                      classes={{ root : classes.addNeuron }}
                      size="small"
                      onClick={this.addNeuron}
                      startIcon={<AddCircleOutlineIcon />}
                    >
                  Add Neuron
                    </Button>
                  }
                </Grid>
              </Grid>
            </AccordionDetails>
            <Divider />
            <AccordionActions>
              <Grid container justify="center" alignItems="center" >
                <Grid container spacing={1}>
                  <Grid item sm={2}>
                    <Typography>Hops</Typography>
                  </Grid>
                  <Grid item sm={10}>
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
                <Grid container alignItems="flex-end">
                  <Grid item sm={2}>
                    <Typography>Weight</Typography>
                  </Grid>
                  <Grid item sm={4}>
                    <Input label="Graph weight" defaultValue={this.weight} onChange={this.weightChange} inputProps={{ 'aria-label': 'description', className : classes.weightInput }} />
                  </Grid>
                  <Grid item container justify="flex-end" sm={6}>
                    <Button
                      color="primary"
                      variant="contained"
                      size="small"
                      onClick={() => this.props.updateGraph(this.state.neuronFields, this.hops, this.weight)}
                    >Refresh Graph</Button>  
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
  return { vfbCircuitBrowser: (type, path) => dispatch ( { type : type, data : { instance : path } }), }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(withStyles(styles)(Controls));
