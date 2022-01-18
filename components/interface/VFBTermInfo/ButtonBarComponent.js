import React from 'react';
import { ChromePicker } from 'react-color';
import Tooltip from '@material-ui/core/Tooltip';
import {
  createMuiTheme,
  MuiThemeProvider
} from "@material-ui/core/styles";

require("./../../../css/ButtonBarComponent.less");

export default class ButtonBarComponent extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      displayColorPicker: false,
      pickerPosition: "220px"
    };

    this.monitorMouseClick = this.monitorMouseClick.bind(this);

    this.colorPickerBtnId = '';
    this.colorPickerActionFn = '';
    this.theme = createMuiTheme({ overrides: { MuiTooltip: { tooltip: { fontSize: "12px" } } } });
    this.colorPickerContainer = undefined;
  }

  monitorMouseClick (e) {
    if ((this.colorPickerContainer !== undefined && this.colorPickerContainer !== null) && !this.colorPickerContainer.contains(e.target) && this.state.displayColorPicker === true) {
      this.setState({ displayColorPicker: false });
    }
  }

  componentDidMount () {
    var that = this;

    document.addEventListener('mousedown', this.monitorMouseClick, false);

    if (that.props.instance != null || that.props.instance != undefined){
      that.props.resize();
    }

    if (this.props.buttonBarConfig.Events != null || this.props.buttonBarConfig.Events != undefined){
      this.props.geppetto.on(GEPPETTO.Events.Visibility_changed, function (instance) {
        if (!$.isEmptyObject(that.props) || that.props != undefined){
          if (instance.getInstancePath() == that.props.instancePath){
            that.forceUpdate();
          } else {
            if ((that.props.instance != null || that.props.instance != undefined)
                  && (instance.getParent() != null || instance.getParent() != undefined)){
              if (that.props.instance.getInstancePath() == instance.getParent().getInstancePath()){
                that.forceUpdate();
              }
            }
          }
        }
      });
      this.props.geppetto.on(GEPPETTO.Events.Select, function (instance) {
        if (!$.isEmptyObject(that.props) || that.props != undefined){
          if (instance.getInstancePath() == that.props.instancePath){
            that.forceUpdate();
          } else {
            if ((that.props.instance != null || that.props.instance != undefined)
                  && (instance.getParent() != null || instance.getParent() != undefined)){
              if (that.props.instance.getInstancePath() == instance.getParent().getInstancePath()){
                that.forceUpdate();
              }
            }
          }
        }
      });
      this.props.geppetto.on(GEPPETTO.Events.Color_set, function (instance) {
        if (that.props != null || that.props != undefined){
          if (instance.instance.getInstancePath() == that.props.instancePath){
            that.forceUpdate();
            if (that.props.instance != null || that.props.instance != undefined){
              that.props.resize();
            }
          }
        }
      });
    }
  }

  componentWillUnmount () {
    this.props = {};
    document.removeEventListener('mousedown', this.monitorMouseClick, false);
  }

  replaceTokensWithPath (inputStr, path) {
    return inputStr.replace(/\$instance\$/gi, path).replace(/\$instances\$/gi, '[' + path + ']');
  }

  getActionString (control, path) {
    var actionStr = '';

    if (control.actions.length > 0) {
      for (var i = 0; i < control.actions.length; i++) {
        actionStr += ((i != 0) ? ";" : "") + this.replaceTokensWithPath(control.actions[i], path);
      }
    }

    return actionStr;
  }

  resolveCondition (control, path, negateCondition) {
    if (negateCondition == undefined) {
      negateCondition = false;
    }

    var resolvedConfig = control;

    if (Object.prototype.hasOwnProperty.call(resolvedConfig, 'condition')) {
      // evaluate condition and reassign control depending on results
      var conditionStr = this.replaceTokensWithPath(control.condition, path);
      if (eval(conditionStr)) {
        resolvedConfig = negateCondition ? resolvedConfig.false : resolvedConfig.true;
      } else {
        resolvedConfig = negateCondition ? resolvedConfig.true : resolvedConfig.false;
      }
    }
    return resolvedConfig;
  }

  refresh () {
    this.forceUpdate();
  }

  render () {
    var showControls = this.props.showControls;
    var config = this.props.buttonBarConfig;
    var path = this.props.instancePath;
    var ctrlButtons = [];

    // retrieve entity/instance
    var entity = undefined;
    try {
      // need to eval because this is a nested path - not simply a global on window
      entity = eval(path)
    } catch (e) {
      throw ( "The instance " + path + " does not exist in the current model" );
    }

    // Add common control buttons to list
    for (var control in config.Common) {
      if ($.inArray(control.toString(), showControls.Common) != -1) {
        var add = true;

        // check show condition
        if (config.Common[control].showCondition != undefined){
          var condition = this.replaceTokensWithPath(config.Common[control].showCondition, path);
          add = eval(condition);
        }

        if (add) {
          ctrlButtons.push(config.Common[control]);
        }
      }
    }

    if (entity != null || entity != undefined){
      if (entity.hasCapability(GEPPETTO.Resources.VISUAL_CAPABILITY)) {
        // Add visual capability controls to list
        for (var control in config.VisualCapability) {
          if ($.inArray(control.toString(), showControls.VisualCapability) != -1) {
            var add = true;

            // check show condition
            if (config.VisualCapability[control].showCondition != undefined){
              var condition = this.replaceTokensWithPath(config.VisualCapability[control].showCondition, path);
              add = eval(condition);
            }

            if (add) {
              ctrlButtons.push(config.VisualCapability[control]);
            }
          }
        }
      }
    }

    var that = this;

    return (
      <div className="buttonBarComponentDiv">
        <MuiThemeProvider theme={this.theme}>
          {ctrlButtons?.map(function (control, id) {
            // grab attributes to init button attributes
            var controlConfig = that.resolveCondition(control, path);
            var idVal = path.replace(/\./g, '_').replace(/\[/g, '_').replace(/\]/g, '_') + "_" + controlConfig.id + "_buttonBar_btn";
            var tooltip = controlConfig.tooltip;
            var classVal = "btn buttonBar-button fa " + controlConfig.icon;
            var styleVal = {};

            // define action function
            var actionFn = function (param) {
              // NOTE: there is a closure on 'control' so it's always the right one
              var controlConfig = that.resolveCondition(control, path);

              // take out action string
              var actionStr = that.getActionString(controlConfig, path);

              if (param != undefined) {
                actionStr = actionStr.replace(/\$param\$/gi, param);
              }

              // run action
              if (actionStr != '' && actionStr != undefined) {
                GEPPETTO.CommandController.execute(actionStr);
                that.refresh();
              }

              // if conditional, swap icon with the other condition outcome
              if (Object.prototype.hasOwnProperty.call(control, 'condition')) {
                var otherConfig = that.resolveCondition(control, path);
                var element = $('#' + idVal);
                element.removeClass();
                element.addClass("btn buttonBar-button fa " + otherConfig.icon);
              }
            };

            // if conditional, swap icon with the other condition outcome
            if (Object.prototype.hasOwnProperty.call(control, 'condition')) {
              var otherConfig = that.resolveCondition(control, path);
              var element = $('#' + idVal);
              element.removeClass();
              element.addClass("btn buttonBar-button fa " + otherConfig.icon);
            }

            // figure out if we need to include the color picker (hook it up in didMount)
            if (controlConfig.id == "color") {
              that.colorPickerBtnId = idVal;
              that.colorPickerActionFn = actionFn;
              // set style val to color tint icon
              if (entity !== undefined) {
                var colorVal = String(entity?.getColor().replace(/0X/i, "#") + "0000")?.slice(0, 7);
                styleVal = { color: colorVal.startsWith('#') ? colorVal : ('#' + colorVal) };
                classVal += " color-picker-button";
              }
            }

            return (
              <span key={id}>
                <Tooltip placement="bottom-start" title={tooltip !== undefined ? tooltip : ""}>
                  <button id={idVal}
                    className={classVal}
                    style={styleVal}
                    onClick={
                      controlConfig.id == "color"
                        ? function (e){
                          that.setState({
                            displayColorPicker: !that.state.displayColorPicker,
                            pickerPosition: e.target.offsetLeft + "px"
                          })
                        }
                        : actionFn
                    }>
                  </button>
                </Tooltip>
                {/* 2 ternary conditions concatenad to check first if the controlconfig.id is color
                  * so we can attach the color picker component to the button, and then the second
                  * to check wether the colorPicker button has been clicked or not and open that.
                */}
                {controlConfig.id === "color"
                  ? (that.state.displayColorPicker === true
                    ? <div
                      className="btnBar-color-picker"
                      ref={ref => that.colorPickerContainer = ref}
                      style={{ left: that.state.pickerPosition }}>
                      <ChromePicker
                        color={ Instances[path].getColor() }
                        onChangeComplete={ (color, event) => {
                          Instances[path].setColor(color.hex);
                          that.setState({ displayColorPicker: true });
                        }}
                        style={{ zIndex: 10 }}/>
                    </div>
                    : undefined)
                  : undefined}
              </span>
            )
          })}
        </MuiThemeProvider>
      </div>
    )
  }
}
