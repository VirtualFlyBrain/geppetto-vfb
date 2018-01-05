FROM rcourt/docker-vfb-geppetto

USER virgo

RUN cd /opt/geppetto/org.geppetto.frontend/src/main/webapp/extensions/geppetto-vfb && \
git config user.name travis && \
git config user.email travis@server.com && \
git stash && \
git pull 

RUN cd /opt/geppetto/org.geppetto && mvn install && chmod -R 777 /opt/geppetto

ENTRYPOINT ["/opt/VFB/startup.sh"]
