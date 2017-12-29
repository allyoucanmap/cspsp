const path = require('path');
const DefinePlugin = require("webpack/lib/DefinePlugin");
const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");

let webpackConfig = require('./webpack.config.js');

webpackConfig.entry = [
  './client.js'
];

webpackConfig.output = {
  path: path.join(__dirname, 'dist'),
  filename: 'cspsp.js',
  publicPath: ''
};

webpackConfig.plugins = [
  new DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new ParallelUglifyPlugin({
    uglifyJS: {
      sourceMap: false,
      compress: {warnings: false},
      mangle: true
    }
  })
];

webpackConfig.resolve = {
    alias: {
        vue: 'vue/dist/vue.min.js'
    }
};

webpackConfig.devtool = undefined;

module.exports = webpackConfig;
