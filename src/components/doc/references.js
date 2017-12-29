
export default {
  selectors: {
    '#point': {
      desc: 'style a point geometry',
      sld: '<PointSymbolizer/>',
      example: '#point {\n\tmark: circle;\n\tmark-stroke: #333333;\n}\n'
    },
    '#line': {
      desc: 'style a line/polyline geometry',
      sld: '<LineSymbolizer/>',
      example: '#line {\n\tstroke: #333333;\n}\n'
    },
    '#polygon': {
      desc: 'style a polygon geometry',
      sld: '<PolygonSymbolizer/>',
      example: '#polygon {\n\tfill: #333333;\n}\n'
    },
    '#text': {
      desc: 'style a text geometry',
      sld: '<TextSymbolizer/>',
      example: '#text {\n\tfill: #333333;\n}\n'
    }
  },
  attributes: {
    '@layer': {
      desc: 'name of layer',
      example: '@layer: layername;\n\n#polygon {\n\tfill: #333333;\n}\n'
    },
    '@title': {
      desc: 'title of current style',
      example: '@layer: layername;\n@title: styletitle;\n\n#polygon {\n\tfill: #333333;\n}\n'
    },
    '@abstract': {
      desc: 'abstract of current style',
      example: '@layer: layername;\n@abstract: a basic style;\n\n#polygon {\n\tfill: #333333;\n}\n'
    },
    '@name': {
      desc: 'name of current style',
      example: '@layer: layername;\n@name: stylename;\n\n#polygon {\n\tfill: #333333;\n}\n'
    },
    'fill': {
      desc: 'fill color of geometry, value hexadecimal color',
      selectors: '#polygon',
      example: '#polygon {\n\tfill: #aaff33;\n}\n'
    },
    'fill-opacity': {
      desc: 'fill color opacity of geometry, value between 0 and 1',
      selectors: '#polygon',
      example: '#polygon {\n\tfill: #aaff33;\n\tfill-opacity: 0.8;\n}\n'
    },
    'stroke': {
      desc: 'stroke color of line, value hexadecimal color',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n}\n'
    },
    'stroke-width': {
      desc: 'stroke width of line, value number',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-width: 10;\n}\n'
    },
    'stroke-opacity': {
      desc: 'stroke color opacity, value number, between 0 and 1',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-opacity: 0.5;\n}\n'
    },
    'stroke-linejoin': {
      desc: 'stroke join type, value string, mitre || round || bevel',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-linejoin: round;\n}\n'
    },
    'stroke-linecap': {
      desc: 'stroke cap type, value string, butt || round || square',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-linecap: round;\n}\n'
    },
    'stroke-dasharray': {
      desc: 'stroke dash sequence (colorSize spaceSize colorSize ...), value numbers separated by space',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-dasharray: 2 1;\n}\n'
    },
    'stroke-dashoffset': {
      desc: 'start of dash sequence, value number',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\tstroke-dasharray: 2 1;\n\tstroke-dashoffset: 5;\n}\n'
    },
    'offset': {
      desc: 'draw a new line with an offset calculated from its initial position, value number',
      selectors: '#polygon || #line',
      example: '#line {\n\tstroke: #333333;\n\toffset: 5;\n}\n'
    },
    'mark': {
      desc: 'mark type, value string, square || circle || triangle || star || cross || x || vertline || horline || slash || backslash || dot || plus || times || oarrow || carrow || triangle-ext || emicircle || triangleemicircle || wkt[ ]',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: triangle;\n\tmark-fill: #333333;\n}\n\n#point {\n\tmark: wkt[MULTIPOLYGON(((0 0.3999999999999999, -0.19999999999999996 0.6, -0.6 0.6, -0.8 0.3999999999999999, -0.8 0, 0 -0.8, 0.8 0, 0.8 0.3999999999999999, 0.6000000000000001 0.6, 0.20000000000000018 0.6, 0 0.3999999999999999)))];\n\tmark-fill: #ffa4db;\n\tmark-fill-opacity: 0.30;\n\tmark-stroke: #ff7acb;\n}\n'
    },
    'mark-fill': {
      desc: 'fill color of mark, value color hexadecimal',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: circle;\n\tmark-fill: #aaff33;\n}\n'
    },
    'mark-fill-opacity': {
      desc: 'fill color opacity of mark, value number, between 0 and 1',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: circle;\n\tmark-fill: #ffaa33;\n\tmark-fill-opacity: 0.5;\n}\n'
    },
    'mark-stroke': {
      desc: 'stroke color of mark, value color hexadecimal',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: square;\n\tmark-stroke: #333333;\n}\n'
    },
    'mark-stroke-width': {
      desc: 'stroke width of mark, value number',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: square;\n\tmark-stroke: #333333;\n\tmark-stroke-width: 0.5;\n}\n'
    },
    'mark-rotation': {
      desc: 'rotation of mark, value number, between -360 and +360',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: star;\n\tmark-stroke: #ff00ff;\n\tmark-rotation: 45;\n}\n'
    },
    // 'mark-opacity': {},
    'mark-size': {
      desc: 'size of mark, value number',
      selectors: '#point || #polygon || #line',
      example: '#point {\n\tmark: square;\n\tmark-stroke: #333333;\n\tmark-size: 20;\n}\n'
    },
    'pattern': {
      desc: 'pattern type, value string, square || circle || triangle || star || cross || x || vertline || horline || slash || backslash || dot || plus || times || oarrow || carrow || triangle-ext || emicircle || triangleemicircle || wkt[ ]',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: triangle;\n\tpattern-fill: #333333;\n}\n\n#polygon {\n\tpattern: wkt[MULTIPOLYGON(((0 0.3999999999999999, -0.19999999999999996 0.6, -0.6 0.6, -0.8 0.3999999999999999, -0.8 0, 0 -0.8, 0.8 0, 0.8 0.3999999999999999, 0.6000000000000001 0.6, 0.20000000000000018 0.6, 0 0.3999999999999999)))];\n\tpattern-fill: #ffa4db;\n\tpattern-fill-opacity: 0.30;\n\tpattern-stroke: #ff7acb;\n}\n'
    },
    'pattern-fill': {
      desc: 'fill color of pattern, value color hexadecimal',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: circle;\n\tpattern-fill: #aaff33;\n}\n'
    },
    'pattern-fill-opacity': {
      desc: 'fill color opacity of pattern, value number, between 0 and 1',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: circle;\n\tpattern-fill: #ffaa33;\n\tpattern-fill-opacity: 0.5;\n}\n'
    },
    'pattern-stroke': {
      desc: 'stroke color of pattern, value color hexadecimal',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: square;\n\tpattern-stroke: #333333;\n}\n'
    },
    'pattern-stroke-width': {
      desc: 'stroke width of pattern, value number',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: square;\n\tpattern-stroke: #333333;\n\tpattern-stroke-width: 0.5;\n}\n'
    },
    'pattern-rotation': {
      desc: 'rotation of pattern, value number, between -360 and +360',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: star;\n\tpattern-stroke: #ff00ff;\n\tpattern-rotation: 45;\n}\n'
    },
    // 'pattern-opacity': {},
    'pattern-size': {
      desc: 'size of pattern, value number',
      selectors: '#polygon',
      example: '#polygon {\n\tpattern: square;\n\tpattern-stroke: #333333;\n\tpattern-size: 20;\n}\n'
    },
    'title': {
      desc: 'title of current symbolizer (name in legend), value string',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon {\n\ttitle: regions;\n\tfill: #777777;\n}\n'
    },
    'label': {
      selectors: '#point || #polygon || #line || #text'
    },
    'font-family': {
      selectors: '#point || #polygon || #line || #text'
    },
    'font-style': {
      selectors: '#point || #polygon || #line || #text'
    },
    'font-weight': {
      selectors: '#point || #polygon || #line || #text'
    },
    'font-size': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-fill': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-fill-opacity': {
      selectors: '#point || #polygon || #line || #text'
    },
    'halo-fill': {
      selectors: '#point || #polygon || #line || #text'
    },
    'halo-fill-opacity': {
      selectors: '#point || #polygon || #line || #text'
    },
    'halo-radius': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-anchor': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-displacement': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-rotation': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-offset': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-group': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-all-group': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-space-around': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-follow-line': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-max-displacement': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-repeat': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-max-angle-delta': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-auto-wrap': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-force-left-to-right': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-conflict-resolution': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-goodness-of-fit': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-polygon-align': {
      selectors: '#point || #polygon || #line || #text'
    },
    // 'label-graphic-resize': {},
    // 'label-graphic-margin': {},
    'label-partials': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-underline-text': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-strikethrough-text': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-char-spacing': {
      selectors: '#point || #polygon || #line || #text'
    },
    'label-word-spacing': {
      selectors: '#point || #polygon || #line || #text'
    }
  },
  filters: {
    'equal': {
      desc: 'filter attribute equal to declared value, structure equal(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[equal(type, residential)] {\n\tfill: #333333;\n}\n'
    },
    'notEqual': {
      desc: 'filter attribute not equal to declared value, structure notEqual(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[notEqual(type, residential)] {\n\tfill: #333333;\n}\n'
    },
    'less': {
      desc: 'filter attribute with values less than declared value, structure less(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[less(area, 1000)] {\n\tfill: #333333;\n}\n'
    },
    'lessEqual': {
      desc: 'filter attribute with values less than or equal to declared value, structure lessEqual(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[lessEqual(area, 1000)] {\n\tfill: #333333;\n}\n'
    },
    'greater': {
      desc: 'filter attribute with values greater than declared value, structure greater(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[greater(area, 1000)] {\n\tfill: #333333;\n}\n'
    },
    'greaterEqual': {
      desc: 'filter attribute with values greater than or equal to declared value, structure greaterEqual(attribute, value)',
      selectors: '#point || #polygon || #line || #text',
      example: '#polygon[greaterEqual(area, 1000)] {\n\tfill: #333333;\n}\n'
    },
    '@map': {
      desc: 'filter simbolizers inside @map, works only width min-scale and max-scale',
      selectors: '#point || #polygon || #line || #text',
      example: '@map (max-scale: 20000) (min-scale: 5000) {\n\t#polygon {\n\t\tfill: #dddddd;\n\t}\n\n\t#text {\n\t\tlabel: name;\n\t\tlabel-fill: #333333;\n\t}\n}'
    },
    'max-scale': {
      desc: 'set min scale denominator limit, if greater than defined value the style will be visible',
      selectors: '#point || #polygon || #line || #text',
      example: '@map (min-scale: 10000) {\n\t#polygon {\n\t\tfill: #333333;\n\t}\n}'
    },
    'min-scale': {
      desc: 'set max scale denominator limit, if less than defined value the style will be visible',
      selectors: '#point || #polygon || #line || #text',
      example: '@map (max-scale: 50000) {\n\t#polygon {\n\t\tfill: #333333;\n\t}\n}'
    }
  },
  operators: {
    '| split': {
      desc: 'create a new symbolizer in the same rule, useful for double stroke line for street',
      selectors: '#point || #polygon || #line || #text',
      example: '#line {\n\tstroke: #333333 | #aaff33;\n\tstroke-width: 10 | 5;\n\tstroke-opacity: 0.5;\n}\n'
    }
  }
}