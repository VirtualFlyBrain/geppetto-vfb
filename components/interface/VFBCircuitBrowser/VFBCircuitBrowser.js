import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from '@geppettoengine/geppetto-ui/graph-visualization/Graph'
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import Controls from './Controls';
import { queryParser } from './QueryParser';
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
const restPostConfig = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').locationCypherQuery;
const stylingConfiguration = require('../../configuration/VFBCircuitBrowser/circuitBrowserConfiguration').styling;

/**
 * If no configuration is given for queries in graphConfiguration.js, we use this configuration.
 */
const defaultHTTPConfiguration = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/192/commit",
  contentType: "application/json"
}

const COMPONENT_ID = "VFBCircuitBrowser";
const NODE_WIDTH = 55;
const NODE_HEIGHT = 40;
const NODE_BORDER_THICKNESS = 2;

/**
 * Component for VFB Circuit Browser between Neurons
 */
class VFBCircuitBrowser extends Component {

  constructor (props) {
    super(props);
    this.state = {
      graph : { nodes : [], links : [] } ,
      legend : {},
      loading : true,
      queryLoaded : false,
      dropDownAnchorEl : null,
      neurons : [{ id : "", label : "" } , { id : "", label : "" }],
      paths : Math.ceil((configuration.maxPaths - configuration.minPaths) / 2),
      weight : 0,
      reload : false
    }
    this.updateGraph = this.updateGraph.bind(this);
    this.queryResults = this.queryResults.bind(this);
    this.handleNodeLeftClick = this.handleNodeLeftClick.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.clearGraph = this.clearGraph.bind(this);
    this.queriesUpdated = this.queriesUpdated.bind(this);
    this.updatePaths = this.updatePaths.bind(this);
    this.updateWeight = this.updateWeight.bind(this);
    this.resize = this.resize.bind(this);
    
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
      setTimeout( function () {
        self.resetCamera();
        self.focused = true;
        self.graphResized = false;
      }, (self.objectsLoaded * 20));
    } else if ( !this.props.visible ) {
      this.focused = false;
    }
    
