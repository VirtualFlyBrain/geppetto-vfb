FROM java:8

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ENV MAXSIZE=5G
ENV VFB_EMBEDDER_URL=https://www.virtualflybrain.org
ENV VFB_PDB_SERVER=pdb.virtualflybrain.org
ENV VFB_OWL_SERVER=owl.virtualflybrain.org
ENV VFB_SOLR_SERVER=solr.virtualflybrain.org

USER root

COPY dockerFiles/sources.list /etc/apt/sources.list

RUN rm /etc/apt/sources.list.d/jessie-backports.list

RUN apt-get -o Acquire::Check-Valid-Until=false update && apt-get install -qq -y sudo xvfb 

RUN useradd -ms /bin/bash developer

RUN mkdir -p /home/developer && mkdir -p /etc/sudoers.d \
    echo "developer:x:1000:1000:Developer,,,:/home/developer:/bin/bash" >> /etc/passwd && \
    echo "developer:x:1000:" >> /etc/group && \
    echo "developer ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/developer && \
    chmod 0440 /etc/sudoers.d/developer && \
    chown developer:developer -R /home/developer && \
    chown root:root /usr/bin/sudo && chmod 4755 /usr/bin/sudo

USER developer
ENV HOME /home/developer
ENV WORKDIR /home/developer

# get maven 3.5.2
RUN sudo wget -q --no-verbose -O /tmp/apache-maven-3.5.2-bin.tar.gz http://archive.apache.org/dist/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz

# install maven
RUN sudo tar xzf /tmp/apache-maven-3.5.2-bin.tar.gz -C /opt/
RUN sudo ln -s /opt/apache-maven-3.5.2 /opt/maven
RUN sudo ln -s /opt/maven/bin/mvn /usr/local/bin
RUN sudo rm -f /tmp/apache-maven-3.5.2-bin.tar.gz
ENV MAVEN_HOME /opt/maven
RUN mvn --version

#SOLR server:
ENV SOLR_SERVER=/solr/ontology/select

USER developer
# Geppetto:
ENV BRANCH_BASE=development
ENV BRANCH_DEFAULT=release_march_2019
ENV BRANCH_ORG_GEPPETTO=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_FRONTEND=vfb_geppetto_application
ENV BRANCH_ORG_GEPPETTO_CORE=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_MODEL=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_MODEL_SWC=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_DATASOURCES=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_SIMULATION=$BRANCH_DEFAULT
ENV BRANCH_GEPPETTO_VFB=vfb_geppetto_application
ENV BRANCH_UK_AC_VFB_GEPPETTO=$BRANCH_DEFAULT

USER root
RUN mkdir -p /opt/geppetto && chmod -R 777 /opt/geppetto
USER developer


RUN cd /opt/geppetto && \
echo cloning required modules: && \
git clone https://github.com/openworm/org.geppetto.git -b $BRANCH_BASE && \
cd org.geppetto && git checkout $BRANCH_ORG_GEPPETTO || true
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.frontend.git -b $BRANCH_BASE && \
cd org.geppetto.frontend/src/main && git checkout $BRANCH_ORG_GEPPETTO_FRONTEND && \
rm -rf webapp || true
RUN cd /opt/geppetto && \
git clone https://github.com/VirtualFlyBrain/geppetto-vfb.git -b $BRANCH_BASE && \
cd geppetto-vfb && git checkout $BRANCH_GEPPETTO_VFB || true
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.core.git -b $BRANCH_BASE && \
cd org.geppetto.core && git checkout $BRANCH_ORG_GEPPETTO_CORE || true
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.model.git -b $BRANCH_BASE && \
cd org.geppetto.model && git checkout $BRANCH_ORG_GEPPETTO_MODEL || true
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.datasources.git -b $BRANCH_BASE && \
cd org.geppetto.datasources && git checkout $BRANCH_ORG_GEPPETTO_DATASOURCES || true
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.model.swc.git -b $BRANCH_BASE && \
cd org.geppetto.model.swc && git checkout $BRANCH_ORG_GEPPETTO_MODEL_SWC || true 
RUN cd /opt/geppetto && \
git clone https://github.com/openworm/org.geppetto.simulation.git -b $BRANCH_BASE && \
cd org.geppetto.simulation && git checkout $BRANCH_ORG_GEPPETTO_SIMULATION || true 
RUN cd /opt/geppetto && \
git clone https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git -b $BRANCH_BASE && \
cd uk.ac.vfb.geppetto && git checkout $BRANCH_UK_AC_VFB_GEPPETTO || true 
RUN cd /opt/geppetto && \
sed -ir "s|url: \".*solr/ontology/select|url: \"${SOLR_SERVER}|g" geppetto-vfb/components/VFBMain.js && \
mv geppetto-vfb webapp && mv webapp org.geppetto.frontend/src/main/

