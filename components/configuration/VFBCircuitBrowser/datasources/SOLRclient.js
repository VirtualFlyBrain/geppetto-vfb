/*
 * Circuit Browser term search. It runs the same SOLR search as the main search
 * box (geppetto-ui's SOLR client and the VFBMain sorter), restricted to terms
 * the Circuit Browser can query: neurons with connectivity, and neuron types
 * for class-level paths. Controls.js adds a filter to one connectome once a
 * neuron has been chosen (connectomeFilter in VFBCircuitBrowser/circuitPaths.js).
 */
import { getResultsSOLR as runSearch } from '@geppettoengine/geppetto-ui/search/datasources/SOLRclient';

const mainSearch = require('../../VFBMain/searchConfiguration');

let latestQuery = 0;

/**
 * Searches SOLR and passes ("OK" | "ERROR", results, searchString) to
 * returnResults, dropping any response that a later search has overtaken.
 */
export function getResultsSOLR (searchString, returnResults, sorter, configuration) {
  latestQuery += 1;
  const query = latestQuery;
  runSearch(searchString, (status, results, value, queryNumber) => {
    if (queryNumber === latestQuery) {
      returnResults(status, results, value);
    }
  }, sorter, query, configuration);
}

const main = mainSearch.datasourceConfiguration.query_settings;

export const datasourceConfiguration = {
  "url": mainSearch.datasourceConfiguration.url,
  "query_settings": {
    ...main,
    "fl": "short_form,label,synonym,id,facets_annotation",
    "fq": [
      // Neurons with connectivity, and neuron types (classes) for class-level paths
      "facets_annotation:has_neuron_connectivity OR (facets_annotation:Class AND facets_annotation:Neuron)",
      "shortform_autosuggest:VFB* OR shortform_autosuggest:FB*",
      "NOT facets_annotation:Deprecated"
    ]
  }
};

export const searchConfiguration = {
  "resultsMapping": {
    "name": "label",
    "id": "short_form"
  },
  "sorter": mainSearch.searchConfiguration.sorter
};
