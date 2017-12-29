/* copyright 2017, stefano bovio @allyoucanmap. */

import axios from 'axios';
import url from 'url';

import {head} from 'lodash';
import {xmlToJson, parseXML} from '../utils/Utils';

const getBbox = l => {
  const bbox = l.LatLonBoundingBox && l.LatLonBoundingBox['@attributes'];
  return bbox ? {minx: parseFloat(bbox.minx), miny: parseFloat(bbox.miny), maxx: parseFloat(bbox.maxx), maxy: parseFloat(bbox.maxy)} : {minx: -180, miny: -90, maxx: 180, maxy: 90};
};

export default {
  getCapabilities(options, loadStart = () => {}, loadEnd = () => {}, loadError = () => {}) {
    loadStart();
    const parsedUrl = url.parse(options.url, true);
    const query = url.format({
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      pathname: parsedUrl.pathname
    });
    setTimeout(() =>
      axios.get(query, {
        params: {
          SERVICE: 'WMS',
          version: '1.1.1',
          REQUEST: 'GetCapabilities'
        }
      }).then(response => {
        try {
          const json = xmlToJson(parseXML(response.data));
          const capability = json
            && json.WMT_MS_Capabilities
            && json.WMT_MS_Capabilities[1]
            && json.WMT_MS_Capabilities[1].Capability || null;
          const isVector = capability
            && capability.Request
            && capability.Request.GetMap
            && capability.Request.GetMap.Format
            && head(capability.Request.GetMap.Format.filter(f => f === 'application/json;type=geojson'))
            && true || false;
          const layers = capability
            && capability.Layer
            && capability.Layer.Layer
            && capability.Layer.Layer.map(l => ({name: l.Name, url: query + '?', bbox: getBbox(l), isVector}))
            || null;
          loadEnd(layers);
        } catch (e) {
          loadError(e);
        }
      }).catch((e) => {
        loadError(e);
      })
    , 1110);
  },
  getFeatureInfo(options, loadStart = () => {}, loadEnd = () => {}, loadError = () => {}) {
    loadStart();
    const parsedUrl = url.parse(options.url, true);
    const query = url.format({
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      pathname: parsedUrl.pathname && parsedUrl.pathname.replace('/ows', '/wms') || ''
    });
    axios.get(query, {
      params: options.params
    }).then(response => {
      loadEnd(response.data);
    }).catch((e) => {
      loadError(e);
    });
  }
};
