/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-doc">
    <input
      v-model="filter"
      placeholder="Filter docs...">
    <div class="am-doc-list">
      <div
        v-for="gKey in Object.keys(references)"
        :key="gKey">
        <div class="am-component">
          <div class="am-title">{{ gKey }}</div>
          <div
            v-for="rKey in $_am_filterRef(references[gKey])"
            :key="rKey"
            class="am-ref">
            <div class="am-title">{{ rKey }}</div>
            <div
              v-if="references[gKey][rKey].desc"
              class="am-desc">{{ references[gKey][rKey].desc }}</div>
            <pre v-if="references[gKey][rKey].example">{{ references[gKey][rKey].example }}</pre>
            <div
              v-if="references[gKey][rKey].selectors"
              class="am-desc">selectors: {{ references[gKey][rKey].selectors }}</div>
            <div
              v-if="references[gKey][rKey].sld"
              class="am-sld">{{ references[gKey][rKey].sld }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import references from './doc/references';
  import {head} from 'lodash';

  export default {
    data() {
      return {
        references,
        filter: ''
      };
    },
    methods: {
      $_am_filterRef(reference) {
        return Object.keys(reference).sort().filter(rf => rf.match(this.filter)
        || head(Object.keys(reference[rf]).filter(key => reference[rf][key].match(this.filter)))
        );
      }
    }
  }
</script>
