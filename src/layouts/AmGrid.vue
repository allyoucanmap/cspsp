/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div
    id="c-splash-splash"
    class="am-container">
    <am-code-panel
      v-if="start"
      type="css"/>
    <!--am-code-panel v-if="start" type="javascript"></am-code-panel-->
    <!--am-code-panel v-if="start" type="xml"></am-code-panel-->
    <am-layer-list v-if="start && showList"/>
    <am-map-viewer v-if="start"/>
    <am-header v-if="start"/>
    <am-footer v-if="start"/>
    <am-doc v-if="start && showDoc"/>
    <am-gui-style/>
    <am-sign v-if="start"/>
    <!--am-color-picker></am-color-picker-->
    <!--am-draw-editor v-if="start"></am-draw-editor-->
  </div>
</template>

<script>

  import {mapGetters} from 'vuex';
  import components from '../utils/requires/getComponents.js'

  export default {
    components,
    computed: {
      ...mapGetters({
        start: 'app/start',
        showList: 'app/showList',
        showDoc: 'app/showDoc'
      })
    }
  }
</script>
