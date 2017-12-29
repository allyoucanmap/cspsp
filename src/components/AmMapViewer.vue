/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div
    id="am-map"
    class="am-map am-v"/>
</template>

<script>

  import L from 'leaflet';
  import canvasLayer from './map/CanvasLayer.js';
  import boundaries from '../data/countries.geo';

  import {mapGetters} from 'vuex';
  import {isEqual} from 'lodash';

  canvasLayer(L);

  export default {
    data() {
      return {
        map: null,
        boundaries: null
      };
    },
    computed: {
      ...mapGetters({
        appLayers: 'app/layers',
        selected: 'app/selected',
        visible: 'app/visible',
        styles: 'code/styles',
        format: 'code/format'
      })
    },
    watch: {
      styles(newData, oldData) {
        if (this.visible.length > 0
        && newData[this.selected.url + ':' + this.selected.name]
        && oldData[this.selected.url + ':' + this.selected.name]
        && newData[this.selected.url + ':' + this.selected.name].sld !== oldData[this.selected.url + ':' + this.selected.name].sld) {
          this.$_am_clearLayers();
          this.visible.forEach(layer => {
            this.$_am_addLayer(layer.url, layer.name, this.format, this.styles[layer.url + ':' + layer.name], layer.isVector);
          });
        }
      },
      visible(newData, oldData) {
        if (!isEqual(newData, oldData)) {
          this.$_am_clearLayers();
          newData.forEach(layer => {
            this.$_am_addLayer(layer.url, layer.name, this.format, this.styles[layer.url + ':' + layer.name], layer.isVector);
          });
        }
      }
    },
    mounted() {
      this.map = L.map('am-map', { zoomControl: false, attributionControl: false}).setView([43.7695604, 11.2558136], 2);
      this.boundaries = this.$_am_addBoundaries();
    },
    beforeDestroy() {
      this.$_am_clearLayers(true);
      this.map.remove();
      this.map = null;
    },
    methods: {
      $_am_addLayer(url, name, format, code, vector) {
        if (url && name && format) {
          if (format === 'application/json;type=geojson' && vector) {
            return L.tileLayer.wms(url, params).addTo(this.map);
          }
          const params = code && code.sld ? {
            layers: name,
            format,
            transparent: true,
            sld_body: code.sld.replace(/\n/g, '')
          } : {
            layers: name,
            format,
            transparent: true
          };
          return L.tileLayer.wms(url, params).addTo(this.map);
        }
        return null;
      },
      $_am_clearLayers(all) {
        this.map.eachLayer(layer => {
          if (!all) {
            if (layer.wmsParams) {
              layer.remove();
            }
          } else {
            if (layer.clearLayers) {
              layer.clearLayers();
            }
            layer.remove();
          }
        });
      },
      $_am_addBoundaries() {
        return L.geoJSON({...boundaries}, {
          style: () => {
            return {
              color: '#333333',
              weight: 1,
              fillColor: 'transparent'
            };
          }
        }).addTo(this.map);
      }
    }
  }
</script>

