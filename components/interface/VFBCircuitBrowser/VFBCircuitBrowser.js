import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from '@geppettoengine/geppetto-ui/graph-visualization/Graph'
import GraphFitter from '../utils/graphFit';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import Controls from './Controls';
import { summariseResponse, buildGraph, nodeIds, alsoFoundIn, datasetName, termName, wrapLines, linkWidth, linkPlacement } from './circuitPaths';
import { connect } from "react-redux";

const styles = theme => ({
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    margin: 'auto',
    color: "#11bffe",
    size: "55rem"
  },
  errorMessage : { textAlign : "center" }
});

/**
 * Read configuration from circuitBrowserConfiguration
 */
const configuration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').configuration;
const circuitPathsConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').circuitPathsConfig;
const circuitPathsParams = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').circuitPathsParams;
const termLookupConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').termLookupConfig;
const stylingConfiguration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').styling;

const COMPONENT_ID = "VFBCircuitBrowser";
const NODE_WIDTH = 120;
const NODE_HEIGHT = 80;
const NODE_BORDER_THICKNESS = 2;
// force-graph's node radius (nodeRelSize, with the default nodeVal of 1)
const NODE_RADIUS = 50;

/**
 * Component for VFB Circuit Browser between Neurons
 */
class VFBCircuitBrowser extends Component {

  constructor (props) {
    super(props);
    this.state = {
      graph : { nodes : [], links : [] } ,
      legend : [],
      loading : true,
      queryLoaded : false,
      dropDownAnchorEl : null,
      neurons : [{ id : "", label : "" } , { id : "", label : "" }],
      paths : Math.ceil((configuration.maxPaths - configuration.minPaths) / 2),
      // Minimum synapses per connection, the /circuit_paths default
      weight : 5,
      /*
       * Last /circuit_paths response, the dataset shown from it and whether
       * class paths are shown as example neurons
       */
      response : null,
      datasets : [],
      dataset : null,
      showNeurons : false,
      terms : {},
      message : "",
      reload : false
    }
    this.updateGraph = this.updateGraph.bind(this);
    this.queryResults = this.queryResults.bind(this);
    this.selectDataset = this.selectDataset.bind(this);
    this.toggleNeurons = this.toggleNeurons.bind(this);
    // Only the latest request's results are drawn
    this.requestCount = 0;
    this.handleNodeLeftClick = this.handleNodeLeftClick.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    // Fits the graph once its panel is measured and its layout has settled
    this.fitter = new GraphFitter(() => this.graphRef.current, () => this.state.graph.nodes);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.clearGraph = this.clearGraph.bind(this);
    this.clearNeurons = this.clearNeurons.bind(this);
    this.queriesUpdated = this.queriesUpdated.bind(this);
    this.updatePaths = this.updatePaths.bind(this);
    this.updateWeight = this.updateWeight.bind(this);
    this.resize = this.resize.bind(this);
    this.nodeRendering = this.nodeRendering.bind(this);
    
    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;

    this.graphRef = React.createRef();
    this.controlsRef = React.createRef();
    this.__isMounted = false;
    this.objectsLoaded = 0;
    this.focused = false;
    // Circuit Browser component has been resized
    this.graphResized = false;
    this.circuitQuerySelected = this.props.circuitQuerySelected;
  }

  componentDidMount () {
    let self = this;
    this.__isMounted = true;
    this.updateGraph(this.state.neurons , Math.ceil((configuration.maxPaths - configuration.minPaths) / 2), this.state.weight);
    const { circuitQuerySelected } = this.props;
    this.circuitQuerySelected = circuitQuerySelected;
  }

  componentDidUpdate () {
    let self = this;
    if ( this.props.visible && ( !this.focused || this.graphResized ) ) {
      // Shown or resized: fit once the panel is measured and the layout settles
      this.fitter.request();
      this.focused = true;
      this.graphResized = false;
    } else if ( !this.props.visible ) {
      this.focused = false;
      this.fitter.cancel();
    }
    
    if ( this.circuitQuerySelected !== this.props.circuitQuerySelected ) {
      this.circuitQuerySelected = this.props.circuitQuerySelected;
    }
  }

  componentWillUnmount () {
    this.__isMounted = false;
    this.fitter.dispose();
  }
  
