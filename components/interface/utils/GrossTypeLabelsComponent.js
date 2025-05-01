define (function (require) {
  var React = require('react');
  var GEPPETTO = require('geppetto');
  
  // Import the label type to ID mapping from utils
  var labelTypeToID = require('./utils').labelTypeToID;

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
            className={`label label-${labelClass}`}
            onClick={() => {
              // Find the term ID for this label type
              const termID = labelTypeToID[trimmedLabel];
              
              if (termID) {
                if (window.Instances && window.Instances.getInstance(termID)) {
                  window.setTermInfo(window.Instances.getInstance(termID)[termID + "_meta"], termID);
                } else {
                  window.fetchVariableThenRun(termID, function () {
                    window.setTermInfo(window.Instances.getInstance(termID)[termID + "_meta"], termID);
                  });
                }
              }
            }}>
            {trimmedLabel}
          </span>
        );
      }).filter(Boolean);
      
      return <div className="label-types">{labels}</div>;
    }
  }
  
  return GrossTypeLabelsComponent;
});