    if ( this.circuitQuerySelected !== this.props.circuitQuerySelected ) {
      this.circuitQuerySelected = this.props.circuitQuerySelected;
    }
  }

  componentWillUnmount () {
    this.__isMounted = false;
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
      this.graphRef.current.ggv.current.zoomToFit();
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
    this.setState({ neurons : [{ id : "", label : "" } , { id : "", label : "" }], graph : { nodes : [], links : [] } });
    this.controlsRef.current.setNeurons()
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
   * Re-render graph with a new instance
   */
  updateGraph (neurons, paths, weight) {
    if (this.__isMounted){
      // Show loading spinner while cypher query search occurs
      this.setState({ loading : true , neurons : neurons ? neurons : this.state.neurons, paths : paths ? paths : this.state.paths, weight : weight ? weight : this.state.weight, queryLoaded : false });
      // Perform cypher query. TODO: Remove hardcoded weight once edge weight is implemented
      this.queryResults(cypherQuery(neurons ? neurons.map(a => `'${a.id}'`).join(",") : this.state.neurons, paths ? paths : this.state.paths, weight ? weight : this.state.weight));
    }
  }    

  /**
   * Perform a cypher query to retrieve  cypher query
   */
  queryResults (requestQuery) {
    var url = restPostConfig.url;

    if (restPostConfig.url === undefined) {
      url = defaultHTTPConfiguration.url;
    }

    let contentType = restPostConfig.contentType.length !== 0 ? restPostConfig.contentType : defaultHTTPConfiguration.contentType;

    // Make cypher query request statement into string
    let request = JSON.parse(JSON.stringify(requestQuery));

    let self = this;

    // Axios HTTP Post request with cypher query
    axios({
      method: 'post',
      url: url,
      headers: { 'content-type': contentType },
      data: request,
    }).then( function (response) {
      var blob = new Blob(["onmessage = " + queryParser ]);
      var blobUrl = window.URL.createObjectURL(blob);

      var worker = new Worker(blobUrl);
      worker.onmessage = function (e) {
        switch (e.data.resultMessage) {
        case "OK":
          self.setState( { graph : e.data.params.results , legend : e.data.params.colorLabels, loading : false, queryLoaded : true });
          self.objectsLoaded = e.data.params.results.nodes.length;
          setTimeout( function () {
            self.resetCamera();
            if ( self.graphRef.current !== null ) {
              self.graphRef.current.ggv.current.d3Force('charge').strength(-(self.objectsLoaded * 100 ))
            }
          }, (self.objectsLoaded * 20));
          break;
        }
      };

      let params = {
        results: response.data,
        configuration : configuration,
        styling : stylingConfiguration,
        paths : self.state.paths,
        NODE_WIDTH : NODE_WIDTH, NODE_HEIGHT : NODE_HEIGHT
      }
      
      // Invoke web worker to perform conversion of graph data into format
      worker.postMessage({ message: "refine", params: params });
    })
      .catch( function (error) {
        self.setState( { loading : false } );
      })
  }

  /**
   * Breaks Description texts into lines to fit within a certain width value.
   */
  wrapText (context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }
  
  // Calculate link middle point
  getQuadraticXY (t, sx, sy, cp1x, cp1y, ex, ey) {
    return {
      x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex,
      y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey,
    };
  }

  render () {
    let self = this;
    
    // Detect when the first load of the Graph component happens
    const { classes, circuitQuerySelected } = this.props;
    this.circuitQuerySelected = circuitQuerySelected;
    
    let errorMessage = "Not enough input queries to create a graph, needs 2.";
    if ( this.state.neurons?.[0]?.id != "" && this.state.neurons?.[1]?.id != "" ){
      errorMessage = "Graph not available for " + this.state.neurons.map(a => `'${a.id}'`).join(",");
    }
    return (
      this.state.loading
        ? <CircularProgress id= { COMPONENT_ID } classes={{ root : classes.loader }}
        />
        : this.state.graph.nodes.length == 0
          ? <div>
            <h4 className={classes.errorMessage}>{errorMessage}</h4>
            <Controls
              updateGraph={self.updateGraph}
              updatePaths={self.updatePaths}
              updateWeight={self.updateWeight}
              neurons={this.state.neurons}
              queryLoaded={this.state.queryLoaded}
              paths={this.state.paths}
              weight={this.state.weight}
              resultsAvailable={ () => this.state.graph.nodes.length > 0 }
              resetCamera={self.resetCamera}
              zoomIn={self.zoomIn}
              zoomOut={self.zoomOut}
              circuitQuerySelected={circuitQuerySelected}
              datasource="SOLR"
              legend = {self.state.legend}
              ref={self.controlsRef}
              clearGraph={self.clearGraph}
              key="controls"
            />
          </div>
          : <GeppettoGraphVisualization
            id= { COMPONENT_ID }
            // Graph data with Nodes and Links to populate
            data={this.state.graph}
            // Create the Graph as 2 Dimensional
            d2={true}
            nodeLabel={node => node.path}
            // Relationship label, placed in Link
            linkLabel={link => link.label}
            // Width of links, log(weight)
            linkWidth={link => link.weight ? Math.log(link.weight) : 1 }
            linkCurvature={ configuration.linkCurvature }
            linkDirectionalArrowLength={link => link.weight ? Math.max(10, Math.log(link.weight) * 5) : 2}
            linkDirectionalArrowRelPos={.75}
            // Node label, used in tooltip when hovering over Node
            linkCanvasObjectMode={() => "after"}
            linkCanvasObject={(link, ctx) => {
              const MAX_FONT_SIZE = 8;
              const LABEL_NODE_MARGIN = 1 * 1.5;

              const start = link.source;
              const end = link.target;
              
              // ignore unbound links
              if (typeof start !== 'object' || typeof end !== 'object') {
                return;
              }
              
              // calculate label positioning
              let textPos = Object.assign({},...['x', 'y'].map(c => ({ [c]: start[c] + (end[c] - start[c]) / 2 })));

              if (link?.__controlPoints ) {
                textPos = this.getQuadraticXY(
                  .3,
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
            nodeRelSize={20}
            nodeSize={30}
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
            nodeCanvasObject={(node, ctx, globalScale) => {
              let cardWidth = NODE_WIDTH;
              let cardHeight = NODE_HEIGHT;
              let borderThickness = self.highlightNodes.has(node) ? NODE_BORDER_THICKNESS : 1;

              // Node border color
              ctx.fillStyle = self.hoverNode == node ? stylingConfiguration.defaultNodeHoverBoderColor : (self.highlightNodes.has(node) ? stylingConfiguration.defaultNeighborNodesHoverColor : stylingConfiguration.defaultNodeBorderColor) ;
              // Create Border
              ctx.fillRect(node.x - cardWidth / 2 - (borderThickness), node.y - cardHeight / 2 - (borderThickness), cardWidth , cardHeight );

              // Assign color to Description Area background in Node
              ctx.fillStyle = stylingConfiguration.defaultNodeDescriptionBackgroundColor;
              // Create Description Area in Node
              ctx.fillRect(node.x - cardWidth / 2,node.y - cardHeight / 2, cardWidth - (borderThickness * 2 ), cardHeight - ( borderThickness * 2) );
              // Assign color to Title Bar background in Node
              ctx.fillStyle = node.color;
              // Create Title Bar in Node
              ctx.fillRect(node.x - cardWidth / 2 ,node.y - cardHeight / 2, cardWidth - ( borderThickness * 2 ), cardHeight / 3);

              // Assign font to text in Node
              ctx.font = stylingConfiguration.defaultNodeFont;
              // Assign color to text in Node
              ctx.fillStyle = stylingConfiguration.defaultNodeFontColor;
              // Text in font to be centered
              ctx.textAlign = "center";
              ctx.textBaseline = 'middle';
              // Create Title in Node
              ctx.fillText(node.title, node.x, node.y - 15);
              // Add Description text to Node
              this.wrapText(ctx, node.path, node.x, node.y, cardWidth - (borderThickness * 2) , 5);
            }}
            // Overwrite Node Canvas Object
            nodeCanvasObjectMode={node => 'replace'}
            // bu = Bottom Up, creates Graph with root at bottom
            dagMode="lr"
            nodeVal = { node => {
              node.fx = node.positionX;
              node.fy = node.level > 0 ? -100 * node.level : node.fy ? node.fy : 0 ;
            }}
            dagLevelDistance = {25}
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
                updateGraph={self.updateGraph}
                updatePaths={self.updatePaths}
                updateWeight={self.updateWeight}
                neurons={this.state.neurons}
                queryLoaded={this.state.queryLoaded}
                paths={this.state.paths}
                weight={this.state.weight}
                resultsAvailable={ () => this.state.graph.nodes.length > 0 }
                resetCamera={self.resetCamera}
                zoomIn={self.zoomIn}
                zoomOut={self.zoomOut}
                clearGraph={self.clearGraph}
                circuitQuerySelected={this.circuitQuerySelected}
                legend = {self.state.legend}
                ref={self.controlsRef}
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
            }
            }
          />
    )
  }
}

VFBCircuitBrowser.propTypes = { classes: PropTypes.object.isRequired };

function mapStateToProps (state) {
  return { circuitQuerySelected : state.generals.ui.circuitBrowser.circuitQuerySelected }
}

export default connect(mapStateToProps, null, null, { forwardRef : true } )(withStyles(styles)(VFBCircuitBrowser));
