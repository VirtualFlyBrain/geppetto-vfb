import React, { Component } from 'react'
import axios from 'axios';
import GeppettoGraphVisualization from 'geppetto-client/js/components/interface/graph-visualization/Graph'
import CircularProgress from '@material-ui/core/CircularProgress';

const https = require('https');
const restPostConfig = require('../../configuration/VFBGraph/graphConfiguration').restPostConfig;
const cypherQuery = require('../../configuration/VFBGraph/graphConfiguration').cypherQuery;

const globalConfiguration = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
}


export default class VFBGraph extends Component {

  constructor (props) {
    super(props);
    this.state = { graph : { nodes : [], links : [] } , loading : true, currentQuery : this.props.instance };
    this.refineGraphData = this.refineGraphData.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
    this.queryResults = this.queryResults.bind(this);
    
    this.__isMounted = false;
  }
  
  componentDidMount() { 
    this.__isMounted = true;
    
    if (this.state.currentQuery !== undefined && this.state.currentQuery !== null){
      this.updateGraph(this.props.instance);
    }
  }
  
  componentWillUnmount() {
    this.__isMounted = false;
  }
  
  updateGraph(instance) {
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
    var idToSearch = innerInstance.id;

    if(this.__isMounted){
	  this.setState({ loading : true, currentQuery : idToSearch });
	  this.queryResults(cypherQuery(idToSearch))
    }
  }
  
  queryResults(requestQuery) {
    var url = restPostConfig.url;
    
    if (restPostConfig.url === undefined) {
      url = globalConfiguration.url;
    }

    let request = JSON.parse(JSON.stringify(requestQuery));
  
    let self = this;
    
    axios({
      method: 'post',
      url: url,
      headers: { 'content-type': restPostConfig.contentType.length !== 0 ? restPostConfig.contentType : globalConfiguration.contentType },
      data: request,
    }).then(function(response){
      console.log(response);
      self.setState( { graph : self.refineGraphData(response.data) , loading : false} );
    })
      .catch(function(error) {
        console.log(error);
      })
  }
  
  refineGraphData(graphData) {
	let data = graphData.results[0].data;
    let nodes = [], links = [];
    let level = 1;
    let parent = null;
    let linksMap = new Map();
    let nodesMap = new Map();
    
    data.forEach(({ graph }) => {
        graph.relationships.forEach(({ startNode, endNode }) => {
          let node = linksMap.get(endNode);
          if (node === undefined) {
            linksMap.set(endNode, new Array());
            node = linksMap.get(endNode);
          }
           
          if (!linksMap.get(endNode).includes(startNode)) {
            linksMap.get(endNode).push(startNode);
          }
        });
      }); 
    
    data.forEach(({ graph }) => {
      graph.nodes.forEach(({ id, properties }) => {
        let label = properties.label;
        if (properties.is_root && nodesMap.get(id) === undefined) {
          const n = {
            path :  properties.label,
            leaf : label,
            id : id,
            level : 0,
            short_form : properties.short_form,
            parent : ""
          };
          parent = n;
          nodesMap.set(id,n);
          nodes.push(n);
        }
      });
    });
    
    data.forEach(({ graph }) => {
      graph.nodes.forEach(({ id, properties }) => {
        let label = properties.label;
        if (!properties.is_root && nodesMap.get(id) === undefined ) {
          const n = {
            path :  properties.label,
            leaf : label,
            id : id,
            level : 0,
            short_form : properties.short_form,
            parent : parent
          };
          parent = n;
          nodesMap.set(id,n);
          nodes.push(n);
        }
      });
    });   
    
    nodes.forEach( part => {
      let n = linksMap.get(part.id);
      if (n !== undefined){
        for (var i = 0 ; i < n.length; i++){
          if (nodesMap.get(n[i]) !== undefined) {  
            links.push( { source: part, target: nodesMap.get(n[i]).path, targetNode: nodesMap.get(n[i]) } );
          }
        }
      }    
    });
        
    return { nodes, links };
  }

  
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
    return (
      this.state.loading ? 
        <CircularProgress />  
        :
          this.state.graph.nodes.length == 0 ? 
          <p>No Graph Available for {this.state.currentQuery}</p>
          :
          <GeppettoGraphVisualization
          data={this.state.graph}
          d2={true}
          nodeLabel={node => node.short_form}
          backgroundColor="black"
          linkColor="white"
          nodeCanvasObject={(node, ctx, globalScale) => {
            let cardWidth = 60;
            let cardHeight = 40;
            let thickness = 1;
            ctx.fillStyle = "black";
            ctx.fillRect(node.x - cardWidth / 2 - (thickness), node.y - cardHeight / 2 - (thickness), cardWidth + (thickness * 2), cardHeight + (thickness * 2));
          
            ctx.fillStyle = "white";
            ctx.fillRect(node.x - cardWidth / 2,node.y - cardHeight / 2, cardWidth, cardHeight);
            ctx.fillStyle = "#ADD8E6";
            ctx.fillRect(node.x - cardWidth / 2,node.y - cardHeight / 2, cardWidth, cardHeight / 3);
            
            // draw font in red
            ctx.textAlign = "center";
            ctx.fillStyle = "black";
            ctx.font = "5px sans-serif";
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, node.x, node.y - 10);
            this.wrapText(ctx, node.path, node.x, node.y, cardWidth, 5);
          }}
          nodeCanvasObjectMode={node => 'replace'}
        />
    )
  }
}
