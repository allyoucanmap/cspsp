/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-color-picker">
    <am-chrome-picker
      :value="colors"
      @input="$_am_updateValue"/>
  </div>
</template>

<script>
  import { Chrome } from 'vue-color';

  export default {
    components: {
      AmChromePicker: Chrome
    },
    props: {
      value: {
        type: String,
        default: '#000000'
      },
      onChange: {
        type: Function,
        default: () => {}
      }
    },
    data() {
      return {
        color: '#000000',
        colors: {
          hex: '#000000'
        }
      };
    },
    watch: {
      color(newData) {
        this.onChange(newData);
      }
    },
    created() {
      this.colors = { hex: this.value };
    },
    methods: {
      $_am_updateValue(colors) {
        this.color = colors.hex;
      }
    }
  }
</script>

