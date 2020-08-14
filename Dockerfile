FROM metacell/java-virgo-maven:development

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

#SET TAG/BRANCH to use:
ARG geppettoRelease=vfb_20200604_a
ARG geppettoModelRelease=vfb_20200604_a
ARG geppettoCoreRelease=vfb_20200604_a
ARG geppettoSimulationRelease=vfb_20200604_a
ARG geppettoDatasourceRelease=vfb_20200604_a
ARG geppettoModelSwcRelease=v1.0.1
ARG geppettoFrontendRelease=development
ARG geppettoClientRelease=feature/200_b
ARG ukAcVfbGeppettoRelease=development

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ARG VFB_PDB_SERVER_ARG=http://pdb.virtualflybrain.org
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.virtualflybrain.org
ARG VFB_OWL_SERVER_ARG=http://owl.virtualflybrain.org/kbs/vfb/
ARG VFB_R_SERVER_ARG=http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast
ARG SOLR_SERVER_ARG=https://solr.virtualflybrain.org/solr/ontology/select
ARG googleAnalyticsSiteCode_ARG=UA-18509775-2
ENV MAXSIZE=2G
ARG finalBuild=false
ENV USESSL=${finalBuild}
ARG build_type=production

ENV VFB_PDB_SERVER=${VFB_PDB_SERVER_ARG}
ENV VFB_TREE_PDB_SERVER=${VFB_TREE_PDB_SERVER_ARG}
ENV VFB_OWL_SERVER=${VFB_OWL_SERVER_ARG}
ENV VFB_R_SERVER=${VFB_R_SERVER_ARG}
ENV SOLR_SERVER=${SOLR_SERVER_ARG}
ENV googleAnalyticsSiteCode=${googleAnalyticsSiteCode_ARG}

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
  echo "DEBUG=$DEBUG" && \
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs /bin/sed -i "s@Boolean debug=.*;@Boolean debug=$DEBUG;@g" &&\
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs cat | grep 'Boolean debug'

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

RUN cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${geppettoClientRelease}" "${geppettoClientRelease}" "${geppettoClientRelease}"

RUN echo "package.json" && cat $HOME/workspace/org.geppetto.frontend/src/main/webapp/package.json

COPY dockerFiles/geppetto.plan $HOME/workspace/org.geppetto/geppetto.plan
COPY dockerFiles/config.json $HOME/workspace/org.geppetto/utilities/source_setup/config.json
COPY dockerFiles/startup.sh /

RUN if test ! "${build_type}" = "development" ; then /startup.sh || true; fi

WORKDIR $HOME
RUN mkdir -p $SERVER_HOME/./repository/usr

EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
