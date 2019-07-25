#!/bin/bash

# Swap servers
grep -rls http://pdb.virtualflybrain.org $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://pdb.virtualflybrain.org@$VFB_PDB_SERVER@g" 
grep -rls http://owl-dev.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://owl-dev.virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g" 
grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g" 
grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend | xargs sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" 
grep -rls UA-45841517-1 $HOME/workspace/org.geppetto.frontend | xargs sed -i "s|UA-45841517-1|${googleAnalyticsSiteCode}|g" 

# Frontend final build
cd $HOME/workspace/org.geppetto.frontend 
/bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
grep -rnwl "$HOME/workspace/" -e "UA-45841517-1" | xargs sed -i "s|UA-45841517-1|${googleAnalyticsSiteCode}|g"
mvn -Dhttps.protocols=TLSv1.2 -DcontextPath=org.geppetto.frontend -DuseSsl=false -DskipTests install
rm -rf src

# Start a logfile
mkdir -p $SERVER_HOME/serviceability/logs
echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

# Deploy Geppetto
rm $SERVER_HOME/./repository/usr/*
cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh

# output log
tail -F --retry $SERVER_HOME/serviceability/logs/log.log & 

# start virgo server
$SERVER_HOME/bin/startup.sh
