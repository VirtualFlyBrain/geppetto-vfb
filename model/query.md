# Queries and Chains Across Data Sources

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get and process example images from Neo4j for class list
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get and process details from Neo4j for list of inds
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get fellow cluster members
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - All example images for a class
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: domainsForTempId - Find domains for template
Description: Doamins for template
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get cluster members
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: imagesForDataSet - Find images for dataset
Description: Images in a dataset
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: imagesForTempId - Find images aligned to a template
Description: Aligned images for template
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for exp from anatomy with no warning
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for anatomy from expression
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for anatomy from expression 
Description: Get JSON for anat_2_ep query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for exp from anatomy without warning 2
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Datasets available for Template
Description: Get JSON for template_2_datasets query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Datasaets available
Description: Get JSON for template_2_datasets query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for exp from anatomy without warning 3
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: compound_neuron_region_connectivity_query - neuron_region_connectivity_query
Description: compound query for neo4j neuron_region_connectivity_query 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: compound_neuron_neuron_connectivity_query - neuron_neuron_connectivity_query
Description: compound query for neo4j neuron_neuron_connectivity_query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to - NBLAST similarity neo Query
Description: NBLAST similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - All referenced Entities from a pub
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to_part_of - NBLASTexp similarity neo Query
Description: NBLASTexp similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to_nb - NeuronBridge similarity neo Query
Description: NeuronBridge similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: cluster_expression_query_compound - cluster_expression_query
Description: Get JSON for cluster expression query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: anat_scRNAseq_query_compound - anat_scRNAseq_query
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: dataset_scRNAseq_query_compound - dataset_scRNAseq_query
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: expression_cluster_query_compound - expression_cluster_query
Description: Get JSON for expression in cluster query
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: None - Owlery Part of
Description: Part of $NAME
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/BFO_0000050%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: None - Owlery Neuron class with part here
Description: Neurons with some part here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: None - Owlery Neurons Synaptic
Description: Neurons with synaptic terminals here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002130%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: None - Owlery Neurons Presynaptic
Description: Neurons with presynaptic terminals here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002113%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: None - Owlery Neurons Postsynaptic
Description: Neurons with postsynaptic terminals here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002110%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass id list only
Description: Keep nothing slimply pass ids
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessor
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: AberNeuronClassesFasciculatingHere - Owlery Neuron classes fasciculating here
Description: Neuron classes fasciculating here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002101%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: innervatesX - Owlery tracts in
Description: tracts in
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005099%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002134%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: subclasses - Owlery Subclasses of
Description: Subclasses of $NAME
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: TransgenesExpressedInX  - Owlery Transgenes expressed in 
Description: Transgenes expressed in 
Query Type: gep_2:SimpleQuery
Query: ```text

```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: lineageClones - Owlery Lineage Clones
Description: Lineage clones found in
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007683%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: CellThatOverlapsX - subClassOf cell that overlaps some X
Description: subClassOf cell that overlaps some X
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007002%3E%20and%20(%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E%20)&direct=false&includeDeprecated=false&includeEquivalent=true
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass 2nd id list only
Description: Keep nothing slimply pass ids to 2nd list
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessor2
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass 3rd id list only
Description: Keep nothing slimply pass ids to 3rd list
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessor2
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass 1st id list only
Description: Keep nothing slimply pass ids to 1st list
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessor2
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: OverlapsX - subClassOf overlaps some X
Description: subClassOf overlaps some X
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=false
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: CellOverlapsX - subClassOf cell overlaps some X
Description: subClassOf cell overlaps some X
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007002%3E%20%20that%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=false
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListPlusQueryTerm - Owlery Pass Plus Query ID
Description: Keep nothing slimply pass ids with query term
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessorWithQueryTerm
```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassSolrIdListOnly - Owlery Class Pass solr id list only
Description: Keep nothing slimply pass solr ids
Query Type: gep_2:ProcessQuery
Query: ```text
owleryToSolrIdOnlyQueryProcessor
```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: ImagesOfNeuronsWithSomePartHereClustered - Owlery Images of neurons with some part here (clustered)
Description: Images of neurons with some part here (clustered)
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/C888C3DB-AEFA-447F-BD4C-858DFE33DBE7%3E%20some%20(%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E)&direct=false&includeDeprecated=false
```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: ImagesOfNeuronsWithSomePartHere - Owlery Images of neurons with some part here
Description: Images of neurons with some part here
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false
```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: Owlery_individual_parts - Owlery individual parts
Description: Find individuals that are part of some X (useful for finding expression pattern parts).
Query Type: gep_2:SimpleQuery
Query: ```text
object=%3Chttp://purl.obolibrary.org/obo/BFO_0000050%3E%20some%20%3Chttp://virtualflybrain.org/reports/$ID%3E&direct=false&includeDeprecated=false
```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: owlPassIdListOnlyInstances - Owlery Pass id list only Instances
Description: Keep nothing slimply pass ids
Query Type: gep_2:ProcessQuery
Query: ```text
owleryIdOnlyQueryProcessor
```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: owlPassSolrIdListOnly - Owlery Ind Pass solr id list only
Description: Keep nothing slimply pass solr ids
Query Type: gep_2:ProcessQuery
Query: ```text
owleryToSolrIdOnlyQueryProcessor
```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: cachedvfbjsoncall - Get cached VFB_JSON for Term
Description: Get cached VFB_JSON for Term
Query Type: gep_2:SimpleQuery
Query: ```text
"params":{"defType":"edismax","fl":"term_info","indent":"true","q.op":"OR","q":"$ID","qf":"id","rows":"1"}
```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: None - Get and process example images from SOLR from id list
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text
Compound Query - See child steps
```

