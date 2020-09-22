import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from '@geppettoengine/geppetto-ui/graph-visualization/Graph'
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import Controls from './Controls';
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
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
function refineData (e) {
  let graphData = e.data.params.results;
  console.log("Results ", e);
  let data = graphData.results[0].data;
  let nodes = [], links = [];
  let linksMap = new Map();
  let nodesMap = new Map();

  // Creates links map from Relationships, avoid duplicates
  data.forEach(({ graph }) => {
    graph.relationships.forEach(({ startNode, endNode, properties }) => {
      if (linksMap.get(startNode) === undefined) {
        linksMap.set(startNode, new Array());
      }

      let newLink = true;
      linksMap.get(startNode).find( function ( ele ) {
        if ( ele.target !== endNode ) {
          newLink = true;
        } else {
          newLink = false;
        }
      });

      // Only keep track of new links, avoid duplicates
      if ( newLink ) {
        linksMap.get(startNode).push( { target : endNode, label : properties[e.data.params.configuration.resultsMapping.link.label] });
      }

    });
  });

  // Loop through nodes from query and create nodes for graph
  data.forEach(({ graph }) => {
    graph.nodes.forEach(({ id, labels, properties }) => {
      let label = properties[e.data.params.configuration.resultsMapping.node.label];
      let title = properties[e.data.params.configuration.resultsMapping.node.title];
      let color = e.data.params.styling.defaultNodeDescriptionBackgroundColor;
      
      const colorLabels = Object.entries(e.data.params.styling.nodeColorsByLabel);
      
      for (var i = 0; i < colorLabels.length ; i++ ) {
        if ( labels.indexOf(colorLabels[i][0]) > -1 ) {
          color = colorLabels[i][1];
          break;
        }
      }
      let n = null;
      if (nodesMap.get(id) === undefined) {
        n = {
          path :  label,
          id : parseInt(id),
          title : title,
          width : e.data.params.NODE_WIDTH,
          height : e.data.params.NODE_HEIGHT,
          color : color,
        };
        nodesMap.set(id, n);
        nodes.push(n);
      }
    });
  });

  // Creates Links array with nodes
  nodes.forEach( sourceNode => {
    let id = sourceNode.id;
    if ( typeof id === "number" ) {
      id = sourceNode.id.toString();
    }
    let n = linksMap.get(id);
    if (n !== undefined){
      for (var i = 0 ; i < n.length; i++){
        let targetNode = nodesMap.get(n[i].target);

        if (targetNode !== undefined) {
          // Create new link for graph
          let link = { source: sourceNode, name : n[i].label, target: targetNode, targetNode: targetNode };
          links.push( link );

          // Assign neighbors to nodes and links
          !sourceNode.neighbors && (sourceNode.neighbors = []);
          !targetNode.neighbors && (targetNode.neighbors = []);
          sourceNode.neighbors.push(targetNode);
          targetNode.neighbors.push(sourceNode);

          // Assign links to nodes
          !sourceNode.links && (sourceNode.links = []);
          !targetNode.links && (targetNode.links = []);
          sourceNode.links.push(link);
          targetNode.links.push(link);
        }
      }
    }
  });

  // Worker is done, notify main thread
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links } } });
}

/**
 * Component for VFB Circuit Browser between Neurons
 */
class VFBCircuitBrowser extends Component {

  constructor (props) {
    super(props);
    this.state = {
      graph : { nodes : [], links : [] } , 
      loading : true,
      dropDownAnchorEl : null,
      neurons : ["", ""],
      hops : Math.ceil((configuration.maxHops - configuration.minHops) / 2),
      reload : false
    }
    this.updateGraph = this.updateGraph.bind(this);
    this.queryResults = this.queryResults.bind(this);
    this.handleNodeLeftClick = this.handleNodeLeftClick.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.queriesUpdated = this.queriesUpdated.bind(this);
    this.updateHops = this.updateHops.bind(this);
    this.resize = this.resize.bind(this);
    
    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;

    this.graphRef = React.createRef();
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
    this.updateGraph(this.state.neurons , Math.ceil((configuration.maxHops - configuration.minHops) / 2));
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
  }

  componentWillUnmount () {
    this.__isMounted = false;
  }
  
  /**
   * New neurons have been entered by user, update graph
   */
  queriesUpdated (neurons) {
    this.updateGraph(neurons, this.state.hops);
  }
  
