import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from 'geppetto-client/js/components/interface/graph-visualization/Graph'
import CircularProgress from '@material-ui/core/CircularProgress';

/**
 * Read configuration from graphConfiguration.js
 */
const configuration = require('../../configuration/VFBGraph/graphConfiguration').configuration;
const restPostConfig = require('../../configuration/VFBGraph/graphConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBGraph/graphConfiguration').cypherQuery;
const stylingConfiguration = require('../../configuration/VFBGraph/graphConfiguration').styling;

/**
 * If no configuration is given for queries in graphConfiguration.js, we use this configuration.
 */
const defaultHTTPConfiguration = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
}

const COMPONENT_ID = "VFBGraph";

/**
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
function refineData (e) { 
  let graphData = e.data.params.results;
  let data = graphData.results[0].data;
  let nodes = [], links = [];
  let level = 0;
  let parent = null;
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
    graph.nodes.forEach(({ id, properties }) => {
      let label = properties[e.data.params.configuration.resultsMapping.node.label];
      let title = properties[e.data.params.configuration.resultsMapping.node.title];
      let n = null;
      if (nodesMap.get(id) === undefined) {
        n = {
          path :  label,
          id : id,
          title : title,
        };
        nodesMap.set(id, n);
        nodes.push(n);
      } 
    });
  });   
  
  // Creates Links array with nodes
  nodes.forEach( sourceNode => {
    let n = linksMap.get(sourceNode.id);
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

export default class VFBGraph extends Component {

  constructor (props) {
    super(props);
    this.state = { graph : { nodes : [], links : [] } , loading : true, currentQuery : this.props.instance };
    this.updateGraph = this.updateGraph.bind(this);
    this.queryResults = this.queryResults.bind(this);
    this.handleNodeLeftClick = this.handleNodeLeftClick.bind(this);
    this.handleNodeRightClick = this.handleNodeRightClick.bind(this);
    this.queryNewInstance = this.queryNewInstance.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    
    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;
    
    this.graphRef = React.createRef();    
    this.__isMounted = false;
    this.shiftOn = false;
    this.objectsLoaded = 0;
  }
  
  componentDidMount () {
    let self = this;
    this.__isMounted = true;
    
    if (this.state.currentQuery !== undefined && this.state.currentQuery !== null){
      this.updateGraph(this.props.instance);
    }
    
    // Keyboard listener, detect when shift is pressed down
    document.addEventListener("keydown", event => {
      if (event.isComposing || event.keyCode === 16) {
        self.shiftOn = true;
      }
    });
  }
  
  componentDidUpdate () {
  }
  
  componentWillUnmount () {
    this.__isMounted = false;
  }
  
  resetCamera () {
    if ( this.graphRef.current !== null ) {
      this.graphRef.current.ggv.current.zoomToFit();  
    } 
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
    if ( this.shiftOn ){
      this.queryNewInstance(node.title);
      this.shiftOn = false;
    } else {
      this.graphRef.current.ggv.current.centerAt(node.x , node.y, 1000);
      this.graphRef.current.ggv.current.zoom(2, 1000);
    }
  }
  
  /**
   * Handle Right click on Nodes, creates a new graph using the clicked node's ID as instance for cypher query
   */
  handleNodeRightClick (node, event) {
    this.queryNewInstance(node.title);
  }
  
  /**
   * Query new instance by using 'addVfbId' functionality
   */
  queryNewInstance (id) {
    this.setState( { loading : true } );
    window.addVfbId(id);
  }
  
  /**
   * Re-render graph with a new instance
   */
  updateGraph (instance) {
    /*
     * function handler called by the VFBMain whenever there is an update of the instance on focus,
     * this will reflect and move to the node (if it exists) that we have on focus.
     */
    var innerInstance = undefined;
    if (instance.getParent() !== null) {
      innerInstance = instance.getParent();
    } else {
      innerInstance = instance;
    }
    
    // ID of instance used to perform cypher query
    var idToSearch = innerInstance.id;

    if (this.__isMounted){
      // Show loading spinner while cypher query search occurs
      this.setState({ loading : true, currentQuery : idToSearch });
      // Perform cypher query
      this.queryResults(cypherQuery(idToSearch), idToSearch)
    }
  }
  
  /**
   * Perform a cypher query to retrieve graph for instance
   */
  queryResults (requestQuery, instanceID) {
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
      console.log(response);
      
      var blob = new Blob(["onmessage = " + refineData ]);
      var blobUrl = window.URL.createObjectURL(blob);
      
      var worker = new Worker(blobUrl);
      worker.onmessage = function (e) {
        switch (e.data.resultMessage) {
        case "OK":
          self.setState( { graph : e.data.params.results , loading : false });
          self.objectsLoaded = e.data.params.results.nodes.length + e.data.params.results.links.length;
          setTimeout( function () { 
            self.resetCamera();
          }, (self.objectsLoaded * 15));
          break;
        }
      };
      
      // Invoke web worker to perform conversion of graph data into format
      worker.postMessage({ message: "refine", params: { results: response.data, value: instanceID, configuration : configuration } });
    })
      .catch( function (error) {
        console.log(error);
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
    
    return (
      this.state.loading
        ? <CircularProgress 
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            margin: 'auto',
            color: "#11bffe",
            size: "55rem"
          }}
        />  
        : this.state.graph.nodes.length == 0
          ? <p>No Graph Available for {this.state.currentQuery}</p>
          : <GeppettoGraphVisualization
            id= { COMPONENT_ID }
            containerStyle={ { position: 'fixed' } }
            // Graph data with Nodes and Links to populate
            data={this.state.graph}
            // Create the Graph as 2 Dimensional
            d2={true}
            // Node label, used in tooltip when hovering over Node
            nodeLabel={node => node.path}
            nodeRelSize={20}
            // Relationship label, placed in Link
            linkLabel={link => link.name}
            // Assign background color to Canvas
            backgroundColor = {stylingConfiguration.canvasColor}
            // Assign color to Links connecting Nodes
            linkColor = {link => {
              let color = stylingConfiguration.linkColor;
              if ( self.highlightLinks.has(link) ) { 
                color = self.highlightNodes.has(link.source) || self.highlightNodes.has(link.targetNode) ? stylingConfiguration.linkHoverColor : stylingConfiguration.linkColor;
              }
              
              return color;
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              let cardWidth = 55;
              let cardHeight = 40;
              let borderThickness = self.highlightNodes.has(node) ? 2 : 1;
              
              // Node border color
              ctx.fillStyle = self.hoverNode == node ? stylingConfiguration.nodeHoverBoderColor : (self.highlightNodes.has(node) ? stylingConfiguration.neighborNodesHoverColor : stylingConfiguration.nodeBorderColor) ;
              // Create Border
              ctx.fillRect(node.x - cardWidth / 2 - (borderThickness), node.y - cardHeight / 2 - (borderThickness), cardWidth , cardHeight );
          
              // Assign color to Description Area background in Node
              ctx.fillStyle = stylingConfiguration.nodeDescriptionBackgroundColor;
              // Create Description Area in Node
              ctx.fillRect(node.x - cardWidth / 2,node.y - cardHeight / 2, cardWidth - (borderThickness * 2 ), cardHeight - ( borderThickness * 2) );
              // Assign color to Title Bar background in Node
              ctx.fillStyle = stylingConfiguration.nodeTitleBackgroundColor;
              // Create Title Bar in Node
              ctx.fillRect(node.x - cardWidth / 2 ,node.y - cardHeight / 2, cardWidth - ( borderThickness * 2 ), cardHeight / 3);
            
              // Assign font to text in Node
              ctx.font = stylingConfiguration.nodeFont;
              // Assign color to text in Node
              ctx.fillStyle = stylingConfiguration.nodeFontColor;
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
            dagMode="radialin"
            dagLevelDistance = {100}
            // Handles clicking event on an individual node
            onNodeClick = { (node,event) => this.handleNodeLeftClick(node,event) }
            // Handles clicking event on an individual node
            onNodeRightClick = { (node,event) => this.handleNodeRightClick(node,event) }
            ref={this.graphRef}
            // Disable dragging of nodes
            enableNodeDrag={false}
            // Allow camera pan and zoom with mouse
            enableZoomPanInteraction={true}
            // Width of links
            linkWidth={1.25}
            controls = {
              <div style={ { position: "absolute", width: "2vh", height: "100px",zIndex: "100" } }>
                <i style={ { zIndex : "1000" , cursor : "pointer", top : "10px", left : "10px" } } className="fa fa-home" onClick={self.resetCamera }></i>
                <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "20px", left : "10px" } } className="fa fa-search-plus" onClick={self.zoomIn }></i>
                <i style={ { zIndex : "1000" , cursor : "pointer", marginTop : "5px", left : "10px" } } className="fa fa-search-minus" onClick={self.zoomOut }></i>
              </div>
            }
            click={() => self.graphRef.current.ggv.current.zoomToFit()}
            // Function triggered when hovering over a node
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
