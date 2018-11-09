var controlPanelColMeta = [
    {
        "columnName": "path",
        "order": 1,
        "locked": false,
        "displayName": "Path",
        "source": "$entity$.getPath()"
    },
    {
        "columnName": "name",
        "order": 2,
        "locked": false,
        "customComponent": GEPPETTO.LinkComponent,
        "displayName": "Name",
        "source": "$entity$.getName()",
        "actions": "window.addVfbId('$entity$');"
    },
    {
        "columnName": "type",
        "order": 3,
        "locked": false,
        "customComponent": GEPPETTO.LinkArrayComponent,
        "displayName": "Type",
        "source": "$entity$.$entity$_meta.getTypes().map(function (t) {return t.type.getInitialValue().value})",
        "actions": "window.addVfbId('$entity$');",
    },
    {
        "columnName": "controls",
        "order": 4,
        "locked": false,
        "customComponent": GEPPETTO.ControlsComponent,
        "displayName": "Controls",
        "cssClassName": "controlpanel-controls-column",
        "source": "",
        "actions": "GEPPETTO.ControlPanel.refresh();"
    },
    {
        "columnName": "image",
        "order": 5,
        "locked": false,
        "customComponent": GEPPETTO.ImageComponent,
        "displayName": "Image",
        "cssClassName": "img-column",
        "source": "GEPPETTO.ModelFactory.getAllVariablesOfMetaType($entity$.$entity$_meta.getType(), 'ImageType')[0].getInitialValues()[0].value.data"
    }
];

var controlPanelConfig = {
    "VisualCapability": {
        "select": {
            "id": "select",
            "condition": "GEPPETTO.SceneController.isSelected($instance$.$instance$_obj != undefined ? [$instance$.$instance$_obj] : []) ||  GEPPETTO.SceneController.isSelected($instance$.$instance$_swc != undefined ? [$instance$.$instance$_swc] : [])",
            "false": {
                "actions": ["$instance$.select()"],
                "icon": "fa-hand-stop-o",
                "label": "Unselected",
                "tooltip": "Select",
                "id": "select",
            },
            "true": {
                "actions": ["$instance$.deselect()"],
                "icon": "fa-hand-rock-o",
                "label": "Selected",
                "tooltip": "Deselect",
                "id": "deselect",
            }
        },
        "color": {
            "id": "color",
            "actions": ["$instance$.setColor('$param$');"],
            "icon": "fa-tint",
            "label": "Color",
            "tooltip": "Color"
        },
        "zoom": {
            "id": "zoom",
            "actions": ["GEPPETTO.SceneController.zoomTo($instances$)"],
            "icon": "fa-search-plus",
            "label": "Zoom",
            "tooltip": "Zoom"
        },
        "visibility_obj": {
            "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_obj')",
            "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_obj != undefined && $instance$.getType().$instance$_obj.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_obj != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_obj]); } return visible; })()",
            "false": {
                "id": "visibility_obj",
                "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_obj'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                "icon": "gpt-shapehide",
                "label": "Hidden",
                "tooltip": "Show 3D Volume"
            },
            "true": {
                "id": "visibility_obj",
                "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_obj])"],
                "icon": "gpt-shapeshow",
                "label": "Visible",
                "tooltip": "Hide 3D Volume"
            }
        },
        "visibility_swc": {
            "showCondition": "$instance$.getType().hasVariable($instance$.getId() + '_swc')",
            "condition": "(function() { var visible = false; if ($instance$.getType().$instance$_swc != undefined && $instance$.getType().$instance$_swc.getType().getMetaType() != GEPPETTO.Resources.IMPORT_TYPE && $instance$.$instance$_swc != undefined) { visible = GEPPETTO.SceneController.isVisible([$instance$.$instance$_swc]); } return visible; })()",
            "false": {
                "id": "visibility_swc",
                "actions": ["(function(){var instance = Instances.getInstance('$instance$.$instance$_swc'); if (instance.getType().getMetaType() == GEPPETTO.Resources.IMPORT_TYPE) { var col = instance.getParent().getColor(); instance.getType().resolve(function() { instance.setColor(col); GEPPETTO.trigger('experiment:visibility_changed', instance); GEPPETTO.ControlPanel.refresh(); }); } else { GEPPETTO.SceneController.show([instance]); }})()"],
                "icon": "gpt-3dhide",
                "label": "Hidden",
                "tooltip": "Show 3D Skeleton"
            },
            "true": {
                "id": "visibility_swc",
                "actions": ["GEPPETTO.SceneController.hide([$instance$.$instance$_swc])"],
                "icon": "gpt-3dshow",
                "label": "Visible",
                "tooltip": "Hide 3D Skeleton"
            }
        },
    },
    "Common": {
        "info": {
            "id": "info",
            "actions": ["var displayTxt = '$instance$'.split('.')['$instance$'.split('.').length - 1]; setTermInfo($instance$[displayTxt + '_meta'], displayTxt);"],
            "icon": "fa-info-circle",
            "label": "Info",
            "tooltip": "Info"
        },
        "delete": {
            "showCondition": "$instance$.getId()!=window.templateID",
            "id": "delete",
            "actions": ["if($instance$.parent != null){$instance$.parent.deselect();$instance$.parent.delete();}else{$instance$.deselect();$instance$.delete();};setTermInfo(window[window.templateID][window.templateID+'_meta'], window[window.templateID][window.templateID+'_meta'].getParent().getId());"],
            "icon": "fa-trash-o",
            "label": "Delete",
            "tooltip": "Delete"
        }
    }
};

var controlPanelControlConfigs = {
    "Common": ['info', 'delete'],
    "VisualCapability": ['select', 'color', 'visibility', 'zoom', 'visibility_obj', 'visibility_swc']
};

var controlPanelColumns = ['name', 'type', 'controls', 'image'];

module.exports = {
    controlPanelColMeta,
    controlPanelConfig,
    controlPanelControlConfigs,
    controlPanelColumns
};