import React from 'react';
import ListViewerControlsMenu from '../../interface/VFBListViewer/ListViewerControlsMenu';
import { MultiStatusComponent, GroupComponent, ImageComponent, IconComponent, ColorComponent } from "@geppettoengine/geppetto-ui/list-viewer/ListViewer";
import Tooltip from '@material-ui/core/Tooltip';

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
      
      let click = (value) => {
    	let instance = Instances.getInstance(value.target.id);
        window.setTermInfo(Instances.getInstance(path)[path + "_meta"], path);
      };
      // Create new HTML string with the Type name and tags only
      let typeHTML = '<a id="' + instance.id + '" style="color:white;text-decoration: none;">' + instance.getName() + "</a>" ;
        
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
      
      // Extract HTML element anchor from html string
      var matchAnchor = /<a[^>]*>([\s\S]*?)<\/a>/g
        , type = html.match(matchAnchor);
      
      // Extract HTML element anchor from html string
      var matchSpan = /<span[^>]*>([\s\S]*?)<\/span>/g
        , tags = html.match(matchSpan);
      
      // Make anchor open in new tab, and fix path by adding 'geppetto?' to href
      let textContent = type.join().replace('href="?', 'target="_blank" href="geppetto?');
      // Create new HTML string with the Type name and tags only
      let typeHTML = "<div>" + textContent + tags.join('') + "</div>" ;
      
      // Set HTML string inside div ready for React
      return <div dangerouslySetInnerHTML={{ __html: typeHTML }} />
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