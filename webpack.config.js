const webpack = require('webpack');
const path = require('path');

module.exports = {
    devtool: 'eval',
    context: path.join(__dirname, 'src'),
    target: 'web',
    entry: [
        'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr&timeout=20000',
        './client.js'
    ],
    output: {
        path: path.join(__dirname, 'www'),
        filename: 'cspsp.js',
        publicPath: 'http://localhost:3000/assets/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        loaders: [{
            test: /\.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        }, {
            test: /\.vue?$/,
            loader: 'vue-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    }
};
