import React from 'react';
import Menu from "geppetto-client/js/components/interface/menu/Menu";
import { MenuComponent, MultiStatusComponent, GroupComponent, ImageComponent, IconComponent, ColorComponent } from "geppetto-client/js/components/interface/listViewer/ListViewer";
import { SliderPicker } from 'react-color';

const controlsConfiguration = require('./menuConfiguration').default;
const menuHandler = (value, component) => {
  let path = component.value.get("path").split(".")[0];
  let entity = Instances.getInstance(path);
  value.handlerAction(entity);
}
const ControlsMenu = (component) => <Menu configuration={ controlsConfiguration } menuHandler={ (value) => menuHandler(value, component) } />;

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
    }
  },
  {
    id: "type",
    title: "Type",
    customComponent: component => { 
      let ps = component.value.get("path").split(".")[0];
      let html = Instances.getInstance(ps)[ps + "_meta"].getTypes().map(function (t) {
        return t.type.getInitialValue().value
      })[0].html;
      
      // Extract HTML element anchor from html string
      var matchAnchor = /<a[^>]*>([\s\S]*?)<\/a>/g
        , anchor = html.match(matchAnchor);
      
      // Extract HTML element anchor from html string
      var matchSpan = /<span[^>]*>([\s\S]*?)<\/span>/g
          , span = html.match(matchSpan);
      
      let typeHTML = "<div>" + anchor.join('') + span.join('') + "</div>" ;
      
      return <div dangerouslySetInnerHTML={{ __html: typeHTML }} />
    },
    source : entity => entity
  },
  {
    id: "image",
    title: "Thumbnail",
    customComponent: ImageComponent,
    source: entity => { 
      let path = entity.path.split(".")[0];
      return GEPPETTO.ModelFactory.getAllVariablesOfMetaType(Instances.getInstance(path)[path + "_meta"].getType(), 'ImageType')[0].getInitialValues()[0].value.data
    },
    configuration: {
      alt: "Alt for the image",
      title: "Image title",
      action: () => alert('Image') // Action is optional
    }
  }
];

export default conf;