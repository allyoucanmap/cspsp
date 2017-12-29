/* copyright 2017, stefano bovio @allyoucanmap. */

import {head, isEmpty} from 'lodash';
import {mapValue} from './Utils.js';

const path = (ctx, coordinates, bbox, style = () => {}) => {
  ctx.beginPath();
  coordinates.forEach(c => {
    c.forEach((p, i) => {
      const x = mapValue(p[0], bbox.minx, bbox.maxx, 0, 256);
      const y = mapValue(p[1], bbox.maxy, bbox.miny, 0, 256);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else if (i === c.length - 1) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
  });

  style();
};

const point = (ctx, feature, bbox) => {
  const p = feature.geometry.coordinates;
  const x = mapValue(p[0], bbox.minx, bbox.maxx, 0, 256);
  const y = mapValue(p[1], bbox.maxy, bbox.miny, 0, 256);
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.stroke();
};

const lineString = (ctx, feature, bbox) => {
  path(ctx, [feature.geometry.coordinates], bbox, () => {
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, '#aaff33');
    gradient.addColorStop(1, '#ff33aa');
    ctx.lineWidth = 1;
    ctx.strokeStyle = gradient;
    ctx.stroke();
  });
};

const multiLineString = (ctx, feature, bbox) => {
  feature.geometry.coordinates.forEach(coordinates => {
    path(ctx, [coordinates], bbox, () => {
      const gradient = ctx.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, '#aaff33');
      gradient.addColorStop(1, '#ff33aa');
      ctx.lineWidth = 1;
      ctx.strokeStyle = gradient;
      ctx.stroke();
    });
  });
};

const isFiltered = (feature, filter) => {
  if (isEmpty(filter)) {
    return true;
  }
  const properties = feature.properties || {};
  return head(Object.keys(properties).map((key) => {
    if (filter.equal) {
      return filter.equal[key] === properties[key];
    }
    return false;
  }).filter(v => v));
};

const hexToRGB = (hex) => {
  if (hex.length !== 7) {
    return null;
  }
  const bigInt = parseInt(hex.replace('#', ''), 16);
  return {
    r: bigInt >> 16 & 255,
    g: bigInt >> 8 & 255,
    b: bigInt & 255
  };
};

const stroke = (ctx, style) => {
  if (style.strokeRGB) {
    const opacity = style['stroke-opacity'] || 1.0;
    ctx.strokeStyle = 'rgba(' + style.strokeRGB.r + ', ' + style.strokeRGB.g + ', ' + style.strokeRGB.b + ', ' + opacity + ')';
    ctx.lineWidth = style['stroke-width'] || 1;
    ctx.stroke();
  }
};

const fill = (ctx, style) => {
  if (style.fillRGB) {
    const opacity = style['fill-opacity'] || 1.0;
    ctx.fillStyle = 'rgba(' + style.fillRGB.r + ', ' + style.fillRGB.g + ', ' + style.fillRGB.b + ', ' + opacity + ')';
    ctx.fill('evenodd');
  }
};

const polygon = (ctx, feature, bbox, style) => {
  Object.keys(style).forEach(key => {
    if (key === '@style' || key.match('@map')) {
      const atStyle = style[key] && {...style[key]} || {};
      Object.keys(atStyle).forEach(symbolyzer => {
        if (symbolyzer.match('#polygon')) {
          const filter = atStyle[symbolyzer].filter && {...atStyle[symbolyzer].filter} || {};
          const hashSymbolStyle = {
            ...atStyle[symbolyzer],
            fillRGB: hexToRGB(atStyle[symbolyzer].fill || ''),
            strokeRGB: hexToRGB(atStyle[symbolyzer].stroke || '')
          };
          if (isFiltered(feature, filter)) {
            path(ctx, feature.geometry.coordinates, bbox, () => {
              ctx.closePath();
              fill(ctx, hashSymbolStyle);
              stroke(ctx, hashSymbolStyle);
            });
          }
        }
      });
    }
  });
};
/*
const multyPolygon = (ctx, feature, bbox) => {
  feature.geometry.coordinates.forEach(coordinates => {
    path(ctx, coordinates, bbox, () => {
      ctx.closePath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#333333';
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, 0, 256, 0);
      gradient.addColorStop(0, '#aaff33');
      gradient.addColorStop(1, '#ff33aa');

      ctx.fillStyle = gradient;
      ctx.fill('evenodd');
    });
  });
};
*/
const drawTile = (options) => {
  options.ctx.clearRect(0, 0, 256, 256);
  options.data.features.forEach(feature => {
    if (feature.geometry && feature.geometry.type) {
      switch (feature.geometry.type) {
        case 'Point':
          point(options.ctx, feature, options.bbox, options.style);
          break;
        case 'LineString':
          lineString(options.ctx, feature, options.bbox, options.style);
          break;
        case 'MultiLineString':
          multiLineString(options.ctx, feature, options.bbox, options.style);
          break;
        case 'Polygon':
          polygon(options.ctx, feature, options.bbox, options.style);
          break;
        case 'MultiPolygon':
          // multyPolygon(options.ctx, feature, options.bbox, options.style);
          break;
        default:
          break;
      }
    }
  });
};


