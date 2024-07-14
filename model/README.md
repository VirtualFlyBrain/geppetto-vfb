# High-Level Queries with Named Query Chain Steps

## ListAllAvailableImages: List all available images of $NAME
- Step: All example images for a class (DataSource Index: 0, Query Index: 3)

## TransgeneExpressionHere: Reports of transgene expression in $NAME
- Step: Owlery Subclasses of (DataSource Index: 1, Query Index: 8)
- Step: Owlery Pass 1st id list only (DataSource Index: 1, Query Index: 14)
- Step: Query for exp from anatomy with no warning (DataSource Index: 0, Query Index: 8)
- Step: subClassOf cell overlaps some X (DataSource Index: 1, Query Index: 16)
- Step: Owlery Pass 2nd id list only (DataSource Index: 1, Query Index: 12)
- Step: Test Query for exp from anatomy without warning 2 (DataSource Index: 0, Query Index: 11)
- Step: Owlery Part of (DataSource Index: 1, Query Index: 0)
- Step: Owlery Pass 3rd id list only (DataSource Index: 1, Query Index: 13)
- Step: Test Query for exp from anatomy without warning 3 (DataSource Index: 0, Query Index: 14)

## ExpressionOverlapsHere: Anatomy $NAME is expressed in
- Step: Query for anatomy from expression  (DataSource Index: 0, Query Index: 10)

## NeuronClassesFasciculatingHere: Neurons fasciculating in $NAME
- Step: Owlery Neuron classes fasciculating here (DataSource Index: 1, Query Index: 6)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## ImagesNeurons: Images of neurons with some part in $NAME
- Step: Owlery Images of neurons with some part here (DataSource Index: 2, Query Index: 1)
- Step: Owlery Ind Pass solr id list only (DataSource Index: 2, Query Index: 4)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## NeuronsPartHere: Neurons with some part in $NAME
- Step: Owlery Neuron class with part here (DataSource Index: 1, Query Index: 1)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## epFrag: Images of fragments of $NAME
- Step: Owlery individual parts (DataSource Index: 2, Query Index: 2)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## NeuronsSynaptic: Neurons with synaptic terminals in $NAME
- Step: Owlery Neurons Synaptic (DataSource Index: 1, Query Index: 2)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## NeuronsPresynapticHere: Neurons with presynaptic terminals in $NAME
- Step: Owlery Neurons Presynaptic (DataSource Index: 1, Query Index: 3)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## NeuronsPostsynapticHere: Neurons with postsynaptic terminals in $NAME
- Step: Owlery Neurons Postsynaptic (DataSource Index: 1, Query Index: 4)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## PaintedDomains: List all painted anatomy available for $NAME
- Step: Find domains for template (DataSource Index: 0, Query Index: 4)

## DatasetImages: List all images included in $NAME
- Step: Find images for dataset (DataSource Index: 0, Query Index: 6)

## TractsNervesInnervatingHere: Tracts/nerves innervating $NAME
- Step: Owlery tracts in (DataSource Index: 1, Query Index: 7)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## ComponentsOf: Components of $NAME
- Step: Owlery Part of (DataSource Index: 1, Query Index: 0)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## LineageClonesIn: Lineage clones found in $NAME
- Step: Owlery Lineage Clones (DataSource Index: 1, Query Index: 10)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## AllAlignedImages: List all images aligned to $NAME
- Step: Find images aligned to a template (DataSource Index: 0, Query Index: 7)

## PartsOf: Parts of $NAME
- Step: Owlery Part of (DataSource Index: 1, Query Index: 0)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## SubclassesOf: Subclasses of $NAME
- Step: Owlery Subclasses of (DataSource Index: 1, Query Index: 8)
- Step: Owlery Class Pass solr id list only (DataSource Index: 1, Query Index: 18)
- Step: Get and process example images from SOLR from id list (DataSource Index: 3, Query Index: 1)

## AlignedDatasets: List all datasets aligned to $NAME
- Step: Datasets available for Template (DataSource Index: 0, Query Index: 12)

## AllDatasets: List all datasets
- Step: Datasaets available (DataSource Index: 0, Query Index: 13)

## ref_neuron_region_connectivity_query: Show connectivity per region for $NAME
- Step: neuron_region_connectivity_query (DataSource Index: 0, Query Index: 15)

## ref_neuron_neuron_connectivity_query: Show neurons connected to $NAME
- Step: neuron_neuron_connectivity_query (DataSource Index: 0, Query Index: 16)

## SimilarMorphologyTo: Neurons with similar morphology to $NAME  [NBLAST mean score]
- Step: NBLAST similarity neo Query (DataSource Index: 0, Query Index: 17)

## SimilarMorphologyToPartOf: Expression patterns with some similar morphology to $NAME  [NBLAST mean score]
- Step: NBLASTexp similarity neo Query (DataSource Index: 0, Query Index: 19)

## TermsForPub: List all terms that reference $NAME
- Step: All referenced Entities from a pub (DataSource Index: 0, Query Index: 18)

## SimilarMorphologyToPartOfexp: Neurons with similar morphology to part of $NAME  [NBLAST mean score]
- Step: NBLASTexp similarity neo Query (DataSource Index: 0, Query Index: 19)

## SimilarMorphologyToNB: Neurons that overlap with $NAME  [NeuronBridge]
- Step: NeuronBridge similarity neo Query (DataSource Index: 0, Query Index: 20)

## SimilarMorphologyToNBexp: Expression patterns that overlap with $NAME  [NeuronBridge]
- Step: NeuronBridge similarity neo Query (DataSource Index: 0, Query Index: 20)

## anatScRNAseqQuery: Single cell transcriptomics data for $NAME
- Step: Owlery Subclasses of (DataSource Index: 1, Query Index: 8)
- Step: Owlery Pass Plus Query ID (DataSource Index: 1, Query Index: 17)
- Step: anat_scRNAseq_query (DataSource Index: 0, Query Index: 22)

## clusterExpression: Genes expressed in $NAME
- Step: cluster_expression_query (DataSource Index: 0, Query Index: 21)

## scRNAdatasetData: List all Clusters for $NAME
- Step: dataset_scRNAseq_query (DataSource Index: 0, Query Index: 23)

## expressionCluster: scRNAseq clusters expressing $NAME
- Step: expression_cluster_query (DataSource Index: 0, Query Index: 24)

## SimilarMorphologyToUserData: Neurons with similar morphology to your upload $NAME  [NBLAST mean score]
- Step: Get user NBLAST results (DataSource Index: 3, Query Index: 2)

