/* copyright 2017, stefano bovio @allyoucanmap. */

const leafletCSS = require('raw-loader!leaflet/dist/leaflet.css');
const codemirrorCSS = require('raw-loader!codemirror/lib/codemirror.css');

const lessFiles = require.context('raw-loader!../../less', true, /\.less$/);
const lessString = lessFiles.keys().reduce((style, key) =>  style + lessFiles(key), '');

export {
  leafletCSS,
  codemirrorCSS,
  lessString
};
