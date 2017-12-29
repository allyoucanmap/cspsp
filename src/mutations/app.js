/* copyright 2017, stefano bovio @allyoucanmap. */

import actions from '../actions/app';
import {head} from 'lodash';

const layerKeys = {
  bbox: true,
  name: true,
  url: true,
  isVector: true
};

export default {
  state: {
    start: false,
    styles: {},
    layers: [],
    loading: false,
    selected: {},
    visible: [],
    showList: true,
    showDoc: false
  },
  mutations: {
    [actions.START](state) {
      state.start = true;
    },
    [actions.LOAD_START](state) {
      state.loading = true;
    },
    [actions.LOAD_ERROR](state) {
      state.loading = false;
    },
    [actions.LOAD_END](state) {
      state.loading = false;
    },
    [actions.GET_CAPABILITIES](state, payload) {
      state.layers = [...payload.layers];
    },
    [actions.GET_FEATURE_INFO]() {

    },
    [actions.GET_STYLES](state, payload) {
      state.styles = {...payload.styles};
    },
    [actions.SELECT_LAYER](state, payload) {
      const selected = {...payload.selected};
      if (state.selected.url && state.selected.url + ':' + state.selected.name === selected.url + ':' + selected.name) {
        state.selected = {};
      } else {
        state.selected = {...Object.keys(selected).reduce((newSelected, key) => layerKeys[key] ? {...newSelected, [key]: selected[key]} : {...newSelected}, {})};
        const isVisible = head([...state.visible].filter(layer => payload.selected.url + ':' + payload.selected.name === layer.url + ':' + layer.name));
        if (!isVisible) {
          state.visible = [...state.visible, {...payload.selected}];
        }
      }
    },
    [actions.SET_LAYER_VISIBILITY](state, payload) {
      const isVisible = head([...state.visible].filter(layer => payload.layer.url + ':' + payload.layer.name === layer.url + ':' + layer.name));
      if (isVisible) {
        state.visible = [...state.visible].filter(layer => payload.layer.url + ':' + payload.layer.name !== layer.url + ':' + layer.name);
      } else {
        state.visible = [...state.visible, {...payload.layer}];
      }
    },
    [actions.CLOSE_LAYERS_LIST](state) {
      state.showList = false;
    },
    [actions.OPEN_LAYERS_LIST](state) {
      state.showList = true;
    },
    [actions.TOGGLE_DOC](state) {
      state.showDoc = !state.showDoc;
    }
  }
};
