/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-keyboard">
    <div class="am-keyboard-container">
      <svg
        :viewBox="'0 0 ' + side + ' ' + (side / 2)"
        @click="$_am_onClick"
        @mousemove="$_am_onMouseMove">
        <rect
          v-for="key in wKeys"
          :key="key.i"
          :x="key.x"
          :y="key.y"
          :width="key.width"
          :height="key.height"
          :fill="'#ffffff'"
          fill-opacity="1"
          :stroke="'#333333'"
          stroke-width="1"/>
        <rect
          v-for="key in bKeys"
          :key="key.i"
          :x="key.x"
          :y="key.y"
          :width="key.width"
          :height="key.height"
          :fill="'#333333'"
          fill-opacity="1"
          :stroke="'#ffffff'"
          stroke-width="1"/>
      </svg>
      <div class="am-keyboard-selector">
        <div class="am-btn"><span>{{ '-' }}</span></div>
        <div class="am-value">{{ 'C4' }}</div>
        <div class="am-btn"><span>{{ '+' }}</span></div>
      </div>
      <div class="am-keyboard-selector">
        <div class="am-btn"><span>{{ '-' }}</span></div>
        <div class="am-value">{{ '0.5' }}</div>
        <div class="am-btn"><span>{{ '+' }}</span></div>
      </div>
      <div class="am-keyboard-selector">
        <div class="am-btn"><span>{{ '-' }}</span></div>
        <div class="am-value">{{ 'triangle' }}</div>
        <div class="am-btn"><span>{{ '+' }}</span></div>
      </div>
    </div>
  </div>
</template>

<script>

  import { range } from 'lodash';

  export default {
    data() {
      return {
        side: 1000,
        wKeys: []
      };
    },
    created() {
      this.wKeys = range(0, 7).map(i => ({i, x: i * this.side / 7, y: 0, width: this.side / 7, height: this.side / 2  }));
      this.bKeys = range(0, 6).map(i => ({i, x: i * this.side / 7 + this.side / 14 + this.side / 14 / 2, y: 0, width: this.side / 14, height: this.side / 3  })).filter((k, i) => i !== 2);
    },
    methods: {
      $_am_onClick() {

      },
      $_am_onMouseMove() {

      }
    }
  }
</script>
