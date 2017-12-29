/* copyright 2017, stefano bovio @allyoucanmap. */

import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);

const requireActions = require.context('./actions/', true, /\.js$/);
const requireMutations = require.context('./mutations/', true, /\.js$/);
const requireGetters = require.context('./getters/', true, /\.js$/);
const modules = requireActions.keys().reduce((mdls, key) => {
  const {actions} = requireActions(key).default;
  const {mutations, state = {}} = requireMutations(key).default;
  const getters = requireGetters(key).default;
  return actions && mutations && {
    ...mdls,
    [key.replace(/\.js|\.\//g, '')]: {
      namespaced: true,
      actions: {...actions},
      mutations: {...mutations},
      state: {...state},
      getters: {...getters}
    }
  } || {...mdls};
}, {});

const store = new Vuex.Store({
  modules,
  plugins: process.env.NODE_ENV !== 'production'
    ? [createLogger({collapsed: false})]
    : []
});

export default store;
