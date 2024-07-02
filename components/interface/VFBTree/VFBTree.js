/* eslint-disable no-prototype-builtins */
import React from 'react';
import { ChromePicker } from 'react-color';
import Tree from '@geppettoengine/geppetto-ui/tree-viewer/Tree';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import { setTermInfo } from './../../../actions/generals';

import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";

import 'react-sortable-tree/style.css';
import { connect } from 'react-redux';

var $ = require('jquery');
const restPostConfig = require('../../configuration/VFBTree/VFBTreeConfiguration').restPostConfig;
const treeCypherQuery = require('../../configuration/VFBTree/VFBTreeConfiguration').treeCypherQuery;

class VFBTree extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      errors: undefined,
      dataTree: undefined,
      root: undefined,
      loading: false,
      edges: undefined,
      nodes: undefined,
      nodeSelected: undefined,
      displayColorPicker: false,
      pickerAnchor: undefined
    };

    this.initTree = this.initTree.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.restPost = this.restPost.bind(this);
    this.nodeClick = this.nodeClick.bind(this);
    this.updateTree = this.updateTree.bind(this);
    this.getButtons = this.getButtons.bind(this);
    this.selectNode = this.selectNode.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.findChildren = this.findChildren.bind(this);
    this.insertChildren = this.insertChildren.bind(this);
    this.updateSubtitle = this.updateSubtitle.bind(this);
    this.monitorMouseClick = this.monitorMouseClick.bind(this);
    this.convertDataForTree = this.convertDataForTree.bind(this);

    this.isNumber = require('./helper').isNumber;
    this.sortData = require('./helper').sortData;
    this.findRoot = require('./helper').findRoot;
    this.convertEdges = require('./helper').convertEdges;
    this.convertNodes = require('./helper').convertNodes;
    this.searchChildren = require('./helper').searchChildren;
    this.defaultComparator = require('./helper').defaultComparator;
    this.parseGraphResultData = require('./helper').parseGraphResultData;
    this.buildDictClassToIndividual = require('./helper').buildDictClassToIndividual;

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

  findChildren (parent, key, familyList, labels) {
    var childrenList = [];
    var childKey = this.searchChildren(familyList, key, parent, labels);
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

  insertChildren (nodes, edges, child, imagesMap) {
    // Extend the array of relationships from here
    var childrenList = this.findChildren({ from: child.id }, "from", edges, ["part of", "SUBCLASSOF"]);
    // child.images = this.findChildren({ from: child.id }, "from", edges, "INSTANCEOF");
    var nodesList = [];
    for ( var i = 0; i < childrenList.length; i++) {
      nodesList.push(edges[childrenList[i]].to)
    }
    var uniqNodes = [...new Set(nodesList)];

    for ( var j = 0; j < uniqNodes.length; j++) {
      var node = nodes[this.findChildren({ id: uniqNodes[j] }, "id", nodes)[0]];
      let imageId = node.instanceId;
      child.children.push({
        title: node.title,
        subtitle: node.classId,
        description: node.info,
        classId: node.classId,
        instanceId: node.instanceId,
        id: node.id,
        showColorPicker: false,
        children: []
      });
      this.insertChildren(nodes, edges, child.children[j], imagesMap)
    }
  }

  convertDataForTree (nodes, edges, vertix, imagesMap) {
    // This will create the data structure for the react-sortable-tree library, starting from the vertix node.
    var refinedDataTree = [];
    for ( var i = 0; i < nodes.length; i++ ) {
      if (vertix === nodes[i].id) {
        refinedDataTree.push({
          title: nodes[i].title,
          subtitle: nodes[i].classId,
          description: nodes[i].info,
          classId: nodes[i].classId,
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
    this.insertChildren(nodes, edges, child, imagesMap);
    return refinedDataTree;
  }

  updateSubtitle (tree, idSelected) {
    var node = undefined;
    if (tree.length !== undefined) {
      node = tree[0];
    } else {
      node = tree;
    }
    if (node.instanceId === idSelected || node.classId === idSelected) {
      node.subtitle = idSelected;
    }
    for (let i = 0; i < node.children.length; i++) {
      this.updateSubtitle(node.children[i], idSelected);
    }
  }

  selectNode (instance) {
    if (this.state.nodeSelected !== undefined && this.state.nodeSelected.instanceId !== instance.instanceId) {
      /*
       * var treeData = this.state.dataTree;
       * this.updateSubtitle(treeData, instance.instanceId);
       */
      this.setState({ nodeSelected: instance });
    }
  }

  updateTree (instance) {
    /*
     * function handler called by the VFBMain whenever there is an update of the instance on focus,
     * this will reflect and move to the node (if it exists) that we have on focus.
     */
    var innerInstance = undefined;
    if (instance?.getParent() !== null) {
      innerInstance = instance.getParent();
    } else {
      innerInstance = instance;
    }
    var idToSearch = innerInstance?.getId();

    if (this.state.nodeSelected !== undefined
      && idToSearch !== this.state.nodeSelected?.instanceId
      && idToSearch !== this.state.nodeSelected?.classId) {
      if (idToSearch === window.templateID) {
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
        if (idToSearch === this.state.nodes[i]["instanceId"] || idToSearch === this.state.nodes[i]["classId"]) {
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

  async initTree (instance) {
    // This function is the core and starting point of the component itself
    var that = this;
    this.setState({
      loading: true,
      errors: undefined,
    });

    const cacheKey = `treeData_${instance}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const dataTree = this.parseGraphResultData(parsedData);
      const vertix = this.findRoot(parsedData);
      const imagesMap = this.buildDictClassToIndividual(parsedData);
      const nodes = this.sortData(this.convertNodes(dataTree.nodes, imagesMap), "id", this.defaultComparator);
      const edges = this.sortData(this.convertEdges(dataTree.edges), "from", this.defaultComparator);
      const treeData = this.convertDataForTree(nodes, edges, vertix, imagesMap);
      
      this.setState({
        loading: false,
        errors: undefined,
        dataTree: treeData,
        root: vertix,
        edges: edges,
        nodes: nodes,
        nodeSelected: (this.props.instance === undefined
          ? treeData[0]
          : (this.props.instance?.getParent() === null
            ? { subtitle: this.props.instance?.getId() }
            : { subtitle: this.props.instance?.getParent()?.getId() }))
      });
    } else {
      this.restPost(treeCypherQuery(instance)).done(data => {
        if (data.errors.length > 0) {
          console.log("-- ERROR TREE COMPONENT --");
          console.log(data.errors);
          this.setState({ errors: "Error retrieving the data - check the console for additional information" });
        }
        if (data.results.length > 0 && data.results[0].data.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          const dataTree = this.parseGraphResultData(data);
          const vertix = this.findRoot(data);
          const imagesMap = this.buildDictClassToIndividual(data);
          const nodes = this.sortData(this.convertNodes(dataTree.nodes, imagesMap), "id", this.defaultComparator);
          const edges = this.sortData(this.convertEdges(dataTree.edges), "from", this.defaultComparator);
          const treeData = this.convertDataForTree(nodes, edges, vertix, imagesMap);
          this.setState({
            loading: false,
            errors: undefined,
            dataTree: treeData,
            root: vertix,
            edges: edges,
            nodes: nodes,
            nodeSelected: (this.props.instance === undefined
              ? treeData[0]
              : (this.props.instance?.getParent() === null
                ? { subtitle: this.props.instance?.getId() }
                : { subtitle: this.props.instance?.getParent()?.getId() }))
          });
        } else {
          var treeData = [{
            title: "No data available.",
            subtitle: null,
            children: []
          }];
          this.setState({
            dataTree: treeData,
            root: undefined,
            loading: false,
            errors: undefined,
          });
        }
      });
    }
  }


  nodeClick (event, rowInfo) {
    if (event.target.getAttribute("type") !== "button" && (event.target.getAttribute("aria-label") !== "Collapse" || event.target.getAttribute("aria-label") !== "Expand")) {
      this.selectNode(rowInfo.node);
    }
  }

  monitorMouseClick (e) {
    const clickCoord = {
      INSIDE: 'inside',
      OUTSIDE: 'outside',
      PICKER_PRESENT: 'picker_present',
      NODE_PRESENT: 'node_present'
    };

    let clickCondition = undefined;
    if (this.colorPickerContainer !== undefined && this.colorPickerContainer !== null) {
      clickCondition = clickCoord.PICKER_PRESENT;
      if (!this.colorPickerContainer.contains(e.target)) {
        clickCondition = clickCoord.OUTSIDE;
      }
    }

    switch (clickCondition) {
    case clickCoord.OUTSIDE:
      if (this.nodeWithColorPicker !== undefined) {
        this.nodeWithColorPicker.showColorPicker = false;
        this.nodeWithColorPicker = undefined;
      }
      this.colorPickerContainer = undefined;
      this.setState({ displayColorPicker: false });
      break;
    }
  }

  getButtons (rowInfo) {
    // As per name, provided by the react-sortable-tree api, we use this to attach to each node custom buttons
    var buttons = [];
    var fillCondition = "unknown";
    var instanceLoaded = false;
    if (rowInfo.node.instanceId != undefined && rowInfo.node.instanceId.indexOf("VFB_") > -1) {
      fillCondition = "3dAvailable";
      for (var i = 1; i < Instances.length; i++) {
        if (Instances[i].id !== undefined && Instances[i].id === rowInfo.node.instanceId) {
          instanceLoaded = true;
          break;
        }
      }
      if (!instanceLoaded) {
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
      buttons.push(<i className="fa fa-eye-slash"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          // rowInfo.node.subtitle = rowInfo.node.instanceId;
          this.props.selectionHandler(rowInfo.node.instanceId);
          this.setState({ nodeSelected: rowInfo.node });
        }} />);
      break;
    case "3dHidden":
      buttons.push(<i className="fa fa-eye-slash"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          if (Instances[rowInfo.node.instanceId]?.getParent() !== null) {
            Instances[rowInfo.node.instanceId]?.getParent().show();
          } else {
            Instances[rowInfo.node.instanceId]?.show();
          }
          this.setState({ nodeSelected: rowInfo.node });
        }} />);
      break;
    case "3dVisible":
      var color = Instances[rowInfo.node.instanceId].getColor();
      buttons.push(<i className="fa fa-eye"
        aria-hidden="true"
        onClick={ e => {
          e.stopPropagation();
          if (Instances[rowInfo.node.instanceId]?.getParent() !== null) {
            Instances[rowInfo.node.instanceId]?.getParent().hide();
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
            <ChromePicker
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
            className={(this.state.nodeSelected !== undefined && rowInfo.node.instanceId === this.state.nodeSelected.instanceId)
              ? "nodeFound nodeSelected"
              : "nodeSelected"}
            onClick={ e => {
              e.stopPropagation();
              this.colorPickerContainer = undefined;
              let instanceFound = false;
              for (let i = 0; i < Instances.length; i++) {
                if (Instances[i]?.getId() === rowInfo.node.instanceId) {
                  instanceFound = true;
                  break;
                }
              }
              if (instanceFound && typeof Instances[rowInfo.node.instanceId].isVisible === "function") {
                this.props.selectionHandler(rowInfo.node.instanceId);
                this.props.setTermInfo({}, true);
              } else {
                this.props.selectionHandler(rowInfo.node.classId);
                this.props.setTermInfo({}, true);
              }
              this.setState({ nodeSelected: rowInfo.node });
            }}>
            {rowInfo.node.title}
          </div>
        </Tooltip>
      </MuiThemeProvider>;
    }
    return title;
  }

  reloadData () {
    if (window.templateID !== undefined) {
      this.initTree(window.templateID);
    } else {
      this.setState({ errors: "Template not loaded yet." });
    }
  }

  componentWillMount () {
    if (window.templateID !== undefined) {
      this.initTree(window.templateID);
    } else {
      this.setState({ errors: "Template not loaded yet." });
    }
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.monitorMouseClick, false);
  }

  componentDidMount () {
    var that = this;
    document.addEventListener('mousedown', this.monitorMouseClick, false);

    GEPPETTO.on(GEPPETTO.Events.Select, function (instance) {
      that.updateTree(instance);
    });

    GEPPETTO.on(GEPPETTO.Events.Instance_deleted, function (parameters) {
      if (Instances[parameters] !== undefined ) {
        that.setState({ nodeSelected: undefined });
      }
    });

    GEPPETTO.on(GEPPETTO.Events.Instances_created, function () {
      that.setState({ displayColorPicker: false });
      if (that.state.errors !== undefined) {
        that.reloadData();
      }
    });

    GEPPETTO.on(GEPPETTO.Events.Color_set, function (instance) {
      that.forceUpdate();
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

    if (this.state.errors !== undefined) {
      return (
        <div id="treeError">
          {this.state.errors}
        </div>
      )
    } else {
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
              style={{ width: this.props.size?.width - 10, height: this.props.size?.height, float: 'left', clear: 'both' }}
              rowHeight={this.styles.row_height}
              getButtons={this.getButtons}
              getNodesProps={this.getNodes}
              searchQuery={this.state.nodeSelected === undefined ? this.props.instance?.getParent()?.getId() : this.state.nodeSelected?.subtitle}
              onlyExpandSearchedNodes={false}
            />
          }
        </div>
      )
    }
  }
}

function mapStateToProps (state) {
  return { ... state }
}
function mapDispatchToProps (dispatch) {
  return { setTermInfo: (instance, visible) => dispatch(setTermInfo(instance, visible )) }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef : true } )(VFBTree);
