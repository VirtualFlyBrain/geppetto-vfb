import React, { Component } from 'react'
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
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
  }
});

/**
 * Read configuration from circuitBrowserConfiguration
 */
const configuration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').configuration;
const restPostConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').locationCypherQuery;
const stylingConfiguration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').styling;

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
      neuronFields : ["", ""]
    };
    this.addNeuron = this.addNeuron.bind(this);
    this.neuronTextfieldModified = this.neuronTextfieldModified.bind(this);
    this.typingTimeout = this.typingTimeout.bind(this);
    this.sliderChange = this.sliderChange.bind(this);
    this.fieldsValidated = this.fieldsValidated.bind(this);
    this.deleteNeuronField = this.deleteNeuronField.bind(this);
    this.getUpdatedNeuronFields = this.getUpdatedNeuronFields.bind(this);
    this.circuitQuerySelected = this.props.circuitQuerySelected;
  }
  
  componentDidMount () {
    let neurons = [...this.props.neurons];
    this.setState( { expanded : !this.props.resultsAvailable(), neuronFields : neurons } );
    this.circuitQuerySelected = this.props.circuitQuerySelected;
  }
  
  componentDidUpdate () {
    this.circuitQuerySelected = this.props.circuitQuerySelected;
  }

  /**
   * Deletes neuron field, updates control component right after
   */
  deleteNeuronField (event) {
    let id = parseInt(event.target.id);
    if ( event.target.id === "" ) {
      id = parseInt(event.target.parentElement.id);
    }
    
    // Update circuit selection
    this.circuitQuerySelected = "";
    this.props.vfbCircuitBrowser(UPDATE_CIRCUIT_QUERY, null);
    
    // remove neuron textfield
    let neurons = this.state.neuronFields;
    neurons.splice(id,1);
    // Update state with one less neuron textfield
    this.setState( { neuronFields : neurons } );
    
    // If neuron fields are validated, let the VFBCircuitBrowser component know, it will do a graph update
    if ( this.fieldsValidated(neurons) ) {
      this.props.queriesUpdated(neurons);
    }
  }
  
  /**
   * Add neuron textfield
   */
  addNeuron () {
    let neuronFields = this.state.neuronFields;
    // Add emptry string for now to text field
    neuronFields.push("");
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
      if ( neurons[i] === "" ) {
        return false;
      } else if ( !neurons[i].match(pattern) ) {
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
    let neurons = this.state.neuronFields;
    neurons[target.id] = target.value;
    this.circuitQuerySelected = "";
    if ( this.fieldsValidated(neurons) ) {
      this.setState( { neuronFields : neurons } );
      this.props.queriesUpdated(neurons);
    }
  }
  
  /**
   * Neuron text field has been modified.
   */
  neuronTextfieldModified (event) {
    const self = this;
    // Remove old typing timeout interval
    if (self.state.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    let target = event.target;
    // Create a setTimeout interval, to avoid performing searches on every stroke
    setTimeout(this.typingTimeout, 500, target);
  }
  
  /**
   * Hops slider has been dragged, value has changed
   */
  sliderChange (event, value ) {
    // Request new queries results with updated hops only if textfields contain valid neuron IDs
    if ( this.fieldsValidated(this.state.neuronFields) ) {
      this.props.updateHops(value);
    }    
  }

  /**
   * Update neuron fields if there's a query preselected.
   */
  getUpdatedNeuronFields () {
    let neuronFields = this.state.neuronFields;
    let neuronMatch = false;
    // Query preselected
    let queriesPassed = Object.keys(this.circuitQuerySelected).length > 0;
    
    if ( queriesPassed) {
      // If query is preselected and is not on the list already
      if ( !this.state.neuronFields.includes(this.circuitQuerySelected) ) {
        for ( var i = 0 ; i < neuronFields.length ; i++ ) {
          if ( this.state.neuronFields[i] === "" ) {
            neuronFields[i] = this.circuitQuerySelected;
            neuronMatch = true;
            break;
          }
        }
      } else if ( queriesPassed && neuronFields.includes(this.circuitQuerySelected) ) {
        neuronMatch = true;
      }
    }

    // If preselected query is not on list of existing queries
    if ( !neuronMatch ) {
      if ( queriesPassed ) {
        if ( neuronFields.length < configuration.maxNeurons ) {
          neuronFields.push(this.circuitQuerySelected);
        }
      }
    }
    
    if ( this.fieldsValidated(neuronFields) ) {
      this.props.queriesUpdated(neuronFields);
    } 
    
    return neuronFields;
  }
  
  render () {
    let self = this;
    const { classes } = this.props;
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
                  { neuronFields.map((value, index) => {
                    let label = "Neuron " + (index + 1) .toString();
                    return <Grid container alignItems="center" justify="center" key={"TextFieldContainer" + index}>
                      <Grid item sm={neuronColumnSize} key={"TextFieldItem" + index}>
                        <TextField
                          fullWidth
                          margin="dense"
                          defaultValue={value}
                          placeholder={label}
                          key={value}
                          onChange={this.neuronTextfieldModified}
                          id={index.toString()}
                          inputProps={{ style: { color: "white" } }}
                          InputLabelProps={{ style: { color: "white" } }}
                        /></Grid>
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
              <Grid container spacing={1}>
                <Grid item sm={2}>
                  <Typography>Hops</Typography>
                </Grid>
                <Grid item sm={10}>
                  <Slider
                    aria-labelledby="discrete-slider-always"
                    defaultValue={this.props.hops}
                    onChangeCommitted={this.sliderChange}
                    step={1}
                    marks={customMarks()}
                    valueLabelDisplay="auto"
                    min={configuration.minHops}
                    max={configuration.maxHops}
                  />  
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
