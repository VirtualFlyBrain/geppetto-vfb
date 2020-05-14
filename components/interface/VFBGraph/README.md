# VFB Graph Visualizer

## Controls

- **left-click** on Node : Camera zooms into Node.
- **right-click** on Node : Add ID to scene.
- **shift** + **left-click** on Node : ADD ID to scene.
- **mouse-wheel**: Zoom into canvas.

## Styling Canvas, Nodes and Links

To change the style configuration of the graph component, you can modify the properties in graphConfiguration.js under object 'styling'.

```javascript
var styling = {
  // Background color for canvas
  canvasColor : "black",
  // Color for links between nodes
  linkColor : "white",
  // Color apply to links while hovering over them 
  linkHoverColor : "#11bffe",
  // Color apply to target and source nodes when hovering over a link or a node.
  neighborNodesHoverColor : "orange",
  // Font used for text in nodes
  nodeFont : "5px sans-serif",
  // Color of font in node's text
  nodeFontColor : "black",
  // Node border color
  nodeBorderColor : "black",
  // When hovering over a node, the node's border color changes to create a halo effect
  nodeHoverBoderColor : "red", 
  // Title bar (in node) background color
  nodeTitleBackgroundColor : "#11bffe",
  // Description area (in node) background color
  nodeDescriptionBackgroundColor : "white"
}
```