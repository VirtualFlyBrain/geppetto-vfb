FROM metacell/java-virgo-maven:development

LABEL maintainer="rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development
ARG buildRef=development

VOLUME /tmp/error

#SET TAG/BRANCH to use:
ARG geppettoRelease=vfb_20200604_a
ARG geppettoModelRelease=vfb_20200604_a
ARG geppettoCoreRelease=VFBv2.2.0
ARG geppettoSimulationRelease=VFBv2.1.0.2
ARG geppettoDatasourceRelease=VFBv2.3.6
ARG geppettoModelSwcRelease=v1.0.1
ARG geppettoFrontendRelease=VFBv2.1.0.7
ARG geppettoClientRelease=VFBv2.3.1
ARG ukAcVfbGeppettoRelease=v2.2.4.20

ARG mvnOpt="-Dhttps.protocols=TLSv1.2 -DskipTests --quiet -Pmaster"

ARG VFB_PDB_SERVER_ARG=http://pdb.v4.virtualflybrain.org
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.v4.virtualflybrain.org
ARG VFB_OWL_SERVER_ARG=http://owl.virtualflybrain.org/kbs/vfb/
ARG VFB_R_SERVER_ARG=http://r.virtualflybrain.org/ocpu/library/vfbr/R/vfb_nblast
ARG SOLR_SERVER_ARG=https://solr.virtualflybrain.org/solr/ontology/select
ARG googleAnalyticsSiteCode_ARG=G-K7DDZVVXM7
ENV MAXSIZE=2G
ARG finalBuild=true
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

# Ensure root privileges for system-level kernel module configuration in build environments.
USER root

# Mitigation for CVE-2026-31431 / Copy Fail: disable AF_ALG authencesn support in-container.
RUN mkdir -p /etc/modprobe.d && \
  printf '%s\n' 'install algif_aead /bin/false' 'blacklist algif_aead' > /etc/modprobe.d/disable-algif-aead.conf

USER developer

RUN /bin/echo -e "\e[1;35mORIGIN BRANCH ------------ $originBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mTARGET BRANCH ------------ $targetBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mDEFAULT BRANCH ------------ $defaultBranch\e[0m" &&\
  /bin/echo -e "\e[1;35mBUILD REF ------------ $buildRef\e[0m"

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
  cd geppetto-vfb &&\
  git checkout -q "${buildRef}" &&\
  /bin/echo -e "\e[1;35mWEBAPP COMMIT ------------ $(git rev-parse HEAD)\e[0m" &&\
  cd .. &&\
  mv geppetto-vfb webapp

RUN /bin/echo -e "\e[1;35mGEPPETTO CLIENT RELEASE ------------ $geppettoClientRelease\e[0m" &&\
  cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${geppettoClientRelease}" "${geppettoClientRelease}" "${geppettoClientRelease}"

COPY dockerFiles/geppetto.plan $HOME/workspace/org.geppetto/geppetto.plan
COPY dockerFiles/config.json $HOME/workspace/org.geppetto/utilities/source_setup/config.json
COPY dockerFiles/startup.sh /
COPY dockerFiles/build.sh /

# Run build script if not in runtime mode
RUN if test "${runtime_build}" = "false" ; then /build.sh; fi

WORKDIR $HOME
RUN mkdir -p $SERVER_HOME/./repository/usr

EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
