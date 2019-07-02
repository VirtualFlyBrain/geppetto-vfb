module.exports = {
  extends: [
    "./node_modules/@geppettoengine/geppetto-client/.eslintrc.js",
    "plugin:jest/recommended"
  ],
  plugins: ["jest"],
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true,
  },

};
