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
grep -rls '"useSsl"' $HOME/workspace/org.geppetto.frontend/
grep -rls '"useSsl"' $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\"[[:space:]]*:[[:space:]]*\(true\|false\)@\"useSsl\": ${USESSL}@g"

# The frontend build runs `npm ci`, which installs exactly what package-lock.json
# pins and ignores package.json. Fail fast if the lock doesn't pin the
# geppetto-client release this image is meant to ship, otherwise the build
# silently bundles whatever older client the lock still points at.
if [ -n "${geppettoClientRelease}" ]; then
  LOCKED_CLIENT=$(grep -A2 '"@geppettoengine/geppetto-client": {' $HOME/workspace/org.geppetto.frontend/src/main/webapp/package-lock.json | grep '"from"' | head -1)
  echo "Locked geppetto-client: ${LOCKED_CLIENT}"
  grep -A1 '"@geppettoengine/geppetto-client": {' $HOME/workspace/org.geppetto.frontend/src/main/webapp/package-lock.json | grep '"version"' || true
  if ! echo "${LOCKED_CLIENT}" | grep -q "geppetto-client#${geppettoClientRelease}\""; then
    echo -e "\e[91mpackage-lock.json does not pin geppetto-client#${geppettoClientRelease} - update the lock to match the Dockerfile/package.json pin.\e[0m"
    exit 1
  fi
fi

# Temporarily disable exit on error so we can check for npm logs if the build fails
set +e

# Frontend final build.
# Every backend module above builds with ${mvnOpt} (which carries -Pmaster),
# but this line never did, so the frontend fell through to the pom's
# activeByDefault "development" profile: `npm run build-dev`, i.e. webpack with
# --devtool eval and NODE_ENV=development. The site has been shipping the
# unminified React development build - 16.7 MB main bundle, PropTypes checks
# and dev-only warnings on every page, which is most of the ~250k errorlog
# events GA records a month. -Pmaster selects `npm run build` (webpack -p).
cd $HOME/workspace/org.geppetto.frontend
/bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
echo "mvnOpt: ${mvnOpt}"
mvn -Pmaster -DcontextPath=org.geppetto.frontend -DuseSsl=${USESSL} install -e
BUILD_STATUS=$?

# If build failed, check for npm logs
if [ $BUILD_STATUS -ne 0 ]; then
  echo -e "\e[91mBuild failed. Checking for npm logs...\e[0m"
  if [ -d "/home/developer/.npm/_logs/" ] && [ "$(ls -A /home/developer/.npm/_logs/)" ]; then
    echo -e "\e[93mFound npm logs:\e[0m"
    cat /home/developer/.npm/_logs/*
  else
    echo "No npm logs found in /home/developer/.npm/_logs/"
  fi
fi

# Re-enable exit on error
set -e

# Exit with the original build status if it failed
if [ $BUILD_STATUS -ne 0 ]; then
  exit $BUILD_STATUS
fi

rm -rf src
