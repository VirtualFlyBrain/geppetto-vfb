/* eslint-disable no-prototype-builtins */
import React from 'react';
import CompactColor from 'react-color';
import Tree from 'geppetto-client/js/components/interface/tree/Tree';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";

import 'react-sortable-tree/style.css';

var $ = require('jquery');
const restPostConfig = require('../configuration/treeWidgetConfiguration').restPostConfig;
const treeCypherQuery = require('../configuration/treeWidgetConfiguration').treeCypherQuery;

export default class TreeWidget extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      instance: undefined,
      dataTree: undefined,
      root: undefined,
      loading: false,
      nodes: undefined,
      nodeSelected: undefined,
      displayColorPicker: false
    };

    this.initTree = this.initTree.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.sortData = this.sortData.bind(this);
    this.restPost = this.restPost.bind(this);
    this.nodeClick = this.nodeClick.bind(this);
    this.updateTree = this.updateTree.bind(this);
    this.getButtons = this.getButtons.bind(this);
    this.selectNode = this.selectNode.bind(this);
    this.convertEdges = this.convertEdges.bind(this);
    this.convertNodes = this.convertNodes.bind(this);
    this.findChildren = this.findChildren.bind(this);
    this.searchChildren = this.searchChildren.bind(this);
    this.insertChildren = this.insertChildren.bind(this);
    this.monitorMouseClick = this.monitorMouseClick.bind(this);
    this.defaultComparator = this.defaultComparator.bind(this);
    this.convertDataForTree = this.convertDataForTree.bind(this);
    this.customSearchMethod = this.customSearchMethod.bind(this);
    this.parseGraphResultData = this.parseGraphResultData.bind(this);

    this.theme = createMuiTheme({ overrides: { MuiTooltip: { tooltip: { fontSize: "12px" } } } });
    this.AUTHORIZATION = "Basic " + btoa("neo4j:vfb");
    this.styles = {
      left_second_column: 395,
      column_width_small: 385,
      column_width_viewer: "calc(100% - 385px)",
      row_height: 25,
      top: 0,
      height: this.props.size.height,
      width: this.props.size.width
    };

    this.colorPickerNode = undefined;
  }

  isNumber (variable) {
    if (isNaN(variable)) {
      return variable;
    } else {
      return parseFloat(variable);
    }
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
      url: restPostConfig.url,
      contentType: restPostConfig.contentType,
      data: strData
    });
  }

  defaultComparator (a, b, key) {
    if (this.isNumber(a[key]) < this.isNumber(b[key])) {
      return -1;
    }
    if (this.isNumber(a[key]) > this.isNumber(b[key])) {
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
        title: displayedLabel,
        subtitle: nodeLabel,
        instanceId: nodeLabel,
        info: description,
        id: node.id,
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
      if (this.isNumber(array[middleIndex][key]) === this.isNumber(target[key])) {
        return middleIndex;
      }
      // Search Right Side Of Array
      if (this.isNumber(target[key]) > this.isNumber(array[middleIndex][key])) {
        startIndex = middleIndex + 1;
      }
      // Search Left Side Of Array
      if (this.isNumber(target[key]) < this.isNumber(array[middleIndex][key])) {
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
      while (i > 0 && this.isNumber(parent[key]) === this.isNumber(familyList[i][key])) {
        childrenList.push(i);
        i--;
      }
      i = childKey + 1;
      while (i < familyList.length && this.isNumber(parent[key]) === this.isNumber(familyList[i][key])) {
        childrenList.push(i);
        i++;
      }
    }
    return childrenList;
  }

  insertChildren (nodes, edges, child) {
    var childrenList = this.findChildren({ from: child.id }, "from", edges);
    var nodesList = [];
    for ( var i = 0; i < childrenList.length; i++) {
      nodesList.push(edges[childrenList[i]].to)
    }
    var uniqNodes = [...new Set(nodesList)];
    for ( var j = 0; j < uniqNodes.length; j++) {
      var node = nodes[this.findChildren({ id: uniqNodes[j] }, "id", nodes)[0]];
      if (node.instanceId.indexOf("VFB_") > -1) {
        child.instanceId = node.instanceId;
      } else {
        child.children.push({
          title: node.title,
          subtitle: node.instanceId,
          description: node.info,
          instanceId: node.instanceId,
          id: node.id,
          children: []
        });
        this.insertChildren(nodes, edges, child.children[j])
      }
    }
  }

  convertDataForTree (nodes, edges, vertix) {
    var refinedDataTree = [];
    for ( var i = 0; i < nodes.length; i++ ) {
      if (vertix === nodes[i].id) {
        refinedDataTree.push({
          title: nodes[i].title,
          subtitle: nodes[i].instanceId,
          description: nodes[i].info,
          instanceId: nodes[i].instanceId,
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

  selectNode (instance) {
    if (this.state.nodeSelected !== undefined && this.state.nodeSelected.instanceId !== instance.instanceId) {
      this.setState({ nodeSelected: instance, dataTree: this.state.dataTree });
    }
  }

  updateTree (instance) {
    var innerInstance = undefined;
    if (instance.getParent() !== null) {
      innerInstance = instance.getParent();
    } else {
      innerInstance = instance;
    }

    if (innerInstance.id !== this.state.instance.id) {
      if (innerInstance.id === window.templateID) {
        this.selectNode(this.state.dataTree[0])
        return;
      }
      var node = [];
      var i = 0;
      while (this.state.nodes.length > i) {
        var idToSearch = innerInstance.getId();
        if (idToSearch === this.state.nodes[i]["instanceId"]) {
          node.push(i);
          break;
        }
        i++;
      }
      if (node.length > 0) {
        this.selectNode(this.state.nodes[node[0]]);
      }
    }
  }

  initTree (instance) {
    this.setState({ loading: true });
    this.restPost(treeCypherQuery(instance)).done(data => {
      // If I need to edit the data I can call this here and then assign it to this.state.dataTree
      if (data.results[0].data.length > 0) {
        var dataTree = this.parseGraphResultData(data);
        var vertix = this.findRoot(data.results[0].data[0].graph.nodes);
        var nodes = this.sortData(this.convertNodes(dataTree.nodes), "id", this.defaultComparator);
        var edges = this.sortData(this.convertEdges(dataTree.edges), "from", this.defaultComparator);
        var treeData = this.convertDataForTree(nodes, edges, vertix);
        this.setState({
          instance: { id: instance },
          dataTree: treeData,
          root: vertix,
          loading: false,
          nodes: nodes,
          nodeSelected: treeData[0]
        });
      } else {
        var treeData = [{
          title: "No data available.",
          subtitle: null,
          children: []
        }];
        this.setState({
          instance: { id: instance },
          dataTree: treeData,
          root: undefined,
          loading: false
        });
      }
    });
  }

  findRoot (nodes) {
    let min = nodes[0].id;
    for ( let i = 1; i < nodes.length; i++) {
      if (nodes[i].id < min) {
        min = nodes[i].id;
      }
    }
    return min;
  }

  componentWillMount () {
    if (window.templateID !== undefined) {
      this.initTree(window.templateID);
      document.addEventListener('mousedown', this.monitorMouseClick, false);
    }
  }

  componentWillReceiveProps () {
    document.removeEventListener('mousedown', this.monitorMouseClick, false);
  }

  nodeClick (event, rowInfo) {
    console.log("clicked on the tree node");
    console.log(rowInfo);
    this.selectNode(rowInfo.node);
  }

  monitorMouseClick (e) {
    if (this.colorPickerNode !== undefined && this.colorPickerNode.contains(e.target)) {
      return;
    } else {
      this.colorPickerNode = undefined;
      this.setState({ displayColorPicker: false });
    }
  }

  getButtons (rowInfo) {
    var buttons = [];
    if (rowInfo.node.title !== "No data available.") {
      buttons.push(<i className="fa fa-tint"
        aria-hidden="true"
        onClick={ () => {
          this.setState({ displayColorPicker: true });
        }}>
        { (this.state.displayColorPicker
          && this.state.nodeSelected.subtitle === rowInfo.node.subtitle
          && this.colorPickerNode === undefined)
          ? <CompactColor
            style={{ zIndex: 10 }}/>
          : null}
      </i>);
    }
    return buttons;
  }

  getNodes (rowInfo) {
    if (rowInfo.node.title !== "No data available.") {
      var title = <MuiThemeProvider theme={this.theme}>
        <Tooltip
          title={<div id="dario">
            <div> {rowInfo.node.instanceId} </div>
            <div> {rowInfo.node.description} </div>
            <div>
              <img id="dario"
                src={"https://VirtualFlyBrain.org/reports/" + rowInfo.node.instanceId + "/thumbnailT.png"} />
            </div></div>}>
          <div
            className={rowInfo.node.subtitle === this.state.nodeSelected.subtitle
              ? "nodeFound nodeSelected"
              : "nodeSelected"}
            onClick={ () => {
              this.colorPickerNode = undefined;
              this.props.selectionHandler(rowInfo.node.subtitle);
              this.setState({ displayColorPicker: false });
            }}>
            {rowInfo.node.title}
          </div>
        </Tooltip>
      </MuiThemeProvider>;
    }
    return title;
  }

  searchDone (matches) {
    if (matches.length > 0) {
      console.log('Found children in the tree');
      /*
       * matches.map(item => {
       *   item.isSelected = true;
       * })
       */
    }
  }

  customSearchMethod = ({ node, searchQuery }) =>
    searchQuery && node.instanceId.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;

  render () {
    if (this.state.dataTree === undefined) {
      var treeData = [{
        title: "No data available.",
        subtitle: null,
        children: []
      }];
    } else {
      var treeData = this.state.dataTree;
    }
    return (
      <div>
        {this.state.loading === true
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
          : <Tree
            id="VFBTree"
            name={"Tree"}
            componentType={'TREE'}
            toggleMode={true}
            treeData={treeData}
            activateParentsNodeOnClick={true}
            handleClick={this.nodeClick}
            style={{ width: this.props.size.width, height: this.props.size.height, float: 'left', clear: 'both' }}
            rowHeight={this.styles.row_height}
            getButtons={this.getButtons}
            getNodesProps={this.getNodes}
            searchQuery={this.state.nodeSelected !== undefined ? this.state.nodeSelected.subtitle : null}
            searchFinishCallback={this.searchDone}
          />
        }
      </div>

    )
  }
}
