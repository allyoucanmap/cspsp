/* eslint-disable no-console */

const express = require("express");
const path = require('path');
const config = require("../webpack.config.js");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const port = 3000;
const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
  hot: true,
  filename: 'cspsp.js',
  publicPath: 'http://localhost:3000/dist/',
  stats: {
    colors: true
  },
  historyApiFallback: true
}));

app.use(webpackHotMiddleware(compiler, {
  path: '/__webpack_hmr',
  heartbeat: 10 * 1000
}));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type, Accept');
  next();
});

app.use(express.static('./'));

app.use('http://localhost:3000/', function(req, res) {
  res.sendFile(path.resolve('./index.html'));
});

app.listen(port, function(error) {
  if (error) throw error;
  console.warn("Express server listening on port", port);
});


