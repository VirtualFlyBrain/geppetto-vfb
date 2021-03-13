/**
 * Converts graph data received from cypher query into a readable format for react-force-graph-2d
 */
export function queryParser (e) {
  let graphData = e.data.params.results;
  console.log("Results ", e);
  let data = graphData.results[0].data;
  let nodes = [], links = [];
  let linksMap = new Map();
  let nodesMap = new Map();
  let presentColorLabels = new Array();

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
        linksMap.get(startNode).push( { target : endNode, label : properties[e.data.params.configuration.resultsMapping.link.label], weight : properties[e.data.params.configuration.resultsMapping.link.weight] });
      }

    });
  });

  console.log("LinksMap ", linksMap);

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
          let match = links.find( link => link.target === targetNode && link.source === sourceNode);
          let reverse = links.find( link => link.target === sourceNode && link.source === targetNode);
          if ( !match ) {
            // Create new link for graph
            let link = { source: sourceNode, label : n[i].weight, weight : n[i].weight, target: targetNode, targetNode: targetNode, curvature: .5 };
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
  
  console.log("Links ", links);

  // Worker is done, notify main thread
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links }, colorLabels : presentColorLabels } });
}