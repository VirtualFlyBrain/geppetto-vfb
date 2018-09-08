define(function (require) {
    return function (GEPPETTO) {
        var ReactDOM = require('react-dom');
        var React = require('react');
        var VFBMain = require('./components/VFBMain').default;
        var injectTapEventPlugin = require('react-tap-event-plugin');

        function App() {
            return (
                <div>
                    <VFBMain> </VFBMain>
                </div>
            );
        }
        ReactDOM.render(<App />, document.querySelector('#mainContainer'));

        GEPPETTO.G.setIdleTimeOut(-1);
    };
});
