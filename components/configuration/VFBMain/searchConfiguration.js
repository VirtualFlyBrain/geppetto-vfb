var searchStyle = {
  inputWrapper: {
    "position": "absolute",
    "height": "100%",
    "width": "100%",
    "top": "10%"
  },
  searchText: {
    "width": "100vh",
    "zIndex": "6",
    "fontSize": "22px",
    "color": "black",
    "backgroundColor": "white",
    "padding": "7px 20px 7px 20px",
    "border": "3px solid #11bffe",
  },
  filterIcon: {
    "right": "25px",
    "bottom": "15px",
    "zIndex": "6",
    "cursor": "pointer",
    "fontSize": "25px",
    "position": "absolute",
    "color": "black",
  },
  closeIcon: {
    "position": "relative",
    "color": "#11bffe",
    "bottom": "50px",
    "right": "14px",
    "fontWeight": "bold",
    "fontSize": "20px",
    "cursor": "pointer",
  },
  paperResults: {
    "left": "14%",
    "height": "50%",
    "width": "70%",
    "position": "absolute",
    "textAlign": "center",
    "backgroundColor": "#333333",
    "padding": "12px 20px 12px 20px",
    "overflow": "scroll",
    "zIndex": "5",
  },
  paperFilters: {
    "minHeight": "280px",
    "minWidth": "240px",
    "position": "absolute",
    "backgroundColor": "#141313",
    "color": "white",
    "overflow": "scroll",
    "zIndex": "6",
    "border": "3px solid #11bffe",
    "fontFamily": "Barlow, Khand, sans-serif",
    "fontSize": "16px",
    "top": "58px",
    "right": "0px",
  },
  singleResult: {
    "color": "white",
    "fontSize": "18px",
    "whiteSpace" : "normal",
    ":hover": {
      "color": "#11bffe",
      "background-color": "#252323",
    },
  },
  main: {
    "position": "absolute",
    "top": "0px",
    "left": "0px",
    "width": "100%",
    "height": "100%",
    "margin": "0",
    "padding": "0",
    "zIndex": "3",
    "backgroundColor": "rgba(51, 51, 51, 0.7)",
    "textAlign": "center",
    "display": "flex",
    "alignItems": "center",
    "justifyContent": "center",
  }
};

var datasourceConfiguration = {
  "url": "https://solr.virtualflybrain.org/solr/ontology/select",
  "query_settings":
    {
      "q": "$SEARCH_TERM$",
      "q.op": "OR",
      "defType": "edismax",
      "mm": "45%",
      "qf": "label^110 synonym^100 label_autosuggest synonym_autosuggest shortform_autosuggest",
      "indent": "true",
      "fl": "short_form,label,synonym,id,facets_annotation,unique_facets",
      "start": "0",
      "pf": "label^250 synonym^120",
      "ps": "0",
      "fq": [
        "(short_form:VFB* OR short_form:FB* OR facets_annotation:DataSet OR facets_annotation:pub) AND NOT short_form:VFBc_*",
        "NOT facets_annotation:Deprecated"
      ],
      "rows": "500",
      "wt": "json",
      "bq": "short_form:VFBexp*^10.0 short_form:VFB*^50.0 facets_annotation:Class^200.0 short_form:FBbt*^150.0 short_form:FBbt_00003982^2 facets_annotation:Deprecated^0.001 facets_annotation:DataSet^500.0 facets_annotation:pub^100.0",
    }
};

