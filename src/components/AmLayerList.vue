/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-list-container">
    <div
      key="list"
      class="am-list">
      <div class="am-input-field">
        <input
          :class="classLoading"
          v-model="url"
          placeholder="Add WMS layers...">
        <span
          v-if="!loading"
          @click="$_am_onAdd">P</span>
        <span
          v-if="!loading"
          @click="$_am_onClose">X</span>
      </div>
      <input
        :class="classLoading"
        v-model="filter"
        placeholder="Filter layers...">
      <div
        v-if="!loading"
        droppable="true"
        @dragover="$_am_dragover"
        @drop="$_am_drop">
        <li
          v-for="layer in layers"
          :key="layer.i"
          :data-id="layer.i"
          :class="layer.className + ($_am_isVisible(layer) ? '' : ' am-soft')"
          draggable="true"
          @dragstart="$_am_dragstart"
          @dragend="$_am_dragend"
          @dragover="$_am_dragover"
          @dragenter="$_am_dragenter" >
          {{ layer.name }}
          <span
            :key="layer.i + 'selector'"
            v-if="selected && (selected.url + ':' + selected.name) === (layer.url + ':' + layer.name)"
            :data-id="layer.i"
            @click="$_am_onSelect(layer)">1</span>
          <span
            :key="layer.i + 'selector'"
            v-else
            :data-id="layer.i"
            @click="$_am_onSelect(layer)" >0</span>
          <span
            v-if="selected && (selected.url + ':' + selected.name) !== (layer.url + ':' + layer.name)"
            :class="'am-visibility' + ($_am_isVisible(layer) ? ' am-visible' : '')"
            :data-id="layer.i"
            @click="$_am_onToggleVisibility(layer)">C</span>
        </li>
      </div>
    </div>
    <div class="am-logo-container-b">
      <div class="am-logo-b">
        <span>2</span>
        <span :class="classLoading">3</span>
        <span :class="classLoading">3</span>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapActions, mapGetters} from 'vuex';
  import {head} from 'lodash';

  export default {
    data() {
      return {
        url: 'http://localhost:8080/geoserver/wms',
        currentID: -1,
        oldID: -1,
        layers: [],
        visibleLayers: [],
        classLoading: '',
        filter: ''
      };
    },
    computed: {
      ...mapGetters({
        loading: 'app/loading',
        appLayers: 'app/layers',
        selected: 'app/selected',
        visible: 'app/visible'
      })
    },
    watch: {
      loading(newData, oldData) {
        this.classLoading = newData ? 'am-loading' : '';
        if (!newData && oldData & this.appLayers.length > 0) {
          this.url = '';
          this.layers = [...this.appLayers].map((layer, i) => ({...layer, i, className: ''})).filter(layer => layer.name.match(this.filter));
        }
      },
      filter(newData) {
        this.layers = [...this.appLayers].map((layer, i) => ({...layer, i, className: ''})).filter(layer => layer.name.match(newData));
      }
    },
    created() {
      this.layers = [...this.appLayers].map((layer, i) => ({...layer, i, className: ''})).filter(layer => layer.name.match(this.filter));
      this.url = this.layers.length > 0 ? '' : 'http://localhost:8080/geoserver/wms';
    },
    methods: {
      $_am_isVisible(layer) {
        return head(this.visible.filter(vis => (vis.url + ':' + vis.name) === (layer.url + ':' + layer.name)));
      },
      $_am_onAdd() {
        this.$_am_onGet({url: this.url});
      },
      $_am_dragover(event) {
        const hoverID = parseFloat(event.target.getAttribute('data-id'));
        if (this.oldID > -1) {
          this.layers = this.layers.map(layer => {
            if (layer.i !== this.oldID) {
              return layer.i === hoverID ? {...layer, className: 'am-drag-hover' } : {...layer, className: '' };
            }
            return {...layer};
          });
        }
        event.preventDefault();
      },
      $_am_dragend(event) {
        this.layers = this.layers.map((layer, i) => ({...layer, i, className: ''}));
        event.preventDefault();
      },
      $_am_dragenter(event) {
        event.preventDefault();
      },
      $_am_drop(event) {
        this.currentID = parseFloat(event.target.getAttribute('data-id'));
        if (this.currentID !== this.oldID) {
          this.layers = this.layers.reduce((newLayers, layer, i) => {
            if (i === this.oldID) {
              return [...newLayers];
            }
            if (i === this.currentID) {
              const newLayer = head(this.layers.filter(lr => lr.i === this.oldID));

              return this.currentID < this.oldID ?
                [...newLayers, {...newLayer}, {...layer}]
                : [...newLayers, {...layer}, {...newLayer}];
            }
            return [...newLayers, {...layer}];
          }, []).map((layer, i) => ({...layer, i, className: ''}));
          this.currentID = -1;
          this.oldID = -1;
        } else {
          this.layers = this.layers.map((layer, i) => ({...layer, i, className: ''}));
        }
      },
      $_am_dragstart(event) {
        this.oldID = parseFloat(event.target.getAttribute('data-id'));
        this.layers = this.layers.map(layer => {
          return layer.i === this.oldID ? {...layer, className: 'am-dragged' } : {...layer, className: '' };
        });
      },
      ...mapActions({
        $_am_onGet: 'app/getCapabilities',
        $_am_onSelect: 'app/selectLayer',
        $_am_onToggleVisibility: 'app/setLayerVisibility',
        $_am_onClose: 'app/closeLayerList'
      })
    }
  }
</script>
