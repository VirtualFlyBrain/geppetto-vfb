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

    show : function () {
      $("#quick_help_modal").show();
    },
      
    hide : function () {
      $("#quick_help_modal").hide();
    },
    
    componentDidMount: function () {
      var self = this;
      GEPPETTO.on('show_quick_help', function () {
        self.show();
      }.bind(this));
      
      GEPPETTO.on('hide_quick_help', function () {
        self.hide();
      }.bind(this));
      
      document.addEventListener("keydown", this.escFunction, false);
      
      var self = this;
      $(document).mouseup( function (e) {
        var container = $("#quick_help_content");
        
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          self.hide();
        }
      });
    },
    
    handleChange : function ( e ){
      // set 30 days expiration
      window.setCookie('show_quick_help', document.getElementById('quick_help_dialog').checked ? 1 : 0, 30);
    },

    render: function () {
      return (
        <div id="quick_help_modal" className="modal callout" style={ { display : "none", width : "auto" , height : "auto", position : "relative" , zIndex: "2000 !important" } }>
          <div id="vfb-content-block" style={ { display : "block", width : "60%" , height : "60%" , textAlign : "center" , margin : "0 auto" } } >
            <div id="quick_help_content" className="modal-content">
              <div className="modal-header">
                <button className="close-slider fa fa-times" id = "x" style = { { float : "right" } } onClick = {e => this.hide()} / >
                <h3 className="text-center"> Quick Help 
                  <span style= { { color : "white" } } > Virtual Fly Brain</span>
                </h3>
              </div>
              <div className="modal-body">  
                <img src={"geppetto/build/splash.png"} alt="" / >
                <div>
                  <div>
                    <input type="checkbox" id="quick_help_dialog" onChange={e => this.handleChange(e)} ref={ input => this.myinput = input} name="help_dialog" / >
                    <label htmlFor="help_dialog"><h3>Dont show up the quick help on startup screen.</h3></label>
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
