# Queries and Chains Across Data Sources

## Query Name: Get and process example images from Neo4j for class list
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: anatomy_query
    ID: None
    Description: fetch Individual instances from Class ID list
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary:Class) WHERE primary.short_form in $ids WITH primary CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'bac066c' AS version, 'anatomy_query' AS query, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS }
```

    ## Query Name: Process images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Get and process details from Neo4j for list of inds
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: anat_image_query
    ID: GetMetaForIndList
    Description: Get images for individual list
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary:Individual) WHERE primary.short_form in $ids WITH primary OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'bac066c' AS version, 'anat_image_query' AS query, channel_image, types ", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Get fellow cluster members
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get other cluster members
    ID: GetFellowClusterMembers
    Description: $NAME's fellow cluster members
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (n:Neuron { short_form: $id } )-[r1:member_of]->(c:Cluster)-[r2:has_member]->(i:Neuron)<-[:depicts]-(j:Individual)-[k:in_register_with]->(m:Individual) OPTIONAL MATCH (i)-[:INSTANCEOF]->(ec:Class) RETURN DISTINCT i.short_form as id, CASE WHEN not i.synonym is null THEN i.label+replace(' ('+reduce(a='',n in i.synonym|a+n+', ')+')',', )',')') ELSE i.label END as name, i.description[0] as def, COLLECT(DISTINCT ec.label) as type, COLLECT(DISTINCT replace(k.folder[0],'http:','https:') + '/thumbnailT.png') as file", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    vfbCreateResultListForIndividualsForQueryResultsQueryProcessor
```

## Query Name: All example images for a class
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Fetch all example individuals for Class
    ID: None
    Description: Fetch all example Individual instances of this Class or subclasses
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (c:Class)<-[:INSTANCEOF|SUBCLASSOF*..]-(primary:Individual)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WHERE c.short_form in [$id] WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm20210224' AS version, 'EXAMPLES_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Find domains for template
ID: domainsForTempId
Description: Doamins for template
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Find domain individuals for template id
    ID: domainsForTempQuery
    Description: Find domain individuals for template id
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (n:Template {short_form:$id})<-[:depicts]-(:Template)<-[r:in_register_with]-(dc:Individual)-[:depicts]->(di:Individual)-[:INSTANCEOF]->(d:Class) WHERE exists(r.index) RETURN distinct di.short_form as id, di.label as name, coalesce(di.description[0],d.description[0]) as def, COLLECT(DISTINCT d.label) as type, replace(r.folder[0],'http:','https:') + '/thumbnailT.png' as file", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    vfbCreateResultListForIndividualsForQueryResultsQueryProcessor
```

## Query Name: Get cluster members
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get cluster members
    ID: GetClusterMembers
    Description: $NAME's members
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (c:Cluster { short_form: $id } )-[r2:has_member]->(i:Neuron)<-[:depicts]-(j:Individual)-[k:in_register_with]->(m:Individual) OPTIONAL MATCH (i)-[:INSTANCEOF]->(ec:Class) RETURN DISTINCT i.short_form as id, CASE WHEN not i.synonym is null THEN i.label+replace(' ('+reduce(a='',n in i.synonym|a+n+', ')+')',', )',')') ELSE i.label END as name, i.description[0] as def, COLLECT(DISTINCT ec.label) as type, COLLECT(DISTINCT replace(k.folder[0],'http:','https:') + '/thumbnailT.png') as file", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    vfbCreateResultListForIndividualsForQueryResultsQueryProcessor
```

