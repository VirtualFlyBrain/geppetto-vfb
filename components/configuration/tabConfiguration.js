var styled = require('react-tabtab').styled;
let {TabListStyle, ActionButtonStyle, TabStyle, PanelStyle} = styled;
TabListStyle = TabListStyle.extend`
background-color: transparent;
color: #ffffff;
box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
border: 0;
`;
TabStyle = TabStyle.extend`
background-color: transparent;
color: #11bffe;
transition: color .28s ease;
border: 1px solid #11bffe;
${props => props.active && !props.vertical ?
    `
    background-color: #ffffff;
    color: #11bffe;
    border: 2px solid #11bffe;
    `
: null}
&:hover {
    background-color: transparent;
    color: #00a0db;
    border: 2px solid #00a0db;
}
`;
ActionButtonStyle = ActionButtonStyle.extend`
background-color: transparent;
color: #ffffff;
border-radius: 0;
&:hover { background-color: #eee; }
border: 0;
`;
PanelStyle = PanelStyle.extend`
background-color: #009988;
border-left: 1px solid rgba(50,50,50,0.12);
border-right: 1px solid rgba(50,50,50,0.12);
border-bottom: 1px solid rgba(50,50,50,0.12);
padding: 30px 30px;
transition: box-shadow .25s, -webkit-box-shadow .25s;
border-radius: 2px;
`;
// need to follow this object naming
module.exports = {
    TabList: TabListStyle,
    ActionButton: ActionButtonStyle,
    Tab: TabStyle,
    Panel: PanelStyle
};
