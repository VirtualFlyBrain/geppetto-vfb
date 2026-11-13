# syntax=docker/dockerfile:1
# Virtual Fly Brain (Geppetto v2) is a static web app: the browser loads the
# page, the webpack bundles and the model files (vfb.json + vfb.xmi) from here
# and fetches everything else itself (VFBquery, the data hosts, Solr). Nothing
# talks to a server process, so the image is a node build and nginx.

FROM node:22.23.4-bookworm AS build

# webpack 4 hashes with md4, which OpenSSL 3 (Node 17+) only offers as a
# legacy algorithm
ENV NODE_OPTIONS=--openssl-legacy-provider

LABEL maintainer="rcourt@ed.ac.uk"

# Endpoints compiled into the client configuration (see dockerFiles/configure.sh)
ARG VFB_TREE_PDB_SERVER_ARG=https://pdb.virtualflybrain.org
ARG SOLR_SERVER_ARG=https://solr.virtualflybrain.org/solr/ontology/select

WORKDIR /webapp

# The client is a GitHub dependency pinned by package-lock.json (npm ci
# installs exactly what the lock says). Fail fast if the lock doesn't install
# the client package.json asks for, rather than silently shipping an older one
# (dockerFiles/check-client-pin.js reads both lockfile formats).
COPY package.json package-lock.json ./
COPY dockerFiles/check-client-pin.js dockerFiles/
# The lock can resolve the client over ssh (npm 7+ writes git+ssh URLs); the
# build has no ssh key, so fetch from GitHub over https instead.
RUN git config --global url."https://github.com/".insteadOf git://github.com/ \
  && git config --global --add url."https://github.com/".insteadOf ssh://git@github.com/ \
  && node dockerFiles/check-client-pin.js \
  && npm ci

COPY . .
RUN --mount=type=secret,id=upload_token,required=false \
  UPLOAD_TOKEN="$(cat /run/secrets/upload_token 2>/dev/null || true)" \
  VFB_TREE_PDB_SERVER="${VFB_TREE_PDB_SERVER_ARG}" SOLR_SERVER="${SOLR_SERVER_ARG}" sh dockerFiles/configure.sh \
  && npm run build

FROM nginx:1.27-alpine

COPY dockerFiles/nginx.conf /etc/nginx/conf.d/default.conf
# what the page links to: the bundles and model files, and the client's own
# stylesheets, images and help files, which it references by node_modules path
COPY --from=build /webapp/build /srv/org.geppetto.frontend/geppetto/build
COPY --from=build /webapp/node_modules/@geppettoengine/geppetto-client/geppetto-client \
  /srv/org.geppetto.frontend/geppetto/node_modules/@geppettoengine/geppetto-client/geppetto-client

EXPOSE 8080