  /**
   * New neurons have been entered by user, update graph.
   * @neurons (array): New list of neurons user has entered
   */
  queriesUpdated (neurons) {
    // Check if new list of neurons is the same as the ones already rendered on last update
    var matched = (this.state.neurons.length == neurons.length) && this.state.neurons.every(function (element, index) {
      return element.id === neurons[index].id; 
    });
    
    // Request graph update if the list of new neurons is not the same
    if ( !this.state.loading && !matched ) {
      this.updateGraph(neurons, this.state.paths, this.state.weight);
    }
  }
  
  /**
   * Paths in controls component have been updated, request new graph with updated amount of paths
   */
  updatePaths (paths) {
    this.setState({ paths : paths });
  }
  
  updateWeight (weight) {
    this.setState({ weight : weight });
  }

  resetCamera () {
    if ( this.graphRef.current !== null ) {
      this.fitter.fitNow();
      this.focused = true;
    }
  }

  resize (){
    this.graphResized = true;
    this.setState( { reload : !this.state.reload } );
  }
  
  zoomIn () {
    let zoom = this.graphRef.current.ggv.current.zoom();
    let inValue = 1;
    if (zoom < 2 ){
      inValue = .2;
    }
    this.graphRef.current.ggv.current.zoom(zoom + inValue , 100);
  }

  zoomOut () {
    let zoom = this.graphRef.current.ggv.current.zoom();
    let out = 1;
    if (zoom < 2 ){
      out = .2;
    }
    this.graphRef.current.ggv.current.zoom(zoom - out , 100);
  }
  
  clearGraph () {
    this.requestCount++;
    this.setState({ neurons : [{ id : "", label : "" } , { id : "", label : "" }], graph : { nodes : [], links : [] }, response : null, datasets : [], dataset : null, message : "" });
    this.controlsRef.current.setNeurons()
  }
  
  clearNeurons (neurons) {
    this.setState({ neurons : neurons });
  }

  /**
   * Handle Left click on Nodes
   */
  handleNodeLeftClick (node, event) {
    window.addVfbId(node.title);
  }
  
  handleNodeRightClick (node, event) {
    this.graphRef.current.ggv.current.centerAt(node.x , node.y, 1000);
    this.graphRef.current.ggv.current.zoom(2, 1000);
  }
  
  /**
   * Query paths between the neurons or neuron types entered.
   */
  updateGraph (neurons, paths, weight, showNeurons) {
    if (this.__isMounted){
      const ends = neurons ? neurons : this.state.neurons;
      const k = paths ? paths : this.state.paths;
      const minSynapses = weight !== undefined && weight !== null && weight !== "" ? weight : this.state.weight;
      const withNeurons = showNeurons !== undefined ? showNeurons : this.state.showNeurons;
      this.setState({ loading : true, neurons : ends, paths : k, weight : minSynapses, showNeurons : withNeurons, queryLoaded : false, message : "" });
      if ( !ends?.[0]?.id || !ends?.[ends.length - 1]?.id ) {
        this.setState({ loading : false, graph : { nodes : [], links : [] }, response : null, datasets : [], dataset : null });
        return;
      }
      this.queryResults(circuitPathsParams(ends, k, minSynapses, withNeurons));
    }
  }

  /**
   * Fetch paths from /circuit_paths, then the labels and facets of the terms on
   * them, and draw the best dataset's paths.
   */
  queryResults (params) {
    const self = this;
    const request = ++this.requestCount;
    const current = () => self.__isMounted && request === self.requestCount;

    axios.get(circuitPathsConfig.url, { params, timeout : circuitPathsConfig.timeout })
      .then(response => {
        if ( !current() ) {
          return;
        }
        const data = response.data;
        const summary = summariseResponse(data, self.state.neurons);
        const ids = Array.from(new Set([].concat(...summary.datasets.map(nodeIds))));
        return self.lookupTerms(ids).then(terms => {
          if ( !current() ) {
            return;
          }
          const previous = self.state.dataset;
          const dataset = summary.datasets.find(block => block.dataset === previous) || summary.datasets[0] || null;
          let message = summary.messages.join(" ");
          if ( !dataset && summary.withoutPaths.length ) {
            const ends = self.state.neurons;
            const searched = summary.withoutPaths.map(datasetName).join(", ");
            message = [message, "No paths found from " + termName(ends[0]) + " to " + termName(ends[ends.length - 1]) + " in " + searched + "."].filter(Boolean).join(" ");
          }
          self.setState({ response : data, datasets : summary.datasets, terms, message });
          self.drawDataset(dataset, self.state.showNeurons, terms);
        });
      })
      .catch(error => {
        if ( !current() ) {
          return;
        }
        let message = "The circuit query failed. Please try again.";
        if ( error?.response?.status === 503 ) {
          message = "The circuit graphs are loading. Please try again in a minute.";
        } else if ( error?.response?.data?.error ) {
          message = error.response.data.error;
        } else if ( error?.code === "ECONNABORTED" ) {
          message = "The circuit query took too long. Try fewer paths or a higher minimum weight.";
        }
        self.setState({ loading : false, queryLoaded : true, graph : { nodes : [], links : [] }, response : null, datasets : [], dataset : null, message });
      });
  }

