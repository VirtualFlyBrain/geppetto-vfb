#!/usr/bin/env bash
#
# Build one named GDS graph projection per connectome for the Circuit Browser.
#
# The Circuit Browser (circuitBrowserConfiguration.js -> locationCypherQuery)
# runs gds.beta.shortestPath.yens.stream against a named graph "cb_<connectome>"
# instead of projecting the whole ~488k-node / ~34.7M-edge synapsed_to graph
# anonymously on every request (which timed out once the connectome grew).
#
# GDS in-memory projections are NOT persisted: they are lost on a Neo4j restart.
# Run this as a polishing-pipeline step AFTER each KB (re)load, and again after
# any pdb restart, before the Circuit Browser is used.
#
# Requires: GDS installed on the target (v1.5.x uses gds.graph.create.cypher),
# APOC, and enough server heap to hold the projections resident (order ~1-2 GB
# for the full ~34.7M edges across all connectomes).
#
# Usage:
#   NEO4J_URL=https://pdb.v4.virtualflybrain.org NEO4J_AUTH=neo4j:vfb \
#     ./build_connectome_projections.sh
#
set -euo pipefail

NEO4J_URL="${NEO4J_URL:-https://pdb.v4.virtualflybrain.org}"
NEO4J_AUTH="${NEO4J_AUTH:-neo4j:vfb}"
TX="${NEO4J_URL%/}/db/neo4j/tx/commit"

cypher () { # $1 = statement -> prints JSON response
  curl -s -H "Content-Type: application/json" -u "$NEO4J_AUTH" \
    -d "{\"statements\":[{\"statement\":$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$1")}]}" \
    "$TX"
}

echo "Discovering connectomes on $NEO4J_URL ..."
SFS=$(cypher "MATCH (s:Connectome) RETURN s.short_form AS sf" \
  | python3 -c 'import sys,json;print("\n".join(r["row"][0] for r in json.load(sys.stdin)["results"][0]["data"]))')

for SF in $SFS; do
  G="cb_${SF}"
  echo "== ${G} =="

  # Drop any stale projection so a reload rebuilds cleanly.
  cypher "CALL gds.graph.exists('${G}') YIELD exists WITH exists WHERE exists CALL gds.graph.drop('${G}') YIELD graphName RETURN graphName" >/dev/null || true

  NODEQ="MATCH (n:Neuron:has_neuron_connectivity)-[:database_cross_reference]->(:Connectome {short_form:\"${SF}\"}) RETURN id(n) AS id"
  RELQ="MATCH (:Connectome {short_form:\"${SF}\"})<-[:database_cross_reference]-(a:Neuron:has_neuron_connectivity)-[r:synapsed_to]->(b:Neuron:has_neuron_connectivity)-[:database_cross_reference]->(:Connectome {short_form:\"${SF}\"}) WHERE exists(r.weight) RETURN id(a) AS source, id(b) AS target, 5000 - r.weight[0] AS weight_p, r.weight[0] AS weight"

  # gds.graph.create.cypher(name, nodeQuery, relationshipQuery)
  # weight_p (= 5000 - synaptic weight) is the path cost so stronger
  # connections are shorter; raw weight is kept for display filtering.
  STMT="CALL gds.graph.create.cypher('${G}', '$(printf '%s' "$NODEQ" | sed "s/'/\\\\'/g")', '$(printf '%s' "$RELQ" | sed "s/'/\\\\'/g")') YIELD graphName, nodeCount, relationshipCount RETURN graphName, nodeCount, relationshipCount"
  cypher "$STMT" | python3 -c '
import sys,json
d=json.load(sys.stdin)
if d.get("errors"): print("   ERROR:", d["errors"]); sys.exit(1)
row=d["results"][0]["data"][0]["row"]
print(f"   built {row[0]}: nodes={row[1]:,} rels={row[2]:,}")
'
done

echo "Done. Named projections:"
cypher "CALL gds.graph.list() YIELD graphName, nodeCount, relationshipCount RETURN graphName, nodeCount, relationshipCount ORDER BY graphName" \
  | python3 -c '
import sys,json
for r in json.load(sys.stdin)["results"][0]["data"]:
    g,n,rel=r["row"]; print(f"  {g:40s} nodes={n:>9,} rels={rel:>12,}")'
