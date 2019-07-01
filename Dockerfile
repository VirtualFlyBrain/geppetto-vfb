FROM metacell/java-virgo-maven:development

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ARG targetBranch=development
ARG originBranch=development
ARG defaultBranch=development

ARG googleAnalyticsSiteCode=UA-45841517-1

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
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.core.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.core &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.core\e[0m" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.simulation.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.simulation &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.simulation\e[0m" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.datasources.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.datasources &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.datasources\e[0m" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd uk.ac.vfb.geppetto &&\
  /bin/echo -e "\e[96mMaven install uk.ac.vfb.geppetto\e[0m" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.model.swc.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  cd org.geppetto.model.swc &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.model.swc\e[0m" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DskipTests --quiet install &&\
  rm -rf src

RUN ../copy.sh https://github.com/openworm/org.geppetto.frontend.git "${targetBranch}" "${originBranch}" "${defaultBranch}"

RUN cd $HOME/workspace/org.geppetto.frontend/src/main &&\
  $HOME/copy.sh https://github.com/VirtualFlyBrain/geppetto-vfb.git "${targetBranch}" "${originBranch}" "${defaultBranch}" &&\
  mv geppetto-vfb webapp

RUN cd $HOME/workspace/org.geppetto.frontend/src/main/webapp &&\
  $HOME/rename.sh https://github.com/openworm/geppetto-client.git "${targetBranch}" "${originBranch}" "${defaultBranch}"

RUN cd $HOME/workspace/org.geppetto.frontend &&\
  /bin/echo -e "\e[96mMaven install org.geppetto.frontend\e[0m" &&\
  grep -rnwl "$HOME/workspace/" -e "UA-45841517-1" | xargs sed -i "s|UA-45841517-1|${googleAnalyticsSiteCode}|g" &&\
  mvn -Dhttps.protocols=TLSv1.2 -DcontextPath=org.geppetto.frontend -DuseSsl=false -DskipTests install &&\
  rm -rf src

COPY dockerFiles/geppetto.plan $HOME/workspace/org.geppetto/geppetto.plan
COPY dockerFiles/config.json $HOME/workspace/org.geppetto/utilities/source_setup/config.json
COPY dockerFiles/startup.sh /

WORKDIR $HOME
RUN mkdir rm $SERVER_HOME/./repository/usr
RUN cd $HOME/workspace/org.geppetto/utilities/source_setup && python update_server.py


EXPOSE 8080
EXPOSE 8443
CMD [ "/bin/bash", "-c", "/startup.sh" ]
