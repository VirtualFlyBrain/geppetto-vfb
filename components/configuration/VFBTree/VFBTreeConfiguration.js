var restPostConfig = {
  url: "https://pdb.virtualflybrain.org/db/neo4j/tx/commit",
  contentType: "application/json"
};

var treeCypherQuery = instance => ({
  "statements": [
    {
      "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Template {short_form:'" + instance + "'})"
      + "<-[:depicts]-(tc:Template)<-[ie:in_register_with]-(c:Individual)-[:depicts]->(image:"
      + "Individual)-[r:INSTANCEOF]->(anat:Class:Anatomy) WHERE exists(ie.index) WITH root, anat,r,image"
      + " MATCH p=allshortestpaths((root)<-[:SUBCLASSOF|part_of*..]-(anat)) "
      + "UNWIND nodes(p) as n UNWIND nodes(p) as m WITH * WHERE id(n) < id(m) "
      + "MATCH path = allShortestPaths( (n)-[:SUBCLASSOF|part_of*..1]-(m) ) "
      + "RETURN collect(distinct { node_id: id(anat), short_form: anat.short_form, image: image.short_form })"
      + " AS image_nodes, id(root) AS root, collect(path)",
      "resultDataContents": ["row", "graph"]
    }
  ]
});

var styling = {
  // Font Awesome Icons to display as Tree's controls
  icons : {
    sync : "fa fa-refresh",
    dropdown : "fa fa-bars",
  },
  // Drop down menu options, consists of label and query
  dropDownQueries : [
    {
      label : "Load Tree for 'adult protocerebrum'",
      query : () => ({
        "statements": [
          {
            "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Individual {short_form:'FBbt_00007145'})"
            + "<-[:depicts]-(tc:Individual)<-[ie:in_register_with]-(c:Individual)-[:depicts]->(image:"
            + "Individual)-[r:INSTANCEOF]->(anat:Class) WHERE exists(ie.index) WITH root, anat,r,image"
            + " MATCH p=allShortestPaths((root)<-[:SUBCLASSOF|part_of*..]-(anat)) "
            + "RETURN collect(distinct { node_id: id(anat), short_form: anat.short_form, image: image.short_form })"
            + " AS image_nodes, id(root) AS root, collect(p)",
            "resultDataContents": ["row", "graph"]
          }
        ]
      })
    },
    {
      label : "Load Tree for 'adult brain template JFRC2'",
      query : () => ({
        "statements": [
          {
            "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Individual {short_form:'VFB_00017894'})"
            + "<-[:depicts]-(tc:Individual)<-[ie:in_register_with]-(c:Individual)-[:depicts]->(image:"
            + "Individual)-[r:INSTANCEOF]->(anat:Class) WHERE exists(ie.index) WITH root, anat,r,image"
            + " MATCH p=allShortestPaths((root)<-[:SUBCLASSOF|part_of*..]-(anat)) "
            + "RETURN collect(distinct { node_id: id(anat), short_form: anat.short_form, image: image.short_form })"
            + " AS image_nodes, id(root) AS root, collect(p)",
            "resultDataContents": ["row", "graph"]
          }
        ]
      })
    },
    {
      label : "Load Tree for 'Adult Cerebrum'",
      query : () => ({
        "statements": [
          {
            "statement": "MATCH (root:Class)<-[:INSTANCEOF]-(t:Individual {short_form:'FBbt_00007050'})"
            + "<-[:depicts]-(tc:Individual)<-[ie:in_register_with]-(c:Individual)-[:depicts]->(image:"
            + "Individual)-[r:INSTANCEOF]->(anat:Class) WHERE exists(ie.index) WITH root, anat,r,image"
            + " MATCH p=allShortestPaths((root)<-[:SUBCLASSOF|part_of*..]-(anat)) "
            + "RETURN collect(distinct { node_id: id(anat), short_form: anat.short_form, image: image.short_form })"
            + " AS image_nodes, id(root) AS root, collect(p)",
            "resultDataContents": ["row", "graph"]
          }
        ]
      })
    }
  ],
  dropDownHoverBackgroundColor : "#11bffe",
  dropDownHoverTextColor : "black",
  dropDownBackgroundColor : "#4f4f4f",
  dropDownTextColor : "white"
}

module.exports = {
  restPostConfig,
  treeCypherQuery,
  styling
};
