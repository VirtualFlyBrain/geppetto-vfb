var restPostConfig = {
  url: "http://pdb.virtualflybrain.org/db/data/transaction/commit",
  contentType: "application/json"
};

var treeCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Individual {short_form:'" + instance + "'})"
      + "<-[:depicts]-(tc:Individual)<-[ie:in_register_with]-(c:Individual)-[:depicts]->(image:"
      + "Individual)-[r:INSTANCEOF]->(anat:Class) WHERE has(ie.index) WITH root, anat,r,image"
      + " MATCH p=allShortestPaths((root)<-[:SUBCLASSOF|part_of*..]-(anat:Class)) RETURN p,r,image",
      "resultDataContents": ["graph"]
    }
  ]
});


module.exports = {
  restPostConfig,
  treeCypherQuery
};