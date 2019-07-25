#!/bin/bash

# Swap servers
sed -i "s@http://pdb.virtualflybrain.org@$VFB_PDB_SERVER@g" $HOME/workspace/org.geppetto.frontend/target/frontend-*/model/vfb.xmi
sed -i "s@http://owl-dev.virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g" $HOME/workspace/org.geppetto.frontend/target/frontend-*/model/vfb.xmi	
sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g" $HOME/workspace/org.geppetto.frontend/target/frontend-*/model/vfb.xmi
grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/target/frontend-*/build/ | xargs sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" 
sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" $HOME/workspace/org.geppetto.frontend/target/frontend-*/components/configuration/queryBuilderConfiguration.js #just for consistency
sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" $HOME/workspace/org.geppetto.frontend/target/frontend-*/components/configuration/spotlightConfiguration.js #just for consistency

#Start a logfile
mkdir -p $SERVER_HOME/serviceability/logs
echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

# re-deploy Geppetto
rm $SERVER_HOME/./repository/usr/*
cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh

# output log
tail -F --retry $SERVER_HOME/serviceability/logs/log.log & 

# start virgo server
$SERVER_HOME/bin/startup.sh
