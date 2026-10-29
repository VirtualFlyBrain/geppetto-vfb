#!/bin/sh
# Point the client configuration at this build's endpoints. Runs on the
# source before webpack, so the values are compiled into the bundle.
set -e

echo "Tree browser / circuit browser / graph PDB: ${VFB_TREE_PDB_SERVER}"
for f in components/configuration/VFBTree/VFBTreeConfiguration.js \
         components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js \
         components/configuration/VFBGraph/graphConfiguration.js \
         model/vfb.xmi; do
  sed -i "s@https://pdb.*virtualflybrain.org@${VFB_TREE_PDB_SERVER}@g" "$f"
done

echo "Search Solr: ${SOLR_SERVER}"
grep -rls "https://solr.*virtualflybrain.org/solr/ontology/select" components/configuration/ \
  | xargs -r sed -i "s@https://solr.*virtualflybrain.org/solr/ontology/select@${SOLR_SERVER}@g"

echo "Non-standard servers still in the client configuration (if any):"
grep -rlE "(dev|alpha)\.virtualflybrain\.org/solr/ontology/select" components/ || true

# Upload token for upload.virtualflybrain.org (VFBUploader), from the BuildKit secret upload_token (GitHub
# secret UPLOAD_TOKEN). It is not kept in the repository. A build without it (pull requests, forks) still
# works, but its uploader gets 401 from the upload server.
if [ -n "${UPLOAD_TOKEN:-}" ]; then
  sed -i "s@__UPLOAD_TOKEN__@${UPLOAD_TOKEN}@" components/configuration/VFBUploader/configuration.json
  echo "Upload token: set"
else
  echo "Upload token: NOT set (the uploader will be refused by the upload server)"
fi