  /**
   * Labels and facets of the given ids from Solr. Paths are still drawn, with
   * ids and no colours, if this fails.
   */
  lookupTerms (ids) {
    if ( ids.length === 0 ) {
      return Promise.resolve({});
    }
    const params = {
      q : "short_form:(" + ids.join(" OR ") + ")",
      fl : termLookupConfig.fields,
      rows : ids.length,
      wt : "json"
    };
    return axios.get(termLookupConfig.url, { params })
      .then(response => {
        const terms = {};
        (response?.data?.response?.docs || []).forEach(doc => {
          terms[doc.short_form] = { label : doc.label, facets : doc.facets_annotation || [] };
        });
        return terms;
      })
      .catch(() => ({}));
  }

  /**
   * Draw one dataset's paths from the last response.
   */
  drawDataset (block, showNeurons, terms) {
    if ( !block ) {
      this.setState({ graph : { nodes : [], links : [] }, legend : [], dataset : null, loading : false, queryLoaded : true });
      return;
    }
    const graph = buildGraph(block, {
      showNeurons,
      terms : terms || this.state.terms,
      styling : stylingConfiguration,
      nodeWidth : NODE_WIDTH,
      nodeHeight : NODE_HEIGHT
    });
    this.setState({ graph : { nodes : graph.nodes, links : graph.links }, legend : graph.legendLabels, dataset : block.dataset, loading : false, queryLoaded : true });
    this.objectsLoaded = graph.nodes.length;
    // Fit the new graph once it is laid out in a measured panel
    this.fitter.request();
  }

  /**
   * Show the paths found in another dataset.
   */
  selectDataset (dataset) {
    const block = this.state.datasets.find(b => b.dataset === dataset);
    if ( block ) {
      this.drawDataset(block, this.state.showNeurons);
    }
  }

  /**
   * Show class paths as example neurons, or back as classes. Example neurons
   * are only fetched when first asked for, as they are slow.
   */
  toggleNeurons (showNeurons) {
    const block = this.state.datasets.find(b => b.dataset === this.state.dataset);
    const hasInstances = block && block.paths.some(path => Array.isArray(path.instances));
    if ( showNeurons && block && block.level === "class" && !hasInstances ) {
      this.updateGraph(this.state.neurons, this.state.paths, this.state.weight, true);
      return;
    }
    this.setState({ showNeurons });
    if ( block ) {
      this.drawDataset(block, showNeurons);
    }
  }

  /**
   * What the legend says about the dataset shown.
   */
  datasetSummary () {
    const block = this.state.datasets.find(b => b.dataset === this.state.dataset);
    if ( !block ) {
      return null;
    }
    return {
      level : block.level,
      neuronsLeftOut : block.neurons_left_out,
      alsoFoundIn : block.level === "class" ? alsoFoundIn(this.state.response, block.dataset) : []
    };
  }

  getFontSize (context, fontSize, maxWidth, text, textLength) {
    let baseSize = fontSize;
    context.font = `${baseSize}px ${stylingConfiguration.defaultNodeFont}`;
    let width = context.measureText(text).width;
    while (width > maxWidth) {
      baseSize--;
      context.font = `${baseSize}px ${stylingConfiguration.defaultNodeFont}`;
      width = context.measureText(text).width;
    }
    
    return baseSize;
  }

