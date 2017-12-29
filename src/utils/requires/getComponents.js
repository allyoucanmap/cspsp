/* copyright 2017, stefano bovio @allyoucanmap. */

const requireComponents = require.context('../../components/', true, /\.vue$/);
const components = requireComponents.keys().reduce((cmpnnts, key) =>
  ({...cmpnnts, [key.replace(/\.vue|\.\//g, '')]: requireComponents(key).default}),
  {}
);
export default components;
