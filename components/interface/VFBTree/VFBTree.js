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

const treeQueryUrl = require('../../configuration/VFBTree/VFBTreeConfiguration').treeQueryUrl;

/*
 * Cache key prefix is version-stamped so any localStorage entry written
 * under the legacy Cypher-shape response (treeData_<id>) is ignored by
 * the new applyResponse - those entries have a graph/relationships
 * payload that the new code wouldn't know how to consume. The prefix
 * will only need bumping again if the response shape changes.
 */
const TREE_CACHE_KEY_PREFIX = "treeData_vfbquery_v1_";

class VFBTree extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      errors: undefined,
      dataTree: undefined,
      root: undefined,
      loading: false,
      nodes: undefined,
      nodeSelected: undefined,
      displayColorPicker: false,
      pickerAnchor: undefined
    };

    this.initTree = this.initTree.bind(this);
    this.applyResponse = this.applyResponse.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.nodeClick = this.nodeClick.bind(this);
    this.updateTree = this.updateTree.bind(this);
    this.getButtons = this.getButtons.bind(this);
    this.selectNode = this.selectNode.bind(this);
    this.reloadData = this.reloadData.bind(this);
    this.monitorMouseClick = this.monitorMouseClick.bind(this);
    this.convertVfbqueryNode = this.convertVfbqueryNode.bind(this);

    this.theme = createMuiTheme({ overrides: { MuiTooltip: { tooltip: { fontSize: "12px" } } } });
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

    /*
     * Track the in-flight tree fetch so componentWillUnmount can abort
     * it. Without this, a fetch started just before the user closes
     * the Tree Browser tab can resolve after unmount and call setState
     * on a dead component (React warning + leaked work).
     */
    this._fetchController = null;
    /*
     * Mounted flag — belt-and-braces guard alongside the abort, since
     * AbortController doesn't cover the localStorage-cached fast path
     * where applyResponse fires synchronously inside the .then() of an
     * already-resolved promise.
     */
    this._mounted = false;
  }

  /*
   * Map a single node from the vfbquery TemplateROIBrowser response shape
   * into the legacy node shape consumed by getButtons / getNodes /
   * nodeClick / updateTree. painted_domain is always a list (T1 leg has
   * bilateral L/R Individuals on the same Class); we surface the first
   * for the eye toggle. Future enhancement: cycle through Individuals
   * in the tooltip if there is more than one.
   */
  convertVfbqueryNode (vNode) {
    var painted = (vNode.painted_domain && vNode.painted_domain.length > 0)
      ? vNode.painted_domain[0]
      : null;
    var instanceId = painted ? painted.individual_id : "";
    return {
      title: vNode.label,
      subtitle: vNode.id,
      description: vNode.summary_md || "",
      classId: vNode.id,
      instanceId: instanceId,
      id: vNode.id,
      showColorPicker: false,
      children: (vNode.children || []).map(this.convertVfbqueryNode)
    };
  }

  /*
   * Walk the converted tree depth-first into a flat list used by
   * updateTree to find a node by instanceId/classId on focus change.
   */
  flattenTree (treeData) {
    var out = [];
    var walk = nodes => {
      for (var i = 0; i < nodes.length; i++) {
        out.push(nodes[i]);
        walk(nodes[i].children);
      }
    };
    walk(treeData);
    return out;
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
     *
     * Geppetto's getParent() returns null for some entity shapes
     * and undefined for others (depends on whether the instance is a
     * top-level Variable or a typed Class/Instance). Use a falsy
     * check so we treat both as "no parent" — a strict `!== null`
     * check routes the undefined case into the parent branch with
     * innerInstance = undefined, idToSearch = undefined, and the flat-
     * node search finds nothing. The GEPPETTO Select event for a
     * focus-term load (e.g. medulla via the search dialog) then
     * silently fails to update nodeSelected, and the batch3 .nodeFound
     * assertion sees no row matching the previous selection.
     */
    var parent = instance?.getParent();
    var innerInstance = parent || instance;
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

  initTree (instance) {
    /*
     * Entry point: load the ROI tree for the active template, either
     * from localStorage (L1 cache) or from vfbquery (which is itself
     * SOLR-cached server-side with a 90-day TTL).
     */
    this.setState({
      loading: true,
      errors: undefined
    });

    var cacheKey = TREE_CACHE_KEY_PREFIX + instance;
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        this.applyResponse(JSON.parse(cached));
        return;
      } catch (e) {
        console.warn("VFBTree: corrupted localStorage entry, refetching", e);
        localStorage.removeItem(cacheKey);
      }
    }

    /*
     * Abort any prior in-flight fetch (e.g. the user switched template
     * before the previous load completed) so its .then doesn't race
     * the new one.
     */
    if (this._fetchController) {
      this._fetchController.abort();
    }
    var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    this._fetchController = controller;

    fetch(treeQueryUrl(instance), controller ? { signal: controller.signal } : undefined)
      .then(r => {
        if (!r.ok) {
          throw new Error("HTTP " + r.status + " from vfbquery TemplateROIBrowser");
        }
        return r.json();
      })
      .then(data => {
        if (!this._mounted || this._fetchController !== controller) {
          return;
        }
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
          if (e && e.name === 'QuotaExceededError') {
            /*
             * Tree responses are small (tens of KB) but the user may
             * have hundreds of other entries. Don't wipe the whole
             * localStorage (would nuke show_quick_help, VFBUploader
             * URLs, and any other app state) — only evict OUR cache
             * entries, including legacy `treeData_<id>` keys from the
             * pre-vfbquery code path that are dead weight.
             */
            console.warn('VFBTree: localStorage full, evicting tree-cache keys and retrying');
            try {
              for (var i = localStorage.length - 1; i >= 0; i--) {
                var k = localStorage.key(i);
                if (k && (k.indexOf(TREE_CACHE_KEY_PREFIX) === 0 || k.indexOf('treeData_') === 0)) {
                  localStorage.removeItem(k);
                }
              }
            } catch (evictErr) {
              console.error('VFBTree: tree-cache eviction failed', evictErr);
            }
            try {
              localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e2) {
              console.error('VFBTree: localStorage write still failing after eviction', e2);
            }
          } else {
            console.error('VFBTree: localStorage write error', e);
          }
        }
        this.applyResponse(data);
      })
      .catch(e => {
        if (e && e.name === 'AbortError') {
          return;
        }
        if (!this._mounted || this._fetchController !== controller) {
          return;
        }
        console.error("VFBTree: error retrieving tree from vfbquery", e);
        this.setState({
          loading: false,
          errors: "Error retrieving the data - check the console for additional information"
        });
      });
  }

  applyResponse (data) {
    /*
     * Render the no-data placeholder when the template has no painted
     * domains (e.g. L1 CNS at the time of writing) or the endpoint
     * returned an unexpected shape.
     */
    if (!data || !Array.isArray(data.tree) || data.tree.length === 0) {
      /*
       * Clear nodeSelected too — if the user previously had a
       * selection (e.g. medulla on JFRC2) and then switched to a
       * template with no painted domains (e.g. L1 larval CNS), the
       * stale subtitle would still drive searchQuery for a node that
       * no longer exists in the rendered tree.
       */
      this.setState({
        loading: false,
        errors: undefined,
        dataTree: [{ title: "No data available.", subtitle: null, children: [] }],
        root: undefined,
        nodes: [],
        nodeSelected: undefined
      });
      return;
    }
    var treeData = data.tree.map(this.convertVfbqueryNode);
    var flatNodes = this.flattenTree(treeData);
    /*
     * Seed nodeSelected from props.instance when the page already has a
     * focus term (e.g. Tree Browser tab is opened after the user
     * searched a class). The legacy code dropped a synthetic
     * { subtitle: <id> } placeholder in here, but that has no
     * instanceId, so getNodes' nodeFound condition
     * (rowInfo.node.instanceId === state.nodeSelected.instanceId) never
     * matched any row - meaning .nodeFound was never applied after a
     * remount with an active focus term. Look up the matching real tree
     * node by classId / instanceId so the row gets the nodeFound class
     * straight from initial render. Falls back to the synthetic
     * placeholder when the focus term isn't in this template's tree.
     */
    var initialSelected;
    if (this.props.instance === undefined) {
      initialSelected = treeData[0];
    } else {
      /*
       * Geppetto's getParent() returns null for some entities and
       * undefined for others (depends on whether the instance is a
       * top-level Variable or a Type). Treat both as "no parent" via
       * the falsy check — a strict `=== null` check misses the
       * undefined case and would route us into the parent branch with
       * focusInstance = undefined, yielding focusId = undefined and
       * the synthetic-placeholder fallback. That's the root cause of
       * the batch3 nodeFound test failure: with focusId undefined,
       * the flat-node lookup fails, the placeholder has no
       * instanceId, and getNodes' nodeFound class never applies.
       */
      var parent = this.props.instance?.getParent();
      var focusInstance = parent || this.props.instance;
      var focusId = focusInstance?.getId();
      initialSelected = null;
      if (focusId !== undefined) {
        for (var fi = 0; fi < flatNodes.length; fi++) {
          if (flatNodes[fi].instanceId === focusId
              || flatNodes[fi].classId === focusId) {
            initialSelected = flatNodes[fi];
            break;
          }
        }
      }
      if (initialSelected === null) {
        initialSelected = { subtitle: focusId };
      }
    }
    this.setState({
      loading: false,
      errors: undefined,
      dataTree: treeData,
      root: (data.anatomy_root && data.anatomy_root.short_form) || undefined,
      nodes: flatNodes,
      nodeSelected: initialSelected
    });
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
          /*
           * Falsy parent check covers both null and undefined returns
           * from getParent() — same shape gotcha as updateTree.
           */
          var hiddenParent = Instances[rowInfo.node.instanceId]?.getParent();
          if (hiddenParent) {
            hiddenParent.show();
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
          var visibleParent = Instances[rowInfo.node.instanceId]?.getParent();
          if (visibleParent) {
            visibleParent.hide();
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
    this._mounted = false;
    /*
     * Cancel any in-flight tree fetch so its .then doesn't try to
     * setState on this dead instance (React warning, leaked work).
     */
    if (this._fetchController) {
      try {
        this._fetchController.abort();
      } catch (e) {
        /* AbortController.abort() may not be supported in legacy envs */
      }
      this._fetchController = null;
    }
    document.removeEventListener('mousedown', this.monitorMouseClick, false);
  }

  componentDidMount () {
    var that = this;
    this._mounted = true;
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
