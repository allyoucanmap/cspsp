/* copyright 2017, stefano bovio @allyoucanmap. */

import Vue from 'vue';
import store from './store.js';
import AmGrid from './layouts/AmGrid.vue';

const app = new Vue({
  el: '#app',
  store,
  components: {
    'c-splash-splash': AmGrid
  },
  template: '<c-splash-splash></c-splash-splash>'
});

export default app;
