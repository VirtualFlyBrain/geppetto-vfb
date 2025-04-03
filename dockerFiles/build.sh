#!/bin/bash

# Note dev/alpha servers in code:
echo "Any non-standard servers in use:"
grep -rls dev.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/ || true
grep -rls alpha.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/ || true

# Swap servers
echo "Using Servers:"
echo "Client Tree Browser Server: $VFB_TREE_PDB_SERVER"
grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js || true
grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true
grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true
grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBGraph/graphConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true

echo "Server PDB: $VFB_PDB_SERVER"
grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true
grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://pdb.*virtualflybrain.org@$VFB_PDB_SERVER@g" || true

echo "Server OWL: $VFB_OWL_SERVER"
grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true
grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://owl.*virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g" || true

echo "Server OCPU R server: $VFB_R_SERVER"
grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true
grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g" || true

echo "Client SOLR Server: $SOLR_SERVER"
grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/ || true
grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/ | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" || true

SOLR_JSON_SERVER=$(echo $SOLR_SERVER | sed 's/ontology/vfb_json/g')
echo "Client SOLR query cache Server: $SOLR_JSON_SERVER"
grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true
grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/vfb_json/select@$SOLR_JSON_SERVER@g" || true

echo "Google Analytics code: ${googleAnalyticsSiteCode}"
grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ || true
grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@ga('create', 'UA-[0-9]*-[0-9]'@ga('create', '${googleAnalyticsSiteCode}'@g" || true

echo "useSSL:${USESSL}"
grep -rls "\"useSsl\":" $HOME/workspace/org.geppetto.frontend/ || true
grep -rls "\"useSsl\":" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\":.*,@\"useSsl\":${USESSL},@g" || true

set -e

# Configure npm properly before building
cd $HOME/workspace/org.geppetto.frontend/src/main/webapp
echo "Configuring npm registry..."
npm config set registry https://registry.npmjs.org/
npm config get registry

# Frontend final build
cd $HOME/workspace/org.geppetto.frontend
/bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
# Add --debug flag to get more information if the build fails
mvn ${mvnOpt} -DcontextPath=org.geppetto.frontend -DuseSsl=false install
rm -rf src
