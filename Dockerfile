FROM rcourt/docker-vfb-geppetto

USER virgo

RUN cd /opt/geppetto/org.geppetto.frontend/src/main/webapp/extensions/geppetto-vfb && \
git stash && \
git pull 

RUN cd /opt/geppetto/org.geppetto && mvn install && chmod -R 777 /opt/geppetto

ENTRYPOINT ["/opt/VFB/startup.sh"]