  /**
   * Breaks Description texts into lines to fit within a certain width value.
   */
  wrapText (context, text, x, y, fontSize, maxWidth, maxHeight) {
    let baseFont = fontSize;
    // As many words per line as fit
    const lines = wrapLines(text, maxWidth, line => context.measureText(line).width);
    
    // Only one line, center it
    if ( lines.length == 1 ) { 
      y = y + ( maxHeight / 2 ) - baseFont / 2;
      baseFont = this.getFontSize (context, stylingConfiguration.nodeMaxFontSize, maxWidth, lines[0], lines[0].length)
    }
    // Tow lines, center them
    if ( lines.length == 2 ) {
      y = y + (baseFont * ((stylingConfiguration.linesText / 2) - 1));
    }
    
    // Multiple lines 
    for ( let i = 0; i < lines.length ; i++ ) {
      if ( i === stylingConfiguration.linesText - 1 ) {
        context.fillText( lines.length > i + 1 ? lines[i] + "..." : lines[i], x, y );
        break;
      } else {
        context.fillText( lines[i], x, y );
      }
      y += baseFont + ( baseFont / lines.length );
    }
                
  }
  
  // Calculate link middle point
  getQuadraticXY (t, sx, sy, cp1x, cp1y, ex, ey) {
    return {
      x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
      y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey,
    };
  }
  
  nodeRendering (node, ctx, globalScale) {
    const cardWidth = NODE_WIDTH;
    const cardHeight = NODE_HEIGHT;
    const nodeTitleHeight = cardHeight * stylingConfiguration.nodeTitleHeight;
    const nodeDescriptionHeight = cardHeight * stylingConfiguration.nodeDescriptionHeight;
    const colorBarHeight = cardHeight * stylingConfiguration.nodeColorAreaHeight;
    let borderThickness = this.highlightNodes.has(node) ? NODE_BORDER_THICKNESS : 1;

    // Node border color
    ctx.fillStyle = self.hoverNode == node || node?.id === self.hoverNode?.id ? stylingConfiguration.defaultNodeHoverBoderColor : (this.highlightNodes.has(node) ? stylingConfiguration.defaultNeighborNodesHoverColor : stylingConfiguration.defaultNodeBorderColor) ;
    // Create Border
    ctx.fillRect(node.x - (cardWidth / 2) - borderThickness, node.y - (cardHeight / 2) + borderThickness, cardWidth + (borderThickness * 2), cardHeight + (borderThickness * 2));

    // Assign color to Description Area background in Node
    ctx.fillStyle = stylingConfiguration.defaultNodeDescriptionBackgroundColor;
    // Create Description Area in Node
    ctx.fillRect(node.x - cardWidth / 2,node.y - nodeDescriptionHeight, cardWidth, cardHeight);

    ctx.fillStyle = stylingConfiguration.defaultNodeTitleBackgroundColor;
    ctx.fillRect(node.x - cardWidth / 2,node.y - nodeTitleHeight, cardWidth, nodeTitleHeight );

    const lastIndex = node.nodeColorLabels.length;
    node.nodeColorLabels.forEach( (color, index) => {
      // Assign color to Title Bar background in Node
      ctx.fillStyle = color;
      const x = (node.x - cardWidth / 2) + (index * (cardWidth / lastIndex));
      const y = node.y;
      // Create Title Bar in Node
      ctx.fillRect(x,y, (cardWidth / lastIndex), colorBarHeight);
    })

    // Assign font to text in Node
    ctx.font = `${stylingConfiguration.nodeTitleFontSize}px ${stylingConfiguration.defaultNodeFont}`;
    // Assign color to text in Node
    ctx.fillStyle = stylingConfiguration.defaultNodeFontColor;
    // Text in font to be centered
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';

    /* 
     * Add Description text to Nodes
     * Parameters:
     * node.name = text to display
     * node.x = x coordinate of text
     * node.y - (cardHeight / 2) + 10 = y coordinate, adds 15 pixels for padding from upper element
     * cardWidth * .8 = The maximum width the text can take
     * nodeTitleHeight = The maximum height the text can take 
     */
    this.wrapText(ctx, node.classLabel, node.x, node.y - (cardHeight / 2) + 10, stylingConfiguration.nodeTitleFontSize, cardWidth * .8 , nodeTitleHeight);
    
    ctx.font = `${stylingConfiguration.nodeDescriptionFontSize}px ${stylingConfiguration.defaultNodeFont}`;
    /* 
     * Add Description text to Nodes
     * Parameters:
     * node.name = text to display
     * node.x = x coordinate of text
     * node.y + 15 = y coordinate, adds 15 pixels for padding from upper element
     * cardWidth * .8 = The maximum width the text can take
     * cardHeight = The maximum height the text can take 
     */
    this.wrapText(ctx, node.name, node.x, node.y + 15, stylingConfiguration.nodeDescriptionFontSize, cardWidth * .8 , nodeDescriptionHeight);
    ctx.font = `${stylingConfiguration.nodeDescriptionFontSize}px ${stylingConfiguration.defaultNodeFont}`;
  }
  
