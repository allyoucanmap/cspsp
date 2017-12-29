/* copyright 2017, stefano bovio @allyoucanmap. */

const UPDATE_CODE = 'UPDATE_CODE';
const CHANGE_FORMAT = 'CHANGE_FORMAT';

export default {
  actions: {
    updateCode({commit}, code) {
      commit({
        type: UPDATE_CODE,
        code
      });
    },
    changeFormat({commit}, format) {
      commit({
        type: CHANGE_FORMAT,
        format
      });
    }
  },
  UPDATE_CODE,
  CHANGE_FORMAT
};
