# Queries and Chains Across Data Sources

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get and process example images from Neo4j for class list
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get and process details from Neo4j for list of inds
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get fellow cluster members
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - All example images for a class
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: domainsForTempId - Find domains for template
Description: Doamins for template
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get cluster members
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: imagesForDataSet - Find images for dataset
Description: Images in a dataset
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: imagesForTempId - Find images aligned to a template
Description: Aligned images for template
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for exp from anatomy with no warning
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for anatomy from expression
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for anatomy from expression 
Description: Get JSON for anat_2_ep query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for exp from anatomy without warning 2
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Datasets available for Template
Description: Get JSON for template_2_datasets query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Datasaets available
Description: Get JSON for template_2_datasets query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for exp from anatomy without warning 3
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: compound_neuron_region_connectivity_query - neuron_region_connectivity_query
Description: compound query for neo4j neuron_region_connectivity_query 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: compound_neuron_neuron_connectivity_query - neuron_neuron_connectivity_query
Description: compound query for neo4j neuron_neuron_connectivity_query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to - NBLAST similarity neo Query
Description: NBLAST similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - All referenced Entities from a pub
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to_part_of - NBLASTexp similarity neo Query
Description: NBLASTexp similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: has_similar_morphology_to_nb - NeuronBridge similarity neo Query
Description: NeuronBridge similarity neo Query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: cluster_expression_query_compound - cluster_expression_query
Description: Get JSON for cluster expression query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: anat_scRNAseq_query_compound - anat_scRNAseq_query
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: dataset_scRNAseq_query_compound - dataset_scRNAseq_query
Description: 
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: expression_cluster_query_compound - expression_cluster_query
Description: Get JSON for expression in cluster query
Query Type: gep_2:CompoundQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - anatomy_query
Description: fetch Individual instances from Class ID list
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Class) WHERE primary.short_form in $ids WITH primary CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'bac066c' AS version, 'anatomy_query' AS query, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: GetMetaForIndList - anat_image_query
Description: Get images for individual list
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Individual) WHERE primary.short_form in $ids WITH primary OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'bac066c' AS version, 'anat_image_query' AS query, channel_image, types ", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: GetFellowClusterMembers - Get other cluster members
Description: $NAME's fellow cluster members
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Neuron { short_form: $id } )-[r1:member_of]->(c:Cluster)-[r2:has_member]->(i:Neuron)<-[:depicts]-(j:Individual)-[k:in_register_with]->(m:Individual) OPTIONAL MATCH (i)-[:INSTANCEOF]->(ec:Class) RETURN DISTINCT i.short_form as id, CASE WHEN not i.synonym is null THEN i.label+replace(' ('+reduce(a='',n in i.synonym|a+n+', ')+')',', )',')') ELSE i.label END as name, i.description[0] as def, COLLECT(DISTINCT ec.label) as type, COLLECT(DISTINCT replace(k.folder[0],'http:','https:') + '/thumbnailT.png') as file", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Fetch all example individuals for Class
Description: Fetch all example Individual instances of this Class or subclasses
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (c:Class)<-[:INSTANCEOF|SUBCLASSOF*..]-(primary:Individual)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WHERE c.short_form in [$id] WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm20210224' AS version, 'EXAMPLES_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: domainsForTempQuery - Find domain individuals for template id
Description: Find domain individuals for template id
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Template {short_form:$id})<-[:depicts]-(:Template)<-[r:in_register_with]-(dc:Individual)-[:depicts]->(di:Individual)-[:INSTANCEOF]->(d:Class) WHERE exists(r.index) RETURN distinct di.short_form as id, di.label as name, coalesce(di.description[0],d.description[0]) as def, COLLECT(DISTINCT d.label) as type, replace(r.folder[0],'http:','https:') + '/thumbnailT.png' as file", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: GetClusterMembers - Get cluster members
Description: $NAME's members
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (c:Cluster { short_form: $id } )-[r2:has_member]->(i:Neuron)<-[:depicts]-(j:Individual)-[k:in_register_with]->(m:Individual) OPTIONAL MATCH (i)-[:INSTANCEOF]->(ec:Class) RETURN DISTINCT i.short_form as id, CASE WHEN not i.synonym is null THEN i.label+replace(' ('+reduce(a='',n in i.synonym|a+n+', ')+')',', )',')') ELSE i.label END as name, i.description[0] as def, COLLECT(DISTINCT ec.label) as type, COLLECT(DISTINCT replace(k.folder[0],'http:','https:') + '/thumbnailT.png') as file", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: neoImagesForDataSet - Find images for dataset
Description: Find images for a dataset
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (c:DataSet)<-[:has_source]-(primary:Individual)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WHERE c.short_form in [$id] WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm20210224' AS version, 'EXAMPLES_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: imagesForTempQuery - Find images aligned to template id
Description: Find images aligned to template id
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Template {short_form:$id})<-[:depicts]-(:Template)<-[r:in_register_with]-(dc:Individual)-[:depicts]->(di:Individual) OPTIONAL MATCH (di)-[:INSTANCEOF]->(d:Class) RETURN distinct di.short_form as id, di.label as name, coalesce(di.description[0],d.description[0]) as def, COLLECT(DISTINCT d.label) as type, replace(r.folder[0],'http:','https:') + '/thumbnailT.png' as file", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Test Query for Exp from Anatomy
Description: Get JSON for anat_2_ep query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub) as pubs, anat, ep UNWIND pubs as p MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(pub.FlyBase[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'de64597' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for Anatomy from Exp
Description: Get JSON for ep_2_anat query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (ep:Expression_pattern:Class)<-[ar:overlaps|part_of]-(anoni:Individual)-[:INSTANCEOF]->(anat:Class) WHERE ep.short_form in $ids WITH anoni, anat, ar OPTIONAL MATCH (p:pub { short_form: ar.pub}) WITH anat, anoni, { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } AS pub OPTIONAL MATCH (anoni)-[r:Related]->(o:FBdv) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.symbol[0], '')} }) END AS stages ,anoni,anat,pub CALL apoc.cypher.run('WITH anat OPTIONAL MATCH (anat)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {anat:anat}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anoni, anat, pub, stages OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anoni,anat,pub,stages RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.symbol[0], '')} AS anatomy, 'Get JSON for ep_2_anat query' AS query, 'bac066c' AS version , pub, stages, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: ep_2_anat_query - Test Query for Anatomy from Exp
Description: Get JSON for ep_2_anat query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (ep:Expression_pattern:Class)<-[ar:overlaps|part_of]-(anoni:Individual)-[:INSTANCEOF]->(anat:Class) WHERE ep.short_form in [$id] WITH  anoni, anat, ar OPTIONAL MATCH (p:pub { short_form: ar.pub}) WITH anat, anoni, { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.`symbol`[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } AS pub OPTIONAL MATCH (anoni)-[r:Related]->(o:FBdv) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')}  }) END AS stages ,anoni,anat,pub CALL apoc.cypher.run('WITH anat OPTIONAL MATCH (anat)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {anat:anat}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anoni, anat, pub, stages OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anoni,anat,pub,stages RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  AS anatomy, 'Get JSON for ep_2_anat query' AS query, '3f881fe' AS version , pub, stages, anatomy_channel_image", "parameters" : { "id" : "$ID"}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for Exp from Anatomy
Description: Get JSON for anat_2_ep query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub) as pubs, anat, ep UNWIND pubs as p MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(pub.FlyBase[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'de64597' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - template_2_datasets_query
Description: Get JSON for template_2_datasets query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (t:Template) <-[depicts]-(tc:Template)-[:in_register_with]-(c:Individual)-[:depicts]->(ai:Individual)-[:has_source]->(ds:DataSet) WHERE t.short_form in [$id] WITH distinct ds, t CALL apoc.cypher.run('WITH ds, template_anat OPTIONAL MATCH (ds) <- [:has_source]-(i:Individual) <-[:depicts]- (channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat) RETURN template, channel, template_anat, i, irw limit 5', {ds:ds, template_anat:t}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, ds OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,ds OPTIONAL MATCH (ds)-[rp:has_reference]->(p:pub) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } ) END AS pubs,ds,anatomy_channel_image OPTIONAL MATCH (ds)-[:has_license|license]->(l:License) WITH collect ({ icon : coalesce(l.license_logo[0], ''), link : coalesce(l.license_url[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets,[])), symbol: coalesce(l.symbol[0], '')} }) as license,ds,anatomy_channel_image,pubs OPTIONAL MATCH (ds) <-[:has_source]-(i:Individual) WITH i, ds, anatomy_channel_image, pubs, license OPTIONAL MATCH (i)-[:INSTANCEOF]-(c:Class) WITH DISTINCT { images: count(distinct i),types: count(distinct c) } as dataset_counts,ds,anatomy_channel_image,pubs,license RETURN { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), symbol: coalesce(ds.symbol[0], '')} as dataset, 'bac066c' AS version, 'template_2_datasets_query' AS query, anatomy_channel_image, pubs, license, dataset_counts", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - test_all_datasets_query
Description: Get JSON for template_2_datasets query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (t:Template)<-[depicts]-(tc:Template)-[:in_register_with]-(c:Individual)-[:depicts]->(ai:Individual)-[:has_source]->(ds:DataSet) WITH distinct ds CALL apoc.cypher.run('WITH ds OPTIONAL MATCH (ds) <-[:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual) <-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ds:ds}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, ds OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,ds OPTIONAL MATCH (ds)-[rp:has_reference]->(p:pub) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } ) END AS pubs,ds,anatomy_channel_image OPTIONAL MATCH (ds)-[:has_license|license]->(l:License) WITH collect ({ icon : coalesce(l.license_logo[0], ''), link : coalesce(l.license_url[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets,[])), symbol: coalesce(l.symbol[0], '')} }) as license,ds,anatomy_channel_image,pubs OPTIONAL MATCH (ds) <-[:has_source]-(i:Individual) WITH i, ds, anatomy_channel_image, pubs, license OPTIONAL MATCH (i)-[:INSTANCEOF]-(c:Class) WITH DISTINCT { images: count(distinct i),types: count(distinct c) } as dataset_counts,ds,anatomy_channel_image,pubs,license RETURN { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), symbol: coalesce(ds.symbol[0], '')} as dataset, 'bac066c' AS version, 'all_datasets_query' AS query, anatomy_channel_image, pubs, license, dataset_counts", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Query for Exp from Anatomy
Description: Get JSON for anat_2_ep query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub) as pubs, anat, ep UNWIND pubs as p MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(pub.FlyBase[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'de64597' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: neuron_region_connectivity_query - neuron_region_connectivity_query
Description: neuron_region_connectivity_query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary) WHERE primary.short_form in [$id] WITH primary MATCH (target:Individual)<-[r:has_presynaptic_terminals_in|has_postsynaptic_terminal_in]-(primary) WITH DISTINCT collect(properties(r)) + {} as props, target, primary WITH apoc.map.removeKeys(apoc.map.merge(props[0], props[1]),['iri', 'short_form', 'Related', 'label', 'type']) as synapse_counts, { short_form: target.short_form, label: coalesce(target.label,''), iri: target.iri, types: labels(target), symbol: coalesce(target.`symbol`[0], '')} as object, target,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(target) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')} ) END AS parents ,primary,target,synapse_counts, object OPTIONAL MATCH (target)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, target, synapse_counts, object, parents   OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary,target,synapse_counts, object,parents RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.`symbol`[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, '64731dc' AS version , synapse_counts, object, parents, channel_image, 'neuron_region_connectivity_query' as query", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: neuron_neuron_connectivity_query - neuron_neuron_connectivity_query
Description: neuron_neuron_connectivity_query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary) WHERE primary.short_form in [$id] WITH primary MATCH (oi:Individual)-[r:synapsed_to]-(primary:Individual) WHERE exists(r.weight) AND r.weight[0] > 1 WITH primary, oi OPTIONAL MATCH (oi)<-[down:synapsed_to]-(primary) WITH down, oi, primary OPTIONAL MATCH (primary)<-[up:synapsed_to]-(oi) WITH { downstream: [coalesce(down.weight[0],0)], upstream:[coalesce(up.weight[0],0)] } as synapse_counts, { short_form: oi.short_form, label: coalesce(oi.label,''), iri: oi.iri, types: labels(oi), symbol: coalesce(oi.`symbol`[0], '')}  as object, oi,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(oi) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')} ) END AS parents ,primary,oi,synapse_counts, object OPTIONAL MATCH (oi)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, oi, synapse_counts, object, parents   OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary,oi,synapse_counts, object,parents RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.`symbol`[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, '64731dc' AS version , synapse_counts, object, parents, channel_image, 'neuron_neuron_connectivity_query' as query", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - vfb_query schema processor
Description: vfb_query schema processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: NBLAST_anat_image_query - NBLAST_anat_image_query
Description: find has_similar_morphology_to relationships
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to]-(primary:Individual) WHERE n.short_form in [$id] AND exists(nblast.NBLAST_score) WITH primary, nblast OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.NBLAST_score[0] as score, 'm20210225' AS version, 'NBLAST_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - Process Images
Description: vfb_query_schema_processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Fetch all entities for pub
Description: Fetch all entities that have reference to pub
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (p:pub)<-[:has_reference]-(primary) WHERE p.short_form in [$id] WITH distinct primary CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<-[:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual) WHERE primary:Class WITH coalesce(i,primary) as i OPTIONAL MATCH (i)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]-> (template_anat:Individual)  RETURN template, channel, template_anat, i, irw limit 5', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm_bac066c' AS version, 'pub_from_anatomy_query' AS query, anatomy_channel_image", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: NBLAST_anat_image_query_exp - NBLAST_anat_image_query_exp
Description: find has_similar_morphology_to relationships
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to_part_of]-(primary:Individual) WHERE n.short_form in [$id] AND EXISTS(nblast.NBLAST_score) WITH primary, nblast OPTIONAL MATCH (c:Class)<-[:INSTANCEOF]-(primary) OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.NBLAST_score[0] as score, 'm20220726' AS version, 'NBLASTexp_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - Process Images NBLASTexp
Description: vfb_query_schema_processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: NB_anat_image_query - NB_anat_image_query
Description: find has_similar_morphology_to relationships
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to_part_of]-(primary:Individual) WHERE n.short_form in [$id] AND exists(nblast.neuronbridge_score)  WITH primary, nblast OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.neuronbridge_score[0] as score, 'm20220726' AS version, 'NeuronBridge_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - Process Images NB
Description: vfb_query_schema_processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: cluster_expression_query - Get JSON for cluster expression query
Description: Get JSON for cluster expression query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Individual:Cluster) WHERE primary.short_form in [$id] WITH primary MATCH (primary)-[e:expresses]->(g:Gene:Class) WITH coalesce(e.expression_level_padded[0], e.expression_level[0]) as expression_level, e.expression_extent[0] as expression_extent, { short_form: g.short_form, label: coalesce(g.label,''), iri: g.iri, types: labels(g), unique_facets: apoc.coll.sort(coalesce(g.uniqueFacets, [])), symbol: coalesce(([]+g.symbol)[0], '')}  AS gene,primary MATCH (a:Anatomy)<-[:composed_primarily_of]-(primary) WITH { short_form: a.short_form, label: coalesce(a.label,''), iri: a.iri, types: labels(a), unique_facets: apoc.coll.sort(coalesce(a.uniqueFacets, [])), symbol: coalesce(([]+a.symbol)[0], '')}  AS anatomy,primary,expression_level,expression_extent,gene  RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for cluster expression query' AS query, 'a3c0d68' AS version , expression_level, expression_extent, gene, anatomy", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - Process genes
Description: vfb_query_schema_processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for anat scRNAseq query
Description: Get JSON for anat scRNAseq query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Class:Anatomy) WHERE primary.short_form in $ids OR primary.short_form = $id WITH primary MATCH (primary)<-[:composed_primarily_of]-(c:Cluster)-[:has_source]->(ds:scRNAseq_DataSet)OPTIONAL MATCH (ds)-[:has_reference]->(p:pub) WITH { short_form: c.short_form, label: coalesce(c.label,''), iri: c.iri, types: labels(c), unique_facets: apoc.coll.sort(coalesce(c.uniqueFacets, [])), symbol: coalesce(([]+c.symbol)[0], '')}  AS cluster, { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(([]+ds.symbol)[0], '')}  AS dataset, COLLECT({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') }) AS pubs,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for anat scRNAseq query' AS query, 'a3c0d68' AS version , cluster, dataset, pubs", "parameters" : { "ids" : $ARRAY_ID_RESULTS , "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for dataset scRNAseq query
Description: Get JSON for dataset scRNAseq query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (c:Individual)-[:has_source]->(ds:scRNAseq_DataSet) WHERE ds.short_form = $id OPTIONAL MATCH (ds)-[:has_reference]->(p:pub) WITH COLLECT({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') }) AS pubs, c RETURN { core : { short_form: c.short_form, label: coalesce(c.label,''), iri: c.iri, types: labels(c), unique_facets: apoc.coll.sort(coalesce(c.uniqueFacets, [])), symbol: coalesce(([]+c.symbol)[0], '')} , description : coalesce(c.description, []), comment : coalesce(c.comment, []) } AS term, 'Get JSON for dataset scRNAseq query' AS query, 'ma3c0d68' AS version, pubs", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: cluster_expression_query - Get JSON for cluster expression query
Description: Get JSON for cluster expression query
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Individual:Cluster)-[e:expresses]->(g:Gene:Class) WHERE g.short_form in [$id] WITH e.expression_level[0] as expression_level, e.expression_extent[0] as expression_extent, { short_form: g.short_form, label: coalesce(g.label,''), iri: g.iri, types: labels(g), unique_facets: apoc.coll.sort(coalesce(g.uniqueFacets, [])), symbol: coalesce(([]+g.symbol)[0], '')}  AS gene,primary MATCH (a:Anatomy)<-[:composed_primarily_of]-(primary) WITH { short_form: a.short_form, label: coalesce(a.label,''), iri: a.iri, types: labels(a), unique_facets: apoc.coll.sort(coalesce(a.uniqueFacets, [])), symbol: coalesce(([]+a.symbol)[0], '')}  AS anatomy,primary,expression_level,expression_extent,gene  RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for expression in cluster query' AS query, 'ma3c0d68' AS version , expression_level, expression_extent, anatomy", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: vfb_query_schema_processor - Process clusters
Description: vfb_query_schema_processor
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get term core info
Description: Fetches term core details.
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Entity {short_form: $id}) RETURN { core: { short_form: primary.short_form, label: primary.label, iri: primary.iri, types: labels(primary) }} as term", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Term Core
Description: Process Term Core
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get baseline term info
Description: Fetches basic term details.
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary {short_form: $id }) WHERE NOT primary:pub AND NOT primary:License AND NOT primary:Individual AND NOT primary:Class AND NOT primary:Template AND NOT primary:DataSet OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary)  WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: o.label, iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])) } ) END AS parents , primary OPTIONAL MATCH (o:Class)<-[r { type: 'Related' }]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.uri, type: type(r) } , object: { short_form: o.short_form, label: o.label, iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])) }  }) END AS relationships , parents, primary OPTIONAL MATCH (s:Site)<-[dbx:hasDbXref]-(primary)  WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link: s.link_base + coalesce(dbx.accession, ''), link_text: s.label, site: { short_form: s.short_form, label: s.label, iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets,[])) }, icon: coalesce(s.link_icon_url[0], '') }) END AS xrefs, parents, relationships, primary OPTIONAL MATCH (primary)-[rp:has_reference { typ: 'syn'}]->(p:pub:Individual)  WITH CASE WHEN p is null THEN [] ELSE collect({ pub: { core: { short_form: p.short_form, label: p.label, iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets,[])) } , PubMed: coalesce(p.PMID, ''), FlyBase: coalesce(p.FlyBase, ''), DOI: coalesce(p.DOI, '') } , synonym: { label: coalesce(rp.synonym[0], ''), scope: coalesce(rp.scope, ''), type: coalesce(rp.cat,'') }  }) END AS pub_syn, parents, relationships, xrefs, primary OPTIONAL MATCH (primary)-[rp:has_reference { typ: 'def'}]->(p:pub:Individual) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: p.label, iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets,[])) } , PubMed: coalesce(p.PMID, ''), FlyBase: coalesce(p.FlyBase, ''), DOI: coalesce(p.DOI, '') } ) END AS def_pubs, parents, relationships, xrefs, pub_syn, primary RETURN { core: { short_form: primary.short_form, label: primary.label, iri: primary.iri, types: labels(primary),  unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])) } , description: coalesce(primary.description, []), comment: coalesce(primary.`annotation-comment`, [])} as term ,parents,relationships,xrefs,pub_syn,def_pubs, 'Base' as query, 'manual' AS version", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Class
Description: Get JSON for Class
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Class) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} ) END AS parents ,primary OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS relationships ,primary,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,parents,relationships CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary, parents, relationships, xrefs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), unique_facets: apoc.coll.sort(coalesce(i.uniqueFacets, [])), symbol: coalesce(([]+i.symbol)[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(([]+technique.symbol)[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(([]+template.symbol)[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(([]+template_anat.symbol)[0], '')} ,image_folder: COALESCE(([]+irw.folder)[0], ''), index: coalesce(apoc.convert.toInteger(([]+irw.index)[0]), []) + [] }} }) END AS anatomy_channel_image ,primary,parents,relationships,xrefs OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) where rp.typ = 'syn' WITH CASE WHEN p is null THEN [] ELSE collect({ pub: { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } , synonym: { label: coalesce(([]+rp.value)[0], ''), scope: coalesce(rp.scope, ''), type: coalesce(([]+rp.has_synonym_type)[0],'') } }) END AS pub_syn,primary,parents,relationships,xrefs,anatomy_channel_image OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) WHERE rp.typ = 'def' WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } ) END AS def_pubs,primary,parents,relationships,xrefs,anatomy_channel_image,pub_syn RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for Class' AS query, '89ca20c' AS version , parents, relationships, xrefs, anatomy_channel_image, pub_syn, def_pubs", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Neuron Class
Description: Get JSON for Neuron Class
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Class) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} ) END AS parents ,primary OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS relationships ,primary,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,parents,relationships CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary, parents, relationships, xrefs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), unique_facets: apoc.coll.sort(coalesce(i.uniqueFacets, [])), symbol: coalesce(([]+i.symbol)[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(([]+technique.symbol)[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(([]+template.symbol)[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(([]+template_anat.symbol)[0], '')} ,image_folder: COALESCE(([]+irw.folder)[0], ''), index: coalesce(apoc.convert.toInteger(([]+irw.index)[0]), []) + [] }} }) END AS anatomy_channel_image ,primary,parents,relationships,xrefs OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) where rp.typ = 'syn' WITH CASE WHEN p is null THEN [] ELSE collect({ pub: { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } , synonym: { label: coalesce(([]+rp.value)[0], ''), scope: coalesce(rp.scope, ''), type: coalesce(([]+rp.has_synonym_type)[0],'') } }) END AS pub_syn,primary,parents,relationships,xrefs,anatomy_channel_image OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) WHERE rp.typ = 'def' WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } ) END AS def_pubs,primary,parents,relationships,xrefs,anatomy_channel_image,pub_syn OPTIONAL MATCH (:Class { label: 'intersectional expression pattern'})<-[:SUBCLASSOF]-(ep:Class)<-[ar:part_of]-(anoni:Individual)-[:INSTANCEOF]->(primary) WITH CASE WHEN ep IS NULL THEN [] ELSE COLLECT({ short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), unique_facets: apoc.coll.sort(coalesce(ep.uniqueFacets, [])), symbol: coalesce(([]+ep.symbol)[0], '')} ) END AS targeting_splits,primary,parents,relationships,xrefs,anatomy_channel_image,pub_syn,def_pubs RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for Neuron Class' AS query, '89ca20c' AS version , parents, relationships, xrefs, anatomy_channel_image, pub_syn, def_pubs, targeting_splits", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Split Class
Description: Get JSON for Split Class
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Class) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} ) END AS parents ,primary OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS relationships ,primary,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,parents,relationships CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary, parents, relationships, xrefs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), unique_facets: apoc.coll.sort(coalesce(i.uniqueFacets, [])), symbol: coalesce(([]+i.symbol)[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(([]+technique.symbol)[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(([]+template.symbol)[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(([]+template_anat.symbol)[0], '')} ,image_folder: COALESCE(([]+irw.folder)[0], ''), index: coalesce(apoc.convert.toInteger(([]+irw.index)[0]), []) + [] }} }) END AS anatomy_channel_image ,primary,parents,relationships,xrefs OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) where rp.typ = 'syn' WITH CASE WHEN p is null THEN [] ELSE collect({ pub: { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } , synonym: { label: coalesce(([]+rp.value)[0], ''), scope: coalesce(rp.scope, ''), type: coalesce(([]+rp.has_synonym_type)[0],'') } }) END AS pub_syn,primary,parents,relationships,xrefs,anatomy_channel_image OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) WHERE rp.typ = 'def' WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } ) END AS def_pubs,primary,parents,relationships,xrefs,anatomy_channel_image,pub_syn OPTIONAL MATCH (:Class { label: 'intersectional expression pattern'})<-[:SUBCLASSOF]-(primary)<-[ar:part_of]-(anoni:Individual)-[:INSTANCEOF]->(n:Neuron) WITH CASE WHEN n IS NULL THEN [] ELSE COLLECT({ short_form: n.short_form, label: coalesce(n.label,''), iri: n.iri, types: labels(n), unique_facets: apoc.coll.sort(coalesce(n.uniqueFacets, [])), symbol: coalesce(([]+n.symbol)[0], '')} ) END AS target_neurons,primary,parents,relationships,xrefs,anatomy_channel_image,pub_syn,def_pubs RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for Split Class' AS query, '89ca20c' AS version , parents, relationships, xrefs, anatomy_channel_image, pub_syn, def_pubs, target_neurons", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Individual
Description: Get JSON for Individual:Anatomy
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Individual) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (primary)-[:has_source]-(ds:DataSet)-[:has_license|license]->(l:License) WITH COLLECT ({ dataset: { link : coalesce(([]+ds.dataset_link)[0], ''), core : { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(([]+ds.symbol)[0], '')} }, license: { icon : coalesce(([]+l.license_logo)[0], ''), link : coalesce(([]+l.license_url)[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets, [])), symbol: coalesce(([]+l.symbol)[0], '')} }}) AS dataset_license,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} ) END AS parents ,primary,dataset_license OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS relationships ,primary,dataset_license,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, dataset_license, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,dataset_license,parents,relationships OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, dataset_license, parents, relationships, xrefs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(([]+technique.symbol)[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(([]+template.symbol)[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(([]+template_anat.symbol)[0], '')} ,image_folder: COALESCE(([]+irw.folder)[0], ''), index: coalesce(apoc.convert.toInteger(([]+irw.index)[0]), []) + [] }}) END AS channel_image,primary,dataset_license,parents,relationships,xrefs OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) where rp.typ = 'syn' WITH CASE WHEN p is null THEN [] ELSE collect({ pub: { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } , synonym: { label: coalesce(([]+rp.value)[0], ''), scope: coalesce(rp.scope, ''), type: coalesce(([]+rp.has_synonym_type)[0],'') } }) END AS pub_syn,primary,dataset_license,parents,relationships,xrefs,channel_image OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) WHERE rp.typ = 'def' WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } ) END AS def_pubs,primary,dataset_license,parents,relationships,xrefs,channel_image,pub_syn RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for Individual' AS query, '89ca20c' AS version , dataset_license, parents, relationships, xrefs, channel_image, pub_syn, def_pubs", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Cluster
Description: Get JSON for Cluster
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Cluster) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (primary)-[:has_source]-(ds:DataSet)-[:has_license|license]->(l:License) WITH COLLECT ({ dataset: { link : coalesce(ds.dataset_link[0], ''), core : { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(ds.symbol[0], '')} }, license: { icon : coalesce(l.license_logo[0], ''), link : coalesce(l.license_url[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets, [])), symbol: coalesce(l.symbol[0], '')} }}) AS dataset_license,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(o.symbol[0], '')} ) END AS parents ,primary,dataset_license OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(o.symbol[0], '')} }) END AS relationships ,primary,dataset_license,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(s.link_base[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(s.homepage[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(s.symbol[0], '')} , icon: coalesce(s.link_icon_url[0], ''), link_postfix: coalesce(s.link_postfix[0], '')}) END AS self_xref, primary, dataset_license, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(s.link_base[0], ''), accession: coalesce(dbx.accession[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(s.homepage[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(s.symbol[0], '')} , icon: coalesce(s.link_icon_url[0], ''), link_postfix: coalesce(s.link_postfix[0], '')}) + self_xref END AS xrefs,primary,dataset_license,parents,relationships OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, dataset_license, parents, relationships, xrefs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary,dataset_license,parents,relationships,xrefs OPTIONAL MATCH (o:Individual)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.uri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(o.symbol[0], ''), types: labels(o) }  }) END AS related_individuals ,primary,dataset_license,parents,relationships,xrefs,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary) , unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(primary.symbol[0], '')}, description: coalesce(primary.description, []), comment : coalesce(primary.comment, primary.`annotation-comment`, []) } AS term, 'Get JSON for Cluster using modified Individual:Anatomy' AS query, 'ca9ab19' AS version , dataset_license, parents, relationships, xrefs, channel_image, related_individuals", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for Template
Description: Get JSON for Template
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Template) WHERE primary.short_form in [$id] WITH primary MATCH (channel:Individual)<-[irw:in_register_with]-(channel:Individual)-[:depicts]->(primary) WITH { index: coalesce(apoc.convert.toInteger(irw.index), []) + [], extent: ([]+irw.extent)[0], center: ([]+irw.center)[0], voxel: ([]+irw.voxel)[0], orientation: coalesce(([]+irw.orientation)[0], ''), image_folder: coalesce(([]+irw.folder)[0],''), channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} } as template_channel,primary OPTIONAL MATCH (technique:Class)<-[:is_specified_output_of]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(primary) WHERE technique.short_form IN ['FBbi_00000224','FBbi_00000251'] AND exists(irw.index) WITH primary, template_channel, collect ({ channel: channel, irw: irw}) AS painted_domains UNWIND painted_domains AS pd OPTIONAL MATCH (channel:Individual { short_form: pd.channel.short_form})-[:depicts]-(ai:Individual)-[:INSTANCEOF]->(c:Class) WITH collect({ anatomical_type: { short_form: c.short_form, label: coalesce(c.label,''), iri: c.iri, types: labels(c), unique_facets: apoc.coll.sort(coalesce(c.uniqueFacets, [])), symbol: coalesce(([]+c.symbol)[0], '')} , anatomical_individual: { short_form: ai.short_form, label: coalesce(ai.label,''), iri: ai.iri, types: labels(ai), unique_facets: apoc.coll.sort(coalesce(ai.uniqueFacets, [])), symbol: coalesce(([]+ai.symbol)[0], '')} , folder: ([]+pd.irw.folder)[0], center: coalesce (pd.irw.center, []), index: [] + coalesce (pd.irw.index, []) }) AS template_domains,primary,template_channel OPTIONAL MATCH (primary)-[:has_source]-(ds:DataSet)-[:has_license|license]->(l:License) WITH COLLECT ({ dataset: { link : coalesce(([]+ds.dataset_link)[0], ''), core : { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(([]+ds.symbol)[0], '')} }, license: { icon : coalesce(([]+l.license_logo)[0], ''), link : coalesce(([]+l.license_url)[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets, [])), symbol: coalesce(([]+l.symbol)[0], '')} }}) AS dataset_license,primary,template_channel,template_domains OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} ) END AS parents ,primary,template_channel,template_domains,dataset_license OPTIONAL MATCH (o:Class)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS relationships ,primary,template_channel,template_domains,dataset_license,parents OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, template_channel, template_domains, dataset_license, parents, relationships OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,template_channel,template_domains,dataset_license,parents,relationships OPTIONAL MATCH (o:Individual)<-[r {type:'Related'}]-(primary) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets, [])), symbol: coalesce(([]+o.symbol)[0], '')} }) END AS related_individuals ,primary,template_channel,template_domains,dataset_license,parents,relationships,xrefs RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for Template' AS query, '89ca20c' AS version , template_channel, template_domains, dataset_license, parents, relationships, xrefs, related_individuals", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for pub
Description: Fetches JSON for pub.
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:Individual:pub) WHERE primary.short_form in [$id] WITH primary OPTIONAL MATCH (primary)-[:has_reference]-(ds:DataSet)-[:has_license|license]->(l:License) WITH COLLECT ({ dataset: { link : coalesce(([]+ds.dataset_link)[0], ''), core : { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(([]+ds.symbol)[0], '')} }, license: { icon : coalesce(([]+l.license_logo)[0], ''), link : coalesce(([]+l.license_url)[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets, [])), symbol: coalesce(([]+l.symbol)[0], '')} }}) AS dataset_license,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for pub' AS query, '89ca20c' AS version , dataset_license, {title: coalesce(([]+primary.title)[0], '') ,PubMed: coalesce(([]+primary.PMID)[0], ''), FlyBase: coalesce(([]+primary.FlyBase)[0], ''), DOI: coalesce(([]+primary.DOI)[0], '') }AS pub_specific_content", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for DataSet
Description: Get JSON for DataSet
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:DataSet) WHERE primary.short_form in [$id] WITH primary CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), unique_facets: apoc.coll.sort(coalesce(i.uniqueFacets, [])), symbol: coalesce(([]+i.symbol)[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets, [])), symbol: coalesce(([]+channel.symbol)[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets, [])), symbol: coalesce(([]+technique.symbol)[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets, [])), symbol: coalesce(([]+template.symbol)[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), unique_facets: apoc.coll.sort(coalesce(template_anat.uniqueFacets, [])), symbol: coalesce(([]+template_anat.symbol)[0], '')} ,image_folder: COALESCE(([]+irw.folder)[0], ''), index: coalesce(apoc.convert.toInteger(([]+irw.index)[0]), []) + [] }} }) END AS anatomy_channel_image ,primary OPTIONAL MATCH (s:Site { short_form: apoc.convert.toList(primary.self_xref)[0] }) WITH CASE WHEN s IS NULL THEN [] ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(primary.short_form, ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) END AS self_xref, primary, anatomy_channel_image OPTIONAL MATCH (s:Site)<-[dbx:database_cross_reference]-(primary) WITH CASE WHEN s IS NULL THEN self_xref ELSE COLLECT({ link_base: coalesce(([]+s.link_base)[0], ''), accession: coalesce(([]+dbx.accession)[0], ''), link_text: primary.label + ' on ' + s.label, homepage: coalesce(([]+s.homepage)[0], ''), site: { short_form: s.short_form, label: coalesce(s.label,''), iri: s.iri, types: labels(s), unique_facets: apoc.coll.sort(coalesce(s.uniqueFacets, [])), symbol: coalesce(([]+s.symbol)[0], '')} , icon: coalesce(([]+s.link_icon_url)[0], ''), link_postfix: coalesce(([]+s.link_postfix)[0], '')}) + self_xref END AS xrefs,primary,anatomy_channel_image OPTIONAL MATCH (primary)-[:has_license|license]->(l:License) WITH collect ({ icon : coalesce(([]+l.license_logo)[0], ''), link : coalesce(([]+l.license_url)[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets, [])), symbol: coalesce(([]+l.symbol)[0], '')} }) as license,primary,anatomy_channel_image,xrefs OPTIONAL MATCH (primary)-[rp:has_reference]->(p:pub) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') } ) END AS pubs,primary,anatomy_channel_image,xrefs,license OPTIONAL MATCH (primary)<-[:has_source]-(i:Individual) WITH i, primary, anatomy_channel_image, xrefs, license, pubs OPTIONAL MATCH (i)-[:INSTANCEOF]-(c:Class) WITH DISTINCT { images: count(distinct i),types: count(distinct c) } as dataset_counts,primary,anatomy_channel_image,xrefs,license,pubs RETURN { link : coalesce(([]+primary.dataset_link)[0], ''), core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for DataSet' AS query, '89ca20c' AS version , anatomy_channel_image, xrefs, license, pubs, dataset_counts", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Get JSON for License
Description: Get JSON for License
Query Type: gep_2:SimpleQuery
Query: ```text
"statement": "MATCH (primary:License) WHERE primary.short_form in [$id] WITH primary RETURN { icon : coalesce(([]+primary.license_logo)[0], ''), link : coalesce(([]+primary.license_url)[0], ''), core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for License' AS query, '89ca20c' AS version ", "parameters" : { "id" : "$ID" }
```