## Query Name: Find images for dataset
ID: imagesForDataSet
Description: Images in a dataset
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Find images for dataset
    ID: neoImagesForDataSet
    Description: Find images for a dataset
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (c:DataSet)<-[:has_source]-(primary:Individual)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WHERE c.short_form in [$id] WITH template, channel, template_anat, irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm20210224' AS version, 'EXAMPLES_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Query for exp from anatomy with no warning
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Test Query for Exp from Anatomy
    ID: None
    Description: Get JSON for anat_2_ep query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub[0]) as pubs, anat, ep UNWIND pubs as p OPTIONAL MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(([]+pub.FlyBase)[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'fe226a6' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Test Query for anatomy from expression
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Query for Anatomy from Exp
    ID: None
    Description: Get JSON for ep_2_anat query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (ep:Expression_pattern:Class)<-[ar:overlaps|part_of]-(anoni:Individual)-[:INSTANCEOF]->(anat:Class) WHERE ep.short_form in $ids WITH anoni, anat, ar OPTIONAL MATCH (p:pub { short_form: []+ar.pub[0]}) WITH anat, anoni, { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } AS pub OPTIONAL MATCH (anoni)-[r:Related]->(o:FBdv) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.symbol[0], '')} }) END AS stages ,anoni,anat,pub CALL apoc.cypher.run('WITH anat OPTIONAL MATCH (anat)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {anat:anat}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anoni, anat, pub, stages OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anoni,anat,pub,stages RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.symbol[0], '')} AS anatomy, 'Get JSON for ep_2_anat query' AS query, 'bac066c' AS version , pub, stages, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Query for anatomy from expression 
ID: None
Description: Get JSON for anat_2_ep query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Test Query for Anatomy from Exp
    ID: ep_2_anat_query
    Description: Get JSON for ep_2_anat query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (ep:Expression_pattern:Class)<-[ar:overlaps|part_of]-(anoni:Individual)-[:INSTANCEOF]->(anat:Class) WHERE ep.short_form in [$id] WITH  anoni, anat, ar OPTIONAL MATCH (p:pub { short_form: []+ar.pub[0]}) WITH anat, anoni, { core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.`symbol`[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } AS pub OPTIONAL MATCH (anoni)-[r:Related]->(o:FBdv) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ relation: { label: r.label, iri: r.iri, type: type(r) } , object: { short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')}  }) END AS stages ,anoni,anat,pub CALL apoc.cypher.run('WITH anat OPTIONAL MATCH (anat)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 10', {anat:anat}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anoni, anat, pub, stages OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anoni,anat,pub,stages RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  AS anatomy, 'Get JSON for ep_2_anat query' AS query, '3f881fe' AS version , pub, stages, anatomy_channel_image", "parameters" : { "id" : "$ID"}
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Test Query for exp from anatomy without warning 2
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Query for Exp from Anatomy
    ID: None
    Description: Get JSON for anat_2_ep query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub[0]) as pubs, anat, ep UNWIND pubs as p OPTIONAL MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(([]+pub.FlyBase)[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'fe226a6' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Datasets available for Template
ID: None
Description: Get JSON for template_2_datasets query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: template_2_datasets_query
    ID: None
    Description: Get JSON for template_2_datasets query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (t:Template) <-[depicts]-(tc:Template)-[:in_register_with]-(c:Individual)-[:depicts]->(ai:Individual)-[:has_source]->(ds:DataSet) WHERE t.short_form in [$id] WITH distinct ds, t CALL apoc.cypher.run('WITH ds, template_anat OPTIONAL MATCH (ds) <- [:has_source]-(i:Individual) <-[:depicts]- (channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat) RETURN template, channel, template_anat, i, irw limit 5', {ds:ds, template_anat:t}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, ds OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,ds OPTIONAL MATCH (ds)-[rp:has_reference]->(p:pub) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } ) END AS pubs,ds,anatomy_channel_image OPTIONAL MATCH (ds)-[:has_license|license]->(l:License) WITH collect ({ icon : coalesce(l.license_logo[0], ''), link : coalesce(l.license_url[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets,[])), symbol: coalesce(l.symbol[0], '')} }) as license,ds,anatomy_channel_image,pubs OPTIONAL MATCH (ds) <-[:has_source]-(i:Individual) WITH i, ds, anatomy_channel_image, pubs, license OPTIONAL MATCH (i)-[:INSTANCEOF]-(c:Class) WITH DISTINCT { images: count(distinct i),types: count(distinct c) } as dataset_counts,ds,anatomy_channel_image,pubs,license RETURN { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), symbol: coalesce(ds.symbol[0], '')} as dataset, 'bac066c' AS version, 'template_2_datasets_query' AS query, anatomy_channel_image, pubs, license, dataset_counts", "parameters" : { "id" : "$ID" }
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Datasaets available
ID: None
Description: Get JSON for template_2_datasets query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: test_all_datasets_query
    ID: None
    Description: Get JSON for template_2_datasets query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (t:Template)<-[depicts]-(tc:Template)-[:in_register_with]-(c:Individual)-[:depicts]->(ai:Individual)-[:has_source]->(ds:DataSet) WITH distinct ds CALL apoc.cypher.run('WITH ds OPTIONAL MATCH (ds) <-[:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual) <-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ds:ds}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, ds OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,ds OPTIONAL MATCH (ds)-[rp:has_reference]->(p:pub) WITH CASE WHEN p is null THEN [] ELSE collect({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), symbol: coalesce(p.symbol[0], '')} , PubMed: coalesce(p.PMID[0], ''), FlyBase: coalesce(p.FlyBase[0], ''), DOI: coalesce(p.DOI[0], '') } ) END AS pubs,ds,anatomy_channel_image OPTIONAL MATCH (ds)-[:has_license|license]->(l:License) WITH collect ({ icon : coalesce(l.license_logo[0], ''), link : coalesce(l.license_url[0], ''), core : { short_form: l.short_form, label: coalesce(l.label,''), iri: l.iri, types: labels(l), unique_facets: apoc.coll.sort(coalesce(l.uniqueFacets,[])), symbol: coalesce(l.symbol[0], '')} }) as license,ds,anatomy_channel_image,pubs OPTIONAL MATCH (ds) <-[:has_source]-(i:Individual) WITH i, ds, anatomy_channel_image, pubs, license OPTIONAL MATCH (i)-[:INSTANCEOF]-(c:Class) WITH DISTINCT { images: count(distinct i),types: count(distinct c) } as dataset_counts,ds,anatomy_channel_image,pubs,license RETURN { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), symbol: coalesce(ds.symbol[0], '')} as dataset, 'bac066c' AS version, 'all_datasets_query' AS query, anatomy_channel_image, pubs, license, dataset_counts", "parameters" : { "id" : "$ID" }
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Test Query for exp from anatomy without warning 3
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Query for Exp from Anatomy
    ID: None
    Description: Get JSON for anat_2_ep query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (ep:Class:Expression_pattern)<-[ar:overlaps|part_of]-(:Individual)-[:INSTANCEOF]->(anat:Class) WHERE anat.short_form in $ids WITH DISTINCT collect(DISTINCT ar.pub[0]) as pubs, anat, ep UNWIND pubs as p OPTIONAL MATCH (pub:pub { short_form: p}) WITH anat, ep, collect({ core: { short_form: pub.short_form, label: coalesce(pub.label,''), iri: pub.iri, types: labels(pub), symbol: coalesce(pub.`symbol`[0], '')} , PubMed: coalesce(pub.PMID[0], ''), FlyBase: coalesce(([]+pub.FlyBase)[0], ''), DOI: coalesce(pub.DOI[0], '') }) as pubs CALL apoc.cypher.run('WITH ep OPTIONAL MATCH (ep)<- [:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual)<-[:depicts]- (channel:Individual)-[irw:in_register_with] ->(template:Individual)-[:depicts]-> (template_anat:Individual) RETURN template, channel, template_anat, i, irw limit 5', {ep:ep}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, anat, ep, pubs OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class)  WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.`symbol`[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,anat,ep,pubs RETURN { short_form: anat.short_form, label: coalesce(anat.label,''), iri: anat.iri, types: labels(anat), symbol: coalesce(anat.`symbol`[0], '')}  as anatomy, { short_form: ep.short_form, label: coalesce(ep.label,''), iri: ep.iri, types: labels(ep), symbol: coalesce(ep.`symbol`[0], '')}  AS expression_pattern, 'Get JSON for anat_2_ep query' AS query, 'fe226a6' AS version , pubs, anatomy_channel_image", "parameters" : { "ids" : $ARRAY_ID_RESULTS}
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: neuron_region_connectivity_query
ID: compound_neuron_region_connectivity_query
Description: compound query for neo4j neuron_region_connectivity_query 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: neuron_region_connectivity_query
    ID: neuron_region_connectivity_query
    Description: neuron_region_connectivity_query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary) WHERE primary.short_form in [$id] WITH primary MATCH (target:Individual)<-[r:has_presynaptic_terminals_in|has_postsynaptic_terminal_in]-(primary) WITH DISTINCT collect(properties(r)) + {} as props, target, primary WITH apoc.map.removeKeys(apoc.map.merge(props[0], props[1]),['iri', 'short_form', 'Related', 'label', 'type']) as synapse_counts, { short_form: target.short_form, label: coalesce(target.label,''), iri: target.iri, types: labels(target), symbol: coalesce(target.`symbol`[0], '')} as object, target,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(target) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')} ) END AS parents ,primary,target,synapse_counts, object OPTIONAL MATCH (target)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, target, synapse_counts, object, parents   OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary,target,synapse_counts, object,parents RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.`symbol`[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, '64731dc' AS version , synapse_counts, object, parents, channel_image, 'neuron_region_connectivity_query' as query", "parameters" : { "id" : "$ID" }
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: neuron_neuron_connectivity_query
ID: compound_neuron_neuron_connectivity_query
Description: compound query for neo4j neuron_neuron_connectivity_query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: neuron_neuron_connectivity_query
    ID: neuron_neuron_connectivity_query
    Description: neuron_neuron_connectivity_query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary) WHERE primary.short_form in [$id] WITH primary MATCH (oi:Individual)-[r:synapsed_to]-(primary:Individual) WHERE exists(r.weight) AND r.weight[0] > 1 WITH primary, oi OPTIONAL MATCH (oi)<-[down:synapsed_to]-(primary) WITH down, oi, primary OPTIONAL MATCH (primary)<-[up:synapsed_to]-(oi) WITH { downstream: [coalesce(down.weight[0],0)], upstream:[coalesce(up.weight[0],0)] } as synapse_counts, { short_form: oi.short_form, label: coalesce(oi.label,''), iri: oi.iri, types: labels(oi), symbol: coalesce(oi.`symbol`[0], '')}  as object, oi,primary OPTIONAL MATCH (o:Class)<-[r:SUBCLASSOF|INSTANCEOF]-(oi) WITH CASE WHEN o IS NULL THEN [] ELSE COLLECT ({ short_form: o.short_form, label: coalesce(o.label,''), iri: o.iri, types: labels(o), unique_facets: apoc.coll.sort(coalesce(o.uniqueFacets,[])), symbol: coalesce(o.`symbol`[0], '')} ) END AS parents ,primary,oi,synapse_counts, object OPTIONAL MATCH (oi)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, oi, synapse_counts, object, parents   OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.`symbol`[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.`symbol`[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.`symbol`[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.`symbol`[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary,oi,synapse_counts, object,parents RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.`symbol`[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, '64731dc' AS version , synapse_counts, object, parents, channel_image, 'neuron_neuron_connectivity_query' as query", "parameters" : { "id" : "$ID" }
```

    ## Query Name: vfb_query schema processor
    ID: vfb_query_schema_processor
    Description: vfb_query schema processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: NBLAST similarity neo Query
ID: has_similar_morphology_to
Description: NBLAST similarity neo Query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: NBLAST_anat_image_query
    ID: NBLAST_anat_image_query
    Description: find has_similar_morphology_to relationships
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to]-(primary:Individual) WHERE n.short_form in [$id] AND exists(nblast.NBLAST_score) WITH primary, nblast OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.NBLAST_score[0] as score, 'm20210225' AS version, 'NBLAST_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: vfb_query_schema_processor
    Description: vfb_query_schema_processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: All referenced Entities from a pub
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Fetch all entities for pub
    ID: None
    Description: Fetch all entities that have reference to pub
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (p:pub)<-[:has_reference]-(primary) WHERE p.short_form in [$id] WITH distinct primary CALL apoc.cypher.run('WITH primary OPTIONAL MATCH (primary)<-[:has_source|SUBCLASSOF|INSTANCEOF*]-(i:Individual) WHERE primary:Class WITH coalesce(i,primary) as i OPTIONAL MATCH (i)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]-> (template_anat:Individual)  RETURN template, channel, template_anat, i, irw limit 5', {primary:primary}) yield value with value.template as template, value.channel as channel,value.template_anat as template_anat, value.i as i, value.irw as irw, primary OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE COLLECT({ anatomy: { short_form: i.short_form, label: coalesce(i.label,''), iri: i.iri, types: labels(i), symbol: coalesce(i.symbol[0], '')} , channel_image: { channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }} }) END AS anatomy_channel_image ,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'm_bac066c' AS version, 'pub_from_anatomy_query' AS query, anatomy_channel_image", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: NBLASTexp similarity neo Query
ID: has_similar_morphology_to_part_of
Description: NBLASTexp similarity neo Query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: NBLAST_anat_image_query_exp
    ID: NBLAST_anat_image_query_exp
    Description: find has_similar_morphology_to relationships
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to_part_of]-(primary:Individual) WHERE n.short_form in [$id] AND EXISTS(nblast.NBLAST_score) WITH primary, nblast OPTIONAL MATCH (c:Class)<-[:INSTANCEOF]-(primary) OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.NBLAST_score[0] as score, 'm20220726' AS version, 'NBLASTexp_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images NBLASTexp
    ID: vfb_query_schema_processor
    Description: vfb_query_schema_processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: NeuronBridge similarity neo Query
ID: has_similar_morphology_to_nb
Description: NeuronBridge similarity neo Query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: NB_anat_image_query
    ID: NB_anat_image_query
    Description: find has_similar_morphology_to relationships
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (n:Individual)-[nblast:has_similar_morphology_to_part_of]-(primary:Individual) WHERE n.short_form in [$id] AND exists(nblast.neuronbridge_score)  WITH primary, nblast OPTIONAL MATCH (primary)<-[:depicts]-(channel:Individual)-[irw:in_register_with]->(template:Individual)-[:depicts]->(template_anat:Individual) WITH template, channel, template_anat, irw, primary, nblast OPTIONAL MATCH (channel)-[:is_specified_output_of]->(technique:Class) WITH CASE WHEN channel IS NULL THEN [] ELSE collect ({ channel: { short_form: channel.short_form, label: coalesce(channel.label,''), iri: channel.iri, types: labels(channel), unique_facets: apoc.coll.sort(coalesce(channel.uniqueFacets,[])), symbol: coalesce(channel.symbol[0], '')} , imaging_technique: { short_form: technique.short_form, label: coalesce(technique.label,''), iri: technique.iri, types: labels(technique), unique_facets: apoc.coll.sort(coalesce(technique.uniqueFacets,[])), symbol: coalesce(technique.symbol[0], '')} ,image: { template_channel : { short_form: template.short_form, label: coalesce(template.label,''), iri: template.iri, types: labels(template), unique_facets: apoc.coll.sort(coalesce(template.uniqueFacets,[])), symbol: coalesce(template.symbol[0], '')} , template_anatomy: { short_form: template_anat.short_form, label: coalesce(template_anat.label,''), iri: template_anat.iri, types: labels(template_anat), symbol: coalesce(template_anat.symbol[0], '')} ,image_folder: COALESCE(irw.folder[0], ''), index: coalesce(apoc.convert.toInteger(irw.index[0]), []) + [] }}) END AS channel_image,primary, nblast OPTIONAL MATCH (primary)-[:INSTANCEOF]->(typ:Class) WITH CASE WHEN typ is null THEN [] ELSE collect ({ short_form: typ.short_form, label: coalesce(typ.label,''), iri: typ.iri, types: labels(typ), symbol: coalesce(typ.symbol[0], '')} ) END AS types,primary,channel_image, nblast RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets,[])), symbol: coalesce(primary.symbol[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, nblast.neuronbridge_score[0] as score, 'm20220726' AS version, 'NeuronBridge_anat_image_query' AS query, channel_image, types", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images NB
    ID: vfb_query_schema_processor
    Description: vfb_query_schema_processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: cluster_expression_query
ID: cluster_expression_query_compound
Description: Get JSON for cluster expression query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get JSON for cluster expression query
    ID: cluster_expression_query
    Description: Get JSON for cluster expression query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary:Individual:Cluster) WHERE primary.short_form in [$id] WITH primary MATCH (primary)-[e:expresses]->(g:Gene:Class) WITH coalesce(e.expression_level_padded[0], e.expression_level[0]) as expression_level, e.expression_extent[0] as expression_extent, { short_form: g.short_form, label: coalesce(g.label,''), iri: g.iri, types: labels(g), unique_facets: apoc.coll.sort(coalesce(g.uniqueFacets, [])), symbol: coalesce(([]+g.symbol)[0], '')}  AS gene,primary MATCH (a:Anatomy)<-[:composed_primarily_of]-(primary) WITH { short_form: a.short_form, label: coalesce(a.label,''), iri: a.iri, types: labels(a), unique_facets: apoc.coll.sort(coalesce(a.uniqueFacets, [])), symbol: coalesce(([]+a.symbol)[0], '')}  AS anatomy,primary,expression_level,expression_extent,gene  RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for cluster expression query' AS query, 'a3c0d68' AS version , expression_level, expression_extent, gene, anatomy", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process genes
    ID: vfb_query_schema_processor
    Description: vfb_query_schema_processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: anat_scRNAseq_query
ID: anat_scRNAseq_query_compound
Description: No description provided
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get JSON for anat scRNAseq query
    ID: None
    Description: Get JSON for anat scRNAseq query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary:Class:Anatomy) WHERE primary.short_form in $ids OR primary.short_form = $id WITH primary MATCH (primary)<-[:composed_primarily_of]-(c:Cluster)-[:has_source]->(ds:scRNAseq_DataSet)OPTIONAL MATCH (ds)-[:has_reference]->(p:pub) WITH { short_form: c.short_form, label: coalesce(c.label,''), iri: c.iri, types: labels(c), unique_facets: apoc.coll.sort(coalesce(c.uniqueFacets, [])), symbol: coalesce(([]+c.symbol)[0], '')}  AS cluster, { short_form: ds.short_form, label: coalesce(ds.label,''), iri: ds.iri, types: labels(ds), unique_facets: apoc.coll.sort(coalesce(ds.uniqueFacets, [])), symbol: coalesce(([]+ds.symbol)[0], '')}  AS dataset, COLLECT({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') }) AS pubs,primary RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for anat scRNAseq query' AS query, 'a3c0d68' AS version , cluster, dataset, pubs", "parameters" : { "ids" : $ARRAY_ID_RESULTS , "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: dataset_scRNAseq_query
ID: dataset_scRNAseq_query_compound
Description: No description provided
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get JSON for dataset scRNAseq query
    ID: None
    Description: Get JSON for dataset scRNAseq query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (c:Individual:Cluster)-[:has_source]->(ds:scRNAseq_DataSet) WHERE ds.short_form = $id MATCH (a:Class:Anatomy)<-[:composed_primarily_of]-(c) WITH *, { short_form: a.short_form, label: coalesce(a.label,''), iri: a.iri, types: labels(a), unique_facets: apoc.coll.sort(coalesce(a.uniqueFacets, [])), symbol: coalesce(([]+a.symbol)[0], '')}  AS anatomy OPTIONAL MATCH (ds)-[:has_reference]->(p:pub) WITH COLLECT({ core: { short_form: p.short_form, label: coalesce(p.label,''), iri: p.iri, types: labels(p), unique_facets: apoc.coll.sort(coalesce(p.uniqueFacets, [])), symbol: coalesce(([]+p.symbol)[0], '')} , PubMed: coalesce(([]+p.PMID)[0], ''), FlyBase: coalesce(([]+p.FlyBase)[0], ''), DOI: coalesce(([]+p.DOI)[0], '') }) AS pubs, c, anatomy RETURN { core : { short_form: c.short_form, label: coalesce(c.label,''), iri: c.iri, types: labels(c), unique_facets: apoc.coll.sort(coalesce(c.uniqueFacets, [])), symbol: coalesce(([]+c.symbol)[0], '')} , description : coalesce(c.description, []), comment : coalesce(c.comment, []) } AS term, anatomy, 'Get JSON for dataset scRNAseq query' AS query, 'm20240712' AS version, pubs", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process Images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: expression_cluster_query
ID: expression_cluster_query_compound
Description: Get JSON for expression in cluster query
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get JSON for cluster expression query
    ID: cluster_expression_query
    Description: Get JSON for cluster expression query
    Type: gep_2:SimpleQuery
    Query: ```
    "statement": "MATCH (primary:Individual:Cluster)-[e:expresses]->(g:Gene:Class) WHERE g.short_form in [$id] WITH e.expression_level[0] as expression_level, e.expression_extent[0] as expression_extent, { short_form: g.short_form, label: coalesce(g.label,''), iri: g.iri, types: labels(g), unique_facets: apoc.coll.sort(coalesce(g.uniqueFacets, [])), symbol: coalesce(([]+g.symbol)[0], '')}  AS gene,primary MATCH (a:Anatomy)<-[:composed_primarily_of]-(primary) WITH { short_form: a.short_form, label: coalesce(a.label,''), iri: a.iri, types: labels(a), unique_facets: apoc.coll.sort(coalesce(a.uniqueFacets, [])), symbol: coalesce(([]+a.symbol)[0], '')}  AS anatomy,primary,expression_level,expression_extent,gene  RETURN { core : { short_form: primary.short_form, label: coalesce(primary.label,''), iri: primary.iri, types: labels(primary), unique_facets: apoc.coll.sort(coalesce(primary.uniqueFacets, [])), symbol: coalesce(([]+primary.symbol)[0], '')} , description : coalesce(primary.description, []), comment : coalesce(primary.comment, []) } AS term, 'Get JSON for expression in cluster query' AS query, 'ma3c0d68' AS version , expression_level, expression_extent, anatomy", "parameters" : { "id" : "$ID" }
```

    ## Query Name: Process clusters
    ID: vfb_query_schema_processor
    Description: vfb_query_schema_processor
    Type: gep_2:ProcessQuery
    Query: ```
    neo4jQueryProcessor
```

## Query Name: Find images aligned to template id
ID: imagesForTempQuery
Description: Find images aligned to template id
Type: gep_2:SimpleQuery
Query: ```
"statement": "MATCH (n:Template {short_form:$id})<-[:depicts]-(:Template)<-[r:in_register_with]-(dc:Individual)-[:depicts]->(di:Individual) RETURN COLLECT(distinct di.short_form) as ids", "parameters" : { "id" : "$ID" }
```

## Query Name: neo4j Pass solr id list only
ID: neo4jPassSolrIdListOnly
Description: Keep nothing slimply pass solr ids
Type: gep_2:ProcessQuery
Query: ```
neo4jToSOLRidQueryProcessor
```

## Query Name: Owlery Part of
ID: None
Description: Part of $NAME
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/BFO_0000050%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Neuron class with part here
ID: None
Description: Neurons with some part here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Neurons Synaptic
ID: None
Description: Neurons with synaptic terminals here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002130%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Neurons Presynaptic
ID: None
Description: Neurons with presynaptic terminals here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002113%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Neurons Postsynaptic
ID: None
Description: Neurons with postsynaptic terminals here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002110%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Pass id list only
ID: owlPassIdListOnly
Description: Keep nothing slimply pass ids
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessor
```

## Query Name: Owlery Neuron classes fasciculating here
ID: AberNeuronClassesFasciculatingHere
Description: Neuron classes fasciculating here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002101%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery tracts in
ID: innervatesX
Description: tracts in
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005099%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002134%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Subclasses of
ID: subclasses
Description: Subclasses of $NAME
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Transgenes expressed in 
ID: TransgenesExpressedInX 
Description: Transgenes expressed in 
Type: gep_2:SimpleQuery
Query: ```

```

## Query Name: Owlery Lineage Clones
ID: lineageClones
Description: Lineage clones found in
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007683%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: subClassOf cell that overlaps some X
ID: CellThatOverlapsX
Description: subClassOf cell that overlaps some X
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007002%3E%20and%20(%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E%20)&direct=false&includeDeprecated=false&includeEquivalent=true
```

## Query Name: Owlery Pass 2nd id list only
ID: owlPassIdListOnly
Description: Keep nothing slimply pass ids to 2nd list
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessor2
```

## Query Name: Owlery Pass 3rd id list only
ID: owlPassIdListOnly
Description: Keep nothing slimply pass ids to 3rd list
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessor2
```

## Query Name: Owlery Pass 1st id list only
ID: owlPassIdListOnly
Description: Keep nothing slimply pass ids to 1st list
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessor2
```

## Query Name: subClassOf overlaps some X
ID: OverlapsX
Description: subClassOf overlaps some X
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=false
```

## Query Name: subClassOf cell overlaps some X
ID: CellOverlapsX
Description: subClassOf cell overlaps some X
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00007002%3E%20%20that%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false&includeEquivalent=false
```

## Query Name: Owlery Pass Plus Query ID
ID: owlPassIdListPlusQueryTerm
Description: Keep nothing slimply pass ids with query term
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessorWithQueryTerm
```

## Query Name: Owlery Class Pass solr id list only
ID: owlPassSolrIdListOnly
Description: Keep nothing slimply pass solr ids
Type: gep_2:ProcessQuery
Query: ```
owleryToSolrIdOnlyQueryProcessor
```

## Query Name: Owlery Images of neurons with some part here (clustered)
ID: ImagesOfNeuronsWithSomePartHereClustered
Description: Images of neurons with some part here (clustered)
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/C888C3DB-AEFA-447F-BD4C-858DFE33DBE7%3E%20some%20(%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E)&direct=false&includeDeprecated=false
```

## Query Name: Owlery Images of neurons with some part here
ID: ImagesOfNeuronsWithSomePartHere
Description: Images of neurons with some part here
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/FBbt_00005106%3E%20and%20%3Chttp://purl.obolibrary.org/obo/RO_0002131%3E%20some%20%3Chttp://purl.obolibrary.org/obo/$ID%3E&direct=false&includeDeprecated=false
```

## Query Name: Owlery individual parts
ID: Owlery_individual_parts
Description: Find individuals that are part of some X (useful for finding expression pattern parts).
Type: gep_2:SimpleQuery
Query: ```
object=%3Chttp://purl.obolibrary.org/obo/BFO_0000050%3E%20some%20%3Chttp://virtualflybrain.org/reports/$ID%3E&direct=false&includeDeprecated=false
```

## Query Name: Owlery Pass id list only Instances
ID: owlPassIdListOnlyInstances
Description: Keep nothing slimply pass ids
Type: gep_2:ProcessQuery
Query: ```
owleryIdOnlyQueryProcessor
```

## Query Name: Owlery Ind Pass solr id list only
ID: owlPassSolrIdListOnly
Description: Keep nothing slimply pass solr ids
Type: gep_2:ProcessQuery
Query: ```
owleryToSolrIdOnlyQueryProcessor
```

## Query Name: Get cached VFB_JSON for Term
ID: cachedvfbjsoncall
Description: Get cached VFB_JSON for Term
Type: gep_2:SimpleQuery
Query: ```
"params":{"defType":"edismax","fl":"term_info","indent":"true","q.op":"OR","q":"$ID","qf":"id","rows":"1"}
```

## Query Name: Get and process example images from SOLR from id list
ID: None
Description: 
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get anat_query
    ID: None
    Description: Fetches essential details.
    Type: gep_2:SimpleQuery
    Query: ```
    "params":{"defType":"edismax","fl":"anat_query,anat_image_query","indent":"true","q.op":"OR","q":"id:*","fq":"{!terms f=id}$ARRAY_ID_RESULTS","rows":"999999"}
```

    ## Query Name: Process images
    ID: None
    Description: No description provided
    Type: gep_2:ProcessQuery
    Query: ```
    solrQueryProcessor
```

## Query Name: Get user NBLAST results
ID: None
Description: No description provided
Type: gep_2:CompoundQuery
Query: ```

```

    ## Query Name: Get user NBLAST results
    ID: None
    Description: Fetches user NBLAST results
    Type: gep_2:SimpleQuery
    Query: ```
    "params":{"defType":"edismax","fl":"upload_nblast_query","indent":"true","q.op":"OR","q":"id:$ID","qf":"id","rows":"99"}
```

    ## Query Name: Process user data NBLAST
    ID: None
    Description: Process user data NBLAST
    Type: gep_2:ProcessQuery
    Query: ```
    cachedUploadNblastQueryProcessor
```

## Query Name: List all available images for class with examples
ID: ListAllAvailableImages
Description: List all available images of $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Expression overlapping selected anatomy
ID: TransgeneExpressionHere
Description: Reports of transgene expression in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Expression overlapping what anatomy
ID: ExpressionOverlapsHere
Description: Anatomy $NAME is expressed in
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Neuron classes fasciculating here
ID: NeuronClassesFasciculatingHere
Description: Neurons fasciculating in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Images of neurons with some part here
ID: ImagesNeurons
Description: Images of neurons with some part in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Neurons with any part here
ID: NeuronsPartHere
Description: Neurons with some part in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Images of expression pattern fragments
ID: epFrag
Description: Images of fragments of $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Neurons Synaptic
ID: NeuronsSynaptic
Description: Neurons with synaptic terminals in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Neurons Presynaptic
ID: NeuronsPresynapticHere
Description: Neurons with presynaptic terminals in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Neurons Postsynaptic
ID: NeuronsPostsynapticHere
Description: Neurons with postsynaptic terminals in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all painted domains for template
ID: PaintedDomains
Description: List all painted anatomy available for $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all images for a dataset
ID: DatasetImages
Description: List all images included in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Tracts/nerves innervating synaptic neuropil
ID: TractsNervesInnervatingHere
Description: Tracts/nerves innervating $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Components of
ID: ComponentsOf
Description: Components of $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Lineage clones found here
ID: LineageClonesIn
Description: Lineage clones found in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all images aligned to template
ID: AllAlignedImages
Description: List all images aligned to $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Parts of
ID: PartsOf
Description: Parts of $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Subclasses of
ID: SubclassesOf
Description: Subclasses of $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all datasets aligned to template
ID: AlignedDatasets
Description: List all datasets aligned to $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all datasets
ID: AllDatasets
Description: List all datasets
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show connectivity to regions from Neuron X
ID: ref_neuron_region_connectivity_query
Description: Show connectivity per region for $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show connectivity to neurons from Neuron X
ID: ref_neuron_neuron_connectivity_query
Description: Show neurons connected to $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to
ID: SimilarMorphologyTo
Description: Neurons with similar morphology to $NAME  [NBLAST mean score]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to_part_of_neuron
ID: SimilarMorphologyToPartOf
Description: Expression patterns with some similar morphology to $NAME  [NBLAST mean score]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_reference_to_pub
ID: TermsForPub
Description: List all terms that reference $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to_part_of_exp
ID: SimilarMorphologyToPartOfexp
Description: Neurons with similar morphology to part of $NAME  [NBLAST mean score]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to_nb
ID: SimilarMorphologyToNB
Description: Neurons that overlap with $NAME  [NeuronBridge]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to_nb_exp
ID: SimilarMorphologyToNBexp
Description: Expression patterns that overlap with $NAME  [NeuronBridge]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: anat_scRNAseq_query
ID: anatScRNAseqQuery
Description: Single cell transcriptomics data for $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: cluster_expression
ID: clusterExpression
Description: Genes expressed in $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: Show all Clusters for a scRNAseq dataset
ID: scRNAdatasetData
Description: List all Clusters for $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: expression_cluster
ID: expressionCluster
Description: scRNAseq clusters expressing $NAME
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

## Query Name: has_similar_morphology_to_userdata
ID: SimilarMorphologyToUserData
Description: Neurons with similar morphology to your upload $NAME  [NBLAST mean score]
Type: gep_2:CompoundRefQuery
Query: ```
No query provided
```

