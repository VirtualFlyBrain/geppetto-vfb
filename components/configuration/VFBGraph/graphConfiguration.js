var configuration = {
  resultsMapping:
  {
    "node": { 
      "title" : "short_form",
      "label" : "label",
      "tooltip" : "id"
    },
    "link" : {
      "label" : "label",
      "visible" : true,
      "tooltip" : "label"
    }
  }
}

var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

var cypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH p=(n:Entity)-[r:INSTANCEOF|part_of|has_synaptic_terminal_in|has_presynaptic_terminal_in"
      + "has_postsynaptic_terminal_in|overlaps*..]->(x)"
      + "WHERE n.short_form = '" + instance + "' return distinct n,r,x,n.short_form as root",
      "resultDataContents": ["graph"]
    }
  ]
});

module.exports = { 
  configuration,
  restPostConfig,
  cypherQuery
};
