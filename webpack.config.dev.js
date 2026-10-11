var webpackBaseConfig = require('./webpack.config.js');
var extended = webpackBaseConfig();
extended.devServer = {
  progress : true,
  port : 8081,
  inline : true,

  /*
   * The bundles come from this dev server; the page and the static files it
   * does not build come from the image running on 8080
   * (docker run -p 8080:8080 virtualflybrain/geppetto-vfb:...).
   */
  proxy : [ {
    path : '/',
    target : 'http://localhost:8080/'
  } ],
};

extended.devtool = 'source-map';

module.exports = extended;
