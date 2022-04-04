export function queryParser (e) {
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
          let match = links.find( link => ( link.target === sourceNode && link.source === targetNode ) || ( link.target === targetNode && link.source === sourceNode ));
          if ( !match ){
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
    }
  });

  // Worker is done, notify main thread
  this.postMessage({ resultMessage: "OK", params: { results: { nodes, links }, instance : e.data.params.value } });
}