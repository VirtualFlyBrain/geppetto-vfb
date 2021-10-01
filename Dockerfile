FROM metacell/java-virgo-maven:development

LABEL maintainer="rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

VOLUME /tmp/error

#SET TAG/BRANCH to use:
ARG geppettoRelease=vfb_20200604_a
ARG geppettoModelRelease=vfb_20200604_a
ARG geppettoCoreRelease=vfb_20200604_a
ARG geppettoSimulationRelease=vfb_20200604_a
ARG geppettoDatasourceRelease=vfb_20200604_a
ARG geppettoModelSwcRelease=v1.0.1
ARG geppettoFrontendRelease=development
ARG geppettoClientRelease=VFBv2.2.0.7
ARG ukAcVfbGeppettoRelease=download

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ARG VFB_PDB_SERVER_ARG=http://pdb.v4.virtualflybrain.org
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.v4.virtualflybrain.org
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
  git clone http://github.com/openworm/org.geppetto.git -q -b "${geppettoRelease}" --single-branch 

WORKDIR $HOME/workspace

RUN git clone https://github.com/openworm/org.geppetto.model.git -q -b "${geppettoModelRelease}" --single-branch &&\
  cd org.geppetto.model &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN git clone https://github.com/openworm/org.geppetto.core.git -q -b "${geppettoCoreRelease}" --single-branch &&\
  cd org.geppetto.core &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.core\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN git clone https://github.com/openworm/org.geppetto.simulation.git -q -b "${geppettoSimulationRelease}" --single-branch &&\
  cd org.geppetto.simulation &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.simulation\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN git clone https://github.com/openworm/org.geppetto.datasources.git -q -b "${geppettoDatasourceRelease}" --single-branch &&\
  cd org.geppetto.datasources &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.datasources\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN git clone https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git -q -b "${ukAcVfbGeppettoRelease}" --single-branch 

RUN export DEBUG=false; if test "$build_type" = "development" ; then export DEBUG=true; fi && \
  echo "DEBUG=$DEBUG" && \
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs /bin/sed -i "s@Boolean debug=.*;@Boolean debug=$DEBUG;@g" &&\
  /bin/grep -rls "Boolean debug=" $HOME/workspace/uk.ac.vfb.geppetto/src/ | xargs cat | grep 'Boolean debug'

RUN cd uk.ac.vfb.geppetto &&\
  /bin/echo -e "\e[96mMaven install uk.ac.vfb.geppetto\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

RUN git clone https://github.com/openworm/org.geppetto.model.swc.git -q -b "${geppettoModelSwcRelease}" --single-branch &&\
  cd org.geppetto.model.swc &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model.swc\e[0m" &&\
  mvn ${mvnOpt} install &&\
  rm -rf src

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

RUN if test ! "${build_type}" = "development" ; then /startup.sh || true; fi

WORKDIR $HOME
RUN mkdir -p $SERVER_HOME/./repository/usr

EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