var searchConfiguration = {
  "resultsMapping":
    {
      "name": "label",
      "id": "short_form",
      "labels" : "unique_facets"
    },
  /*
   * The SOLR label field can carry a stray backslash-escaping of a quote or
   * apostrophe from over-escaped source data (e.g. "y5B\'2a" for a label whose
   * real value is "y5B'2a"). Strip a backslash that precedes a quote/apostrophe
   * so search results display the clean label. Never legitimate in a label, so
   * this is safe and idempotent.
   */
  "label_manipulation" : label => (typeof label === 'string' ? label.replace(/\\(['"])/g, '$1') : label),
  "filters_expanded": true,
  "filter_positive" : "^100",
  "filter_negative" : "^0.001",
  "filters": [
    {
      "key": "facets_annotation",
      "filter_name": "Filters",
      "type": "array",
      "enabled": "disabled",
      "disableGlobal": true,
      "values": [
        {
          "key": "Adult",
          "filter_name": "Adult",
          "enabled": "disabled",
        },
        {
          "key": "Larva",
          "filter_name": "Larva",
          "enabled": "disabled",
        },
        {
          "key": "Nervous_system",
          "filter_name": "Nervous System",
          "enabled": "disabled",
        },
        {
          "key": "Anatomy",
          "filter_name": "Anatomy",
          "enabled": "disabled",
        },
        {
          "key": "Neuron",
          "filter_name": "Neuron",
          "enabled": "disabled",
        },
        {
          "key": "Class",
          "filter_name": "Type",
          "enabled": "disabled",
        },
        {
          "key": "has_image",
          "filter_name": "Image",
          "enabled": "disabled",
        },
        {
          "key": "Split",
          "filter_name": "Split Expression",
          "enabled": "disabled",
        },
        {
          "key": "Expression_pattern",
          "filter_name": "Expression Pattern",
          "enabled": "disabled",
        },
        {
          "key": "Expression_pattern_fragment",
          "filter_name": "Expression Pattern Fragment",
          "enabled": "disabled",
        },
        {
          "key": "has_neuron_connectivity",
          "filter_name": "Neuron with Connectivity",
          "enabled": "disabled",
        },
        {
          "key": "NBLAST",
          "filter_name": "Neuron Similarity (NBLAST)",
          "enabled": "disabled",
        },
        {
          "key": "NBLASTexp",
          "filter_name": "Expression Similarity (NBLAST)",
          "enabled": "disabled",
        },
        {
          "key": "Synaptic_neuropil_domain",
          "filter_name": "Synaptic Neuropil",
          "enabled": "disabled",
        },
        {
          "key": "hasScRNAseq",
          "filter_name": "Has scRNAseq data",
          "enabled": "disabled",
        },
        {
          "key": "DataSet",
          "filter_name": "Dataset",
          "enabled": "disabled",
        },
        {
          "key": "Deprecated",
          "filter_name": "Deprecated",
          "enabled": "negative",
        }
      ]
    },
  ],
  "sorter": function (a, b) {
    // Normalize user input so ranking comparisons stay aligned with query tokenization
    var InputString = (window.spotlightString || "").trim();
    if (a.label == undefined) {
      return 1;
    }
    if (b.label == undefined) {
      return -1;
    }

    // Helper functions
    var aIsClass = a.id.indexOf("FBbt") > -1 || a.id.indexOf("FBgn") > -1;
    var bIsClass = b.id.indexOf("FBbt") > -1 || b.id.indexOf("FBgn") > -1;
    var aIsIndividual = a.id.indexOf("VFB_") > -1;
    var bIsIndividual = b.id.indexOf("VFB_") > -1;

    // Extract short form (part before parenthesis)
    var aShortForm = a.label.split(' (')[0];
    var bShortForm = b.label.split(' (')[0];
    var aShortFormLC = aShortForm.toLowerCase();
    var bShortFormLC = bShortForm.toLowerCase();
    var InputStringLC = InputString.toLowerCase();

    /*
     * Exact label match wins outright — decided BEFORE the "official symbol"
     * occurrence-count heuristic below. Compare against the label's MAIN part
     * (before the " (short_form)" that refineResults appends). Without this, a
     * longer subtype whose label AND synonyms both contain the term (count>=2)
     * outranks the exact match (count 1 when the term is not also a synonym):
     * e.g. searching "neuron" must rank "neuron" above "gnathal ganglion neuron".
     */
    var aExactLabelLC = InputStringLC === aShortFormLC;
    var bExactLabelLC = InputStringLC === bShortFormLC;
    if (aExactLabelLC && !bExactLabelLC) {
      return -1;
    }
    if (bExactLabelLC && !aExactLabelLC) {
      return 1;
    }
    if (aExactLabelLC && bExactLabelLC) {
      /* both exact: prefer class terms unless the search specifies a type */
      var xVFB = InputString.indexOf("VFB") === 0;
      var xFBbt = InputString.indexOf("FBbt") === 0;
      var xFBgn = InputString.indexOf("FBgn") === 0;
      if (!xVFB && !xFBbt && !xFBgn) {
        if (aIsClass && !bIsClass) {
          return -1;
        }
        if (bIsClass && !aIsClass) {
          return 1;
        }
      }
    }

    /*
     * Detect official symbol matches vs synonym matches
     * Official symbol: search term appears multiple times (label + synonyms)
     * Alias/Synonym: search term appears only once or only in synonyms
     * Rationale: Terms appearing in both label and synonyms are more likely official
     */
    var countTermOccurrences = function (item) {
      var count = 0;
      if (!item.label) {
        return 0;
      }

      var labelLC = item.label.toLowerCase();

      /*
       * After refineResults, label format is:
       * - "synonym (original_label)" for synonym matches
       * - "label (short_form)" for original records
       * Count occurrences in both the main part and parenthetical part
       */

      /*
       * Extract parts from refined label
       */
      var parenIndex = labelLC.indexOf(' (');
      var mainPart = parenIndex > -1 ? labelLC.substring(0, parenIndex) : labelLC;
      var parenPart = parenIndex > -1 ? labelLC.substring(parenIndex + 2, labelLC.length - 1) : '';

      /*
       * Check main part of label
       */
      if (mainPart.indexOf(InputStringLC) > -1) {
        count += 1;
      }

      /*
       * Check parenthetical part of label
       */
      if (parenPart && parenPart.indexOf(InputStringLC) > -1) {
        count += 1;
      }

      /*
       * Also check synonyms field if it exists (for backward compatibility)
       */
      if (item.synonym) {
        var syns = Array.isArray(item.synonym) ? item.synonym : [item.synonym];
        syns.forEach(function (syn) {
          if (syn && syn.toLowerCase().indexOf(InputStringLC) > -1) {
            count += 1;
          }
        });
      }

      return count;
    };
    var aTermCount = countTermOccurrences(a);
    var bTermCount = countTermOccurrences(b);
    var aIsOfficialSymbol = aTermCount >= 2;
    var bIsOfficialSymbol = bTermCount >= 2;
    var aIsSymbolCaseInsensitive = aTermCount >= 2;
    var bIsSymbolCaseInsensitive = bTermCount >= 2;
    var aIsSynonymMatch = aShortForm === InputString && !aIsOfficialSymbol;
    var bIsSynonymMatch = bShortForm === InputString && !bIsOfficialSymbol;

    /*
     * Helper function to find synonym position in list
     * Earlier position = more important/commonly used name
     */
    var getSynonymIndex = function (synonymField) {
      if (!synonymField) {
        return -1;
      }
      var syns = Array.isArray(synonymField) ? synonymField : (typeof synonymField === 'string' ? synonymField.split(';').map(s => s.trim()) : []);
      for (var i = 0; i < syns.length; i++) {
        if (syns[i].toLowerCase() === InputStringLC) {
          return i;
        }
      }
      return -1;
    };
    var aSynonymIndex = getSynonymIndex(a.synonym);
    var bSynonymIndex = getSynonymIndex(b.synonym);

    /* Synonym position ordering: earlier in list = more important */
    if ((aSynonymIndex >= 0 || bSynonymIndex >= 0) && aSynonymIndex !== bSynonymIndex) {
      if (aSynonymIndex >= 0 && bSynonymIndex < 0) {
        return -1;
      }
      if (bSynonymIndex >= 0 && aSynonymIndex < 0) {
        return 1;
      }
      if (aSynonymIndex >= 0 && bSynonymIndex >= 0 && aSynonymIndex !== bSynonymIndex) {
        return aSynonymIndex - bSynonymIndex;
      }
    }

    /* Priority 0: Official symbol match (short_form field match) */
    if (aIsOfficialSymbol || bIsOfficialSymbol) {
      if (aIsOfficialSymbol && !bIsOfficialSymbol) {
        return -1;
      }
      if (bIsOfficialSymbol && !aIsOfficialSymbol) {
        return 1;
      }
      /* Both are official symbols - prefer class terms if search doesn't specify a type */
      if (aIsOfficialSymbol && bIsOfficialSymbol) {
        var searchIsVFB = InputString.indexOf("VFB") === 0;
        var searchIsFBbt = InputString.indexOf("FBbt") === 0;
        var searchIsFBgn = InputString.indexOf("FBgn") === 0;
        if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
          if (aIsClass && !bIsClass) {
            return -1;
          }
          if (bIsClass && !aIsClass) {
            return 1;
          }
        }
      }
    }

    /* Case-insensitive official symbol match */
    if (aIsSymbolCaseInsensitive || bIsSymbolCaseInsensitive) {
      if (aIsSymbolCaseInsensitive && !bIsSymbolCaseInsensitive) {
        return -1;
      }
      if (bIsSymbolCaseInsensitive && !aIsSymbolCaseInsensitive) {
        return 1;
      }
    }

    /* Priority 1: Exact short form match */
    var aExactShort = InputString === aShortForm;
    var bExactShort = InputString === bShortForm;
    if (aExactShort || bExactShort) {
      if (aExactShort && !bExactShort) {
        /* Only a matches exactly - prefer a. If both match exactly in short form, prefer FBbt over VFB */
        return -1;
      }
      if (bExactShort && !aExactShort) {
        return 1;
      }
      /* Both match exactly - only prefer classes if search doesn't specify a type */
      if (aExactShort && bExactShort) {
        var searchIsVFB = InputString.indexOf("VFB") === 0;
        var searchIsFBbt = InputString.indexOf("FBbt") === 0;
        var searchIsFBgn = InputString.indexOf("FBgn") === 0;
        if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
          if (aIsClass && !bIsClass) {
            return -1;
          }
          if (bIsClass && !aIsClass) {
            return 1;
          }
        }
      }
    }

    /* Priority 2: Case-insensitive short form match */
    var aCaseInsensitiveShort = InputStringLC === aShortFormLC;
    var bCaseInsensitiveShort = InputStringLC === bShortFormLC;
    if (aCaseInsensitiveShort || bCaseInsensitiveShort) {
      if (aCaseInsensitiveShort && !bCaseInsensitiveShort) {
        return -1;
      }
      if (bCaseInsensitiveShort && !aCaseInsensitiveShort) {
        return 1;
      }
      /* Both match - only prefer classes if search doesn't specify a type */
      if (aCaseInsensitiveShort && bCaseInsensitiveShort) {
        var searchIsVFB = InputString.indexOf("VFB") === 0;
        var searchIsFBbt = InputString.indexOf("FBbt") === 0;
        var searchIsFBgn = InputString.indexOf("FBgn") === 0;
        if (!searchIsVFB && !searchIsFBbt && !searchIsFBgn) {
          if (aIsClass && !bIsClass) {
            return -1;
          }
          if (bIsClass && !aIsClass) {
            return 1;
          }
        }
      }
    }

    // move exact label matches to top
    if (InputString == a.label) {
      return -1;
    }
    if (InputString == b.label) {
      return 1;
    }
    // close match without case matching
    if (InputStringLC == a.label.toLowerCase()) {
      return -1;
    }
    if (InputStringLC == b.label.toLowerCase()) {
      return 1;
    }
    // match ignoring joinging nonwords
    if (InputString.toLowerCase().split(/\W+/).join(' ') == a.label.toLowerCase().split(/\W+/).join(' ')) {
      return -1;
    }
    if (InputString.toLowerCase().split(/\W+/).join(' ') == b.label.toLowerCase().split(/\W+/).join(' ')) {
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
    if (a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1 && (a.label.split(' (')[0].length < b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0)) {
      return -1;
    }
    if (b.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) > -1 && (a.label.split(' (')[0].length > b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ')) < 0)) {
      return 1;
    }
    // also with underscores ignored
    if ((a.label.split(' (')[0].length < b.label.split(' (')[0].length || b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0) && a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return -1;
    }
    if ((a.label.split(' (')[0].length > b.label.split(' (')[0].length || a.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) < 0) && b.label.toLowerCase().split(/\W+/).join(' ').replace('_', ' ').indexOf(InputString.toLowerCase().split(/\W+/).join(' ').replace('_', ' ')) > -1) {
      return 1;
    }
    // find all matching spaced words
    if (InputString.toLowerCase().indexOf(' ') > -1) {
      var lcInputStingFac = InputString.toLowerCase().split(' ');
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var cA = compare(lcInputStingFac, a.label.toLowerCase().split(' '));
      var cB = compare(lcInputStingFac, b.label.toLowerCase().split(' '));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
    }
    // find all tokenised word matches
    if (InputString.split(/\W+/).length > 1) {
      var lcInputStingFac = InputString.toLowerCase().split(/\W+/);
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var cA = compare(lcInputStingFac, a.label.toLowerCase().split(/\W+/));
      var cB = compare(lcInputStingFac, b.label.toLowerCase().split(/\W+/));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
    }
    // prioritise matches in the primary label
    if (InputString.split(/\W+/).length > 1) {
      var lcInputStingFac = InputString.toLowerCase().split(/\W+/);
      var compare = (a1, a2) => a1.filter(v => a2.includes(v)).length;
      var aLabel = a.label.split(' (');
      var aEnd = aLabel.pop(aLabel.length);
      aLabel = aLabel.join(' (');
      var bLabel = b.label.split(' (');
      var bEnd = bLabel.pop(bLabel.length);
      bLabel = bLabel.join(' (');
      var cA = compare(lcInputStingFac, aLabel.toLowerCase().split(/\W+/));
      var cB = compare(lcInputStingFac, bLabel.toLowerCase().split(/\W+/));
      if (cA > 0 || cB > 0) {
        if (cA > cB) {
          return -1;
        }
        if (cA < cB) {
          return 1;
        }
      }
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
    // prioritise class terms (FBbt_) over individual terms (VFB_)
    var aIsClass = a.id.indexOf("FBbt") > -1;
    var bIsClass = b.id.indexOf("FBbt") > -1;
    if (aIsClass && !bIsClass) {
      return -1;
    }
    if (bIsClass && !aIsClass) {
      return 1;
    }
    // move up expression (VFBexp) terms
    if (a.id.indexOf("VFBexp") > -1 && b.id.indexOf("VFBexp") < 0) {
      return -1;
    }
    if (b.id.indexOf("VFBexp") > -1 && a.id.indexOf("VFBexp") < 0) {
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
  },
  "clickHandler": function (id) {
    window.addVfbId(id);
  },
  "Neo4jLabels" : {
    "FAFB" : "FAFB",
    "L1EM" : "L1EM",
    "FlyEM_HB" : "FlyEM_HB"
  }
};

module.exports = {
  searchStyle,
  searchConfiguration,
  datasourceConfiguration
};
