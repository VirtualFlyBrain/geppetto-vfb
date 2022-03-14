/* eslint-disable no-prototype-builtins */

const parseGraphResultData = data => {
  var nodes = {}, edges = {};
  data.results[0].data.forEach(function (row) {
    row.graph.nodes.forEach(function (n) {
      if (!nodes.hasOwnProperty(n.id)) {
        nodes[n.id] = n;
      }
    });
    row.graph.relationships.forEach(function (r) {
      if (!edges.hasOwnProperty(r.id)) {
        edges[r.id] = r;
      }
    });
  });
  var nodesArray = [], edgesArray = [];
  for (var p in nodes) {
    if (nodes.hasOwnProperty(p)) {
      nodesArray.push(nodes[p]);
    }
  }
  for (var q in edges) {
    if (edges.hasOwnProperty(q)) {
      edgesArray.push(edges[q])
    }
  }
  return { nodes: nodesArray, edges: edgesArray };
}

const findRoot = data => {
  let columns = data.results[0].columns;
  let rootIndex = columns.indexOf("root");
  return data.results[0].data[0].row[rootIndex].toString();
}

const buildDictClassToIndividual = data => {
  var dictionaryIndividuals = {};
  let columns = data.results[0].columns;
  let imagesIndex = columns.indexOf("image_nodes");
  let nodes = data.results[0].data[0].row[imagesIndex];
  for (let i = 0; i < nodes.length; i++) {
    dictionaryIndividuals[nodes[i].short_form] = {
      id: nodes[i].node_id,
      image: nodes[i].image
    }
  }
  return dictionaryIndividuals;
};

const searchChildren = (array, key, target, labels) => {
  // Define Start and End Index
  let startIndex = 0;
  let endIndex = array.length - 1;

  // While Start Index is less than or equal to End Index
  while (startIndex <= endIndex) {
    // Define Middle Index (This will change when comparing )
    let middleIndex = Math.floor((startIndex + endIndex) / 2);
    // Compare Middle Index with Target for match
    if (isNumber(array[middleIndex][key]) === isNumber(target[key])) {
      // check for target relationship (label)
      if ((labels === undefined) || labels.includes(array[middleIndex].label)){
        return middleIndex;
      } else {
        // move on if not matching target relationship (label)
        startIndex = middleIndex + 1;
      }
    }
    // Search Right Side Of Array
    if (isNumber(target[key]) > isNumber(array[middleIndex][key])) {
      startIndex = middleIndex + 1;
    }
    // Search Left Side Of Array
    if (isNumber(target[key]) < isNumber(array[middleIndex][key])) {
      endIndex = middleIndex - 1;
    }
  }
  // If Target Is Not Found
  return undefined;
}

const sortData = (unsortedArray, key, comparator) => {
  // Create a sortable array to return.
  const sortedArray = [ ...unsortedArray ];
  // Recursively sort sub-arrays.
  const recursiveSort = (start, end) => {
    // If this sub-array is empty, it's sorted.
    if (end - start < 1) {
      return;
    }
    const pivotValue = sortedArray[end];
    let splitIndex = start;
    for (let i = start; i < end; i++) {
      const sort = comparator(sortedArray[i], pivotValue, key);
      // This value is less than the pivot value.
      if (sort === -1) {
        /*
         * If the element just to the right of the split index,
         *   isn't this element, swap them.
         */
        if (splitIndex !== i) {
          const temp = sortedArray[splitIndex];
          sortedArray[splitIndex] = sortedArray[i];
          sortedArray[i] = temp;
        }
        /*
         * Move the split index to the right by one,
         *   denoting an increase in the less-than sub-array size.
         */
        splitIndex++;
      }
      /*
       * Leave values that are greater than or equal to
       *   the pivot value where they are.
       */
    }
    // Move the pivot value to between the split.
    sortedArray[end] = sortedArray[splitIndex];
    sortedArray[splitIndex] = pivotValue;
    // Recursively sort the less-than and greater-than arrays.
    recursiveSort(start, splitIndex - 1);
    recursiveSort(splitIndex + 1, end);
  };
    // Sort the entire array.
  recursiveSort(0, unsortedArray.length - 1);
  return sortedArray;
}


const convertEdges = edges => {
  var convertedEdges = [];
  edges.forEach(function (edge) {
    var relatType = edge.type.replace("_"," ");
    if (relatType.indexOf("Related") > -1){
      relatType = edge.properties['label'].replace("_"," ");
    }
    if (convertedEdges.length > 0) {

    } else {
      convertedEdges.push({
        from: edge.endNode,
        to: edge.startNode,
        label: relatType
      });
    }
    convertedEdges.push({
      from: edge.endNode,
      to: edge.startNode,
      label: relatType
    });
  });
  return convertedEdges;
}

const convertNodes = (nodes, imagesMap) => {
  var convertedNodes = [];
  nodes.forEach(function (node) {
    var nodeLabel = node.properties['short_form'];
    var nodeImage = nodeLabel;
    if (imagesMap[nodeLabel] !== undefined && imagesMap[nodeLabel].id.toString() === node.id.toString()) {
      nodeImage = imagesMap[nodeLabel].image;
    }
    var displayedLabel = node.properties['label'];
    var description = node.properties['description']
    convertedNodes.push({
      title: displayedLabel,
      subtitle: nodeLabel,
      instanceId: nodeImage,
      classId: nodeLabel,
      info: description,
      id: node.id,
    })
  });
  return convertedNodes;
}

const defaultComparator = (a, b, key) => {
  if (isNumber(a[key]) < isNumber(b[key])) {
    return -1;
  }
  if (isNumber(a[key]) > isNumber(b[key])) {
    return 1;
  }
  return 0;
}

const isNumber = variable => {
  if (isNaN(variable)) {
    return variable;
  } else {
    return parseFloat(variable);
  }
}

module.exports = {
  isNumber,
  findRoot,
  sortData,
  convertNodes,
  convertEdges,
  searchChildren,
  defaultComparator,
  parseGraphResultData,
  buildDictClassToIndividual
};
