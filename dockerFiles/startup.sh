#!/bin/bash

if [[ -d "$HOME/workspace/org.geppetto.frontend/src" ]]
then
    # Note dev/alpha servers in code:
    echo "Any non-standard servers in use:"
    grep -rls dev.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/
    grep -rls alpha.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/

    # Swap servers
    echo "Using Servers:"
    echo "Client Tree Browser Server: $VFB_TREE_PDB_SERVER"
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g"
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g"
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBGraph/graphConfiguration.js
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBGraph/graphConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g"
    echo "Server PDB: $VFB_PDB_SERVER"
    grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://pdb.*virtualflybrain.org@$VFB_PDB_SERVER@g"
    echo "Server OWL: $VFB_OWL_SERVER"
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://owl.*virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g"
    echo "Server OCPU R server: $VFB_R_SERVER"
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g"
    echo "Client SOLR Server: $SOLR_SERVER"
    grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBMain/
    grep -rls https://solr.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBMain/ | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g"
    echo "Google Analytics code: ${googleAnalyticsSiteCode}"
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@ga('create', 'UA-[0-9]*-[0-9]'@ga('create', '${googleAnalyticsSiteCode}'@g"
    echo "useSSL:${USESSL}"
    grep -rls '"useSsl":' $HOME/workspace/org.geppetto.frontend/
    grep -rls '"useSsl":' $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\":.*,@\"useSsl\":${USESSL},@g"

    set -e

    # Frontend final build
    cd $HOME/workspace/org.geppetto.frontend
    /bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m"
    mvn ${mvnOpt} -DcontextPath=org.geppetto.frontend -DuseSsl=false install
    rm -rf src
fi

if [[ -d "$SERVER_HOME/./repository/usr" ]]
then

    echo "Using Servers:"
    echo "Client Tree Browser Server: $VFB_TREE_PDB_SERVER"
    echo "Server PDB: $VFB_PDB_SERVER"
    echo "Server OWL: $VFB_OWL_SERVER"
    echo "Server OCPU R server: $VFB_R_SERVER"
    echo "Client SOLR Server: $SOLR_SERVER"
    echo "Google Analytics code: ${googleAnalyticsSiteCode}"
    echo "useSSL:${USESSL}"

    # Start a logfile
    mkdir -p $SERVER_HOME/serviceability/logs
    export log="$SERVER_HOME/serviceability/logs/log.log"
    echo 'Start of log...' > $log

    # Deploy Geppetto
    rm $SERVER_HOME/./repository/usr/* || true
    cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py

    # set java memory maximum
    sed "s/XX:MaxPermSize=512m/XX:MaxMetaspaceSize=${MAXSIZE,,}/g" -i $SERVER_HOME/bin/dmk.sh
    sed "s/Xmx1024m/Xmx${MAXSIZE,,}/g" -i $SERVER_HOME/bin/dmk.sh
    # shutdown on catastrophic out of memory error
    sed 's/XX:+HeapDumpOnOutOfMemoryError/XX:OnOutOfMemoryError="shutdown -r"/g' -i $SERVER_HOME/bin/dmk.sh
    # output error to the main log
    sed 's@ErrorFile="$KERNEL_HOME/serviceability/error.log"@ErrorFile="$SERVER_HOME/serviceability/logs/log.log"@g' -i $SERVER_HOME/bin/dmk.sh

    # output log
    tail -F --retry "$log" || true &

    # check for any memory issues:
    match="java.lang.OutOfMemoryError"
    while sleep 60; do if fgrep --quiet "$match" "$log"; then cp -fv "$log" "/tmp/error/$(date '+%Y-%m-%d_%H-%M').log" ; pkill -u developer; exit 0; fi; done &

    # start virgo server
    $SERVER_HOME/bin/startup.sh
fi
