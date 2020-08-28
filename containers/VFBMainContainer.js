import VFBMain from '../components/VFBMain';
import { vfbLoadId, vfbIdLoaded, vfbUIUpdated, instanceAdded, vfbGraph } from '../actions/generals';
import { connect } from "react-redux";

const mapStateToProps = state => ({ ...state });

const mapDispatchToProps = dispatch => ({
  vfbLoadId: id => dispatch(vfbLoadId(id)),
  vfbIdLoaded: (id, component) => dispatch(vfbIdLoaded(id, component)),
  vfbUIUpdated: layout => dispatch(vfbUIUpdated(layout)),
  vfbGraph: (id, component, type) => dispatch(vfbGraph(id, component, type)),
  instanceAdded: instance => dispatch(instanceAdded(instance)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VFBMain);
