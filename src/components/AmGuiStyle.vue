/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <span/>
</template>

<script>

  import less from 'less';
  import {mapActions, mapGetters} from 'vuex';
  import {leafletCSS, codemirrorCSS, lessString} from '../utils/requires/getStyles';
  import {isEqual} from 'lodash';

  if (!document.getElementById('_am-style-libs')) {
    const style = document.createElement('style');
    style.setAttribute('id', '_am-style-libs');
    style.innerHTML = leafletCSS + codemirrorCSS;
    document.head.appendChild(style);
  }

  const defaulVariables = {
    '@a-bg-color': '#333333',
    '@a-tx-color': '#ffffff',
    '@a-br-color': '#777777',
    '@a-tx-edit': '#00ffff',
    '@a-tx-remove': '#ff00ff',
    '@a-tx-highlight': '#00ff00',
    '@a-bg-map-color': '#f2f2f2',
    '@am-size': '32px',
    '@a-br-type': 'solid'
  };

  export default {
    data() {
      return {
        variables: {...defaulVariables}
      };
    },
    computed: {
      ...mapGetters({})
    },
    watch: {
      variables(newData, oldData) {
        if (!isEqual(newData, oldData)) {
          this.$_am_onChange(newData);
        }
      }
    },
    beforeMount() {
      this.$_am_onChange(this.variables);
      if (!document.getElementById('_am-style')) {
        const style = document.createElement('style');
        style.setAttribute('id', '_am-style');
        document.head.appendChild(style);
        less.render(this.getLess()).then(out => {
          style.innerHTML = out.css;
          this.$_am_onStart();
        });
      }
    },
    methods: {
      ...mapActions({
        $_am_onStart: 'app/start',
        $_am_onChange: 'app/getStyle'
      }),
      getVariables(v = {}) {
        this.variables = {...defaulVariables, ...v};
        return Object.keys(this.variables).reduce((a, b) => {
          return a + b + ':' + this.variables[b] + ';\n';
        }, '');
      },
      getLess(v) {
        return this.getVariables(v) + lessString;
      }
    }
  }
</script>

