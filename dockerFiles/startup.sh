#!/bin/bash
# Set url to run Geppetto under
grep -rnwl '/opt/geppetto/' -e "VFB_EMBEDDER_URL" | xargs sed -i "s|VFB_EMBEDDER_URL|$VFB_EMBEDDER_URL|g" 
# deploy Geppetto
cd /opt/geppetto/org.geppetto/utilities/source_setup 
python update_server.py
# output log
tail --sleep-interval=5 -F ~/serviceability/logs/log.log & 
# set java memory maximum 
sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i /home/virgo/bin/dmk.sh
sed 's/Xmx512m/Xmx$MAXSIZE/' -i /home/virgo/bin/dmk.sh
# start virgo server
/home/virgo/bin/startup.sh 
