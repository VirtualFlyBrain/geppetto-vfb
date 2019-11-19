/* eslint-disable no-prototype-builtins */
import React from 'react';
import { SliderPicker } from 'react-color';
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
      displayColorPicker: false,
      pickerAnchor: undefined
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

    this.colorPickerContainer = undefined;
    this.nodeWithColorPicker = undefined;
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

  searchChildren (array, key, target, label){
    // Define Start and End Index
    let startIndex = 0;
    let endIndex = array.length - 1;

    // While Start Index is less than or equal to End Index
    while (startIndex <= endIndex) {
      // Define Middle Index (This will change when comparing )
      let middleIndex = Math.floor((startIndex + endIndex) / 2);
      // Compare Middle Index with Target for match
      if (this.isNumber(array[middleIndex][key]) === this.isNumber(target[key])) {
        // check for target relationship (label)
        if (array[middleIndex].label === label){
          return middleIndex;
        } else {
          // move on if not matching target relationship (label)
          startIndex = middleIndex + 1;
        }
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

  findChildren (parent, key, familyList, label) {
    var childrenList = [];
    var childKey = this.searchChildren(familyList, key, parent, label);
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
    var childrenList = this.findChildren({ from: child.id }, "from", edges, "part of");
    // child.images = this.findChildren({ from: child.id }, "from", edges, "INSTANCEOF");
    var nodesList = [];
    for ( var i = 0; i < childrenList.length; i++) {
      nodesList.push(edges[childrenList[i]].to)
    }
    var uniqNodes = [...new Set(nodesList)];

    for (var j = uniqNodes.length - 1; j >= 0 ; j--) {
      var node = nodes[this.findChildren({ id: uniqNodes[j] }, "id", nodes)[0]];
      if (node.instanceId.indexOf("VFB_") > -1) {
        child.instanceId = node.instanceId;
        node.subtitle = child.subtitle;
        // child.subtitle = child.subtitle + " " + node.instanceId;
        uniqNodes.splice(j, 1);
      }
    }

    for ( var j = 0; j < uniqNodes.length; j++) {
      var node = nodes[this.findChildren({ id: uniqNodes[j] }, "id", nodes)[0]];
      if (node.instanceId.indexOf("VFB_") > -1) {
        child.instanceId = node.instanceId;
        node.subtitle = child.subtitle;
      } else {
        child.children.push({
          title: node.title,
          subtitle: node.instanceId,
          description: node.info,
          instanceId: node.instanceId,
          id: node.id,
          showColorPicker: false,
          children: []
        });
        this.insertChildren(nodes, edges, child.children[j])
      }
    }
  }

  convertDataForTree (nodes, edges, vertix) {
    // This will create the data structure for the react-sortable-tree library, starting from the vertix node.
    var refinedDataTree = [];
    for ( var i = 0; i < nodes.length; i++ ) {
      if (vertix === nodes[i].id) {
        refinedDataTree.push({
          title: nodes[i].title,
          subtitle: nodes[i].instanceId,
          description: nodes[i].info,
          instanceId: nodes[i].instanceId,
          id: nodes[i].id,
          showColorPicker: false,
          children: []
        });
        break;
      }
    }
    var child = refinedDataTree[0];
    // Once the vertix has been established we call insertChildren recursively on each child.
    this.insertChildren(nodes, edges, child);
    return refinedDataTree;
  }

  selectNode (instance) {
    if (this.state.nodeSelected !== undefined && this.state.nodeSelected.instanceId !== instance.instanceId) {
      this.setState({ nodeSelected: instance });
    }
  }

  updateTree (instance) {
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

    if (this.state.instance !== undefined && innerInstance.id !== this.state.instance.id) {
      if (innerInstance.id === window.templateID) {
        this.selectNode(this.state.dataTree[0])
        return;
      }
      var node = [];
      var i = 0;
      /*
       * check the instance's id with the nodes, if this match we will use its subtitle
       * in the searchQuery in the render to move the tree focus on this node
       */
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
    // This function is the core and starting point of the component itself
    this.setState({ loading: true });
    this.restPost(treeCypherQuery(instance)).done(data => {
      /*
       * we take the data provided by the cypher query and consume the until we obtain the treeData that can be given
       * to the react-sortable-tree since it understands this data structure
       */
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
          nodeSelected: (this.props.instance === undefined
            ? treeData[0]
            : (this.props.instance.getParent() === null
              ? { subtitle: this.props.instance.getId() }
              : { subtitle: this.props.instance.getParent().getId() }))
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

  nodeClick (event, rowInfo) {
    this.selectNode(rowInfo.node);
  }

  monitorMouseClick (e) {
    // event handler to monitor when we click outside the color picker and close it.
    if (!(this.colorPickerContainer !== undefined && this.colorPickerContainer !== null && this.colorPickerContainer.contains(e.target))) {
      if (this.nodeWithColorPicker !== undefined) {
        this.nodeWithColorPicker.showColorPicker = false;
        this.nodeWithColorPicker = undefined;
      }
      this.colorPickerContainer = undefined;
      this.setState({ displayColorPicker: false });
    }
  }

  getButtons (rowInfo) {
    // As per name, provided by the react-sortable-tree api, we use this to attach to each node custom buttons
    var buttons = [];
    var fillCondition = "unknown";
    if (rowInfo.node.instanceId.indexOf("VFB_") > -1) {
      fillCondition = "3dAvailable";
      if (Instances[rowInfo.node.instanceId] === undefined) {
        fillCondition = "3dToLoad";
      } else {
        if ((typeof Instances[rowInfo.node.instanceId].isVisible !== "undefined") && (Instances[rowInfo.node.instanceId].isVisible())) {
          fillCondition = "3dVisible";
        } else {
          fillCondition = "3dHidden";
        }
      }
    }

    switch (fillCondition) {
    case "3dToLoad":
      buttons.push(<i className="fa fa-eye"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          rowInfo.node.subtitle = rowInfo.node.instanceId;
          this.props.selectionHandler(rowInfo.node.instanceId);
          this.setState({ nodeSelected: rowInfo.node });
        }} />);
      break;
    case "3dHidden":
      buttons.push(<i className="fa fa-eye"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          if (Instances[rowInfo.node.instanceId].getParent() !== null) {
            Instances[rowInfo.node.instanceId].getParent().show();
          } else {
            Instances[rowInfo.node.instanceId].show();
          }
          this.setState({ nodeSelected: rowInfo.node });
        }} />);
      break;
    case "3dVisible":
      var color = Instances[rowInfo.node.instanceId].getColor();
      buttons.push(<i className="fa fa-eye-slash"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          if (Instances[rowInfo.node.instanceId].getParent() !== null) {
            Instances[rowInfo.node.instanceId].getParent().hide();
          } else {
            Instances[rowInfo.node.instanceId].hide();
          }
          this.setState({ nodeSelected: rowInfo.node });
        }} />);
      buttons.push(<span
        onClick={ e => {
          e.stopPropagation();
        }}>
        <i className="fa fa-tint"
          style={{
            paddingLeft: "6px",
            color: color
          }}
          aria-hidden="true"
          onClick={ e => {
            e.stopPropagation();
            this.nodeWithColorPicker = rowInfo.node;
            rowInfo.node.showColorPicker = !rowInfo.node.showColorPicker;
            this.setState({
              displayColorPicker: !this.state.displayColorPicker,
              pickerAnchor: (!this.state.displayColorPicker ? undefined : e)
            });
          }} />
        { (this.state.displayColorPicker
          && rowInfo.node.showColorPicker)
          ? <div
            id="tree-color-picker"
            ref={ref => this.colorPickerContainer = ref}>
            <SliderPicker
              color={Instances[rowInfo.node.instanceId].getColor()}
              onChangeComplete={ (color, event) => {
                Instances[rowInfo.node.instanceId].setColor(color.hex);
                this.setState({ displayColorPicker: true });
              }}
              style={{ zIndex: 10 }}/>
          </div>
          : null}
      </span>);
      break;
    }
    return buttons;
  }

  getNodes (rowInfo) {
    /*
     * In the getNodes, provided by the API of react-sortable-tree, if the node has visual capability
     * we attach the tooltip with the image, differently only tooltip.
     */
    if (rowInfo.node.title !== "No data available.") {
      var title = <MuiThemeProvider theme={this.theme}>
        <Tooltip placement="right-start"
          title={ (rowInfo.node.instanceId.indexOf("VFB_") > -1)
            ? (<div>
              <div> {rowInfo.node.description} </div>
              <div>
                <img style={{ display: "block", textAlign: "center" }}
                  src={"https://VirtualFlyBrain.org/reports/" + rowInfo.node.instanceId + "/thumbnailT.png"} />
              </div></div>)
            : (<div>
              <div> {rowInfo.node.description} </div>
            </div>)}>
          <div
            className={rowInfo.node.subtitle === this.state.nodeSelected.subtitle
              ? "nodeFound nodeSelected"
              : "nodeSelected"}
            onClick={ e => {
              e.stopPropagation();
              this.colorPickerContainer = undefined;
              this.props.selectionHandler(rowInfo.node.subtitle);
              this.setState({ nodeSelected: rowInfo.node });
            }}>
            {rowInfo.node.title}
          </div>
        </Tooltip>
      </MuiThemeProvider>;
    }
    return title;
  }

  componentWillMount () {
    if (window.templateID !== undefined) {
      this.initTree(window.templateID);
    }
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.monitorMouseClick, false);
  }

  componentDidMount () {
    var that = this;
    document.addEventListener('mousedown', this.monitorMouseClick, false);
    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      that.setState({ displayColorPicker: false });
    });
  }

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
    // In the return we show the circular progress if the data are still being processed, differently the Tree
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
            searchQuery={this.state.nodeSelected === undefined ? this.props.instance.getParent().getId() : this.state.nodeSelected.subtitle}
            onlyExpandSearchedNodes={false}
          />
        }
      </div>
    )
  }
}