/*
const inside = (p, a) => {
    let ins = false;
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
        if (a[i][1] > p[1] !== a[j][1] > p[1] && p[0] < (a[j][0] - a[i][0]) * (p[1] - a[i][1]) / (a[j][1] - a[i][1]) + a[i][0]) {
            ins = !ins;
        }
    }
    return ins;
};

const hasAudioAttribute = (style, attributes) => {
    return head(Object.keys(style).map(key => {
        return head(attributes.filter(v => v === key)) && style[key].match('audio');
    }).filter(v => v));
};

const getAudioValue = value => {
    if (!value.match('audio')) {
        return {};
    }
    const keys = [
        {
            name: 'frequency',
            value: v => isNaN(parseFloat(v)) && notes[v] || isNaN(parseFloat(v)) && 440 || parseFloat(v)
        },
        {
            name: 'gain',
            value: v => parseFloat(v)
        },
        {
            name: 'type',
            value: v => v.trim()
        }
    ];
    return value.replace(/audio\(|\)/g, '').split(',').reduce((a, v, i) => {
        return {...a, [keys[i].name]: keys[i].value(v)};
    }, {});
};

const toLStyle = {
    fill: 'fillColor',
    stroke: 'color'
};

const sound = (feature, options, attributes) => {

    Object.keys(options.style || {}).forEach(key => {
        if (key === '@style' || key.match('@map')) {
            const atStyle = options.style[key] && {...options.style[key]} || {};
            Object.keys(atStyle).forEach(symbolyzer => {
                if (symbolyzer.match('#polygon')) {
                    const filter = atStyle[symbolyzer].filter && {...atStyle[symbolyzer].filter} || {};
                    if (isFiltered(feature, filter)) {

                        if (hasAudioAttribute(atStyle[symbolyzer], attributes)) {
                            if (!isEqual(options.canvas._cSpSpCurrentFeature, feature)) {
                                let soundStyle = {};
                                Object.keys(atStyle[symbolyzer]).forEach(k => {
                                    if (head(attributes.filter(v => v === k))) {
                                        const audioValue = getAudioValue(atStyle[symbolyzer][k]);
                                        soundStyle = {...soundStyle, [toLStyle[k]]: fequencyColor(audioValue.frequency)};
                                        if (audioValue.frequency) {
                                            options.data.audioNodes[k].oscillatorNode.frequency.value = audioValue.frequency;
                                            options.data.audioNodes[k].oscillatorNode.type = audioValue.type || 'triangle';
                                            options.data.audioNodes[k].gainNode.gain.value = audioValue.gain || 0.5;
                                        } else {
                                            options.data.audioNodes[k].gainNode.gain.value = 0;
                                        }
                                    }
                                });

                                options.soundLayer.clearLayers();
                                options.soundLayer.addData({
                                    features: [{...feature}]
                                });
                                options.soundLayer.setStyle({
                                    fillColor: 'transparent',
                                    color: 'transparent',
                                    opacity: 0.75,
                                    fillOpacity: 0.75,
                                    ...soundStyle});

                            }

                            Object.keys(atStyle[symbolyzer]).forEach(k => {
                                if (head(attributes.filter(v => v === k))) {
                                    const audioValue = getAudioValue(atStyle[symbolyzer][k]);
                                    if (audioValue.frequency) {
                                        options.data.audioNodes[k].gainNode.gain.value = audioValue.gain || 0.5;
                                    } else {
                                        options.data.audioNodes[k].gainNode.gain.value = 0;
                                    }
                                }
                            });
                            options.canvas._cSpSpChecked = true;
                            options.canvas._cSpSpCurrentFeature = {...feature};
                        }
                    }
                }
            });
        }
    });

};

const playTile = options => {
    const p = [
        mapValue(options.point[0], 0, 256, options.bbox.minx, options.bbox.maxx),
        mapValue(options.point[1], 0, 256, options.bbox.maxy, options.bbox.miny)
    ];
    const attributes = ['fill', 'stroke'];
    options.canvas._cSpSpChecked = false;
    options.data.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type) {
            switch (feature.geometry.type) {
                case 'Point':

                    break;
                case 'LineString':

                    break;
                case 'MultiLineString':

                    break;
                case 'Polygon':
                    if (inside(p, feature.geometry.coordinates[0])) {
                        sound(feature, options, attributes);
                    }
                    break;
                case 'MultiPolygon':

                    break;
                default:
                    break;
            }
        }
    });

    if (!options.canvas._cSpSpChecked) {
        options.soundLayer.clearLayers();
        Object.keys(options.data.audioNodes).forEach(key => {
            options.data.audioNodes[key].gainNode.gain.value = 0.0;
        });
        options.canvas._cSpSpCurrentFeature = {};
    }

};*/

export {
  drawTile
};
