import React from 'react';
import { GroupComponent, IconComponent, ColorComponent } from "geppetto-client/js/components/interface/listViewer/ListViewer";
import { SliderPicker } from 'react-color';
``
const conf = [
  {
    id: "controls",
    title: "Controls",
    customComponent: GroupComponent,
    configuration: [
      {
        id: "info",
        customComponent: IconComponent,
        configuration: {
          action: "clickShowInfo",
          icon: "fa-info-circle",
          label: "Info",
          tooltip: "Info",
        },
      },
      {
        id: "select",
        customComponent: IconComponent,
        configuration: {
          action: "clickShowInfo",
          icon: "fa-tint",
          label: "Select",
          tooltip: "Plot time series"          
        },
      },
      {
        id: "color",
        customComponent: IconComponent,
        configuration: {
          action: "clickShowInfo",
          icon: "fa-tint",
          label: "Color",
          tooltip: "Color"
        },
      },
      {
        id: "zoom",
        customComponent: IconComponent,
        configuration: {
          icon: "fa-search-plus",
          action: "clickShowInfo",
          label: "Zoom",
          tooltip: "Zoom",
        }
      }
    ]
  },
  {
    id: "name",
    title: "Name",
    source : "name"
  },
  {
    id: "type",
    title: "Type",
    source: "type"
  },
  {
    id: "thumbnail",
    title: "Thumbnails",
    source: 'thumbnail',
  }
];

export default conf;