## DataSource: neo4j Data Source (ID: neo4JDataSourceService)
Query ID: None - Process Term JSON
Description: Process Term JSON
Query Type: gep_2:ProcessQuery
Query: ```text

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

```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass 3rd id list only
Description: Keep nothing slimply pass ids to 3rd list
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassIdListOnly - Owlery Pass 1st id list only
Description: Keep nothing slimply pass ids to 1st list
Query Type: gep_2:ProcessQuery
Query: ```text

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

```

## DataSource: owlery Data Source (subclasses) (ID: owleryDataSourceSubclass)
Query ID: owlPassSolrIdListOnly - Owlery Class Pass solr id list only
Description: Keep nothing slimply pass solr ids
Query Type: gep_2:ProcessQuery
Query: ```text

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

```

## DataSource: owlery Data Source (instances) (ID: owleryDataSourceRealise)
Query ID: owlPassSolrIdListOnly - Owlery Ind Pass solr id list only
Description: Keep nothing slimply pass solr ids
Query Type: gep_2:ProcessQuery
Query: ```text

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

```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: None - Get anat_query
Description: Fetches essential details.
Query Type: gep_2:SimpleQuery
Query: ```text
"params":{"defType":"edismax","fl":"anat_query,anat_image_query","indent":"true","q.op":"OR","q":"id:*","fq":"{!terms f=id}$ARRAY_ID_RESULTS","rows":"999999"}
```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: None - Process images
Description: 
Query Type: gep_2:ProcessQuery
Query: ```text

```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: None - Get term info
Description: Fetches essential details.
Query Type: gep_2:SimpleQuery
Query: ```text
"params":{"defType":"edismax","fl":"term_info","indent":"true","q.op":"OR","q":"id:$ID","qf":"id","rows":"1"}
```

## DataSource: SOLR Cached Queries (ID: querycache)
Query ID: None - Process Cached JSON
Description: Process Cached JSON
Query Type: gep_2:ProcessQuery
Query: ```text

```

