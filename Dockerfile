FROM slarson/virgo-tomcat-server:3.6.4-RELEASE-jre-7

MAINTAINER Robert Court "rcourt@ed.ac.uk"

ENV MAXSIZE=5G
ENV VFB_EMBEDDER_URL=https://www.virtualflybrain.org

USER root
# update maven: 
COPY dockerFiles/apache-maven-3.3.9-bin.tar.gz /tmp/apache-maven-3.3.9-bin.tar.gz
RUN cd /opt/ \
&& tar -zxvf /tmp/apache-maven-3.3.9-bin.tar.gz
RUN chmod -R 777 /opt
RUN apt-get update --fix-missing && apt-get install -y sshfs
ENV PATH=/opt/apache-maven-3.3.9/bin/:$PATH

# Forcing bash:
RUN rm /bin/sh && ln -s /bin/bash /bin/sh && rm /bin/sh.distrib && ln -s /bin/bash /bin/sh.distrib


USER virgo
# Geppetto:
ENV BRANCH_DEFAULT=development
ENV BRANCH_ORG_GEPPETTO=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_FRONTEND=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_CORE=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_MODEL=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_MODEL_SWC=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_DATASOURCES=$BRANCH_DEFAULT
ENV BRANCH_ORG_GEPPETTO_SIMULATION=$BRANCH_DEFAULT
ENV BRANCH_GEPPETTO-VFB=$BRANCH_DEFAULT
ENV BRANCH_UK_AC_VFB_GEPPETTO=$BRANCH_DEFAULT

RUN mkdir -p /opt/geppetto
ENV SERVER_HOME=/home/virgo/

RUN cd /opt/geppetto && \
echo cloning required modules: && \
git clone https://github.com/openworm/org.geppetto.git -b $BRANCH_ORG_GEPPETTO && \
git clone https://github.com/openworm/org.geppetto.frontend.git -b $BRANCH_ORG_GEPPETTO_FRONTEND && \
git clone https://github.com/VirtualFlyBrain/geppetto-vfb.git -b $BRANCH_GEPPETTO-VFB && \
git clone https://github.com/openworm/org.geppetto.core.git -b $BRANCH_ORG_GEPPETTO_CORE && \
git clone https://github.com/openworm/org.geppetto.model.git -b $BRANCH_ORG_GEPPETTO_MODEL && \
git clone https://github.com/openworm/org.geppetto.datasources.git -b $BRANCH_ORG_GEPPETTO_DATASOURCES && \
git clone https://github.com/openworm/org.geppetto.model.swc.git -b $BRANCH_ORG_GEPPETTO_MODEL_SWC && \
git clone https://github.com/openworm/org.geppetto.simulation.git -b $BRANCH_ORG_GEPPETTO_SIMULATION && \
git clone https://github.com/VirtualFlyBrain/uk.ac.vfb.geppetto.git -b $BRANCH_UK_AC_VFB_GEPPETTO && \
mv geppetto-vfb org.geppetto.frontend/src/main/webapp/extensions/

#Set GA keys TBD:Check if still needed
RUN grep -rnwl '/opt/geppetto/' -e "UA-45841517-1" | xargs sed -i "s|UA-45841517-1|UA-18509775-2|g" 

#Setup config:
COPY dockerFiles/pom.xml /opt/geppetto/org.geppetto/pom.xml.temp
COPY dockerFiles/geppetto.plan /opt/geppetto/org.geppetto/geppetto.plan
COPY dockerFiles/GeppettoConfiguration.json /opt/geppetto/org.geppetto.frontend/src/main/webapp/GeppettoConfiguration.json
RUN mkdir -p /opt/VFB
COPY dockerFiles/startup.sh /opt/VFB/startup.sh

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
REPO=${REPO/,]/]} && \
echo $REPO > org.geppetto/utilities/source_setup/config.json

# Build Geppetto:
RUN cd /opt/geppetto/org.geppetto && mvn --quiet clean install

#Remove redirect in tomcat config
RUN sed 's\redirectPort="8443"\\g' -i /home/virgo/configuration/tomcat-server.xml

#Start a logfile
RUN mkdir -p ~/serviceability/logs && \
echo 'Start of log...' > ~/serviceability/logs/log.log

ENTRYPOINT ["/opt/VFB/startup.sh"]
