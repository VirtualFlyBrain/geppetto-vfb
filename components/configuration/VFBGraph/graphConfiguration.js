var configuration = {
  resultsMapping:
    {
      "name": "label",
      "id": "short_form"
    }
}

var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

var cypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH p=(n:Class)-[:SUBCLASSOF*..]->(x)"
      + "WHERE (('Cell' IN  labels(x)) or ('synaptic neuropil' IN labels(x)))"
      + "AND n.short_form = '" + instance + "' return  p, ID(n) as root",
      "resultDataContents": ["graph"]
    }
  ]
});

module.exports = { 
  configuration,
  restPostConfig,
  cypherQuery
};
