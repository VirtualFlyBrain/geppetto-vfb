var Bloodhound = require("typeahead.js/dist/bloodhound.min.js");

var spotlightConfig = {
  "SpotlightBar": {
    "DataSources": {},
    "CompositeType": {
      "type": {
        "actions": [
          "window.setTermInfo($variableid$['$variableid$' + '_meta'],'$variableid$');$(\"#spotlight\").hide();",
        ],
        "icon": "fa-info-circle",
        "label": "Show info",
        "tooltip": "Show info"
      },
      "query": {
        actions: [
          "window.fetchVariableThenRun('$variableid$', window.addToQueryCallback);"
        ],
        icon: "fa-quora",
        label: "Add to query",
        tooltip: "Add to query"
      },
    },
    "VisualCapability": {
      "buttonOne": {
        "condition": "GEPPETTO.SceneController.isSelected($instances$)",
        "false": {
          "actions": ["GEPPETTO.SceneController.select($instances$)"],
          "icon": "fa-hand-stop-o",
          "label": "Unselected",
          "tooltip": "Select"
        },
        "true": {
          "actions": ["GEPPETTO.SceneController.deselect($instances$)"],
          "icon": "fa-hand-rock-o",
          "label": "Selected",
          "tooltip": "Deselect"
        },
      },
      "buttonTwo": {
        "condition": "GEPPETTO.SceneController.isVisible($instances$)",
        "false": {
          "actions": [
            "GEPPETTO.SceneController.show($instances$)"
          ],
          "icon": "fa-eye-slash",
          "label": "Hidden",
          "tooltip": "Show"
        },
        "true": {
          "actions": [
            "GEPPETTO.SceneController.hide($instances$)"
          ],
          "icon": "fa-eye",
          "label": "Visible",
          "tooltip": "Hide"
        }

      },
      "buttonThree": {
        "actions": [
          "GEPPETTO.SceneController.zoomTo($instances$);$(\"#spotlight\").hide();"
        ],
        "icon": "fa-search-plus",
        "label": "Zoom",
        "tooltip": "Zoom"
      },
    }
  }
};

