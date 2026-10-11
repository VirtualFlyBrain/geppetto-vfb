# Virtual Fly Brain (Geppetto v2) is a static web app: the browser loads the
# page, the webpack bundles and the model files (vfb.json + vfb.xmi) from here
# and fetches everything else itself (VFBquery, the data hosts, Solr). Nothing
# talks to a server process, so the image is a node build and nginx.

FROM node:14.21.3-bullseye AS build

LABEL maintainer="rcourt@ed.ac.uk"

# Endpoints compiled into the client configuration (see dockerFiles/configure.sh)
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.v4.virtualflybrain.org
ARG SOLR_SERVER_ARG=https://solr.virtualflybrain.org/solr/ontology/select

WORKDIR /webapp

# The client is a GitHub dependency pinned by package-lock.json (npm ci
# installs exactly what the lock says). Fail fast if the lock and
# package.json disagree, rather than silently shipping an older client.
COPY package.json package-lock.json ./
# npm 6 tries git:// (and ssh) for a GitHub dependency before https; GitHub
# no longer serves git://, so go straight to https.
RUN git config --global url."https://github.com/".insteadOf git://github.com/ \
  && git config --global --add url."https://github.com/".insteadOf ssh://git@github.com/ \
  && node -e ' \
  const want = require("./package.json").dependencies["@geppettoengine/geppetto-client"]; \
  const lock = require("./package-lock.json").dependencies["@geppettoengine/geppetto-client"]; \
  console.log("geppetto-client: package.json " + want + ", lock " + lock.from + " -> " + lock.version); \
  if (lock.from !== "github:" + want) { console.error("package-lock.json does not pin " + want); process.exit(1); }' \
  && npm ci

COPY . .
RUN VFB_TREE_PDB_SERVER="${VFB_TREE_PDB_SERVER_ARG}" SOLR_SERVER="${SOLR_SERVER_ARG}" sh dockerFiles/configure.sh \
  && npm run build

FROM nginx:1.27-alpine

COPY dockerFiles/nginx.conf /etc/nginx/conf.d/default.conf
# what the page links to: the bundles and model files, and the client's own
# stylesheets, images and help files, which it references by node_modules path
COPY --from=build /webapp/build /srv/org.geppetto.frontend/geppetto/build
COPY --from=build /webapp/node_modules/@geppettoengine/geppetto-client/geppetto-client \
  /srv/org.geppetto.frontend/geppetto/node_modules/@geppettoengine/geppetto-client/geppetto-client

EXPOSE 8080
