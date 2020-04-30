import { connect } from "react-redux";
import VFBLoader from './VFBLoader';
import { vfbLoadId, vfbIdLoaded } from '../../../actions/generals';

const mapStateToProps = state => ({ ...state });

const mapDispatchToProps = dispatch => ({
  vfbLoadId: id => dispatch(vfbLoadId(id)),
  vfbIdLoaded: id => dispatch(vfbIdLoaded(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VFBLoader);
