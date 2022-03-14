/**
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
export function queryParser (e) {
  // The nodes and links arrays used for the graph
  let nodes = [], links = [];
  let graphData = e.data.params.results;
  let weight = e.data.params.weight;
  console.log("Results ", e);
  // Reads graph data
  let data = graphData?.results[0]?.data;
  
  if (data === undefined) {
    this.postMessage({ resultMessage: "OK", params: { results: { nodes, links } } });
    return;
  }
  
  // Read source and target node ids
  let sourceNodeID = data[0]?.row[4];
  let targetNodeID = data[0]?.row[5];
  let maxHops = Math.ceil(data[0]?.row[6] / 2) + 1;
  // Read relationship max hops
  let relationshipsHops = data[0]?.row[7];
  const idClassLabels = data[0]?.row[8];
  
  // Keeps track of links
  let linksMap = new Map();
  let allRelationships = new Map();
  // Keeps track of reverse links
  let reverseMap = new Map();
  // Keeps track of nodes in map
  let nodesMap = new Map();
  
  // Colors for labels
  let legendLabels = new Array();
  // maps of links with their max hop
  let linksMaxHops = {};
  // Keeps track of what level nodes belong
  let nodesInLevel = new Array();
  
  // Read relationshipY:index values
  relationshipsHops?.forEach( rel => {
    let split = rel.split(":");
    // Map link id to highest index
    linksMaxHops[split[0]] = parseInt(split[1]) + 1;
  })
  
  // Creates map from Relationships for easy access. 
  data.forEach(({ graph, row }) => {
    graph.relationships.forEach(({ startNode, endNode, properties, id }) => {
      // Keep track of the level where the node will be placed
      linksMaxHops[id] ? nodesInLevel[endNode] ? nodesInLevel[endNode] = linksMaxHops[id] : nodesInLevel[endNode] = linksMaxHops[id] : null;
      if (allRelationships.get(parseInt(startNode)) === undefined) {
        allRelationships.set(parseInt(startNode), new Array());
      }
      if ( data[0]?.row[3].includes(parseInt(id)) ) {
        allRelationships?.get(parseInt(startNode))?.push( { target : parseInt(endNode), label : properties[e.data.params.configuration.resultsMapping.link.label], weight : properties[e.data.params.configuration.resultsMapping.link.weight] });
      }
    });
  });
    
  // Loop through nodes from query and create nodes for graph
  data.forEach(({ graph }) => {
    console.log("Results ", graph.nodes);
    graph.nodes.forEach(({ id, properties }) => {
      let label = properties[e.data.params.configuration.resultsMapping.node.label];
      let title = properties[e.data.params.configuration.resultsMapping.node.title];
      let color = e.data.params.styling.defaultNodeDescriptionBackgroundColor;
      let nodeColorLabels = new Array();
      const labels = properties.uniqueFacets.sort();
      
      // Retrieve list of Label colors from configuration
      const colorLabels = Object.entries(e.data.params.styling.nodeColorsByLabel);
      console.log("Labels ", labels);
      console.log("Color labels, ", colorLabels);
      // Loop through color labels
      for (var i = 0; i < colorLabels.length ; i++ ) {
        let index = labels.indexOf(colorLabels[i][0]);
        if ( index > -1 ) {
          nodeColorLabels.push(colorLabels[i][1]);
          // Add to array of present colors only if array doesn't have it already
          if ( !legendLabels.includes(labels[index]) ) {
            legendLabels.push(labels[index]);
          }
        }
      }
      let n = null;
      if (nodesMap.get(id) === undefined) {
        let level = 0;
        let parseID = parseInt(id);
        if ( parseID != targetNodeID && parseID != sourceNodeID){
          level = parseInt(nodesInLevel[id]);
        }
        
        // Assign hop to source and target node
        let hop = 1;
        if ( parseID === targetNodeID ) {
          hop = maxHops + 1;
        } else if ( parseID === sourceNodeID) {
          hop = 0;
        }
        
        const classLabel = idClassLabels[title];
        console.log("nodeColorLabels ", nodeColorLabels);
        console.log(" className ", Object.values(classLabel).join());

        n = {
          name :  label,
          id : parseID,
          title : title,
          level : level,
          hop : hop,
          width : e.data.params.NODE_WIDTH,
          height : e.data.params.NODE_HEIGHT,
          nodeColorLabels : nodeColorLabels,
          classLabel : Object.values(classLabel).join()
        };
        
        nodesMap.set(id, n);
        nodes.push(n);
      }
    });
  });
  
  // Helper function to assign hops to nodes, this will determine the X position
  function hopAssignment (startNodeID, endNodeID, relationshipsMap, currentHops, nodesHopsMap){
    let neighbors = relationshipsMap?.get(startNodeID);
  
    for ( let i = 0; i < neighbors?.length; i++ ) {
      let currentID = neighbors[i]?.target;
      if ( currentID != endNodeID && currentID != sourceNodeID && nodesHopsMap[currentID] === undefined ) {
        nodesHopsMap[currentID] = currentHops + 1;
        hopAssignment(currentID, endNodeID, relationshipsMap, currentHops + 1, nodesHopsMap)
      }
    }
 
    return nodesHopsMap;
  }
  
  // assign hops to nodes
  let hopsMap = hopAssignment(sourceNodeID, targetNodeID, allRelationships, 0, {});
  maxHops = Math.max.apply(null, Object.keys(hopsMap)?.map( key => parseInt(hopsMap[key])));
  
  let positionArray = [];
  // Loop through nodes and assign X position based on hops
  nodes.forEach( sourceNode => {
    let id = sourceNode.id;
    if ( typeof id === "number" ) {
      id = sourceNode.id.toString();
    }
    let n = linksMap.get(id);
    
    // Set the X position of each node, this will place them on their corresponding column depending on hops
    let positionX = 0;
    let spaceBetween = maxHops > 2 ? 300 : 400;
    if ( sourceNode.level === 0 ){
      if ( sourceNode.id == targetNodeID ){
        sourceNode.positionX = maxHops > 0 ? maxHops * spaceBetween : spaceBetween;
      } else if ( sourceNode.id == sourceNodeID ) {
        sourceNode.positionX = maxHops > 0 ? maxHops * (-1 * spaceBetween) : (-1 * spaceBetween);
      } 
    } else if ( sourceNode.level >= 1 ) {
      sourceNode.hop = hopsMap[sourceNode?.id];
      let space = ((maxHops * spaceBetween * 2) / (maxHops + 1)) * sourceNode.hop;
      positionX = (maxHops * (-1 * spaceBetween) ) + space
      sourceNode.positionX = positionX;
    }
    
    
    if ( positionArray.some(row => row[0] == sourceNode.level && row[1] == sourceNode.hop ) ) {
      sourceNode.level = sourceNode.level + 1 ;
    } else {
      positionArray.push([sourceNode.level, sourceNode.hop]);
    }
  });
  
    
  // Creates links map from Relationships, avoid duplicates
  data.forEach(({ graph, row }) => {
    graph.relationships.forEach(({ startNode, endNode, properties, id }) => {
      let matchingStartNode = nodes.find(node => node.id === parseInt(startNode));
      let matchingEndNode = nodes.find(node => node.id === parseInt(endNode));
      
      if ( row[3].includes(parseInt(id)) ) {
        if (linksMap.get(startNode) === undefined) {
          linksMap.set(startNode, new Array());
        }

        let newLink = true;
        linksMap.get(startNode).find( ele => {
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
  
  // Creates Links array with nodes, assign node neighbors that are connected by links
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
            const labelWeight = n[i].weight >= weight ? n[i].weight : 0; 
            const tooltip = "Label  : " + n[i].label + '<br/>'
              + "Weight : " + (reverse ? n[i].weight + " [" + reverse.weight + "]" : n[i].weight + "[0]");
            const weightLabel = reverse ? n[i].weight + " [" + reverse.weight + "]" : n[i].weight + "[0]";
            // Create new link for graph
            let link = { source: sourceNode, label : tooltip, weightLabel : weightLabel, weight : n[i].weight, target: targetNode, targetNode: targetNode };
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
  });
  
  console.log("Nodes ", nodes);
  console.log("Links ", links);
  
  // Worker is done, notify main thread
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links }, colorLabels : legendLabels } });
}