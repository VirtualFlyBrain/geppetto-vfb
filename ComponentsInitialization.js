define(function (require) {
    return function (GEPPETTO) {
        var React = require('react');
        var ReactDOM = require('react-dom');
        var Route = require('react-router-dom').Route;
        var Switch = require('react-router-dom').Switch;
        var Redirect = require('react-router-dom').Redirect;
        var Router = require('react-router-dom').BrowserRouter;
        var browserHistory = require('react-router-dom').browserHistory;
        var VFBMain = require('./components/VFBMain').default;

        GEPPETTO.G.setIdleTimeOut(-1);
        GEPPETTO_CONFIGURATION.properties.title = "VFB - Virtual Fly Brain";
        GEPPETTO_CONFIGURATION.properties.description = "VFB - Virtual Fly Brain, a hub for Drosophila melanogaster neuroscience research";
        GEPPETTO_CONFIGURATION.properties.icon = "https://v2.virtualflybrain.org/images/vfbbrain_icon.png";
        
        ReactDOM.render( 
                <Router basename={GEPPETTO_CONFIGURATION.contextPath}>
                    <Switch>
                        <Route path="/geppetto" component={VFBMain} />
                        <Redirect from="/" to="/geppetto" />
                    </Switch>
                </Router>
            , document.getElementById('mainContainer'));
    };
});
