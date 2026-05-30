# High-Level Queries with Named Query Chain Steps

## ListAllAvailableImages: List all available images of $NAME
- Step: VFBquery ListAllAvailableImages (DataSource Index: 4, Query Index: 4)

## TransgeneExpressionHere: Reports of transgene expression in $NAME
- Step: VFBquery TransgeneExpressionHere (DataSource Index: 4, Query Index: 5)

## ExpressionOverlapsHere: Anatomy $NAME is expressed in
- Step: VFBquery ExpressionOverlapsHere (DataSource Index: 4, Query Index: 6)

## NeuronClassesFasciculatingHere: Neurons fasciculating in $NAME
- Step: VFBquery NeuronClassesFasciculatingHere (DataSource Index: 4, Query Index: 7)

## ImagesNeurons: Images of neurons with some part in $NAME
- Step: VFBquery ImagesNeurons (DataSource Index: 4, Query Index: 8)

## NeuronsPartHere: Neurons with some part in $NAME
- Step: VFBquery NeuronsPartHere (DataSource Index: 4, Query Index: 9)

## epFrag: Images of fragments of $NAME
- Step: VFBquery epFrag (DataSource Index: 4, Query Index: 10)

## NeuronsSynaptic: Neurons with synaptic terminals in $NAME
- Step: VFBquery NeuronsSynaptic (DataSource Index: 4, Query Index: 11)

## NeuronsPresynapticHere: Neurons with presynaptic terminals in $NAME
- Step: VFBquery NeuronsPresynapticHere (DataSource Index: 4, Query Index: 12)

## NeuronsPostsynapticHere: Neurons with postsynaptic terminals in $NAME
- Step: VFBquery NeuronsPostsynapticHere (DataSource Index: 4, Query Index: 13)

## PaintedDomains: List all painted anatomy available for $NAME
- Step: VFBquery PaintedDomains (DataSource Index: 4, Query Index: 14)

## DatasetImages: List all images included in $NAME
- Step: VFBquery DatasetImages (DataSource Index: 4, Query Index: 15)

## TractsNervesInnervatingHere: Tracts/nerves innervating $NAME
- Step: VFBquery TractsNervesInnervatingHere (DataSource Index: 4, Query Index: 16)

## ComponentsOf: Components of $NAME
- Step: VFBquery ComponentsOf (DataSource Index: 4, Query Index: 17)

## LineageClonesIn: Lineage clones found in $NAME
- Step: VFBquery LineageClonesIn (DataSource Index: 4, Query Index: 18)

## AllAlignedImages: List all images aligned to $NAME
- Step: VFBquery AllAlignedImages (DataSource Index: 4, Query Index: 19)

## PartsOf: Parts of $NAME
- Step: VFBquery PartsOf (DataSource Index: 4, Query Index: 20)

## SubclassesOf: Subclasses of $NAME
- Step: VFBquery SubclassesOf (DataSource Index: 4, Query Index: 21)

## AlignedDatasets: List all datasets aligned to $NAME
- Step: VFBquery AlignedDatasets (DataSource Index: 4, Query Index: 22)

## AllDatasets: List all datasets
- Step: VFBquery AllDatasets (DataSource Index: 4, Query Index: 23)

## NeuronRegionConnectivityQuery: Show connectivity per region for $NAME
- Step: VFBquery NeuronRegionConnectivityQuery (DataSource Index: 4, Query Index: 3)

## NeuronNeuronConnectivityQuery: Show neurons connected to $NAME
- Step: VFBquery NeuronNeuronConnectivityQuery (DataSource Index: 4, Query Index: 2)

## DownstreamClassConnectivity: Show downstream connectivity by class for $NAME
- Step: VFBquery DownstreamClassConnectivity (DataSource Index: 4, Query Index: 1)

## UpstreamClassConnectivity: Show upstream connectivity by class for $NAME
- Step: VFBquery UpstreamClassConnectivity (DataSource Index: 4, Query Index: 0)

## SimilarMorphologyTo: Neurons with similar morphology to $NAME  [NBLAST mean score]
- Step: VFBquery SimilarMorphologyTo (DataSource Index: 4, Query Index: 24)

## SimilarMorphologyToPartOf: Expression patterns with some similar morphology to $NAME  [NBLAST mean score]
- Step: VFBquery SimilarMorphologyToPartOf (DataSource Index: 4, Query Index: 25)

## TermsForPub: List all terms that reference $NAME
- Step: VFBquery TermsForPub (DataSource Index: 4, Query Index: 26)

## SimilarMorphologyToPartOfexp: Neurons with similar morphology to part of $NAME  [NBLAST mean score]
- Step: VFBquery SimilarMorphologyToPartOfexp (DataSource Index: 4, Query Index: 27)

## SimilarMorphologyToNB: Neurons that overlap with $NAME  [NeuronBridge]
- Step: VFBquery SimilarMorphologyToNB (DataSource Index: 4, Query Index: 28)

## SimilarMorphologyToNBexp: Expression patterns that overlap with $NAME  [NeuronBridge]
- Step: VFBquery SimilarMorphologyToNBexp (DataSource Index: 4, Query Index: 29)

## anatScRNAseqQuery: Single cell transcriptomics data for $NAME
- Step: VFBquery anatScRNAseqQuery (DataSource Index: 4, Query Index: 30)

## clusterExpression: Genes expressed in $NAME
- Step: VFBquery clusterExpression (DataSource Index: 4, Query Index: 31)

## scRNAdatasetData: List all Clusters for $NAME
- Step: VFBquery scRNAdatasetData (DataSource Index: 4, Query Index: 32)

## expressionCluster: scRNAseq clusters expressing $NAME
- Step: VFBquery expressionCluster (DataSource Index: 4, Query Index: 33)

## SimilarMorphologyToUserData: Neurons with similar morphology to your upload $NAME  [NBLAST mean score]
- Step: VFBquery SimilarMorphologyToUserData (DataSource Index: 4, Query Index: 34)

## ImagesThatDevelopFrom: List images of neurons that develop from $NAME
- Step: VFBquery ImagesThatDevelopFrom (DataSource Index: 4, Query Index: 35)

