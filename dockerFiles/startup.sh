#!/bin/bash

# Mitigation for CVE-2026-31431 / Copy Fail: prevent algif_aead module loading and unload it if possible.
if command -v modprobe >/dev/null 2>&1; then
  mkdir -p /etc/modprobe.d
  printf '%s\n' 'install algif_aead /bin/false' 'blacklist algif_aead' > /etc/modprobe.d/disable-algif-aead.conf
fi
if command -v rmmod >/dev/null 2>&1; then
  rmmod algif_aead 2>/dev/null || true
fi

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
    grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/
    grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/ | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g"
    echo "Client SOLR query cache Server: ${SOLR_SERVER/ontology/vfb_json}"
    grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi
    grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/vfb_json/select@${SOLR_SERVER/ontology/vfb_json}@g"
    echo "Google Analytics code: ${googleAnalyticsSiteCode}"
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@ga('create', 'UA-[0-9]*-[0-9]'@ga('create', '${googleAnalyticsSiteCode}'@g"
    echo "useSSL:${USESSL}"
    grep -rls '"useSsl"' $HOME/workspace/org.geppetto.frontend/
    grep -rls '"useSsl"' $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\"[[:space:]]*:[[:space:]]*\(true\|false\)@\"useSsl\": ${USESSL}@g"

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

    # --- Relax Tomcat/Virgo HTTP connector to accept VFB characters in request targets ---
    # Tomcat rejects | [ ] { } ^ in the request target per RFC 3986 / RFC 7230, logging
    # "Invalid character found in the request target" and dropping the request. VFB IDs and
    # query params legitimately contain these characters, so relax the HTTP connector(s).
    # The patch prints what it matched/changed so it is verifiable in the container log
    # (a silent no-op here previously bit us when patching Virgo config from startup.sh).
    echo "Relaxing Tomcat connector allowed characters ( | [ ] { } ^ )..."
    PYBIN=$(command -v python3 || command -v python)
    if [ -n "$PYBIN" ]; then
      "$PYBIN" - <<'PYEOF'
import os, re, sys
sh = os.environ.get('SERVER_HOME', '')
cfgs = []
for root, dirs, files in os.walk(sh):
    if 'tomcat-server.xml' in files:
        cfgs.append(os.path.join(root, 'tomcat-server.xml'))
if not cfgs:
    print("  WARNING: no tomcat-server.xml found under SERVER_HOME=" + repr(sh) + "; connector NOT relaxed")
    sys.exit(0)
relax = ' relaxedPathChars="[]|{}^" relaxedQueryChars="[]|{}^"'
pat = re.compile(r'<Connector\b[^>]*>', re.IGNORECASE)
for cfg in cfgs:
    fh = open(cfg); data = fh.read(); fh.close()
    state = {'changed': False}
    def repl(m):
        tag = m.group(0)
        if 'relaxedQueryChars' in tag or re.search('AJP', tag, re.IGNORECASE):
            return tag  # already relaxed, or an AJP connector we leave alone
        state['changed'] = True
        return '<Connector' + relax + tag[len('<Connector'):]
    new = pat.sub(repl, data)
    if state['changed']:
        fh = open(cfg, 'w'); fh.write(new); fh.close()
        print("  Patched Tomcat connector(s) in: " + cfg)
    else:
        print("  No change (already relaxed or no HTTP connector): " + cfg)
    for line in new.splitlines():
        if '<Connector' in line or 'relaxedQueryChars' in line:
            print("    " + line.strip())
PYEOF
    else
      echo "  WARNING: no python interpreter found; Tomcat connector NOT relaxed"
    fi

    # start virgo server
    $SERVER_HOME/bin/startup.sh
fi
