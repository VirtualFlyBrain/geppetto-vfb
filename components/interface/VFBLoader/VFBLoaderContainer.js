import { connect } from "react-redux";
import VFBLoader from "./VFBLoader";

const componentsMap = require('../../configuration/VFBLoader/VFBLoaderConfiguration').componentsMap;

const mapStateToProps = state => ({
  componentsMap: componentsMap,
  ...state,
});

export default connect(mapStateToProps)(VFBLoader);
