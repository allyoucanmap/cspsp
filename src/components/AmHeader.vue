/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-header">
    <div
      class="am-btn"
      @click="$_am_onOpenList">
      <span>H</span>
    </div>
    <!--div class="am-btn"><span>C</span></div>
    <div class="am-btn"><span>V</span></div-->
    <div
      class="am-btn"
      @click="$_am_onToggleDoc">
      <span>W</span>
    </div>
    <div class="am-logo-container">
      <div class="am-logo">
        <span>2</span><span>3</span><span>3</span>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapActions} from 'vuex';

  export default {
    methods: {
      ...mapActions({
        $_am_onOpenList: 'app/openLayerList',
        $_am_onToggleDoc: 'app/toggleDoc'
      })
    }
  }
</script>

