const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');

let geppettoConfig;
try {
  geppettoConfig = require('./GeppettoConfiguration.json');
  console.log('\nLoaded Geppetto config from file');
} catch (e) {
  console.error('\nFailed to load Geppetto Configuration');
}

const geppetto_base_path = 'node_modules/@geppettoengine/geppetto-client';
const geppetto_client_path = `${geppetto_base_path}/geppetto-client`;

const publicPath = path.join("/", geppettoConfig.contextPath, "geppetto/build/");
console.log(`\nThe public path (used by the main bundle when including split bundles) is: ${publicPath}`);

const isProduction = process.argv.indexOf('-p') >= 0;
console.log(`\nBuilding for a ${(isProduction ? "production" : "development")} environment`);

const availableExtensions = [
  { from: path.resolve(__dirname, geppetto_client_path, "static/*"), to: 'static', flatten: true },
  { from: path.resolve(__dirname, "static"), to: 'static' },
  { from: 'model/*', to: './', flatten: true },
  { from: 'images/*', to: './', flatten: true }
];

console.log(availableExtensions);

module.exports = function (env) {
  if (env !== undefined) {
    console.log(env);
    if (env.contextPath) {
      geppettoConfig.contextPath = env.contextPath;
    }
    if (env.useSsl) {
      geppettoConfig.useSsl = JSON.parse(env.useSsl);
    }
    if (env.noTest) {
      geppettoConfig.noTest = JSON.parse(env.noTest);
    }
    if (env.embedded) {
      geppettoConfig.embedded = JSON.parse(env.embedded);
    }
    if (env.embedderURL) {
      geppettoConfig.embedderURL = env.embedderURL;
    }
  }

  console.log('Geppetto configuration \n');
  console.log(JSON.stringify(geppettoConfig, null, 2), '\n');
  
  const entries = {
    main: path.resolve(__dirname, "Main.js"),
    admin: path.resolve(__dirname, geppetto_client_path, "js/pages/admin/admin.js"),
  };

  console.log(`\nThe Webpack entries are:`);
  console.log(entries);

  return {
    entry: entries,

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'common',                   
            minChunks: 2,
            chunks: 'initial',
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    },
    
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].bundle.js',
      publicPath: publicPath
    },
    plugins: [
      new CopyWebpackPlugin(availableExtensions),
      new HtmlWebpackPlugin({
        filename: 'geppetto.vm',
        template: path.resolve(__dirname, geppetto_client_path, 'js/pages/geppetto/geppetto.ejs'),
        GEPPETTO_CONFIGURATION: geppettoConfig,
        chunks: []
      }),
      new HtmlWebpackPlugin({
        filename: 'admin.vm',
        template: path.resolve(__dirname, geppetto_client_path, 'js/pages/admin/admin.ejs'),
        GEPPETTO_CONFIGURATION: geppettoConfig,
        chunks: []
      }),
      new HtmlWebpackPlugin({
        filename: 'dashboard.vm',
        template: path.resolve(__dirname, geppetto_client_path, 'js/pages/dashboard/dashboard.ejs'),
        GEPPETTO_CONFIGURATION: geppettoConfig,
        chunks: []
      }),
      new HtmlWebpackPlugin({
        filename: '../WEB-INF/web.xml',
        template: path.resolve(__dirname, 'WEB-INF/web.ejs'),
        GEPPETTO_CONFIGURATION: geppettoConfig,
        chunks: []
      }),
      new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'), } }),
      new MiniCssExtractPlugin({ filename: '[name].css' })
    ],

    resolve: {
      alias: {
        root: path.resolve(__dirname),
        '@geppettoengine/geppetto-client': path.resolve(__dirname, `${geppetto_client_path}/js`),
        '@geppettoengine/geppetto-ui': path.resolve(__dirname, `${geppetto_base_path}/geppetto-ui/src`),
        '@geppettoengine/geppetto-core': path.resolve(__dirname, `${geppetto_base_path}/geppetto-core/src`),
        geppetto: path.resolve(__dirname, `${geppetto_client_path}/js/pages/geppetto/GEPPETTO.js`),
        '@geppettoengine/geppetto-client-initialization': path.resolve(__dirname, `${geppetto_client_path}/js/pages/geppetto/main`),
        handlebars: 'handlebars/dist/handlebars.js'
      },
      extensions: ['*', '.js', '.json', '.ts', '.tsx', '.jsx'],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: [/ami.min.js/, /node_modules\/(?!(@geppettoengine\/geppetto-client)\/).*/],
          loader: 'babel-loader',
          query: { 
            presets: [['@babel/preset-env', { "modules": false }], '@babel/preset-react'],
            plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"],
            sourceType: "unambiguous"
          }
        },
        {
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader"
        },
        {
          test: /Dockerfile/,
          loader: 'ignore-loader'
        },
        {
          test: /\.(py|jpeg|svg|gif|css|jpg|md|hbs|dcm|gz|xmi|dzi|sh|obj|yml|nii)$/,
          loader: 'ignore-loader'
        },
        {
          test: /\.(png|eot|ttf|woff|woff2|svg)(\?[a-z0-9=.]+)?$/,
          loader: 'url-loader?limit=100000'
        },
        {
          test: /\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: "css-loader" }
          ]
        },
        {
          test: /\.less$/,
          loader: `style-loader!css-loader!less-loader?{"modifyVars":{"url":"${path.resolve(__dirname, geppettoConfig.themes)}"}}`
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        }
      ]
    },
    node: {
      fs: 'empty',
      child_process: 'empty',
      module: 'empty'
    }
  };
};
