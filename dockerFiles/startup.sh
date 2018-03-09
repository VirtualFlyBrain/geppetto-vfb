#!/bin/bash

#Start a logfile
mkdir -p ~/serviceability/logs
echo 'Start of log...' > ~/serviceability/logs/log.log

# deploy Geppetto
cd /opt/geppetto/org.geppetto/utilities/source_setup 
python update_server.py

# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i /home/virgo/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i /home/virgo/bin/dmk.sh
# Remove redirect in tomcat config
sed 's\redirectPort="8443"\\g' -i /home/virgo/configuration/tomcat-server.xml

# output log
tail -F --retry ~/serviceability/logs/log.log & 

# start virgo server
/home/virgo/bin/startup.sh 
