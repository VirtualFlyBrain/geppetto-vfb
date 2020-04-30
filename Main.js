global.jQuery = require("jquery");
global.GEPPETTO_CONFIGURATION = require('./GeppettoConfiguration.json');

const Provider = require("react-redux").Provider;
const configureStore = require('./store').default;
const store = configureStore();

jQuery(function () {
  require('geppetto-client-initialization');
  var React = require('react');
  var ReactDOM = require('react-dom');
  var Route = require('react-router-dom').Route;
  var Switch = require('react-router-dom').Switch;
  var Redirect = require('react-router-dom').Redirect;
  var Router = require('react-router-dom').BrowserRouter;
  var VFBMain = require('./containers/VFBMainContainer').default;
  var ErrorCatcher = require('./components/interface/ErrorCatcher').default;

  ReactDOM.render(
    <ErrorCatcher>
      <Provider store={store}>
        <Router basename={GEPPETTO_CONFIGURATION.contextPath}>
          <Switch>
            <Route path="/geppetto" component={props => <VFBMain {...props} />} />
            <Redirect from="/" to="/geppetto" />
          </Switch>
        </Router>
      </Provider>
    </ErrorCatcher>
    , document.getElementById('mainContainer'));
});
