/* copyright 2017, stefano bovio @allyoucanmap. */

<template lang="html">
  <div class="am-draw-editor">
    <div class="am-draw-editor-container">
      <svg
        :viewBox="'0 0 ' + side + ' ' + side"
        @click="$_am_onClick"
        @mousemove="$_am_onMouseMove">
        <rect
          x="0"
          y="0"
          :width="side"
          :height="side"
          :fill="styles['@a-bg-color']"/>
        <line
          v-for="line in xLines"
          :key="line.x"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          :stroke="styles['@a-tx-color']"
          stroke-opacity="0.2"/>
        <line
          v-for="line in yLines"
          :key="line.y"
          :x1="line.x1"
          :y1="line.y1"
          :x2="line.x2"
          :y2="line.y2"
          :stroke="styles['@a-tx-color']"
          stroke-opacity="0.2"/>
        <path
          v-for="geometry in pathGeometries"
          :key="geometry.id"
          :d="geometry.d"
          :fill="geometry.id === hover && !edit ? 'transparent' : styles['@a-tx-color']"
          fill-opacity="0.2"
          :stroke="geometry.id === hover && !edit ? styles['@a-tx-remove'] : styles['@a-tx-color']"
          :stroke-dasharray="geometry.id === hover && !edit ? 20 : 0"
          stroke-width="5"/>
        <path
          :d="pathMulti"
          :fill="styles['@a-tx-color']"
          fill-opacity="0.2"
          :stroke="styles['@a-tx-color']"
          stroke-width="5"/>
        <rect
          v-for="point in multi"
          :key="point[0] + point[1]"
          :x="point[0] - snap / 4"
          :y="point[1] - snap / 4"
          :width="snap / 2"
          :height="snap / 2"
          :fill="styles['@a-tx-color']"
          fill-opacity="0.2"
          :stroke="styles['@a-tx-edit']"
          stroke-width="3"/>
        <rect
          v-if="close && multi.length > 2"
          :x="b[0] - snap / 2"
          :y="b[1] - snap / 2"
          :width="snap"
          :height="snap"
          :fill="styles['@a-tx-color']"
          fill-opacity="0.2"
          :stroke="styles['@a-tx-highlight']"
          stroke-width="3"/>
        <rect
          v-if="near && geometry.length > 0 && !edit"
          :x="anchor[0] - snap / 2"
          :y="anchor[1] - snap / 2"
          :width="snap"
          :height="snap"
          :fill="styles['@a-tx-color']"
          fill-opacity="0.2"
          :stroke="styles['@a-tx-highlight']"
          stroke-width="3"/>
        <svg v-if="near && edit && geometry.length > 0">
          <rect
            v-for="point in geometry[near.j]"
            :key="point[0] + point[1]"
            :x="point[0] - snap / 4"
            :y="point[1] - snap / 4"
            :width="snap / 2"
            :height="snap / 2"
            :fill="styles['@a-tx-color']"
            fill-opacity="0.2"
            :stroke="styles['@a-tx-edit']"
            stroke-width="3"/>
        </svg>
        <svg v-if="hover > -1 && geometry.length > 0 && !edit">
          <rect
            v-for="point in geometry[hover]"
            :key="point[0] + point[1]"
            :x="point[0] - snap / 4"
            :y="point[1] - snap / 4"
            :width="snap / 2"
            :height="snap / 2"
            :fill="styles['@a-tx-color']"
            fill-opacity="0.2"
            :stroke="styles['@a-tx-remove']"
            stroke-width="3"/>
        </svg>
      </svg>
    </div>
  </div>
</template>

