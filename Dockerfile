FROM metacell/java-virgo-maven:development

LABEL maintainer="rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

VOLUME /tmp/error

#SET TAG/BRANCH to use:
ARG geppettoRelease=vfb_20200604_a
ARG geppettoModelRelease=vfb_20200604_a
ARG geppettoCoreRelease=VFBv2.2.0
ARG geppettoSimulationRelease=VFBv2.1.0.2
ARG geppettoDatasourceRelease=VFBv2.3.4
ARG geppettoModelSwcRelease=v1.0.1
ARG geppettoFrontendRelease=VFBv2.1.0.7
ARG geppettoClientRelease=VFBv2.2.9
ARG ukAcVfbGeppettoRelease=v2.2.4.7

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ARG VFB_PDB_SERVER_ARG=http://pdb.v4.virtualflybrain.org
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.v4.virtualflybrain.org
ARG VFB_OWL_SERVER_ARG=http://owl.virtualflybrain.org/kbs/vfb/
ARG VFB_R_SERVER_ARG=http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast
ARG SOLR_SERVER_ARG=https://solr.virtualflybrain.org/solr/ontology/select
ARG googleAnalyticsSiteCode_ARG=G-K7DDZVVXM7
ENV MAXSIZE=2G
ARG finalBuild=false
ENV USESSL=${finalBuild}
ARG build_type=production
ARG runtime_build=false
ENV RUNTIME_BUILD=${runtime_build}

ENV VFB_PDB_SERVER=${VFB_PDB_SERVER_ARG}
ENV VFB_TREE_PDB_SERVER=${VFB_TREE_PDB_SERVER_ARG}
ENV VFB_OWL_SERVER=${VFB_OWL_SERVER_ARG}
ENV VFB_R_SERVER=${VFB_R_SERVER_ARG}
ENV SOLR_SERVER=${SOLR_SERVER_ARG}
ENV googleAnalyticsSiteCode=${googleAnalyticsSiteCode_ARG}
ENV LOG4J_FORMAT_MSG_NO_LOOKUPS=true

RUN /bin/echo -e "\e[1;35mORIGIN BRANCH ------------ $originBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mTARGET BRANCH ------------ $targetBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mDEFAULT BRANCH ------------ $defaultBranch\e[0m"

# clear out the geppetto maven cache
RUN rm -rv /home/developer/.m2/repository/org/geppetto

RUN rm -rf /home/developer/geppetto

# get geppetto
RUN mkdir -p workspace &&\
  cd workspace &&\
  git clone http://github.com/openworm/org.geppetto.git -q -b "${geppettoRelease}" --single-branch 

WORKDIR $HOME/workspace

RUN git clone https://github.com/openworm/org.geppetto.model.git -q -b "${geppettoModelRelease}" --single-branch &&\
  cd org.geppetto.model &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/openworm/org.geppetto.core.git -q -b "${geppettoCoreRelease}" --single-branch &&\
  cd org.geppetto.core &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.core\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/openworm/org.geppetto.simulation.git -q -b "${geppettoSimulationRelease}" --single-branch &&\
  cd org.geppetto.simulation &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.simulation\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/openworm/org.geppetto.datasources.git -q -b "${geppettoDatasourceRelease}" --single-branch &&\
  cd org.geppetto.datasources &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.datasources\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git -q -b "${ukAcVfbGeppettoRelease}" --single-branch 

RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  echo "DEBUG=$DEBUG" && \
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs /bin/sed -i "s@Boolean debug=.*;@Boolean debug=$DEBUG;@g" &&\
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs cat | grep 'Boolean debug'

RUN cd uk.ac.vfb.geppetto &&\
  /bin/echo -e "\e[96mMaven install uk.ac.vfb.geppetto\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/openworm/org.geppetto.model.swc.git -q -b "${geppettoModelSwcRelease}" --single-branch &&\
  cd org.geppetto.model.swc &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model.swc\e[0m" &&\
  mvn ${mvnOpt} install

RUN git clone https://github.com/openworm/org.geppetto.frontend.git -q -b "${geppettoFrontendRelease}" --single-branch 