  /**
   * Hops in controls component have been updated, request new graph with updated amount of hops
   */
  updateHops (hops) {
    this.updateGraph(this.state.neurons, hops);
  }

  resetCamera () {
    if ( this.graphRef.current !== null ) {
      this.graphRef.current.ggv.current.zoomToFit();
      this.focused = true;
    }
  }

  resize(){
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

  /**
   * Handle Left click on Nodes
   */
  handleNodeLeftClick (node, event) {
    this.graphRef.current.ggv.current.centerAt(node.x , node.y, 1000);
    this.graphRef.current.ggv.current.zoom(2, 1000);
  }
  
  /**
   * Re-render graph with a new instance
   */
  updateGraph (neurons, hops) {
    if (this.__isMounted){
      // Show loading spinner while cypher query search occurs
      this.setState({ loading : true , neurons : neurons, hops : hops });
      // Perform cypher query
      this.queryResults(cypherQuery(neurons.map(d => `'${d}'`).join(','), hops));
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
      var blob = new Blob(["onmessage = " + refineData ]);
      var blobUrl = window.URL.createObjectURL(blob);

      var worker = new Worker(blobUrl);
      worker.onmessage = function (e) {
        switch (e.data.resultMessage) {
        case "OK":
          self.setState( { graph : e.data.params.results , loading : false });
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

      // Invoke web worker to perform conversion of graph data into format
      worker.postMessage({ message: "refine", params: { results: response.data, configuration : configuration, styling : stylingConfiguration, NODE_WIDTH : NODE_WIDTH, NODE_HEIGHT : NODE_HEIGHT } });
    })
      .catch( function (error) {
        console.log("HTTP Request Error: ", error);
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

  render () {
    let self = this;
    const { classes } = this.props;
    
    // Detect when the first load of the Graph component happens
    if ( !this.state.loading && this.firstLoad ) {
      // Reset CircuitQuerySelected value after first load
      this.circuitQuerySelected = "";
    }
    if ( !this.state.loading && !this.firstLoad ) {
      this.firstLoad = true;
    }
    
    return (
      this.state.loading
        ? <CircularProgress classes={{ root : classes.loader }}
        />
        : <GeppettoGraphVisualization
          id= { COMPONENT_ID }
          // Graph data with Nodes and Links to populate
          data={this.state.graph}
          // Create the Graph as 2 Dimensional
          d2={true}
          // Node label, used in tooltip when hovering over Node
          nodeLabel={node => node.path}
          nodeRelSize={20}
          nodeSize={30}
          // Relationship label, placed in Link
          linkLabel={link => link.name}
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
          dagLevelDistance = {100}
          // Handles clicking event on an individual node
          onNodeClick = { (node,event) => this.handleNodeLeftClick(node,event) }
          ref={this.graphRef}
          // Disable dragging of nodes
          enableNodeDrag={false}
          // Allow camera pan and zoom with mouse
          enableZoomPanInteraction={true}
          // Width of links
          linkWidth={1.25}
          controls = {
            <Controls
              queriesUpdated={self.queriesUpdated}
              updateHops={self.updateHops}
              neurons={this.state.neurons}
              hops={this.state.hops}
              resultsAvailable={ () => this.state.graph.nodes.length > 0 }
              resetCamera={self.resetCamera}
              zoomIn={self.zoomIn}
              zoomOut={self.zoomOut}
              circuitQuerySelected={this.circuitQuerySelected}
              datasource="SOLR"
            />
          }
          // Function triggered when hovering over a nodeoptions
          onNodeHover={node => {
            // Reset maps of hover nodes and links
            self.highlightNodes.clear();
            self.highlightLinks.clear();

            // We found the node that we are hovering over
            if (node) {
              // Keep track of hover node, its neighbors and links
              self.highlightNodes.add(node);
              node.neighbors.forEach(neighbor => self.highlightNodes.add(neighbor));
              node.links.forEach(link => self.highlightLinks.add(link));
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
  return {
    circuitQuerySelected : state.generals.circuitQuerySelected,
    circuitBrowserSelected : state.generals.circuitBrowserSelected
  }
}

export default connect(mapStateToProps, null, null, { forwardRef : true } )(withStyles(styles)(VFBCircuitBrowser));
