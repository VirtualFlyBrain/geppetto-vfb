FROM metacell/java-virgo-maven:development

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

#SET TAG/BRANCH to use:
ARG geppettoRelease=VFBv2.1.0.1
ARG geppettoModelRelease=VFBv2.1.0.1
ARG geppettoCoreRelease=VFBv2.1.0.1
ARG geppettoSimulationRelease=VFBv2.1.0.1
ARG geppettoDatasourceRelease=VFBv2.1.0.1
ARG geppettoModelSwcRelease=VFBv2.1.0.1
ARG geppettoFrontendRelease=VFBv2.1.0.1
ARG geppettoClientRelease=VFBv2.1.0.1
ARG ukAcVfbGeppettoRelease=v2.1.0.0

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ENV VFB_PDB_SERVER=http://pdb.virtualflybrain.org
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
  ../copy.sh http://github.com/openworm/org.geppetto.git "${geppettoRelease}" "${geppettoRelease}" "${geppettoRelease}"

WORKDIR $HOME/workspace
# checkout $targetBranch
RUN ../copy.sh https://github.com/openworm/org.geppetto.model.git "${geppettoModelRelease}" "${geppettoModelRelease}" "${geppettoModelRelease}" &&\
  cd org.geppetto.model &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.core.git "${geppettoCoreRelease}" "${geppettoCoreRelease}" "${geppettoCoreRelease}" &&\
  cd org.geppetto.core &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.core\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.simulation.git "${geppettoSimulationRelease}" "${geppettoSimulationRelease}" "${geppettoSimulationRelease}" &&\
  cd org.geppetto.simulation &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.simulation\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.datasources.git "${geppettoDatasourceRelease}" "${geppettoDatasourceRelease}" "${geppettoDatasourceRelease}" &&\
  cd org.geppetto.datasources &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.datasources\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git "${ukAcVfbGeppettoRelease}" "${ukAcVfbGeppettoRelease}" "${ukAcVfbGeppettoRelease}"
  
RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs /bin/sed -i "s@Boolean debug=.*;@Boolean debug=$DEBUG;@g"

RUN cd uk.ac.vfb.geppetto &&\
  /bin/echo -e "\e[96mMaven install uk.ac.vfb.geppetto\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.model.swc.git "${geppettoModelSwcRelease}" "${geppettoModelSwcRelease}" "${geppettoModelSwcRelease}" &&\
  cd org.geppetto.model.swc &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model.swc\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.frontend.git "${geppettoFrontendRelease}" "${geppettoFrontendRelease}" "${geppettoFrontendRelease}"

RUN cd $HOME/workspace/org.geppetto.frontend/src/main &&\
  $HOME/copy.sh https://github.com/VirtualFlyBrain/geppetto-vfb.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  mv geppetto-vfb webapp

RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  /bin/grep -rls "window.location.reload(true)" $HOME/workspace/org.geppetto.frontend/src/main/webapp | xargs /bin/sed -i "s@window.location.reload(true);@window.location.reload($DEBUG);@g"

RUN cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${geppettoClientRelease}" "${geppettoClientRelease}" "${geppettoClientRelease}"

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
