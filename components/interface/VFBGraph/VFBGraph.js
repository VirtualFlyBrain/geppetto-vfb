import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from '@geppettoengine/geppetto-ui/graph-visualization/Graph'
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { UPDATE_GRAPH } from './../../../actions/generals';
import { connect } from "react-redux";

/**
 * Read configuration from graphConfiguration.js
 */
const configuration = require('../../configuration/VFBGraph/graphConfiguration').configuration;
const restPostConfig = require('../../configuration/VFBGraph/graphConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBGraph/graphConfiguration').locationCypherQuery;
const stylingConfiguration = require('../../configuration/VFBGraph/graphConfiguration').styling;

/**
 * If no configuration is given for queries in graphConfiguration.js, we use this configuration.
 */
const defaultHTTPConfiguration = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
}

const COMPONENT_ID = "VFBGraph";
const NODE_WIDTH = 55;
const NODE_HEIGHT = 40;
const NODE_BORDER_THICKNESS = 2;

/**
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
function refineData (e) {
  let graphData = e.data.params.results;
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
    graph.nodes.forEach(({ id, properties }) => {
      let label = properties[e.data.params.configuration.resultsMapping.node.label];
      let title = properties[e.data.params.configuration.resultsMapping.node.title];
      let n = null;
      if (nodesMap.get(id) === undefined) {
        n = {
          path :  label,
          id : parseInt(id),
          title : title,
          width : e.data.params.NODE_WIDTH,
          height : e.data.params.NODE_HEIGHT
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
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links }, id : e.data.params.value } });
}

class VFBGraph extends Component {

  constructor (props) {
    super(props);
    this.state = {
      graph : { nodes : [], links : [] },
      currentQuery : this.props.instance != null ? this.props.instance.id : "",
      dropDownAnchorEl : null,
      optionsIconColor : stylingConfiguration.defaultRefreshIconColor,
      reload : false
    }
    this.updateGraph = this.updateGraph.bind(this);
    this.instanceFocusChange = this.instanceFocusChange.bind(this);
    this.queryResults = this.queryResults.bind(this);
    this.handleNodeLeftClick = this.handleNodeLeftClick.bind(this);
    this.handleNodeRightClick = this.handleNodeRightClick.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.queryNewInstance = this.queryNewInstance.bind(this);
    this.resetCamera = this.resetCamera.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.selectedNodeLoaded = this.selectedNodeLoaded.bind(this);
    this.resize = this.resize.bind(this);
    this.sync = this.sync.bind(this);

    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;

    this.graphRef = React.createRef();
    this.__isMounted = false;
    this.shiftOn = false;
    this.objectsLoaded = 0;
    this.focused = false;
    // Graph component has been resized
    this.graphResized = false;
    this.focusedInstance = { id : "" };
    this.selectedDropDownQuery = -1;
    this.loading = true;
    this.firstLoad = true;
    this.nodeSelectedID = "";
  }

  componentDidMount () {
    let self = this;
    this.__isMounted = true;

    if (this.state.currentQuery !== undefined && this.state.currentQuery !== "" && this.state.currentQuery !== null){
      if ( this.props.instance !== null ) {
        if (this.props.instance.getParent() !== null) {
          this.focusedInstance = this.props.instance.getParent();
        } else {
          this.focusedInstance = this.props.instance;
        }
      }
      this.updateGraph();
    }

    // Keyboard listener, detect when shift is pressed down
    document.addEventListener("keydown", event => {
      if (event.isComposing || event.keyCode === 16) {
        self.shiftOn = true;
      }
    });

    document.addEventListener("keyup", event => {
      if (event.isComposing || event.keyCode === 16) {
        self.shiftOn = false;
      }
    });
  }

  componentDidUpdate () {
    let self = this;
    
    if (this.loading && this.firstLoad) {
      if (this.state.currentQuery === undefined || this.state.currentQuery === "" || this.state.currentQuery === null){
        if (this.props.instance !== null && this.props.instance !== undefined) {
          if (this.props.instance.getParent() !== null) {
            this.focusedInstance = this.props.instance.getParent();
          } else {
            this.focusedInstance = this.props.instance;
          }
          this.firstLoad = false;
          this.updateGraph();
        } else if (this.props.instanceOnFocus !== null && this.props.instanceOnFocus !== undefined) {
          if (this.props.instanceOnFocus.getParent() !== null) {
            this.focusedInstance = this.props.instanceOnFocus.getParent();
          } else {
            this.focusedInstance = this.props.instanceOnFocus;
          }
          this.firstLoad = false;
          this.updateGraph();
        }
      }
    }
    
    
    // Reset camera if graph component is visible, not focused or has been resized
    if ( this.props.visible && ( !this.focused || this.graphResized ) ) {
      /*
       * Update graph with selected query index from configuration dropdown selection, this is to allow to lauch the component to be launched
       * with specific configuration dropdown query. 
       */
      stylingConfiguration.dropDownQueries.map((item, index) => {
        if ( parseInt(self.props.graphQueryIndex) >= 0 && self.firstLoad ) { 
          if ( parseInt(self.props.graphQueryIndex) === index ) {
            self.selectedDropDownQuery = index;
            self.loading = true;
            let idToSearch = self.props.instanceOnFocus.id;
            if (self.props.instanceOnFocus.getParent() !== null) {
              idToSearch = self.props.instanceOnFocus.getParent().id;
            }
            self.queryResults(item.query(idToSearch), idToSearch);
          }
        }
      });
      // Reset camera view after graph component becomes visible
      setTimeout( function () {
        self.resetCamera();
        self.focused = true;
        self.loading = false;
        self.graphResized = false;
      }, (self.objectsLoaded * 50));
    } else if ( !this.props.visible ) {
      this.focused = false;
      if ( parseInt(this.props.graphQueryIndex) >= 0 && !this.firstLoad ) {
        this.selectedDropDownQuery = -1;
        this.props.vfbGraph(UPDATE_GRAPH, this.focusedInstance, -1);
      }
      this.firstLoad = true;
    }
  }

  componentWillUnmount () {
    this.__isMounted = false;
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

  /**
   * Handle Left click on Nodes
   */
  handleNodeLeftClick (node, event) {
    this.nodeSelectedID = node.title;
    this.queryNewInstance(node);
  }

  /**
   * Handle Right click on Nodes
   */
  handleNodeRightClick (node, event) {
    this.graphRef.current.ggv.current.centerAt(node.x , node.y, 1000);
    this.graphRef.current.ggv.current.zoom(2, 1000);
  }
  
  sync () {
    this.instanceFocusChange(this.props.instanceOnFocus);
    this.updateGraph();
  }

  /**
   * Handle Menu drop down clicks
   */
  handleMenuClick (query) {
    if (this.__isMounted){
      // Show loading spinner while cypher query search occurs
      this.loading = true;
      this.setState({ dropDownAnchorEl : null });
      // Perform cypher query
      this.queryResults(query(this.state.currentQuery), this.state.currentQuery)
    }
  }

  /**
   * Query new instance by using 'addVfbId' functionality
   */
  queryNewInstance (node) {
    window.addVfbId(node.title);
    this.loading = true;
    this.setState({ optionsIconColor : stylingConfiguration.defaultRefreshIconColor });
    // Perform cypher query
    this.queryResults(cypherQuery(node.title), node.title)
  }

  selectedNodeLoaded (instance) {
    var loadedId = instance.id;
    if (instance.getParent() !== null) {
      loadedId = instance.getParent().id;
    }

    if ( this.nodeSselected ) {
      if ( this.nodeSelectedID === loadedId ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets notified every time the instance focused changes
   */
  instanceFocusChange (instance) {
    // Keep track of latest instance loaded/focused, will be needed to synchronize/update graph.
    this.selectedDropDownQuery = -1;
    if (instance.getParent() !== null) {
      this.focusedInstance = instance.getParent();
    } else {
      this.focusedInstance = instance;
    }
  }

  /**
   * Re-render graph with a new instance
   */
  updateGraph () {
    var idToSearch = this.focusedInstance.id;
    /*
     * function handler called by the VFBMain whenever there is an update of the instance on focus,
     * this will reflect and move to the node (if it exists) that we have on focus.
     */
    if (this.focusedInstance.getParent() !== null) {
      idToSearch = this.focusedInstance.getParent().id;
    }

    if (this.__isMounted){
      // Show loading spinner while cypher query search occurs
      this.loading = true;
      this.setState({ optionsIconColor : stylingConfiguration.defaultRefreshIconColor });
      // Perform cypher query
      this.queryResults(cypherQuery(idToSearch), idToSearch);
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
      var blob = new Blob(["onmessage = " + refineData ]);
      var blobUrl = window.URL.createObjectURL(blob);

      var worker = new Worker(blobUrl);
      worker.onmessage = function (e) {
        switch (e.data.resultMessage) {
        case "OK":
          self.loading = false;
          self.firstLoad = false;
          self.focusedInstance = e.data.params;
          self.setState( { graph : e.data.params.results, currentQuery : e.data.params.id });
          self.objectsLoaded = e.data.params.results.nodes.length;
          setTimeout( function () {
            self.resetCamera();
            if ( self.graphRef.current !== null ) {
              self.graphRef.current.ggv.current.d3Force('charge').strength(-(self.objectsLoaded * 100 ))
            }
          }, 0);
          break;
        }
      };

      // Invoke web worker to perform conversion of graph data into format
      worker.postMessage({ message: "refine", params: { results: response.data, value: instanceID, configuration : configuration, NODE_WIDTH : NODE_WIDTH, NODE_HEIGHT : NODE_HEIGHT } });
    })
      .catch( function (error) {
        self.loading = false;
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
    const { graphQueryIndex } = this.props;

    let syncColor = this.state.optionsIconColor;
    
    if (Object.keys(this.props.instanceOnFocus).length === 0 && this.props.instanceOnFocus.constructor === Object) {
      return (
        <p>Model not loaded, graph not available yet</p>
      );
    }

    if ( this.focusedInstance.id !== "" && !this.props.instanceOnFocus.id.includes(this.focusedInstance.id) ) {
      // If the length of the graph is 0, request a new query using the instanceOnFocus
      if ( this.state.graph.nodes.length === 0 && this.state.graph.links.length === 0 && this.focusedInstance.id !== this.state.currentQuery ){
        let idToSearch = this.focusedInstance.id;
        if (this.focusedInstance.getParent() !== null) {
          idToSearch = this.focusedInstance.getParent().id;
        }

        syncColor = stylingConfiguration.defaultRefreshIconColor;
        // Perform cypher query
        this.loading = true;
        this.queryResults(cypherQuery(idToSearch), idToSearch)
      }
      
      // Out of sync if instanceOnFocus is not what's on display
      if ( this.focusedInstance.id !== this.state.currentQuery ) {
        syncColor = stylingConfiguration.outOfSyncIconColor;
      }
    }

    // Out of sync if instanceOnFocus is not what's on display
    if ( !this.props.instanceOnFocus.id.includes(this.focusedInstance.id) ) {
      syncColor = stylingConfiguration.outOfSyncIconColor;
    }
    
    return (
      this.loading
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
              let color = stylingConfiguration.linkColor;
              if ( self.highlightLinks.has(link) ) {
                color = self.highlightNodes.has(link.source) || self.highlightNodes.has(link.targetNode) ? stylingConfiguration.linkHoverColor : stylingConfiguration.linkColor;
              }

              return color;
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
              let cardWidth = NODE_WIDTH;
              let cardHeight = NODE_HEIGHT;
              let borderThickness = self.highlightNodes.has(node) ? NODE_BORDER_THICKNESS : 1;

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
            dagMode="bu"
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
                <Tooltip title={<h6>Reset View</h6>}>
                  <i
                    style={
                      {
                        zIndex : "1000",
                        cursor : "pointer",
                        top : "10px",
                        left : "10px"
                      }
                    }
                    className={stylingConfiguration.icons.home}
                    onClick={self.resetCamera }>
                  </i>
                </Tooltip>
                <Tooltip title={<h6>Zoom In</h6>}>
                  <i
                    style={
                      {
                        zIndex : "1000",
                        cursor : "pointer",
                        marginTop : "20px",
                        left : "10px"
                      }
                    }
                    className={stylingConfiguration.icons.zoomIn}
                    onClick={self.zoomIn }>
                  </i>
                </Tooltip>
                <Tooltip title={<h6>Zoom Out</h6>}>
                  <i
                    style={
                      {
                        zIndex : "1000",
                        cursor : "pointer",
                        marginTop : "5px",
                        left : "10px"
                      }
                    }
                    className={stylingConfiguration.icons.zoomOut}
                    onClick={self.zoomOut }>
                  </i>
                </Tooltip>
                <Tooltip title={<h6>Refresh for {this.focusedInstance.name} </h6>}>
                  <i 
                    style={ 
                      { 
                        zIndex : "1000",
                        cursor : "pointer",
                        marginTop : "20px",
                        left : "10px",
                        color : syncColor
                      }
                    }
                    className={stylingConfiguration.icons.sync}
                    key="tooltip-icon"
                    onClick={self.sync}>
                  </i>
                </Tooltip>
                <Tooltip title={<h6>Options</h6>}>
                  <i 
                    style={ 
                      { 
                        zIndex : "1000" ,
                        cursor : "pointer",
                        marginTop : "5px",
                        left : "10px"
                      }
                    }
                    className={stylingConfiguration.icons.dropdown}
                    aria-label="more"
                    aria-controls="dropdown-menu"
                    aria-haspopup="true"
                    onClick={ event => self.setState( { dropDownAnchorEl : event.currentTarget } )}
                  />
                </Tooltip>
                <Menu
                  id="dropdown-menu"
                  anchorEl={self.state.dropDownAnchorEl}
                  keepMounted
                  open={Boolean(self.state.dropDownAnchorEl)}
                  onClose={ event => self.setState( { dropDownAnchorEl : null } )}
                  PaperProps={{
                    style: {
                      marginTop: '32px',
                      borderStyle: "solid",
                      borderColor: "#585858",
                      borderRadius: "0px 0px 2px 2px",
                      color: stylingConfiguration.dropDownTextColor,
                      backgroundColor: stylingConfiguration.dropDownBackgroundColor,
                    }
                  }}
                >
                  {stylingConfiguration.dropDownQueries.map(item => (
                    <MenuItem 
                      key={item.label(self.state.currentQuery)} 
                      onClick={() => self.handleMenuClick(item.query)}
                      style={{
                        fontSize : "14px",
                        fontFamily: "Barlow Condensed",
                      }}
                      onMouseEnter={e => {
                        e.target.style.color = stylingConfiguration.dropDownHoverTextColor;
                        e.target.style.backgroundColor = stylingConfiguration.dropDownHoverBackgroundColor;
                      }
                      }
                      onMouseLeave={e => {
                        e.target.style.color = stylingConfiguration.dropDownTextColor;
                        e.target.style.backgroundColor = stylingConfiguration.dropDownBackgroundColor;
                      }
                      }
                    >
                      {item.label(self.state.currentQuery)}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            }
            click={() => self.graphRef.current.ggv.current.zoomToFit()}
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

function mapStateToProps (state) {
  return {
    graphQueryIndex : state.generals.ui.graph.graphQueryIndex,
    instanceOnFocus : state.generals.instanceOnFocus
  }
}

function mapDispatchToProps (dispatch) {
  return { vfbGraph: (type, path, index) => dispatch ( { type : type, data : { instance : path, queryIndex : index } } ) }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(VFBGraph);
