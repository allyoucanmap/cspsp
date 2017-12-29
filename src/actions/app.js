/* copyright 2017, stefano bovio @allyoucanmap. */

import appAPI from '../api/app';

const START = 'START';
const LOAD_START = 'LOAD_START';
const LOAD_END = 'LOAD_END';
const LOAD_ERROR = 'LOAD_ERROR';
const GET_CAPABILITIES = 'GET_CAPABILITIES';
const GET_FEATURE_INFO = 'GET_FEATURE_INFO';
const GET_STYLES = 'GET_STYLES';
const SELECT_LAYER = 'SELECT_LAYER';
const SET_LAYER_VISIBILITY = 'SET_LAYER_VISIBILITY';
const CLOSE_LAYERS_LIST = 'CLOSE_LAYERS_LIST';
const OPEN_LAYERS_LIST = 'OPEN_LAYERS_LIST';
const TOGGLE_DOC = 'TOGGLE_DOC';

const loadStart = function({ commit }) {
  commit(LOAD_START);
};

const loadEnd = function({ commit }) {
  commit(LOAD_END);
};

const loadError = function({ commit }, e) {
  commit({
    type: LOAD_ERROR,
    e
  });
};

const closeLayerList = function({ commit }) {
  commit({
    type: CLOSE_LAYERS_LIST
  });
};

const openLayerList = function({ commit }) {
  commit({
    type: OPEN_LAYERS_LIST
  });
};

const toggleDoc = function({ commit }) {
  commit(TOGGLE_DOC);
};

export default {
  actions: {
    start({ commit }) {
      commit({
        type: START
      });
    },
    getStyle({ commit }, styles) {
      commit({
        type: GET_STYLES,
        styles
      });
    },
    loadStart,
    loadError,
    loadEnd,
    closeLayerList,
    openLayerList,
    toggleDoc,
    getCapabilities({ commit }, options) {
      appAPI.getCapabilities(options,
        () => {
          loadStart({ commit });
        },
        layers => {
          commit({
            type: GET_CAPABILITIES,
            layers: [...layers]
          });
          loadEnd({ commit });
        },
        e => {
          loadError({ commit }, {name: GET_CAPABILITIES, error: e});
        }
      );
    },
    getFeatureInfo({ commit }, options) {
      appAPI.getFeatureInfo(options,
        () => {
          loadStart({ commit });
        },
        data => {
          commit({
            type: GET_FEATURE_INFO,
            data
          });
          loadEnd({ commit });
        },
        e => {
          loadError({ commit }, {name: GET_FEATURE_INFO, error: e});
        }
      );
    },
    selectLayer({ commit }, selected) {
      commit({
        type: SELECT_LAYER,
        selected
      });
    },
    setLayerVisibility({ commit }, layer) {
      commit({
        type: SET_LAYER_VISIBILITY,
        layer
      });
    }
  },
  START,
  LOAD_START,
  LOAD_END,
  LOAD_ERROR,
  GET_CAPABILITIES,
  GET_FEATURE_INFO,
  GET_STYLES,
  SELECT_LAYER,
  SET_LAYER_VISIBILITY,
  CLOSE_LAYERS_LIST,
  OPEN_LAYERS_LIST,
  TOGGLE_DOC
};