var spotlightDataSourceConfig = {
  VFB: {
    url: "https://solr.virtualflybrain.org/solr/ontology/select?fl=short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation&start=0&fq=ontology_name:(vfb)&rows=100&bq=is_obsolete:false%5E100.0%20shortform_autosuggest:VFB*%5E110.0%20shortform_autosuggest:FBbt*%5E100.0%20is_defining_ontology:true%5E100.0%20label_s:%22%22%5E2%20synonym_s:%22%22%20in_subset_annotation:BRAINNAME%5E3%20short_form:FBbt_00003982%5E2&q=$SEARCH_TERM$%20OR%20$SEARCH_TERM$*%20OR%20*$SEARCH_TERM$*&defType=edismax&qf=label%20synonym%20label_autosuggest_ws%20label_autosuggest_e%20label_autosuggest%20synonym_autosuggest_ws%20synonym_autosuggest_e%20synonym_autosuggest%20shortform_autosuggest%20has_narrow_synonym_annotation%20has_broad_synonym_annotation&wt=json&indent=true", 
    crossDomain: true,
    id: "short_form",
    label: { field: "label", formatting: "$VALUE$" },
    explode_fields: [{ field: "short_form", formatting: "$VALUE$ ($LABEL$)" }],
    explode_arrays: [{ field: "synonym", formatting: "$VALUE$ ($LABEL$)" }],
    type: {
      property: {
        icon: "fa-file-text-o",
        buttons: {
          buttonOne: {
            actions: ["window.addVfbId('$ID$');"],
            icon: "fa-info-circle",
            label: "Show info",
            tooltip: "Show info"
          }
        }
      },
      class: {
        icon: "fa-file-text-o",
        buttons: {
          buttonOne: {
            actions: ["window.addVfbId('$ID$');$(\"#spotlight\").hide();"],
            icon: "fa-info-circle",
            label: "Show info",
            tooltip: "Show info"
          },
          buttonTwo: {
            actions: ["window.fetchVariableThenRun('$ID$', window.addToQueryCallback, '$LABEL$');"],
            icon: "fa-quora",
            label: "Add to query",
            tooltip: "Add to query"
          }
        }
      },
      individual: {
        icon: "fa-file-image-o",
        buttons: {
          buttonOne: {
            actions: ["window.addVfbId('$ID$');$(\"#spotlight\").hide();"],
            icon: "fa-file-image-o",
            label: "Add to scene",
            tooltip: "Add to scene"
          },
          buttonTwo: {
            actions: ["window.fetchVariableThenRun('$ID$', window.addToQueryCallback, '$LABEL$');"],
            icon: "fa-quora",
            label: "Add to query",
            tooltip: "Add to query"
          }
        }
      }
    },
    bloodhoundConfig: {
      datumTokenizer: function (d) {
        return Bloodhound.tokenizers.nonword(d.label.replace('_', ' '));
      },
      queryTokenizer: function (q) {
        return Bloodhound.tokenizers.nonword(q.replace('_', ' '));
      },
      sorter: function (a, b) {
        var InputString = $('#typeahead').val();
        // move exact matches to top
        if (InputString == a.label) {
          return -1;
        }
        if (InputString == b.label) {
          return 1;
        }
        // close match without case matching
        if (InputString.toLowerCase() == a.label.toLowerCase()) {
          return -1;
        }
        if (InputString.toLowerCase() == b.label.toLowerCase()) {
          return 1;
        }
        // match ignoring joinging nonwords
        Bloodhound.tokenizers.nonword("test thing-here12 34f").join(' ');
        if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ')) {
          return -1;
        }
        if (Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ') == Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ')) {
          return 1;
        }
        // match against id
        if (InputString.toLowerCase() == a.id.toLowerCase()) {
          return -1;
        }
        if (InputString.toLowerCase() == b.id.toLowerCase()) {
          return 1;
        }
        // pick up any match without nonword join character match
        if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
          return 1;
        }
        if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ')) > -1) {
          return -1;
        }
        // also with underscores ignored
        if (Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
          return 1;
        }
        if (Bloodhound.tokenizers.nonword(b.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) < 0 && Bloodhound.tokenizers.nonword(a.label.toLowerCase()).join(' ').replace('_', ' ').indexOf(Bloodhound.tokenizers.nonword(InputString.toLowerCase()).join(' ').replace('_', ' ')) > -1) {
          return -1;
        }
        // if not found in one then advance the other
        if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
          return 1;
        }
        if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) < 0 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1) {
          return -1;
        }
        // if the match is closer to start than the other move up
        if (a.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.label.toLowerCase().indexOf(InputString.toLowerCase()) < b.label.toLowerCase().indexOf(InputString.toLowerCase())) {
          return -1;
        }
        if (b.label.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.label.toLowerCase().indexOf(InputString.toLowerCase()) < a.label.toLowerCase().indexOf(InputString.toLowerCase())) {
          return 1;
        }
        // if the match in the id is closer to start then move up
        if (a.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && a.id.toLowerCase().indexOf(InputString.toLowerCase()) < b.id.toLowerCase().indexOf(InputString.toLowerCase())) {
          return -1;
        }
        if (b.id.toLowerCase().indexOf(InputString.toLowerCase()) > -1 && b.id.toLowerCase().indexOf(InputString.toLowerCase()) < a.id.toLowerCase().indexOf(InputString.toLowerCase())) {
          return 1;
        }
        // move the shorter synonyms to the top
        if (a.label < b.label) {
          return -1;
        } else if (a.label > b.label) {
          return 1;
        } else {
          return 0;
        } // if nothing found then do nothing.
      }
    }
  }
};

module.exports = {
  spotlightConfig,
  spotlightDataSourceConfig
};
