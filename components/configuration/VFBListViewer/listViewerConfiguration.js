import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import ListViewerControlsMenu from '../../interface/VFBListViewer/ListViewerControlsMenu';
import { getMetaHtml } from '../../interface/VFBListViewer/metaHtml';

/**
 * Create component to display controls
 */
const ControlsMenu = component => {
  let path = component.value.get("path").split(".")[0];
  let instance = Instances.getInstance(path);
  return <ListViewerControlsMenu instance={ instance }/>;
}

const Thumbnail = component => (
  <Tooltip
    title={
      <React.Fragment>
        <img src={component.value}
          className="thumbnail-img" />
      </React.Fragment>
    }
  >
    <img src={component.value}
      className="thumbnail-img" />
  </Tooltip>
)

const conf = [
  {
    id: "controls",
    title: "Controls",
    customComponent: ControlsMenu,
    source: entity => entity
  },
  {
    id: "name",
    title: "Name",
    customComponent: component => {
      // Retrieve instance path
      let path = component.value.get("path").split(".")[0];

      let instance = Instances.getInstance(path);
      var self = this;

      /*
       * The id is on the inner <a>, but the handler is on the div that wraps
       * it, so a click on the cell's padding -- or the gap beside a name that
       * wrapped to two lines -- has no id on the target. Looking that id up
       * threw ("The instance  does not exist in the current model") and took
       * the rest of the handler with it, so those clicks silently did nothing
       * while clicks that landed on the text worked. path is already in scope
       * and is all the handler needs.
       *
       * Select rather than only setting the term info. Setting it alone left
       * the row unmarked while its term filled the panel, so the list and the
       * panel disagreed about which term you were looking at; selecting marks
       * the row and sets the term info on the way. Checked on a live instance:
       * selecting one that is already selected does not toggle it off and does
       * re-show its term info, so a repeat click still brings the panel back.
       *
       * Partial instance shapes turn up here -- the same clear-then-re-add
       * case the isSelected guard below covers -- so fall back to setting the
       * term info directly when select is missing.
       */
      let click = () => {
        let clicked = Instances.getInstance(path);
        if (typeof clicked.select === 'function') {
          clicked.select();
          return;
        }
        window.setTermInfo(clicked[path + "_meta"], path);
      };
      // Create new HTML string with the Type name and tags only
      let typeHTML = '<a id="' + instance.id + '" style="color:white;text-decoration: none;cursor:pointer">' + instance.getName() + "</a>" ;
      /*
       * Same partial-instance-shape issue as the isVisible guard in
       * ListViewerControlsMenu (VFB2 #clear-then-re-add) - isSelected may be
       * briefly missing rather than undefined, so guard it too.
       */
      if (instance.isSelected !== undefined && instance.isSelected()) {
        typeHTML = '<a id="' + instance.id + '" style="color:yellow;text-decoration: none;cursor:pointer">' + instance.getName() + "</a>" ;
      }

      // Set HTML string inside div ready for React
      return <div onClick={e => click(e)} dangerouslySetInnerHTML={{ __html: typeHTML }} />
    },
    source : entity => entity
  },
  {
    id: "type",
    title: "Type",
    customComponent: component => {
      // Retrieve instance path
      let path = component.value.get("path").split(".")[0];

      let instance = Instances.getInstance(path)[path + "_meta"];

      if ( instance === undefined ) {
        return null;
      }

      /*
       * Retrieve the HTML type from the Instance, it's in the form of an HTML element saved as a string.
       * Empty when the image has no instance_of class in the KB (VFB2#499).
       */
      let html = getMetaHtml(instance, "type") || "";

      let htmlLabels = getMetaHtml(instance, "label") || "";

      // Extract HTML element anchor from html string
      var matchAnchor = /<a[^>]*>([\s\S]*?)<\/a>/g
        , type = html.match(matchAnchor) || [];

      // Extract span tags from the Name HTML (null when a term carries no tags)
      var matchSpan = /<span[^>]*>([\s\S]*?)<\/span>/g
        , tags = htmlLabels.match(matchSpan) || [];

      var matchID = /data-instancepath\=\"([A-Za-z0-9 _]*)\"/
        , idMatch = type[0] ? type[0].match(matchID) : null
        , classID = idMatch ? idMatch[1] : path;

      var matchText = /<a [^>]+>(.*?)<\/a>/
        , textMatch = type[0] ? type[0].match(matchText) : null
        , newText = textMatch ? textMatch[1] : path

      let textClass = '<a id="' + classID + '" style="color:#428bca;text-decoration: none;cursor:pointer">' + newText + "</a>"
      // Create new HTML string with the Type name and tags only
      let typeHTML = tags.join('') ;

      let click = value => {
        let id = value.target.id;
        if (Instances.getInstance(id) === undefined) {
          window.addVfbId(id);
        } else {
          window.setTermInfo(Instances.getInstance(id)[id + "_meta"], id);
        }
      };

      // Set HTML string inside div ready for React
      return <div>
        <div style={{ width: "40%", textAlign: "left", float: "left" }} onClick={e => click(e)} dangerouslySetInnerHTML={{ __html: textClass }} />
        <div style={{ textAlign: "right", width: "60%", float: "right" }} dangerouslySetInnerHTML={{ __html: typeHTML }} />
      </div>
    },
    source : entity => entity
  },
  {
    id: "image",
    title: "Thumbnail",
    customComponent: Thumbnail,
    source: entity => { 
      // Retrieve path from instance
      let path = entity.path.split(".")[0];
      
      let instance = Instances.getInstance(path)[path + "_meta"];
      
      if ( instance === undefined ) {
        return null;
      }
      
      let value = GEPPETTO.ModelFactory.getAllVariablesOfMetaType(instance.getType(), 'ImageType')[0]?.getInitialValues()?.[0]?.value;
      let img = "";
      if ( value === undefined ) {
        return img;
      }
      if ( value.elements != undefined ) {
        img = value.elements[0].initialValue.data;
      } else if ( value.data != undefined ) {
        img = value.data;
      }
      // Retrieve thumbnail image from Instance
      return img;
    }
  }
];

export default conf;
