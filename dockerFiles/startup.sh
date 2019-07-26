#!/bin/bash

# Swap servers
echo "Using Servers:"
echo $VFB_PDB_SERVER
grep -rls http://pdb-dev.virtualflybrain.org $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://pdb-dev.virtualflybrain.org@$VFB_PDB_SERVER@g" 
echo $VFB_OWL_SERVER
grep -rls http://owl-dev.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://owl-dev.virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g" 
echo $VFB_R_SERVER
grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g" 
echo $SOLR_SERVER
grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" 
echo "Google Analytics code: ${googleAnalyticsSiteCode}"
grep -rls UA-45841517-1 $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@UA-45841517-1@${googleAnalyticsSiteCode}@g" 

# Frontend final build
cd $HOME/workspace/org.geppetto.frontend 
/bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
mvn -Dhttps.protocols=TLSv1.2 -DcontextPath=org.geppetto.frontend -DuseSsl=false -DskipTests install
rm -rf src

# Start a logfile
mkdir -p $SERVER_HOME/serviceability/logs
echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

# Deploy Geppetto
rm $SERVER_HOME/./repository/usr/* || true
cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh

# output log
tail -F --retry $SERVER_HOME/serviceability/logs/log.log || true & 

# start virgo server
$SERVER_HOME/bin/startup.sh
