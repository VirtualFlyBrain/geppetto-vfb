/* eslint-disable no-prototype-builtins */
import React from 'react';
import Tree from 'geppetto-client/js/components/interface/tree/Tree';
import 'react-sortable-tree/style.css';

var $ = require('jquery');
var GEPPETTO = require('geppetto');

export default class TreeWidget extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      instance: undefined,
      dataTree: undefined,
      root: undefined
    };

    this.sortData = this.sortData.bind(this);
    this.restPost = this.restPost.bind(this);
    this.updateTree = this.updateTree.bind(this);
    this.convertEdges = this.convertEdges.bind(this);
    this.convertNodes = this.convertNodes.bind(this);
    this.defaultComparator = this.defaultComparator.bind(this);
    this.parseGraphResultData = this.parseGraphResultData.bind(this);

    this.AUTHORIZATION = "Basic " + btoa("neo4j:vfb");
    this.styles = {
      left_second_column: 395,
      column_width_small: 385,
      column_width_viewer: "calc(100% - 385px)",
      row_height: 60,
      top: 0,
      height: this.props.size.height,
      width: this.props.size.width
    };
  }

  restPost (data) {
    var strData = JSON.stringify(data);
    return $.ajax({
      type: "POST",
      beforeSend: function (request) {
        if (this.AUTHORIZATION != undefined) {
          request.setRequestHeader("Authorization", this.AUTHORIZATION);
        }
      },
      url: "http://pdb.virtualflybrain.org/db/data/transaction/commit",
      contentType: "application/json",
      data: strData
    });
  }

  defaultComparator (a, b, key) {
    if (parseFloat(a[key]) < parseFloat(b[key])) {
      return -1;
    }
    if (parseFloat(a[key]) > parseFloat(b[key])) {
      return 1;
    }
    return 0;
  }

  sortData (unsortedArray, key, comparator) {
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

  convertEdges (edges) {
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

  convertNodes (nodes) {
    var convertedNodes = [];
    nodes.forEach(function (node) {
      var nodeLabel = node.properties['short_form'];
      var displayedLabel = node.properties['label'];
      var description = node.properties['description']
      convertedNodes.push({
        id: node.id,
        label: displayedLabel,
        group: nodeLabel,
        info: description
      })
    });
    return convertedNodes;
  }

  parseGraphResultData (data) {
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

  searchChildren (array, key, target){
    // Define Start and End Index
    let startIndex = 0;
    let endIndex = array.length - 1;

    // While Start Index is less than or equal to End Index
    while (startIndex <= endIndex) {
      // Define Middle Index (This will change when comparing )
      let middleIndex = Math.floor((startIndex + endIndex) / 2);
      // Compare Middle Index with Target for match
      if (parseFloat(array[middleIndex][key]) === parseFloat(target[key])) {
        return middleIndex;
      }
      // Search Right Side Of Array
      if (parseFloat(target[key]) > parseFloat(array[middleIndex][key])) {
        startIndex = middleIndex + 1;
      }
      // Search Left Side Of Array
      if (parseFloat(target[key]) < parseFloat(array[middleIndex][key])) {
        endIndex = middleIndex - 1;
      }
    }
    // If Target Is Not Found
    return undefined;
  }

  findChildren (parent, key, familyList) {
    var childrenList = [];
    var childKey = this.searchChildren(familyList, key, parent);
    if (childKey !== undefined) {
      childrenList.push(childKey);
      var i = childKey - 1;
      while (i > 0 && parseFloat(parent[key]) === parseFloat(familyList[i][key])) {
        childrenList.push(i);
        i--;
      }
      i = childKey + 1;
      while (i < familyList.length && parseFloat(parent[key]) === parseFloat(familyList[i][key])) {
        childrenList.push(i);
        i++;
      }
    }
    return childrenList;
  }

  insertChildren (nodes, edges, child) {
    var childrenList = this.findChildren({ from: child.id }, "from", edges);
    for ( var j = 0; j < childrenList.length; j++) {
      var node = nodes[this.findChildren({ id: edges[childrenList[j]].to }, "id", nodes)[0]];
      child.children.push({
        title: node.label,
        subtitle: node.group + " - " + node.info,
        id: node.id,
        children: []
      });
      this.insertChildren(nodes, edges, child.children[j])
    }
  }

  convertDataForTree (nodes, edges, vertix) {
    var refinedDataTree = [];
    for ( var i = 0; i < nodes.length; i++ ) {
      if (vertix === nodes[i].id) {
        refinedDataTree.push({
          title: nodes[i].label,
          subtitle: nodes[i].group + " - " + nodes[i].info,
          id: nodes[i].id,
          children: []
        });
        break;
      }
    }
    var child = refinedDataTree[0];
    this.insertChildren(nodes, edges, child);
    return refinedDataTree;
  }

  updateTree (instance) {
    var innerInstance = undefined;
    if (instance.getParent() !== null) {
      innerInstance = instance.getParent();
    } else {
      innerInstance = instance;
    }
    if (this.state.instance !== undefined && innerInstance.id === this.state.instance.id) {
      return;
    }
    this.restPost({
      "statements": [
        {
          "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Individual { short_form : '" + innerInstance.getId() + "'})"
                            + "<-[:depicts]-(tc:Individual)<-[ie:in_register_with]-(c:Individual)-[:depicts]->"
                            + "(image:Individual)-[:INSTANCEOF]->(ac:Class) WHERE has(ie.index) WITH root, COLLECT"
                            + " (ac.short_form) as tree_nodes, COLLECT (DISTINCT{ image: image.short_form, anat_ind:"
                            + " image.short_form, type: ac.short_form}) AS domain_map MATCH p=allShortestPaths((root)"
                            + "<-[:SUBCLASSOF|part_of*..]-(anat:Class)) WHERE anat.short_form IN tree_nodes RETURN p,"
                            + " domain_map",
          "resultDataContents": ["graph"]
        }
      ]
    }).done(data => {
      // If I need to edit the data I can call this here and then assign it to this.state.dataTree
      if (data.results[0].data.length > 0) {
        var dataTree = this.parseGraphResultData(data);
        var vertix = data.results[0].data[0].graph.nodes[0].id;
        var nodes = this.sortData(this.convertNodes(dataTree.nodes), "id", this.defaultComparator);
        var edges = this.sortData(this.convertEdges(dataTree.edges), "from", this.defaultComparator);
        var treeData = this.convertDataForTree(nodes, edges, vertix);
        this.setState({
          instance: innerInstance,
          dataTree: treeData,
          root: vertix
        });
      } else {
        var treeData = [{
          title: Instances[1].getId(),
          subtitle: Instances[1].getName(),
          children: [{
            title: Instances[1].getId(),
            subtitle: Instances[1].getName(),
            children: []
          }, {
            title: Instances[1].getId(),
            subtitle: Instances[1].getName(),
            children: []
          }]
        }];
        this.setState({
          instance: innerInstance,
          dataTree: treeData,
          root: undefined
        });
      }
    });
  }

  componentDidMount () {
    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      this.updateTree(instance);
    }.bind(this));
  }

  render () {
    /*
     * else {
     *   var treeData = [{
     *     title: this.state.instance.getId(),
     *     subtitle: this.state.instance.getName(),
     *     children: []
     *   }]
     * }
     */
    if (this.state.dataTree === undefined) {
      var treeData = [{
        title: Instances[1].getId(),
        subtitle: Instances[1].getName(),
        children: [{
          title: Instances[1].getId(),
          subtitle: Instances[1].getName(),
          children: []
        }, {
          title: Instances[1].getId(),
          subtitle: Instances[1].getName(),
          children: []
        }]
      }];
    } else {
      var treeData = this.state.dataTree;
    }
    return (
      <div>
        <Tree
          id="VFBTree"
          name={"Tree"}
          componentType={'TREE'}
          toggleMode={true}
          treeData={treeData}
          activateParentsNodeOnClick={true}
          style={{ width: this.props.size.width, height: this.props.size.height, float: 'left', clear: 'both' }}
          rowHeight={this.styles.row_height}
        />
      </div>

    )
  }
}
