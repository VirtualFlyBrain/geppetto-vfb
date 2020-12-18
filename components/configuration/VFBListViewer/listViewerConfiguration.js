import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import ListViewerControlsMenu from '../../interface/VFBListViewer/ListViewerControlsMenu';

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

      let click = value => {
        let instance = Instances.getInstance(value.target.id);
        window.setTermInfo(Instances.getInstance(path)[path + "_meta"], path);
      };
      // Create new HTML string with the Type name and tags only
      let typeHTML = '<a id="' + instance.id + '" style="color:white;text-decoration: none;cursor:pointer">' + instance.getName() + "</a>" ;
      if (instance.isSelected()) {
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

      // Retrieve the HTML type from the Instance, it's in the form of an HTML element saved as a string
      let html = instance.getTypes().map(function (t) {
        return t.type.getInitialValue().value
      })[0].html;

      let htmlLabels = instance.getTypes().map(function (t) {
        return t.label.getInitialValue().value
      })[0].html;

      // Extract HTML element anchor from html string
      var matchAnchor = /<a[^>]*>([\s\S]*?)<\/a>/g
        , type = html.match(matchAnchor);

      // Extract HTML element anchor from html string
      var matchSpan = /<span[^>]*>([\s\S]*?)<\/span>/g
        , tags = htmlLabels.match(matchSpan);

      var matchID = /data-instancepath\=\"([A-Za-z0-9 _]*)\"/
        , classID = type[0].match(matchID)[1];

      var matchText = /<a [^>]+>(.*?)<\/a>/
        , newText = type[0].match(matchText)[1]

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
      
      let value = GEPPETTO.ModelFactory.getAllVariablesOfMetaType(instance.getType(), 'ImageType')[0].getInitialValues()[0].value;
      let img = "";
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
