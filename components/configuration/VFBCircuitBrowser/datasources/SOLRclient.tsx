import axios from 'axios';

const globalConfiguration:any = {
    "url": "https://solr.virtualflybrain.org/solr/ontology/select",
    "query_settings":
    {
        "q": "$SEARCH_TERM$ OR $SEARCH_TERM$* OR *$SEARCH_TERM$*",
        "defType": "edismax",
        "qf": "label synonym label_autosuggest_ws label_autosuggest_e label_autosuggest synonym_autosuggest_ws synonym_autosuggest_e synonym_autosuggest shortform_autosuggest has_narrow_synonym_annotation has_broad_synonym_annotation",
        "indent": "true",
        "fl": "short_form,label,synonym,id,type,has_narrow_synonym_annotation,has_broad_synonym_annotation,facets_annotation",
        "start": "0",
        "fq": [
            "type:class OR type:individual OR type:property",
            "ontology_name:(vfb)",
            "facets_annotation:has_neuron_connectivity",
            "shortform_autosuggest:VFB* OR shortform_autosuggest:FB* OR is_defining_ontology:true"
        ],
        "rows": "100",
        "wt": "json",
        "bq": "is_obsolete:false^100.0 shortform_autosuggest:VFB*^110.0 shortform_autosuggest:FBbt*^100.0 is_defining_ontology:true^100.0 label_s:\"\"^2 synonym_s:\"\" in_subset_annotation:BRAINNAME^3 short_form:FBbt_00003982^2"
    }
};

let solrConfiguration:any = {
    params: {
        json: {
          params: globalConfiguration.query_settings
        }
    }
}

export function getResultsSOLR ( searchString: string, returnResults: Function, sorter: Function, configuration?: any) {
    var url:string = configuration.url;

    if (configuration.url === undefined) {
        url = globalConfiguration.url;
    }
    if (configuration.query_settings !== undefined) {
        solrConfiguration.params.json.params = configuration.query_settings;
    }

    // hack to clone the object
    let tempConfig:any = JSON.parse(JSON.stringify(solrConfiguration));
    tempConfig.params.json.params.q = solrConfiguration.params.json.params.q.replace(/\$SEARCH_TERM\$/g, searchString);

    axios.get(`${url}`, tempConfig)
        .then(function(response) {
            var blob = new Blob(["onmessage = " + refineResults]);
            var blobUrl = window.URL.createObjectURL(blob);

            var worker = new Worker(blobUrl);
            worker.onmessage = function (e) {
                switch(e.data.resultMessage) {
                    case "OK":
                        returnResults("OK", e.data.params.results, searchString);
                        window.URL.revokeObjectURL(blobUrl);
                        break;
                }
            };
            worker.postMessage({message: "refine", params: {results: response.data.response.docs, value: searchString}});

            // refineResults(searchString, response.data.response.docs, returnResults);
        })
        .catch(function(error) {
            console.log('%c --- SOLR datasource error --- ', 'background: black; color: red');
            console.log(error);
            returnResults("ERROR", undefined, searchString);
        })
};

