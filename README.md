[![Build Status](https://travis-ci.org/VirtualFlyBrain/geppetto-vfb.svg?branch=master)](https://travis-ci.org/VirtualFlyBrain/geppetto-vfb)[![Docker Hub](https://www.shippable.com/assets/images/logos/docker-hub.jpg)](https://hub.docker.com/r/virtualflybrain/geppetto-vfb/)

# geppetto-vfb
Virtual Fly Brain project running on Geppetto

Main docker build with customisation code.

To run tests:

Install locally packages:

``npm install jest@24.8.0 puppeteer@1.17.0 jest-puppeteer@4.3.0 @babel/preset-env@7.4.5 url-join@4.0.0 @babel/core@7.4.5``

Then navigate to folder 'geppetto-vfb/tests/jest/vfb' and run:

``npm test``

This will run the tests against the local server 'localhost:8080'.
If you want to run tests against a VFB version deployed somewhere else, run the same command but with parameter 'url', as in:

``url=http://v2-dev2.virtualflybrain.org/org.geppetto.frontend npm test``

or 

``url=http://localhost:8081/org.geppetto.frontend npm test``