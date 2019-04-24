define(function (require) {
    return function (GEPPETTO) {
        var React = require('react');
        var ReactDOM = require('react-dom');
        var Route = require('react-router-dom').Route;
        var Switch = require('react-router-dom').Switch;
        var Redirect = require('react-router-dom').Redirect;
        var Router = require('react-router-dom').BrowserRouter;
        var VFBMain = require('./components/VFBMain').default;
        var ErrorCatcher = require('./components/interface/ErrorCatcher').default;

        ReactDOM.render( 
                <ErrorCatcher>
                <Router basename={GEPPETTO_CONFIGURATION.contextPath}>
                    <Switch>
                        <Route path="/geppetto" component={VFBMain} />
                        <Redirect from="/" to="/geppetto" />
                    </Switch>
                </Router>
                </ErrorCatcher>
            , document.getElementById('mainContainer'));
    };
});
