import VFBMain from '../components/VFBMain';
import { vfbLoadId, vfbIdLoaded, vfbUIUpdated, instanceAdded, instanceSelected, instanceVisibilityChanged } from '../actions/generals';
import { connect } from "react-redux";

const mapStateToProps = state => ({ ...state });

const mapDispatchToProps = dispatch => ({
  vfbLoadId: id => dispatch(vfbLoadId(id)),
  vfbIdLoaded: (id, component) => dispatch(vfbIdLoaded(id, component)),
  vfbUIUpdated: layout => dispatch(vfbUIUpdated(layout)),
  instanceAdded: instance => dispatch(instanceAdded(instance)),
  instanceSelected : instance => dispatch(instanceSelected(instance)),
  instanceVisibilityChanged : instance => dispatch(instanceVisibilityChanged(instance))
});

export default connect(mapStateToProps, mapDispatchToProps)(VFBMain);
