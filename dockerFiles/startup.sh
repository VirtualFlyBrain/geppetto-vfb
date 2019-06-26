#!/bin/bash

# Swap servers
grep -rls pdb.virtualflybrain.org $HOME/ | xargs sed -i "s@pdb.virtualflybrain.org@$VFB_PDB_SERVER@g" &
grep -rls owl.virtualflybrain.org $HOME/workspace/ | xargs sed -iv "s@owl.virtualflybrain.org@$VFB_OWL_SERVER@g"	grep -rls owl.virtualflybrain.org /home/ | xargs sed -i "s@owl.virtualflybrain.org@$VFB_OWL_SERVER@g" &
grep -rls solr.virtualflybrain.org $HOME/workspace/ | xargs sed -iv "s@http://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g"	grep -rls solr.virtualflybrain.org /home/ | xargs sed -i "s@http://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" &

#Start a logfile
mkdir -p $SERVER_HOME/serviceability/logs
echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

# re-deploy Geppetto
cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh

# output log
tail -F --retry $SERVER_HOME/serviceability/logs/log.log & 

# start virgo server
$SERVER_HOME/bin/startup.sh
