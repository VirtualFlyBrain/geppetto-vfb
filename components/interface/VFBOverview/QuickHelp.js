define(function (require) {

  var React = require('react');
  var CreateClass = require('create-react-class');
  var GEPPETTO = require('geppetto');

  var logoDiv = CreateClass({
    escFunction : function (event) {
      if ( event.keyCode === 27 ) {
        this.hide()
      }
    },

    hide : function () {
      $("#quickHelpModal").hide();
    },
    
    componentDidMount: function () {
      GEPPETTO.on('show_quick_help', function () {
        $("#quickHelpModal").show();
      }.bind(this));
      
      GEPPETTO.on('hide_quick_help', function () {
        this.hide();
      }.bind(this));
      
      document.addEventListener("keydown", this.escFunction, false);
      
      var self = this;
      $(document).mouseup( function (e) {
        var container = $("#quickHelpContent");
        
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          self.hide();
        }
      });
    },
    
    handleChange : function ( e ){
      // set 30 days expiration
      window.setCookie('show_quick_help', document.getElementById('quickHelpDialog').checked ? 1 : 0, 30);
    },

    render: function () {
      return (
        <div id="quickHelpModal" className="modal callout" style={ { display : "none", width : "auto" , height : "auto", position : "relative" , zIndex: "2000 !important" } }>
          <div id="vfb-content-block" style={ { display : "block", width : "60%" , height : "60%" , textAlign : "center" , margin : "0 auto" } } >
            <div id="quickHelpContent" className="modal-content">
              <div className="modal-header">
                <button id = "x" style = { { float : "right" } } onClick = {e => this.hide()} >
                  X
                </button>  
                <h3 className="text-center"> Quick Help 
                  <span style= { { color : "white" } } > Virtual Fly Brain</span>
                </h3>
              </div>
              <div className="modal-body">  
                <img src={"geppetto/build/splash.png"} alt="" / >
                <div>
                  <div>
                    <input type="checkbox" id="quickHelpDialog" onChange={e => this.handleChange(e)} ref={ input => this.myinput = input} name="helpDialog" / >
                    <label htmlFor="helpDialog"><h3>Dont show up the quick help on startup screen.</h3></label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  });

  return logoDiv;
});
