import React, { Component } from 'react';
require('./VFBLoader.less');

export default class VFBLoader extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      percentage: 0,
      loadedCounter: 0,
      idsLoaded: [],
      queuedItems: [],
      idsMap: {},
      layout: undefined,
      stepstoLoad: 0,
      stepsLoaded: 0,
      instancesToLoad: 0,
      instancesLoaded: 0
    };

    this.nextStep = this.nextStep.bind(this);

    this.componentsMap = props.componentsMap;
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    // Variables from props and state
    var idsMap = prevState.idsMap;
    var queuedItems = prevState.queuedItems;
    var stepstoLoad = 0;
    var stepsLoaded = 0;
    var instancesToLoad = 0;
    var instancesLoaded = 0;
    var layout = nextProps.generals.layout;

    // function to add new instances to the map that keep tracks of each component loaded
    var addIdToMap = function (singleId) {
      stepstoLoad = 0;
      stepsLoaded = 0;
      instancesToLoad = 0;
      instancesLoaded = 0;
      // If this id is not listed in idsMap the we add it
      if (idsMap.singleId === undefined) {
        idsMap[singleId] = {
          loaded: false,
          components: {}
        };
        checkSuffixChildren(singleId);
        return true;
      }
      return false;
    };

    // function to update the instances map
    var updateIdsMap = function () {
      stepstoLoad = 0;
      stepsLoaded = 0;
      instancesToLoad = 0;
      instancesLoaded = 0;
      for (let singleId in idsMap) {
        checkSuffixChildren(singleId);
      }
    };

    // function that create the inner map per instance to track each component
    var checkSuffixChildren = function (id) {
      if (Instances[id] !== undefined && Instances[id].children.length > 0) {
        var loaded = true;
        Instances[id].children.map(child => {
          var childId = child.getId();
          for (let key in nextProps.componentsMap) {
            if (typeof nextProps.componentsMap[key].geppettoSuffix === "string") {
              if (childId.includes(nextProps.componentsMap[key].geppettoSuffix)) {
                if (idsMap[id].components[nextProps.componentsMap[key].matchingString] !== undefined) {
                  if (layout[nextProps.componentsMap[key].matchingString] == false
                      && idsMap[id].components[nextProps.componentsMap[key].matchingString].available) {
                    idsMap[id].components[nextProps.componentsMap[key].matchingString].available = false;
                  }
                  if (idsMap[id].components[nextProps.componentsMap[key].matchingString].loaded
                      && idsMap[id].components[nextProps.componentsMap[key].matchingString].available) {
                    stepstoLoad++;
                    stepsLoaded++;
                  }
                  if (idsMap[id].components[nextProps.componentsMap[key].matchingString].available
                      && idsMap[id].components[nextProps.componentsMap[key].matchingString].loaded == false) {
                    stepstoLoad++;
                    loaded = false;
                  }
                } else {
                  if (layout[nextProps.componentsMap[key].matchingString]) {
                    idsMap[id].components[nextProps.componentsMap[key].matchingString] = {
                      loaded: false,
                      available: true,
                    };
                    stepstoLoad++;
                    loaded = false;
                  } else {
                    idsMap[id].components[nextProps.componentsMap[key].matchingString] = {
                      loaded: false,
                      available: false,
                    };
                  }
                }
              }
            } else if (nextProps.componentsMap[key].geppettoSuffix.length > 1) {
              nextProps.componentsMap[key].geppettoSuffix.map(suffix => {
                if (childId.includes(suffix)) {
                  if (idsMap[id].components[nextProps.componentsMap[key].matchingString] !== undefined) {
                    if (layout[nextProps.componentsMap[key].matchingString] == false
                        && idsMap[id].components[nextProps.componentsMap[key].matchingString].available) {
                      idsMap[id].components[nextProps.componentsMap[key].matchingString].available = false;
                    }
                    if (layout[nextProps.componentsMap[key].matchingString]
                        && idsMap[id].components[nextProps.componentsMap[key].matchingString].loaded) {
                      stepstoLoad++;
                      stepsLoaded++;
                    }
                    if (layout[nextProps.componentsMap[key].matchingString]
                        && idsMap[id].components[nextProps.componentsMap[key].matchingString].loaded == false) {
                      stepstoLoad++;
                      loaded = false;
                    }
                  } else {
                    if (layout[nextProps.componentsMap[key].matchingString]) {
                      idsMap[id].components[nextProps.componentsMap[key].matchingString] = {
                        loaded: false,
                        available: true,
                      };
                      loaded = false;
                      stepstoLoad++;
                    } else {
                      idsMap[id].components[nextProps.componentsMap[key].matchingString] = {
                        loaded: false,
                        available: false,
                      };
                    }
                  }
                }
              });
            }
          }
        });
        if (loaded) {
          delete idsMap[id];
        }
      } else {
        stepstoLoad++;
      }
    };

    // If there are new instances to load add them to the map and to the queueItems array
    if (nextProps.generals.idsToLoad !== undefined && nextProps.generals.idsToLoad.length > 0) {
      nextProps.generals.idsToLoad.map(singleId => {
        if (addIdToMap(singleId)) {
          queuedItems.push(singleId);
        }
      });

      var instancesToLoad = queuedItems.length;
      var instancesLoaded = instancesToLoad - Object.keys(idsMap).length;

      return {
        ...prevState,
        loading: true,
        idsMap: idsMap,
        queuedItems: queuedItems,
        stepstoLoad: stepstoLoad,
        stepsLoaded: stepsLoaded,
        instancesToLoad: instancesToLoad,
        instancesLoaded: instancesLoaded,
      };
    }

    // If an instances has been partially or totally loaded update the map
    if (nextProps.generals.idLoaded !== undefined) {
      if (idsMap[nextProps.generals.idLoaded.id] === undefined) {
        return null;
      }
      checkSuffixChildren(nextProps.generals.idLoaded.id);
      if (idsMap[nextProps.generals.idLoaded.id].components[nextProps.generals.idLoaded.component] !== undefined) {
        idsMap[nextProps.generals.idLoaded.id].components[nextProps.generals.idLoaded.component].loaded = true;
      }
      updateIdsMap();

      var instancesToLoad = queuedItems.length;
      var instancesLoaded = instancesToLoad - Object.keys(idsMap).length;

      return {
        ...prevState,
        loading: true,
        idsMap: idsMap,
        queuedItems: queuedItems,
        stepstoLoad: stepstoLoad,
        stepsLoaded: stepsLoaded,
        instancesToLoad: instancesToLoad,
        instancesLoaded: instancesLoaded,
      };
    }

    return null;
  }


  nextStep () {
    if (this.state.percentage <= this.state.totalUIItems) {
      this.setState(prevState => ({ percentage: prevState.percentage + 1 }))
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if ((Object.keys(this.state.idsMap).length === 0 && this.state.loading === true)) {
      this.setState({
        loading: false,
        percentage: 0,
        loadedCounter: 0,
        idsLoaded: [],
        queuedItems: [],
        idsMap: {},
        layout: undefined,
        stepstoLoad: 0,
        stepsLoaded: 0,
        instancesToLoad: 0,
        instancesLoaded: 0
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

    GEPPETTO.on(GEPPETTO.Events.Instances_created, function (instances) {
      var idsMap = JSON.parse(JSON.stringify(that.state.idsMap));
      var requireUpdate = false;

      for (let id in idsMap) {
        if (Instances[id] !== undefined && Instances[id].children.length > 0) {
          var loaded = true;
          Instances[id].children.map(child => {
            var childId = child.getId();
            for (let key in that.componentsMap) {
              if (typeof that.componentsMap[key].geppettoSuffix === "string") {
                if (childId.includes(that.componentsMap[key].geppettoSuffix)) {
                  if (idsMap[id].components[that.componentsMap[key].matchingString] !== undefined) {
                    if (that.props.generals.layout[that.componentsMap[key].matchingString]
                        && idsMap[id].components[that.componentsMap[key].matchingString].loaded == false) {
                      loaded = false;
                    }
                  } else {
                    if (that.props.generals.layout[that.componentsMap[key].matchingString]) {
                      idsMap[id].components[that.componentsMap[key].matchingString] = {
                        loaded: false,
                        available: true,
                      };
                      loaded = false;
                    }
                  }
                }
              } else if (that.componentsMap[key].geppettoSuffix.length > 1) {
                that.componentsMap[key].geppettoSuffix.map(suffix => {
                  if (childId.includes(suffix)) {
                    if (idsMap[id].components[that.componentsMap[key].matchingString] !== undefined) {
                      if (that.props.generals.layout[that.componentsMap[key].matchingString]
                          && idsMap[id].components[that.componentsMap[key].matchingString].loaded == false) {
                        loaded = false;
                      }
                    } else {
                      if (that.props.generals.layout[that.componentsMap[key].matchingString]) {
                        idsMap[id].components[that.componentsMap[key].matchingString] = {
                          loaded: false,
                          available: true,
                        };
                        loaded = false;
                      }
                    }
                  }
                });
              }
            }
          });
          if (loaded) {
            delete idsMap[id];
            requireUpdate = true;
          }
        }
      }

      if (requireUpdate) {
        that.setState({ idsMap: idsMap });
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
  let instancesToLoad = props.params.instancesToLoad;
  let instancesLoaded = props.params.instancesLoaded + 1;
  return (
    <div className="progress-bar" datalabel={"Loading " + String(instancesLoaded) + "/" + String(instancesToLoad) + " ..."}>
      <Filler stepsLoaded={props.params.stepsLoaded} stepstoLoad={props.params.stepstoLoad} />
    </div>
  )
};

const Filler = props => (
  <div className="filler" style={{ width: `${props.stepsLoaded * (100 / props.stepstoLoad)}%` }}></div>
);