  render () {
    let self = this;
    
    // Detect when the first load of the Graph component happens
    const { classes, circuitQuerySelected } = this.props;
    this.circuitQuerySelected = circuitQuerySelected;
    
    let errorMessage = "Enter neurons or neuron types below to find the paths between them";
    if ( this.state.message ) {
      errorMessage = this.state.message;
    } else if ( this.state.queryLoaded && this.state.neurons?.[0]?.id && this.state.neurons?.[1]?.id ){
      errorMessage = "No paths found from " + termName(this.state.neurons[0]) + " to " + termName(this.state.neurons[this.state.neurons.length - 1]) + ".";
    }
    const controlsProps = {
      updateGraph : self.updateGraph,
      updatePaths : self.updatePaths,
      updateWeight : self.updateWeight,
      neurons : this.state.neurons,
      queryLoaded : this.state.queryLoaded,
      paths : this.state.paths,
      weight : this.state.weight,
      resultsAvailable : () => this.state.graph.nodes.length > 0,
      resetCamera : self.resetCamera,
      zoomIn : self.zoomIn,
      zoomOut : self.zoomOut,
      clearGraph : self.clearGraph,
      clearNeurons : self.clearNeurons,
      legend : self.state.legend,
      datasets : this.state.datasets.map(block => ({ dataset : block.dataset, name : datasetName(block), paths : block.paths.length })),
      dataset : this.state.dataset,
      selectDataset : self.selectDataset,
      datasetSummary : self.datasetSummary(),
      showNeurons : this.state.showNeurons,
      toggleNeurons : self.toggleNeurons,
      message : this.state.message,
      ref : self.controlsRef
    };
    return (
      this.state.loading
        ? <CircularProgress id= { COMPONENT_ID } classes={{ root : classes.loader }}
        />
        : this.state.graph.nodes.length == 0
          ? <div>
            <h4 className={classes.errorMessage}>{errorMessage}</h4>
            <Controls
              {...controlsProps}
              circuitQuerySelected={circuitQuerySelected}
              datasource="SOLR"
              key="controls"
            />
          </div>
          : <GeppettoGraphVisualization
            id= { COMPONENT_ID }
            // Graph data with Nodes and Links to populate
            data={this.state.graph}
            // Create the Graph as 2 Dimensional
            d2={true}
            // Fit again once the force layout has settled
            onEngineStop={this.fitter.engineStopped}
            nodeLabel={node => node.name + " [" + node.title + "]" + (node.kind === "neuron" && node.typeLabel ? "<br/>" + node.typeLabel : "")}
            // Relationship label, placed in Link
            linkLabel={link => link.label}
            // Width of links, from log(synapses)
            linkWidth={link => linkWidth(link.weight)}
            // Links that would pass behind a node are bowed around it (buildGraph)
            linkCurvature={link => link.curvature || configuration.linkCurvature}
            // Arrowhead tip at the target card's edge, label clear of it
            linkDirectionalArrowLength={link => linkPlacement(link, NODE_WIDTH, NODE_HEIGHT, NODE_RADIUS).arrowLength}
            linkDirectionalArrowRelPos={link => linkPlacement(link, NODE_WIDTH, NODE_HEIGHT, NODE_RADIUS).arrowRelPos}
            // Node label, used in tooltip when hovering over Node
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link, ctx) => {
              const MAX_FONT_SIZE = 16;
              const LABEL_NODE_MARGIN = 1 * 1.5;

              const start = link.source;
              const end = link.target;
              
              // ignore unbound links
              if (typeof start !== 'object' || typeof end !== 'object') {
                return;
              }
              
              // calculate label positioning
              const labelAt = linkPlacement(link, NODE_WIDTH, NODE_HEIGHT, NODE_RADIUS).labelAt;
              let textPos = Object.assign({},...['x', 'y'].map(c => ({ [c]: start[c] + (end[c] - start[c]) * labelAt })));

              if (link?.__controlPoints ) {
                textPos = this.getQuadraticXY(
                  labelAt,
                  start.x,
                  start.y,
                  link?.__controlPoints[0],
                  link?.__controlPoints[1],
                  end.x,
                  end.y
                );
              }
              const relLink = { x: end.x - start.x, y: end.y - start.y };

              const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

              let textAngle = Math.atan2(relLink.y, relLink.x);
              // maintain label vertical orientation for legibility
              if (textAngle > Math.PI / 2) {
                textAngle = -(Math.PI - textAngle);
              }
              if (textAngle < -Math.PI / 2) {
                textAngle = -(-Math.PI - textAngle);
              }

              const label = link.weightLabel;

              // estimate fontSize to fit in link length
              const fontSize = MAX_FONT_SIZE;
              ctx.font = `${fontSize}px Sans-Serif`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

              // draw text label (with background rect)
              ctx.save();
              ctx.translate(textPos.x,textPos.y);
              ctx.rotate(textAngle);
              ctx.fillStyle = 'rgba(0, 0, 0, 1)';
              ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'white';
              ctx.setLineDash([5, 5]);
              ctx.fillText(label, 0, 0);
              ctx.restore();
            }}
            nodeRelSize={50}
            nodeSize={30}
            enableNodeDrag={true}
            // Assign background color to Canvas
            backgroundColor = {stylingConfiguration.canvasColor}
            // Assign color to Links connecting Nodes
            linkColor = {link => {
              let color = stylingConfiguration.defaultLinkColor;
              if ( self.highlightLinks.has(link) ) {
                color = self.highlightNodes.has(link.source) || self.highlightNodes.has(link.targetNode) ? stylingConfiguration.defaultLinkHoverColor : stylingConfiguration.defaultLinkColor;
              }

              return color;
            }}
            nodeCanvasObject={this.nodeRendering}
            // Overwrite Node Canvas Object
            nodeCanvasObjectMode={node => 'replace'}
            // bu = Bottom Up, creates Graph with root at bottom
            dagMode="lr"
            nodeVal = { node => {
              // Fixed layout: column along the path, row by path rank
              node.fx = node.positionX;
              node.fy = node.positionY;
            }}
            dagLevelDistance = {75}
            onDagError={loopNodeIds => {}}
            // Handles clicking event on an individual node
            onNodeClick = { (node,event) => this.handleNodeLeftClick(node,event) }
            // Handles clicking event on an individual node
            onNodeRightClick = { (node,event) => this.handleNodeRightClick(node,event) }
            ref={this.graphRef}
            // Disable dragging of nodes
            enableNodeDrag={false}
            // Allow camera pan and zoom with mouse
            enableZoomPanInteraction={true}
            controls = {
              <Controls
                {...controlsProps}
                circuitQuerySelected={this.circuitQuerySelected}
              />
            }
            // Function triggered when hovering over a nodeoptions
            onNodeHover={node => {
            // Reset maps of hover nodes and links
              self.highlightNodes?.clear();
              self.highlightLinks?.clear();

              // We found the node that we are hovering over
              if (node) {
              // Keep track of hover node, its neighbors and links
                self.highlightNodes?.add(node);
                node?.neighbors?.forEach(neighbor => self?.highlightNodes?.add(neighbor));
                node?.links?.forEach(link => self?.highlightLinks?.add(link));
              }

              // Keep track of hover node
              self.hoverNode = node || null;
              document.getElementById(COMPONENT_ID).style.cursor = node ? '-webkit-grab' : null;
            }
            }
            // Function triggered when hovering over a link
            onLinkHover={link => {
            // Reset maps of hover nodes and links
              self.highlightNodes.clear();
              self.highlightLinks.clear();

              // We found link being hovered
              if (link) {
              // Keep track of hovered link, and it's source/target node
                self.highlightLinks.add(link);
                self.highlightNodes.add(link.source);
                self.highlightNodes.add(link.target);
              }
            }}
            linkHoverPrecision={10}
          />
    )
  }
}

VFBCircuitBrowser.propTypes = { classes: PropTypes.object.isRequired };

function mapStateToProps (state) {
  return { circuitQuerySelected : state.generals.ui.circuitBrowser.circuitQuerySelected }
}

export default connect(mapStateToProps, null, null, { forwardRef : true } )(withStyles(styles)(VFBCircuitBrowser));