<script>
  import {range} from 'lodash';
  import {mapValue, inside} from '../utils/Utils';
  import {mapGetters} from 'vuex';

  export default {
    data() {
      return {
        side: 1000,
        count: 40,
        snap: 32,
        hover: -1,
        edit: false,
        close: false,
        a: [],
        b: [],
        multi: [],
        geometry: [],
        pathGeometries: [],
        pathMulti: [],
        anchor: [],
        near: null
      }
    },
    computed: {
      ...mapGetters({
        styles: 'app/styles'
      })
    },
    watch: {
      geometry(newData) {
        this.pathGeometries = this.$_am_getPathGeometries(newData);
      },
      b(newData) {
        let pathMulti = this.$_am_getPathD([...this.multi, newData]);
        this.pathMulti = pathMulti.replace('Z', '');
      },
      near(newData) {
        if (newData && this.geometry) {
          this.anchor = this.geometry[newData.j][newData.i];
        }
      }
    },
    created() {
      const linesArray = range(this.count - (this.count - 1), this.count);
      this.xLines = this.$_am_getXLines(linesArray);
      this.yLines = this.$_am_getYLines(linesArray);
    },
    methods: {
      $_am_onUpdate() {
        //
      },
      $_am_getXLines(linesArray) {
        return linesArray.map(x => ({x, x1: this.side / this.count * x, y1: 0, x2: this.side / this.count * x, y2: this.side}));
      },
      $_am_getYLines(linesArray) {
        return linesArray.map(y => ({y, x1: 0, y1: this.side / this.count * y, x2: this.side, y2: this.side / this.count * y}));
      },
      $_am_getBbox() {
        return this.$el && this.$el.children && this.$el.children[0] && this.$el.children[0].getBoundingClientRect()
          || {bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0};
      },
      $_am_getPathGeometries(geometries) {
        return geometries.map((geometry, id) => ({id, d: this.$_am_getPathD(geometry)}))
      },
      $_am_getPathMulti(multi) {
        return multi.map((geometry, id) => ({id, d: this.$_am_getPathD(geometry)}))
      },
      $_am_getPathD(geometry) {
        return geometry.reduce((a, b, i) => {
          if (i === 0) {
            return a + 'M' + b[0] + ' ' + b[1] + ' ';
          }
          if (i === geometry.length - 1) {
            return a + 'L' + b[0] + ' ' + b[1] + ' Z';
          }
          return a + 'L' + b[0] + ' ' + b[1] + ' ';
        }, '');
      },
      $_am_updateWKT(geometry) {
        return geometry.reduce((w, g, i) => {
          const end = i === geometry.length - 1 ? ')' : ', ';
          return w + g.reduce((a, b, j) => {
            const gEnd = j === g.length - 1 ? '))' : ', ';
            return a + mapValue(b[0], 0, this.side, -1, 1) + ' ' + mapValue(b[1], 0, this.side, 1, -1) + gEnd;
          }, '((') + end;
        }, 'MULTIPOLYGON(');
      },
      $_am_onClick(event) {
        const { left, top, width, height } = this.$_am_getBbox();

        if (this.near) {
          if (!this.edit) {
            this.edit = true;
          } else {
            const WKT = this.$_am_updateWKT(this.geometry);
            this.edit = false;
            this.near = null;
            this.$_am_onUpdate([...this.geometry], WKT);
          }
        } else if (this.hover !== -1) {
          const geometry = this.geometry.filter((g, i) => i !== this.hover);
          const WKT = this.$_am_updateWKT(geometry);
          this.geometry = [...geometry];
          this.hover = -1;
          this.near = null
          this.$_am_onUpdate([...geometry], WKT);
        } else if (this.close) {
          const geometry = [...this.geometry, [...this.multi /*, this.multi[0]*/]];
          const WKT = this.$_am_updateWKT(geometry);
          this.a = [];
          this.multi = [];
          this.geometry = [...geometry];
          this.close = false;
          this.$_am_onUpdate([...geometry], WKT);
        } else {
          let a = [mapValue(event.clientX - left, 0, width, 0, this.side), mapValue(event.clientY - top, 0, height, 0, this.side)];
          if (event.ctrlKey) {
            const frag = this.side / this.count;
            a = [Math.round(a[0] / frag) * frag, Math.round(a[1] / frag) * frag];
          }
          this.multi = [...this.multi, a];
          this.a = [...a];
        }
      },
      $_am_onMouseMove(event) {
        const { left, top, width, height } = this.$_am_getBbox();
        let b = [mapValue(event.clientX - left, 0, width, 0, this.side), mapValue(event.clientY - top, 0, height, 0, this.side)];
        if (event.ctrlKey) {
          const frag = this.side / this.count;
          b = [Math.round(b[0] / frag) * frag, Math.round(b[1] / frag) * frag];
        }
        if (this.edit) {
          let geometry = [...this.geometry];
          geometry[this.near.j] = geometry[this.near.j].map((c, i) => i === this.near.i ? b : c);
          this.geometry = [...geometry];
        } else {
          let hover;
          if (this.geometry.length > 0) {
            hover = this.geometry.reduce((a, g, i) => {
              if (!a) {
                return inside(b, g) ? {id: i} : null;
              }
              return a;
            }, null);

            const near = this.geometry.map((g) => {
              return g.map(c => {
                return Math.sqrt(Math.pow(Math.abs(c[0] - b[0]), 2) + Math.pow(Math.abs(c[1] - b[1]), 2));
              }).reduce((a, v, i) => {
                return a.v > v ? {i, v} : a;
              }, {i: -1, v: Infinity});
            }).reduce((a, v, j) => {
              return a.v > v.v ? {j, i: v.i, v: v.v} : a;
            }, {i: -1, v: Infinity, j: -1});

            if (near && near.v < 10) {
              this.near = near;
            } else {
              this.near = null;
            }

          } else {
            this.near = null;
          }

          if (this.multi.length > 0) {
            const last = [...this.multi[0]];
            const dist = Math.sqrt(Math.pow(Math.abs(last[0] - b[0]), 2) + Math.pow(Math.abs(last[1] - b[1]), 2));
            if (dist < 10) {
              this.b = [...last];
              this.close = true;
              this.hover = hover ? hover.id : -1;
            } else {
              this.b = b;
              this.close = false;
              this.hover = hover ? hover.id : -1;
            }
          } else {
            this.b = b;
            this.hover = hover ? hover.id : -1;
          }
        }
      }
    }
  }
</script>

