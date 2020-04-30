import React, { Component } from 'react';

export default class VFBLoader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      percentage: 0,
      loadedCounter: 0,
      totalUIItems: 3,
      idsLoaded: [],
      queuedItems: [],
      idsMap: {},
    };

    this.nextStep = this.nextStep.bind(this);

    this.componentsMap = require('../../configuration/VFBLoader/VFBLoaderConfiguration').componentsMap;
    require('./VFBLoader.less');
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    var componentsMap = require('../../configuration/VFBLoader/VFBLoaderConfiguration').componentsMap;
    var idsMap = prevState.idsMap;
    var queuedItems = prevState.queuedItems;

    // function to add new instances to the map that keep tracks of each component loaded
    var addIdToMap = function (componentsMap, idsMap, singleId) {
      // If this id is not listed in idsMap the we add it
      if (idsMap.singleId === undefined) {
        if (Instances[singleId] !== undefined && Instances[singleId].children > 0 ) {
          idsMap[singleId] = {
            loaded: false,
            components: {}
          }
          Instances[singleId].children.map(child => {
            var childId = child.getId();
            for (let key in componentsMap) {
              checkSuffixChildren(componentsMap, idsMap, singleId, childId, key);
            }
          });
        } else {
          idsMap[singleId] = {
            loaded: false,
            components: {}
          }
        }
        return true;
      }
      return false;
    };

    // function that create the inner map per instance to track each component
    var checkSuffixChildren = function (componentsMap, idsMap, id, childId, key) {
      if (typeof componentsMap[key].geppettoSuffix === "string") {
        if (childId.includes(componentsMap[key].geppettoSuffix) && idsMap[id].components[componentsMap[key].matchingString] === undefined) {
          idsMap[id].components[componentsMap[key].matchingString] = { loaded: false }
        }
      } else if (componentsMap[key].geppettoSuffix.length > 1) {
        componentsMap[key].geppettoSuffix.map(suffix => {
          if (childId.includes(suffix) && idsMap[id].components[componentsMap[key].matchingString] === undefined) {
            idsMap[id].components[componentsMap[key].matchingString] = { loaded: false }
          }
        });
      }
    };

    // function to update the instances map
    var updateIdsMap = function (componentsMap, idsMap) {
      for (let singleId in idsMap) {
        if (Instances[singleId] !== undefined && Instances[singleId].children.length > 0) {
          if (idsMap[singleId] === undefined && addIdToMap(componentsMap, idsMap, singleId)) {
            queuedItems.push(singleId);
          } else {
            Instances[singleId].children.map(child => {
              var childId = child.getId();
              for (let key in componentsMap) {
                checkSuffixChildren(componentsMap, idsMap, singleId, childId, key);
              }
            });
          }
        }
      }
    }

    // If there are new instances to load add them to the map and to the queueItems array
    if (nextProps.generals.idsToLoad !== undefined && nextProps.generals.idsToLoad.length > 0) {
      nextProps.generals.idsToLoad.map(singleId => {
        if (addIdToMap(componentsMap, idsMap, singleId)) {
          queuedItems.push(singleId);
        }
      });

      return {
        ...prevState,
        loading: true,
        idsMap: idsMap,
        percentage: 0,
        queuedItems: queuedItems
      };
    }

    // If an instances has been partially or totally loaded update the map
    if (nextProps.generals.idLoaded !== undefined) {
      if (idsMap[nextProps.generals.idLoaded.id] === undefined) {
        return null;
      }
      updateIdsMap(componentsMap, idsMap);
      idsMap[nextProps.generals.idLoaded.id].components[nextProps.generals.idLoaded.component].loaded = true;
      let newPercentage = prevState.percentage;

      if ( newPercentage >= 0 && newPercentage < prevState.totalUIItems) {
        newPercentage++;
      } else {
        newPercentage = 0;
      }

      return {
        ...prevState,
        loading: true,
        idsMap: idsMap,
        percentage: newPercentage,
        queuedItems: queuedItems
      };
    }

    return null;
  }


  nextStep () {
    if (this.state.percentage <= this.state.totalUIItems) {
      this.setState(prevState => ({ percentage: prevState.percentage + 1 }))
    }
  }

  checkIdsMap (idLoadedBool) {
    var idsMap = JSON.parse(JSON.stringify(this.state.idsMap));
    var idsLoaded = [];
    var loadedCounter = 0;
    for (let singleId in idsMap) {
      let instanceLoaded = true;
      if (Object.keys(idsMap[singleId].components).length === 0) {
        instanceLoaded = false;
      } else {
        for (let component in idsMap[singleId].components) {
          if (idsMap[singleId].components[component].loaded === false) {
            instanceLoaded = false;
          }
        }
      }
      if (instanceLoaded === true) {
        loadedCounter++;
        idsLoaded.push(singleId);
        delete idsMap[singleId];
      }
    }

    if (Object.keys(idsMap).length !== Object.keys(this.state.idsMap).length) {
      if (idLoadedBool) {
        this.setState({
          percentage: 0,
          idsMap: idsMap,
          idsLoaded: idsLoaded,
          loadedCounter: loadedCounter
        });
      } else {
        this.setState({
          idsMap: idsMap,
          idsLoaded: idsLoaded,
          loadedCounter: loadedCounter
        });
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.percentage === this.state.totalUIItems) {
      this.checkIdsMap(true);
    } else {
      this.checkIdsMap(false);
    }

    if ((this.state.loadedCounter !== 0 && this.state.loadedCounter === this.state.queuedItems.length) || (Object.keys(this.state.idsMap).length === 0 && this.state.loading === true)) {
      this.setState({
        loading: false,
        percentage: 0,
        loadedCounter: 0,
        idsLoaded: [],
        queuedItems: [],
        idsMap: {},
      }, () => {
        GEPPETTO.trigger('stop_spin_logo');
      });
    }
  }

  componentDidMount () {
    var that = this;
    GEPPETTO.on('stop_spin_logo', function () {
      if (that.state.loading) {
        GEPPETTO.trigger('spin_logo');
      }
    });
  }

  render () {
    if (!this.state.loading) {
      return null;
    }
    return (
      <div>
        <ProgressBar params={this.state} />
      </div>
    )
  }
}

const ProgressBar = props => {
  let loadedCounter = props.params.loadedCounter + 1;
  let queuedItems = props.params.queuedItems;
  return (
    <div className="progress-bar" datalabel={"Loading " + String(loadedCounter) + "/" + String(queuedItems.length) + " ..."}>
      <Filler percentage={props.params.percentage} totalUIItems={props.params.totalUIItems} />
    </div>
  )
};

const Filler = props => (
  <div className="filler" style={{ width: `${props.percentage * (100 / props.totalUIItems)}%` }}></div>
);
