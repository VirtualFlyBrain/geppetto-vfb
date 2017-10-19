##Run with

* `casperjs test control-panel-tests.js --engine=slimerjs`
* `casperjs test query-tests.js --engine=slimerjs`
* `casperjs test VFBTests.js --engine=slimerjs` 

##Prereqs

* node.js
* npm

##Install with:

`npm install -g phantomjs npm install -g casperjs npm install -g slimerjs`

## Run with (in this folder):

To run the Control Panel Casper Tests:

`casperjs test control-panel-tests.js --engine=slimerjs` 

To run the Query Casper Tests:

`casperjs test query-tests.js --engine=slimerjs` 

To run the Term Info Casper Tests:

`casperjs test term-info-tests.js --engine=slimerjs` 

To run the Spotlight Casper Tests:

`casperjs test spotlight-tests.js --engine=slimerjs` 

To run the Stack Viewer Casper Tests:

`casperjs test stack-viewer-tests.js --engine=slimerjs` 

##documentation

* [CasperJS Test API documentation](http://docs.casperjs.org/en/latest/modules/tester.html) - assert API
* [CasperJS Core API documentation](http://docs.casperjs.org/en/latest/modules/casper.html) - actions like clicks.
* [Additional command-line options for casperjs](https://docs.slimerjs.org/current/configuration.html#command-line-options) (these can go after `--engine=slimerjs`)
