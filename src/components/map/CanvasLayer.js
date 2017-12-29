/* copyright 2017, stefano bovio @allyoucanmap. */

import axios from 'axios';
import {isObject} from 'lodash';
import {drawTile} from '../../utils/DrawUtils.js';
import {bboxToString, getTileBbox} from '../../utils/PrjUtils.js';

const getPatams = bbox => ({
  SERVICE: 'WMS',
  version: '1.1.1',
  REQUEST: 'GetMap',
  layers: name,
  styles: '',
  srs: 'EPSG:4326',
  width: 256,
  height: 256,
  bbox: bboxToString(bbox),
  format: 'application/json;type=geojson',
  tiled: true
});

const getUrlData = (type, url, coords, bbox) => {
  switch (type) {
    case 'osm':
      return {url, params: {}};
    case 'wms':
      return {url, params: getPatams(bbox)};
    default:
      return null;
  }
};

export default L => {
  L.GridLayer.Canvas = L.GridLayer.extend({
    createTile(coords) {
      const {x, y, z} = coords;
      const {name = '', url = '', style = {}, type = 'wms', cache = {}} = this.options;
      const bbox = getTileBbox(coords);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (cache[url + ':' + name + ':' + x + ':' + y + ':' + z]) {
        drawTile({
          ctx,
          coords,
          data: {...cache[url + ':' + name + ':' + x + ':' + y + ':' + z]},
          bbox: {...bbox},
          style: {...style}
        });
      } else {
        const data = getUrlData(type, url, coords, bbox);
        if (data) {
          axios.get(data.url, {params: {...data.params}})
            .then(response => {
              if (isObject(response.data)) {
                cache[url + ':' + name + ':' + x + ':' + y + ':' + z] = {...response.data};
                drawTile({
                  ctx,
                  coords,
                  data: {...cache[url + ':' + name + ':' + x + ':' + y + ':' + z]},
                  bbox: {...bbox},
                  style: {...style}
                });
              }
            });
        }
      }
      return canvas;
    }
  });

  L.GridLayer.canvas = (options) => new L.GridLayer.Canvas(options);

};


