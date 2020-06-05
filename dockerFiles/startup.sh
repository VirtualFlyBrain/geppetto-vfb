#!/bin/bash

if [[ -d "$HOME/workspace/org.geppetto.frontend/src" ]]
then
    # Note dev/alpha servers in code:
    echo "Any non-standard servers in use:"
    grep -rls dev.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/
    grep -rls alpha.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/

    # Swap servers
    echo "Using Servers:"
    echo $VFB_PDB_SERVER
    grep -rls http://pdb.virtualflybrain.org $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls http://pdb.virtualflybrain.org $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://pdb.virtualflybrain.org@$VFB_PDB_SERVER@g"
    echo $VFB_OWL_SERVER
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://owl.virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g"
    echo $VFB_R_SERVER
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g"
    echo $SOLR_SERVER
    grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBMain/
    grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBMain/ | xargs sed -i "s@https://solr.virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g"
    echo "Google Analytics code: ${googleAnalyticsSiteCode}"
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@ga('create', 'UA-[0-9]*-[0-9]'@ga('create', '${googleAnalyticsSiteCode}'@g"
    echo "useSSL:${USESSL}"
    grep -rls '"useSsl":' $HOME/workspace/org.geppetto.frontend/
    grep -rls '"useSsl":' $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\":.*,@\"useSsl\":${USESSL},@g"

    # Frontend final build
    cd $HOME/workspace/org.geppetto.frontend
    /bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
    mvn ${mvnOpt} -DcontextPath=org.geppetto.frontend -DuseSsl=false install
    rm -rf src
fi

if [[ -d "$SERVER_HOME/./repository/usr" ]]
then
    # Start a logfile
    mkdir -p $SERVER_HOME/serviceability/logs
    echo 'Start of log...' > $SERVER_HOME/serviceability/logs/log.log

    # Deploy Geppetto
    rm $SERVER_HOME/./repository/usr/* || true
    cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

    # set java memory maximum
    sed 's/XX:MaxPermSize=512m/XX:MaxPermSize=$MAXSIZE/g' -i $SERVER_HOME/bin/dmk.sh
    sed 's/Xmx1024m/Xmx$MAXSIZE/' -i $SERVER_HOME/bin/dmk.sh

    # output log
    tail -F --retry $SERVER_HOME/serviceability/logs/log.log || true &

    # start virgo server
    $SERVER_HOME/bin/startup.sh
fi
