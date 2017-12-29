/* copyright 2017, stefano bovio @allyoucanmap. */

import actions from '../actions/code';
import StyleUtils from '../utils/StyleUtils';

export default {
  state: {
    styles: {},
    format: 'image/png'
  },
  mutations: {
    [actions.UPDATE_CODE](state, payload) {
      const code = {...payload.code};
      if (code.language === 'css') {
        const json = StyleUtils.toJSON(code.code);
        const sld = StyleUtils.toSLD(json);
        state.styles = {...state.styles, [code.url + ':' + code.name]: {json, sld, css: code.code}};
      } else if (code.language === 'sld') {
        const css = StyleUtils.toCSS(code.code);
        const json = StyleUtils.toJSON(css);
        state.styles = {...state.styles, [code.url + ':' + code.name]: {json, sld: code.code, css}};
      } else if (code.language === 'json') {
        const sld = StyleUtils.toSLD(code.code);
        const css = StyleUtils.toCSS(sld);
        state.styles = {...state.styles, [code.url + ':' + code.name]: {json: code.code, sld, css}};
      }
    },
    [actions.CHANGE_FORMAT](state, payload) {
      state.format = payload.format;
    }
  }
}