function refineResults(e) {
    const sorter = function (a, b) {
        // Normalize user input so ranking comparisons stay aligned with query tokenization
        var InputString = (self.spotlightString || "").trim();
        if (a.label == undefined) {
            return 1;
        }
        if (b.label == undefined) {
            return -1;
        }

        // Helper functions
        var aIsClass = a.id.indexOf("FBbt") > -1 || a.id.indexOf("FBgn") > -1;
        var bIsClass = b.id.indexOf("FBbt") > -1 || b.id.indexOf("FBgn") > -1;

        // Extract short form (part before parenthesis)
        var aShortForm = a.label.split(' (')[0];
        var bShortForm = b.label.split(' (')[0];
        var aShortFormLC = aShortForm.toLowerCase();
        var bShortFormLC = bShortForm.toLowerCase();
        var InputStringLC = InputString.toLowerCase();

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
            var parenIndex = labelLC.indexOf(' (');
            var mainPart = parenIndex > -1 ? labelLC.substring(0, parenIndex) : labelLC;
            var parenPart = parenIndex > -1 ? labelLC.substring(parenIndex + 2, labelLC.length - 1) : '';

            if (mainPart.indexOf(InputStringLC) > -1) {
                count += 1;
            }

            if (parenPart && parenPart.indexOf(InputStringLC) > -1) {
                count += 1;
            }

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
    };

    self.spotlightString = (e.data.params.value || "").trim();
    var refinedResults:Array<any> = [];
    const seenRecords:Set<string> = new Set();
    const pushUniqueRecord = function (record:any) {
        const recordKey = JSON.stringify(record);
        if (!seenRecords.has(recordKey)) {
            seenRecords.add(recordKey);
            refinedResults.push(record);
        }
    };

    e.data.params.results.forEach(item => {
        if (item.hasOwnProperty("synonym")) {
            const synonyms = Array.isArray(item.synonym) ? item.synonym : [item.synonym];
            synonyms.forEach(innerItem => {
                let newRecord:any = {}
                if (innerItem !== item.label) {
                    Object.keys(item).forEach(key => {
                        switch(key) {
                            case "label":
                                newRecord[key] = innerItem + " (" + item.label + ")";
                                break;
                            case "synonym":
                                break;
                            default:
                                newRecord[key] = item[key];
                        }
                    });
                    pushUniqueRecord(newRecord);
                }
            });
            let newRecord:any = {}
            Object.keys(item).forEach(key => {
                if (key !== "synonym") {
                    if (key === "label") {
                        newRecord[key] = item[key] + " (" + item["short_form"] + ")";
                    } else {
                        newRecord[key] = item[key];
                    }
                }
            });
            pushUniqueRecord(newRecord);
        } else {
            let newRecord:any = {}
            Object.keys(item).forEach(key => {
                if (key === "label") {
                    newRecord[key] = item[key] + " (" + item["short_form"] + ")";
                } else {
                    newRecord[key] = item[key];
                }
            });
            pushUniqueRecord(newRecord);
        }
    });

    var sortedResults: Array<any> = refinedResults.sort(sorter);
    this.postMessage({resultMessage: "OK", params: {results: sortedResults}});
    self.close();
}

export const datasourceConfiguration = {
  "url": "https://solr.virtualflybrain.org/solr/ontology/select",
  "query_settings":
    {
      "q": "$SEARCH_TERM$",
      "q.op": "OR",
      "defType": "edismax",
      "mm": "45%",
      "qf": "label^110 synonym^100 label_autosuggest synonym_autosuggest shortform_autosuggest",
      "indent": "true",
      "fl": "short_form,label,synonym,id,facets_annotation",
      "start": "0",
      "pf":"true",
      "fq": [
        "facets_annotation:has_neuron_connectivity",
        "shortform_autosuggest:VFB* OR shortform_autosuggest:FB*",
        "NOT facets_annotation:Deprecated"
      ],
      "rows": "100",
      "wt": "json",
      "bq": "short_form:VFB*^110.0 short_form:FBbt*^100.0 short_form:FBbt_00003982^2 facets_annotation:Deprecated^0.001"
    }
};

export const searchConfiguration = {
  "resultsMapping":
    {
      "name": "label",
      "id": "short_form"
    },
  "filters_expanded": true,
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

    // Extract short form (part before parenthesis)
    var aShortForm = a.label.split(' (')[0];
    var bShortForm = b.label.split(' (')[0];
    var aShortFormLC = aShortForm.toLowerCase();
    var bShortFormLC = bShortForm.toLowerCase();
    var InputStringLC = InputString.toLowerCase();

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
      var parenIndex = labelLC.indexOf(' (');
      var mainPart = parenIndex > -1 ? labelLC.substring(0, parenIndex) : labelLC;
      var parenPart = parenIndex > -1 ? labelLC.substring(parenIndex + 2, labelLC.length - 1) : '';

      if (mainPart.indexOf(InputStringLC) > -1) {
        count += 1;
      }

      if (parenPart && parenPart.indexOf(InputStringLC) > -1) {
        count += 1;
      }

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
  }
};
