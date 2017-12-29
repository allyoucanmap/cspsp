/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div :class="'am-code-panel am-code-' + type">

    <div
      :id="'am-code-' + type"
      class="am-code-textarea"/>
    <!--div class="am-code-toolbar">
      <div class="am-btn" v-if="showDrawEditor || showColorPicker"><span>X</span></div>
      <div class="am-btn" v-if="showDrawEditor || showColorPicker" v-on:click="$_am_replaceValue"><span>D</span></div>
    </div-->
    <div class="am-code-square">
      <am-draw-editor v-if="showDrawEditor"/>
      <am-keyboard v-if="showAudioEditor"/>
      <am-color-picker
        :value="param.value"
        v-if="showColorPicker"
        :on-change="$_am_updateColor"/>
    </div>
  </div>
</template>

<script>

  import codemirror from 'codemirror';
  import 'codemirror/mode/javascript/javascript';
  import 'codemirror/addon/search/searchcursor';
  import 'codemirror/mode/xml/xml';
  import '../lib/css';
  import AmDrawEditor from './AmDrawEditor.vue';
  import AmColorPicker from './AmColorPicker.vue';
  import AmKeyboard from './AmKeyboard.vue';
  import {head} from 'lodash';
  import {mapGetters, mapActions} from 'vuex';

  const hexToRGB = (hex) => {
      if (hex.length !== 7) {
          return null;
      }
      try {
        const bigInt = parseInt(hex.replace('#', ''), 16);
        return {
            r: (bigInt >> 16) & 255,
            g: (bigInt >> 8) & 255,
            b: bigInt & 255
        };
      } catch (e) {
        return null;
      }
  };

  const params = {
    fill: {
      color: v => hexToRGB(v),
      audio: v => v.match('audio')
    },
    stroke: {
      color: v => hexToRGB(v),
      audio: v => v.match('audio')
    },
    mark: {
      wkt: v => v.match('wkt')
    },
    pattern: {
      wkt: v => v.match('wkt')
    }
  };

  export default {
    components: {
      AmDrawEditor,
      AmColorPicker,
      AmKeyboard
    },
    props: {
      type: {
        type: String,
        default: 'css'
      }
    },
    data(){
      return {
        cm: {},
        code: '',
        param: {},
        cursors: {},
        lineTokens: {},
        showColorPicker: false,
        showDrawEditor: false,
        showAudioEditor: false,
        value: '',
        attributeValue: []
      }
    },
    computed: {
      ...mapGetters({
        selected: 'app/selected',
        codes: 'code/styles'
      })
    },
    watch: {
      code(newData, oldData) {
        if (oldData !== newData) {
          const cmDOM = document.getElementById('am-code-' + this.type);
          const atoms = cmDOM && cmDOM.getElementsByClassName('cm-atom');
          if (atoms) {
            for (let i = 0; i < atoms.length; i++) {
              const text = atoms[i].innerHTML;
              const color = hexToRGB(text);
              if (color) {
                const luminance = Math.sqrt(Math.pow(0.299 * color.r, 2) + Math.pow(0.587 * color.g, 2) + Math.pow(0.114 * color.b, 2));
                atoms[i].style.color = luminance > 85 ? '#000' : '#fff';
                atoms[i].style.backgroundColor = text;
              }
            }
          }
        }
      },
      param(newData) {
        this.value = '';
        if (newData.key && params[newData.key] && params[newData.key].color && params[newData.key].color(newData.value)) {
          this.showColorPicker = true;
        } else if (newData.key && params[newData.key] && params[newData.key].wkt && params[newData.key].wkt(newData.value)) {
          this.showDrawEditor = true;
        } else if (newData.key && params[newData.key] && params[newData.key].audio && params[newData.key].audio(newData.value)) {
          this.showAudioEditor = true;
        } else {
          this.$_am_resetEditors();
        }
      },
      selected(newData) {
        if (newData.name) {
          if (this.codes[newData.url + ':' + newData.name]
          && this.codes[newData.url + ':' + newData.name][this.type]) {
            this.cm.setValue(this.codes[newData.url + ':' + newData.name][this.type]);
          } else {
            this.cm.setValue('@layer: ' + newData.name + ';');
          }
        } else {
          this.cm.setValue('');
        }
      }
    },
    mounted() {
      this.cm = codemirror(document.querySelector('#am-code-' + this.type), {
        mode: { name: this.type },
        lineNumbers: true,
        lineWrapping: true
      });
      this.cm.on('change', this.$_am_onChange);
      this.cm.on('dblclick', this.$_am_onDoubleClick);
      this.cm.on('cursorActivity', this.$_am_onCursorActivity);
    },
    beforeDestroy() {
      this.cm.off('change', this.$_am_onChange);
      this.cm.off('dblclick', this.$_am_onDoubleClick);
      this.cm.off('cursorActivity', this.$_am_onCursorActivity);
    },
    methods: {
      ...mapActions({
        $_am_updateCode: 'code/updateCode'
      }),
      $_am_resetEditors() {
        this.showColorPicker = false;
        this.showDrawEditor = false;
        this.showAudioEditor = false;
      },
      $_am_setSelection() {
        this.cm.setSelection({line: this.cursors.start.line, ch: this.attributeValue[this.attributeValue.length - 1].end}, {line: this.cursors.start.line, ch: this.attributeValue[0].start});
      },
      $_am_edit() {
        return this.showColorPicker || this.showDrawEditor || this.showAudioEditor;
      },
      $_am_updateColor(color) {
        this.value = ' ' + color;
      },
      $_am_replaceValue() {
        if (this.value) {
          this.cm.replaceSelection(this.value);
        }
        this.$_am_resetEditors();
      },
      $_am_onChange(cm) {
        this.code = cm.getValue();
        if (this.selected.url && this.selected.name) {
          this.$_am_updateCode({
            language: this.type,
            code: this.code,
            name: this.selected.name,
            url: this.selected.url
          });
        }
      },
      $_am_onCursorActivity() {
        if (this.$_am_edit()) {
          this.$_am_setSelection();
          this.$_am_replaceValue();
        } else {
          this.$_am_resetEditors();
        }
      },
      $_am_onDoubleClick(cm) {
        this.cursors = { start: {...cm.getCursor(true)}, end: {...cm.getCursor(false)}};
        this.lineTokens = [...cm.getLineTokens(this.cursors.start.line)];

        const insideProperty = head(this.lineTokens.filter(token => this.cursors.start.ch >= token.start && this.cursors.start.ch < token.end && token.type === 'property').map(() => true));

        if (!insideProperty) {
          const colonIndex = this.lineTokens.reduce((index, token, idx) => token.string === ':' ? idx : index, -1);
          const semicolonIndex = this.lineTokens.reduce((index, token, idx) => token.string === ';' ? idx : index, -1);
          const grepIndex = this.lineTokens.map((token, idx) => ({...token, idx})).filter(token => token.string === '|');

          if (colonIndex !== -1 && semicolonIndex !== -1 && grepIndex.length === 0) {
            this.attributeValue = this.lineTokens.filter((token, idx) => idx > colonIndex && idx < semicolonIndex);
            const property = this.lineTokens.filter(token => token.type === 'property').reduce((str, token) => str + token.string ,'');
            if (property) {
              this.$_am_setSelection();
              this.param = {key: property, value: cm.getSelection().trim()};
            }
          } else if (colonIndex !== -1 && semicolonIndex !== -1 && grepIndex.length > 0) {
            const gIndex = grepIndex.map((token, idx) => {
              if (this.cursors.start.ch < token.start) {
                const previous = idx > 0 && grepIndex[idx - 1].idx || -1;
                return { c: token.idx, p: previous};
              }
              return null;
            }).filter(v => v);
            const boundsIndex = !gIndex[0] && { after: grepIndex[grepIndex.length - 1].idx }
              || gIndex[0] && gIndex.length === grepIndex.length && { before: gIndex[0].c }
              || gIndex[0] && { after: gIndex[0].p, before: gIndex[0].c }
              || {};
            this.attributeValue = this.lineTokens.filter((token, idx) => idx > (boundsIndex.after || colonIndex) && idx < (boundsIndex.before || semicolonIndex));
            const property = this.lineTokens.filter(token => token.type === 'property').reduce((str, token) => str + token.string ,'');
            if (property) {
              this.$_am_setSelection();
              this.param = {key: property, value: cm.getSelection().trim()};
            }
          } else {
            this.param = {};
          }
        } else {
          this.param = {};
        }
      }
    }
  }
</script>

