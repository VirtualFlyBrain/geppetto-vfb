import { connect } from "react-redux";
import VFBLoader from "./VFBLoader";

const mapStateToProps = state => ({ ...state });

export default connect(mapStateToProps)(VFBLoader);
