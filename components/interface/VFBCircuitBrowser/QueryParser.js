/**
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
export function queryParser (e) {
  var start = Date.now();
  console.log("START : ", start);
  let graphData = e.data.params.results;
  console.log("Results ", e);
  // Reads graph data
  let data = graphData.results[0].data;
  // Read source and target node ids
  let sourceNodeID = data[0]?.row[4];
  let targetNodeID = data[0]?.row[5];
  // Read relationship max hops
  let relationshipsHops = data[0]?.row[7];
  
  // The nodes and links arrays used for the graph
  let nodes = [], links = [];
  // Keeps track of links
  let linksMap = new Map();
  // Keeps track of reverse links
  let reverseMap = new Map();
  // Keeps track of nodes in map
  let nodesMap = new Map();
  
  // Colors for labels
  let presentColorLabels = new Array();
  // maps of links with their max hop
  let linksMaxHops = {};
  let nodesPerLevel = new Array(7).fill(0);
  let maxHops = 2;
  let levels = new Array(7).fill(0);
  
  relationshipsHops?.forEach( rel => {
    let split = rel.split(":");
    let level = parseInt(split[1]) + 1;
    level > maxHops ? maxHops = level : null;
    // Map link id to highest hop
    linksMaxHops[split[0]] = level;
  })
  
  console.log("Reverse Map : ", reverseMap)

    // Creates links map from Relationships, avoid duplicates
  data.forEach(({ graph, row }) => {
    graph.relationships.forEach(({ startNode, endNode, properties, id }) => {
      linksMaxHops[id] ? nodesPerLevel[endNode] = linksMaxHops[id] : null;
    });
  });
  
  // Loop through nodes from query and create nodes for graph
  data.forEach(({ graph }) => {
    graph.nodes.forEach(({ id, labels, properties }) => {
      let label = properties[e.data.params.configuration.resultsMapping.node.label];
      let title = properties[e.data.params.configuration.resultsMapping.node.title];
      let color = e.data.params.styling.defaultNodeDescriptionBackgroundColor;
      
      // Retrieve list of Label colors from configuration
      const colorLabels = Object.entries(e.data.params.styling.nodeColorsByLabel);
      
      // Loop through color labels
      for (var i = 0; i < colorLabels.length ; i++ ) {
        let index = labels.indexOf(colorLabels[i][0]);
        if ( index > -1 ) {
          color = colorLabels[i][1];
          // Add to array of present colors only if array doesn't have it already
          if ( !presentColorLabels.includes(labels[index]) ) {
            presentColorLabels.push(labels[index]);
          }
          break;
        }
      }
      let n = null;
      if (nodesMap.get(id) === undefined) {
        let level = 0;
        if ( id != targetNodeID && id != sourceNodeID){
          level = parseInt(nodesPerLevel[id]);
        }
        
        console.log("Level ", level);
        console.log("nodesPerLevel[level] ", levels[level]);
        level > 0 ? levels[level] = levels[level] + 1 : null;
        
        n = {
          path :  label,
          id : parseInt(id),
          title : title,
          level : level,
          width : e.data.params.NODE_WIDTH,
          height : e.data.params.NODE_HEIGHT,
          color : color,
        };
        
        nodesMap.set(id, n);
        nodes.push(n);
      }
    });
  });
  
  // Creates links map from Relationships, avoid duplicates
  data.forEach(({ graph, row }) => {
    graph.relationships.forEach(({ startNode, endNode, properties, id }) => {
      let matchingStartNode = nodes.find((node) => node.id === parseInt(startNode));
      let matchingEndNode = nodes.find((node) => node.id === parseInt(endNode));
      
      console.log("matchingStartNode ", matchingStartNode);
      console.log("matchingEndNode ", matchingEndNode);
      if ( matchingStartNode?.level <= matchingEndNode?.level ) {
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
          linksMap.get(startNode).push( { target : endNode, label : properties[e.data.params.configuration.resultsMapping.link.label], weight : properties[e.data.params.configuration.resultsMapping.link.weight] });
        }        
      } else {
        // Keep track of reverse links
        if (reverseMap.get(startNode) === undefined) {
          reverseMap.set(startNode, new Array());
        }
        reverseMap.get(startNode).push( { target : endNode, label : properties[e.data.params.configuration.resultsMapping.link.label], weight : properties[e.data.params.configuration.resultsMapping.link.weight] });
      }      
    });
  });
  
  console.log("Nodes per level ", levels);
  let maxNodesPerLevel = levels.reduce(function (a, b) {
    return Math.max(a, b);
  });
  console.log("Max Nodes per level ", maxNodesPerLevel);
  console.log("Hops ", maxHops);
  
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
          let match = links.find( link => link.target === targetNode && link.source === sourceNode);
          let reverse = reverseMap.get(targetNode.id.toString())?.find( node => node.target === sourceNode.id.toString());
          if ( !match ) {
            // Create tooltip label for link and weight
            const tooltip = "Label  : " + n[i].label + '<br/>' 
              + "Weight : " + (reverse ? n[i].weight + " [" + reverse.weight + "]" : n[i].weight);
            const weightLabel = reverse ? n[i].weight + " [" + reverse.weight + "]" : n[i].weight;
            // Create new link for graph
            let link = { source: sourceNode, label : tooltip, weightLabel : weightLabel, weight : n[i].weight, target: targetNode, targetNode: targetNode, curvature: .75 };
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
    }
    
    let positionX = 0;
    if ( sourceNode.level === 0 ){
      if ( sourceNode.id == targetNodeID ){
        sourceNode.positionX = maxNodesPerLevel * 200;
      } else if ( sourceNode.id == sourceNodeID ) {
        sourceNode.positionX = maxNodesPerLevel * -200;
      } 
    } else if ( sourceNode.level > 1 ) {
      levels[sourceNode.level] == 1 ? positionX = ((maxNodesPerLevel * -200) + 100) : positionX = (maxNodesPerLevel * -200) + levels[sourceNode.level] * 100;
      levels[sourceNode.level]-- 
      sourceNode.positionX = positionX;
    }
    console.log("Source Node ", sourceNode);
    console.log("PositonX ", sourceNode.positionX);
    console.log("Level ", sourceNode.level);
  });
  
  var end = Date.now();
  console.log("END : ", end);
  var elapsed = end - start;
  console.log("Elapse time ", elapsed);
  
  // Worker is done, notify main thread
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links }, colorLabels : presentColorLabels } });
  
  end = Date.now();
  elapsed = end - start;
  console.log("Elapse time after post message ", elapsed);
}