#Set GA keys TBD:Check if still needed
RUN grep -rnwl '/opt/geppetto/' -e "UA-45841517-1" | xargs sed -i "s|UA-45841517-1|UA-18509775-2|g" 

#temp fix for results table layout
RUN sed -i "s/table-layout: fixed;/table-layout: auto;/g" /opt/geppetto/org.geppetto.frontend/src/main/webapp/js/components/interface/query/query.less

#Remove automatic capitalisation:
RUN grep -rnwl '/opt/geppetto/' -e "text-transform: capitalize;" | xargs sed -i "s|text-transform: capitalize;|text-transform: none;|g" 

#Setup config:
COPY dockerFiles/pom.xml /opt/geppetto/org.geppetto/pom.xml.temp
COPY dockerFiles/geppetto.plan /opt/geppetto/org.geppetto/geppetto.plan
COPY dockerFiles/GeppettoConfiguration.json /opt/geppetto/org.geppetto.frontend/src/main/webapp/GeppettoConfiguration.json
USER root
RUN mkdir -p /opt/VFB && chmod -R 777 /opt/VFB
USER developer
COPY dockerFiles/startup.sh /opt/VFB/startup.sh
USER root
RUN chmod -R 777 /opt/geppetto | true
RUN chmod +x /opt/VFB/*.sh | true
USER developer

#VIRGO INSTALL
USER root
RUN apt-get -o Acquire::Check-Valid-Until=false update && apt-get install -qq -y curl bsdtar locate
USER developer
RUN mkdir -p /home/developer/virgo
RUN curl -L 'http://www.eclipse.org/downloads/download.php?file=/virgo/release/VP/3.7.2.RELEASE/virgo-tomcat-server-3.7.2.RELEASE.zip&r=1' | bsdtar --strip-components 1 -C /home/developer/virgo -xzf -
RUN cp /opt/geppetto/org.geppetto/utilities/docker/geppetto/dmk.sh /home/developer/virgo/bin/
RUN rm /home/developer/virgo/configuration/java-server.profile
RUN cp /opt/geppetto/org.geppetto/utilities/docker/geppetto/java-server.profile /home/developer/virgo/configuration/
RUN rm /home/developer/virgo/configuration/tomcat-server.xml
RUN cp /opt/geppetto/org.geppetto/utilities/docker/geppetto/tomcat-server.xml /home/developer/virgo/configuration/
USER root
RUN chown developer /home/developer/virgo/bin/dmk.sh
USER developer
# Create repository/usr folder
RUN mkdir /home/developer/virgo/./repository/usr
RUN chmod u+x /home/developer/virgo/bin/*.sh
ENV SERVER_HOME /home/developer/virgo
#END VIRGO INSTALL

RUN echo Updating Modules... && \
cd /opt/geppetto/org.geppetto && \
VERSION=$(cat pom.xml | grep version | sed -e 's/\///g' | sed -e 's/\ //g' | sed -e 's/\t//g' | sed -e 's/<version>//g') && \
echo "$VERSION" && \
mv pom.xml.temp pom.xml && \
sed -i "s@%VERSION%@${VERSION}@g" pom.xml && \
sed -i "s@%VERSION%@${VERSION}@g" geppetto.plan

RUN cd /opt/geppetto && \
REPO='{"sourcesdir":"..//..//..//", "repos":[' && \
for folder in * ; do if [ "$folder" != "org.geppetto" ]; then REPO=${REPO}'{"name":"'$folder'", "url":"", "auto_install":"yes"},' ; fi; done; REPO=$REPO']}' && \
REPO=$(/bin/echo "${REPO}" | /bin/sed -e 's/,]/]/g') && \
/bin/echo "$REPO" > /opt/geppetto/org.geppetto/utilities/source_setup/config.json && \
cat /opt/geppetto/org.geppetto/utilities/source_setup/config.json

# Output amended config files
RUN echo -e "\n\n\n\n/opt/geppetto/org.geppetto.frontend/src/main/webapp/GeppettoConfiguration.json" && \
cat /opt/geppetto/org.geppetto.frontend/src/main/webapp/GeppettoConfiguration.json && \ 
echo -e "\n\n\n\n/opt/geppetto/org.geppetto/geppetto.plan" && \
cat /opt/geppetto/org.geppetto/geppetto.plan && \
echo -e "\n\n\n\n/opt/geppetto/org.geppetto/pom.xml" && \
cat /opt/geppetto/org.geppetto/pom.xml && \
echo -e "\n\n\n"
 
# Build Geppetto:
RUN cd /opt/geppetto/org.geppetto && mvn -Dhttps.protocols=TLSv1.2 --quiet clean install

# deploy Geppetto:
RUN cd /opt/geppetto/org.geppetto/utilities/source_setup && \
ls && cat *.json && \
python update_server.py 

ENTRYPOINT ["/opt/VFB/startup.sh"]
