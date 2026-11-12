var webpackBaseConfig = require('./webpack.config.js');
var extended = webpackBaseConfig();
extended.devServer = {
  progress : true,
  port : 8082,
  inline : true,

  /*
   * The bundles come from this dev server; the page and the static files it
   * does not build come from VFB_BACKEND: the live site by default, or the
   * image running on 8080 with VFB_BACKEND=http://localhost:8080
   * (docker run -p 8080:8080 virtualflybrain/geppetto-vfb:...).
   */
  proxy : [ {
    path : '/',
    target : process.env.VFB_BACKEND || 'https://v2.virtualflybrain.org',
    changeOrigin : true
  } ],
};

extended.devtool = 'source-map';

module.exports = extended;
