FROM metacell/java-virgo-maven:development

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ENV VFB_PDB_SERVER=http://pdb-dev.virtualflybrain.org
ENV VFB_OWL_SERVER=http://owl.virtualflybrain.org/kbs/vfb/ß
ENV VFB_R_SERVER=http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast
ENV SOLR_SERVER=https://solr.virtualflybrain.org/solr/ontology/select
ARG googleAnalyticsSiteCode=UA-18509775-2
ENV MAXSIZE=2G
ENV USESSL=false

RUN /bin/echo -e "\e[1;35mORIGIN BRANCH ------------ $originBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mTARGET BRANCH ------------ $targetBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mDEFAULT BRANCH ------------ $defaultBranch\e[0m"

# get geppetto
RUN mkdir -p workspace &&\
  cd workspace &&\
  ../copy.sh http://github.com/openworm/org.geppetto.git "${targetBranch}" "${originBranch}" "${defaultBranch}"

WORKDIR $HOME/workspace
# checkout $targetBranch
RUN ../copy.sh https://github.com/openworm/org.geppetto.model.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.model &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.core.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.core &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.core\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.simulation.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.simulation &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.simulation\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.datasources.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.datasources &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.datasources\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git "${targetBranch}" "${originBranch}" "${defaultBranch}"
  
RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs /bin/sed -i "s@Boolean debug=.*;@Boolean debug=$DEBUG;@g"

RUN cd uk.ac.vfb.geppetto &&\
  /bin/echo -e "\e[96mMaven install uk.ac.vfb.geppetto\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.model.swc.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.model.swc &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model.swc\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.frontend.git "${targetBranch}" "${originBranch}" "${defaultBranch}"

RUN cd $HOME/workspace/org.geppetto.frontend/src/main &&\
  $HOME/copy.sh https://github.com/VirtualFlyBrain/geppetto-vfb.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  mv geppetto-vfb webapp

RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  /bin/grep -rls "window.location.reload(true)" $HOME/workspace/org.geppetto.frontend/src/main/webapp | xargs /bin/sed -i "s@window.location.reload(true);@window.location.reload($DEBUG);@g"

RUN cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${targetBranch}" "${originBranch}" "${defaultBranch}"

RUN cd $HOME/workspace/org.geppetto.frontend &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m" &&\
  mvn ${mvnOpt} clean install &&\
  rm -rf src

COPY dockerFiles/geppetto.plan $HOME/workspace/org.geppetto/geppetto.plan
COPY dockerFiles/config.json $HOME/workspace/org.geppetto/utilities/source_setup/config.json
COPY dockerFiles/startup.sh /

RUN if [[ ( "${targetBranch}" == "v*" ) && ("${USESSL}" == "true") ]]; then /startup.sh || true; fi

WORKDIR $HOME
RUN mkdir -p $SERVER_HOME/./repository/usr

EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
