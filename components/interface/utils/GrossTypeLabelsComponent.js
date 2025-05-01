define (function (require) {
  var React = require('react');
  var GEPPETTO = require('geppetto');
  
  
  // Import the label type to ID mapping from utils
  var labelTypeToID = require('./utils').labelTypeToID;
  var attachLabelClickHandlers = require('./utils').attachLabelClickHandlers;

  /**
   * A custom component for the gross_type column that renders clickable labels
   */
  class GrossTypeLabelsComponent extends React.Component {
    constructor (props) {
      super(props);
    }

    render () {
      if (!this.props.data) {
        return null;
      }

      // Split the semicolon-delimited string into individual labels
      const labels = this.props.data.split(';').map((label, idx) => {
        const trimmedLabel = label.trim();
        if (!trimmedLabel) {
          return null;
        }
        
        // Use original case for the CSS class
        const labelClass = trimmedLabel.replace(/ /g, '_');
        
        return (
          <span 
            key={labelClass + '-' + idx}
            className={`label label-${labelClass}`}>
            {trimmedLabel}
          </span>
        );
      }).filter(Boolean);
      
      // Wrap the labels in a span with class "label types"
      return <span className="label types">{labels}</span>;
    }
  }
  attachLabelClickHandlers();
  return GrossTypeLabelsComponent;
});