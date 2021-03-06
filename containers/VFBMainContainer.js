import VFBMain from '../components/VFBMain';
import {
  vfbLoadId,
  vfbIdLoaded,
  vfbUIUpdated,
  instanceAdded,
  instanceSelected,
  instanceDeleted,
  instanceVisibilityChanged,
  setTermInfo,
  vfbGraph,
  vfbCircuitBrowser,
  invalidIdLoaded
} from '../actions/generals';
import { connect } from "react-redux";

const mapStateToProps = state => ({ ...state });

const mapDispatchToProps = dispatch => ({
  vfbLoadId: id => dispatch(vfbLoadId(id)),
  vfbIdLoaded: (id, component) => dispatch(vfbIdLoaded(id, component)),
  vfbUIUpdated: layout => dispatch(vfbUIUpdated(layout)),
  vfbGraph: (id, component, type, visible, sync) => dispatch(vfbGraph(id, component, type, visible, sync)),
  vfbCircuitBrowser: (type, path, visible) => dispatch (vfbCircuitBrowser(type, path, visible)),
  instanceAdded: instance => dispatch(instanceAdded(instance)),
  instanceSelected : instance => dispatch(instanceSelected(instance)),
  instanceDeleted : (type, instanceID) => dispatch(instanceDeleted(type, instanceID)),
  instanceVisibilityChanged : instance => dispatch(instanceVisibilityChanged(instance)),
  setTermInfo: (instance, visible) => dispatch (setTermInfo(instance, visible)),
  invalidIdLoaded: id => dispatch(invalidIdLoaded(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(VFBMain);