RUN cd $HOME/workspace/org.geppetto.frontend/src/main &&\
  git clone https://github.com/VirtualFlyBrain/geppetto-vfb.git -q -b "${targetBranch}" --single-branch &&\
  mv geppetto-vfb webapp

RUN cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${geppettoClientRelease}" "${geppettoClientRelease}" "${geppettoClientRelease}"

RUN echo "package.json" && cat $HOME/workspace/org.geppetto.frontend/src/main/webapp/package.json

COPY dockerFiles/geppetto.plan $HOME/workspace/org.geppetto/geppetto.plan
COPY dockerFiles/config.json $HOME/workspace/org.geppetto/utilities/source_setup/config.json
COPY dockerFiles/startup.sh /

# Set bash as the default shell for remaining RUN commands
SHELL ["/bin/bash", "-c"]

RUN if test "${runtime_build}" = "false" ; then \
    # Note dev/alpha servers in code: \
    echo "Any non-standard servers in use:" && \
    grep -rls dev.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/ || true && \
    grep -rls alpha.virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/ || true && \
    \
    # Swap servers \
    echo "Using Servers:" && \
    echo "Client Tree Browser Server: $VFB_TREE_PDB_SERVER" && \
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js || true && \
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBTree/VFBTreeConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true && \
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js || true && \
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBCircuitBrowser/circuitBrowserConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true && \
    grep -rls url $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/VFBGraph/graphConfiguration.js | xargs sed -i "s@https://pdb.*virtualflybrain.org@$VFB_TREE_PDB_SERVER@g" || true && \
    echo "Server PDB: $VFB_PDB_SERVER" && \
    grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true && \
    grep -rls "http://pdb.*virtualflybrain.org" $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://pdb.*virtualflybrain.org@$VFB_PDB_SERVER@g" || true && \
    echo "Server OWL: $VFB_OWL_SERVER" && \
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true && \
    grep -rls http://owl.virtualflybrain.org/kbs/vfb/ $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://owl.*virtualflybrain.org/kbs/vfb/@$VFB_OWL_SERVER@g" || true && \
    echo "Server OCPU R server: $VFB_R_SERVER" && \
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true && \
    grep -rls http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast@$VFB_R_SERVER@g" || true && \
    echo "Client SOLR Server: $SOLR_SERVER" && \
    grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/ || true && \
    grep -rls https://solr.*virtualflybrain.org/solr/ontology/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/components/configuration/ | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/ontology/select@$SOLR_SERVER@g" || true && \
    SOLR_JSON_SERVER=$(echo $SOLR_SERVER | sed 's/ontology/vfb_json/g') && \
    echo "Client SOLR query cache Server: $SOLR_JSON_SERVER" && \
    grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi || true && \
    grep -rls https://solr.*virtualflybrain.org/solr/vfb_json/select $HOME/workspace/org.geppetto.frontend/src/main/webapp/model/vfb.xmi | xargs sed -i "s@https://solr.*virtualflybrain.org/solr/vfb_json/select@$SOLR_JSON_SERVER@g" || true && \
    echo "Google Analytics code: ${googleAnalyticsSiteCode}" && \
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ || true && \
    grep -rls "ga('create', 'UA-" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@ga('create', 'UA-[0-9]*-[0-9]'@ga('create', '${googleAnalyticsSiteCode}'@g" || true && \
    echo "useSSL:${USESSL}" && \
    grep -rls "\"useSsl\":" $HOME/workspace/org.geppetto.frontend/ || true && \
    grep -rls "\"useSsl\":" $HOME/workspace/org.geppetto.frontend/ | xargs sed -i "s@\"useSsl\":.*,@\"useSsl\":${USESSL},@g" || true && \
    \
    set -e && \
    \
    # Frontend final build \
    cd $HOME/workspace/org.geppetto.frontend && \
    /bin/echo -e "\\e[96mMaven install org.geppetto.frontend\\e[0m" && \
    mvn ${mvnOpt} -DcontextPath=org.geppetto.frontend -DuseSsl=false install && \
    rm -rf src; \
fi

WORKDIR $HOME
RUN mkdir -p $SERVER_HOME/./repository/usr

EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
