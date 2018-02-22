#!/bin/bash
# Set url to run Geppetto under
grep -rnwl '/opt/geppetto/' -e "VFB_EMBEDDER_URL" | xargs sed -i "s|VFB_EMBEDDER_URL|$VFB_EMBEDDER_URL|g" 
#Start a logfile
mkdir -p ~/serviceability/logs
echo 'Start of log...' > ~/serviceability/logs/log.log
# deploy Geppetto
cd /opt/geppetto/org.geppetto/utilities/source_setup 
python update_server.py
grep -rnwl '/home/virgo' -e "VFB_EMBEDDER_URL" | xargs sed -i "s|VFB_EMBEDDER_URL|$VFB_EMBEDDER_URL|g" 
# output log
tail --sleep-interval=5 -F ~/serviceability/logs/log.log & 
# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i /home/virgo/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i /home/virgo/bin/dmk.sh
# Remove redirect in tomcat config
sed 's\redirectPort="8443"\\g' -i /home/virgo/configuration/tomcat-server.xml
# Force URL after unpacking
/opt/VFB/seturl.sh & 
# start virgo server
/home/virgo/bin/startup.sh 
