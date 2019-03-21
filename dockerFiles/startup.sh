#!/bin/bash

# Swap servers
grep -rls pdb.virtualflybrain.org /opt/geppetto/ | xargs sed -iv "s@pdb.virtualflybrain.org@$VFB_PDB_SERVER@g"
grep -rls owl.virtualflybrain.org /opt/geppetto/ | xargs sed -iv "s@owl.virtualflybrain.org@$VFB_OWL_SERVER@g"
grep -rls solr.virtualflybrain.org /opt/geppetto/ | xargs sed -iv "s@http://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g"

#Start a logfile
mkdir -p $SERVER_HOME/serviceability/logs
echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

# deploy Geppetto
cd /opt/geppetto/org.geppetto/utilities/source_setup 
python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh
# Remove redirect in tomcat config
sed 's\redirectPort="8443"\\g' -i $SERVER_HOME/configuration/tomcat-server.xml


# output log
tail -F --retry $SERVER_HOME/serviceability/logs/log.log & 

# start virgo server
$SERVER_HOME/bin/startup.sh
