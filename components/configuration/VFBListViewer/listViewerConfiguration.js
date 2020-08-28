import React from 'react';
import ListViewerControlsMenu from '../../interface/VFBListViewer/ListViewerControlsMenu';
import { MultiStatusComponent, GroupComponent, ImageComponent, IconComponent, ColorComponent } from "geppetto-client/js/components/interface/listViewer/ListViewer";
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
    source : entity => { 
      let path = entity.path.split(".")[0];
      return Instances.getInstance(path).getName();
    },
    customHeadingComponent : ({ title }) => <span style={{ color: '#AA0000' }}></span>
  },
  {
    id: "type",
    title: "Type",
    customComponent: component => { 
      // Retrieve instance path
      let path = component.value.get("path").split(".")[0];
      
      // Retrieve the HTML type from the Instance, it's in the form of an HTML element saved as a string
      let html = Instances.getInstance(path)[path + "_meta"].getTypes().map(function (t) {
        return t.type.getInitialValue().value
      })[0].html;
      
      // Extract HTML element anchor from html string
      var matchAnchor = /<a[^>]*>([\s\S]*?)<\/a>/g
        , type = html.match(matchAnchor);
      
      // Extract HTML element anchor from html string
      var matchSpan = /<span[^>]*>([\s\S]*?)<\/span>/g
        , tags = html.match(matchSpan);
      
      // Create new HTML string with the Type name and tags only
      let typeHTML = "<div>" + type.join('') + tags.join('') + "</div>" ;
      
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
      // Retrieve thumbnail image from Instance
      return GEPPETTO.ModelFactory.getAllVariablesOfMetaType(Instances.getInstance(path)[path + "_meta"].getType(), 'ImageType')[0].getInitialValues()[0].value.data
    }
  }
];

export default conf;