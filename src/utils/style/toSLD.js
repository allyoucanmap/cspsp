/* copyright 2017, stefano bovio @allyoucanmap. */

import {head, isArray, range} from 'lodash';

const encoding = '<?xml version="1.0" encoding="ISO-8859-1"?>';

const Symbolizer = {
  '#polygon': 'PolygonSymbolizer',
  '#line': 'LineSymbolizer',
  '#point': 'PointSymbolizer',
  '#raster': 'RasterSymbolizer',
  '#text': 'TextSymbolizer'
};

const filterName = {
  PropertyIsEqualTo: 'equal',
  PropertyIsNotEqualTo: 'notEqual',
  PropertyIsLessThan: 'less',
  PropertyIsLessThanOrEqualTo: 'lessEqual',
  PropertyIsGreaterThan: 'greater',
  PropertyIsGreaterThanOrEqualTo: 'greaterEqual'
};

const cssParameter = param => param && param.key && param.value ? '<CssParameter name="' + param.key + '">' + param.value + '</CssParameter>\n' : '';
const cssParameters = params => params.reduce((a, param) => a + cssParameter(param), '');

const addCssParameters = (key, params, fields) => {
  const css = cssParameters(params);
  const externalField = fields.reduce((a, b) => a + b, '');
  return css === '' ? '' : '<' + key + '>\n' + css + externalField + '</' + key + '>\n';
};

const wellKnownName = mark => {
  const names = [
    {mark: 'square', code: 'square'},
    {mark: 'circle', code: 'circle'},
    {mark: 'triangle', code: 'triangle'},
    {mark: 'star', code: 'star'},
    {mark: 'cross', code: 'cross'},
    {mark: 'x', code: 'x'},

    {mark: 'vertline', code: 'shape://vertline'},
    {mark: 'horline', code: 'shape://horline'},
    {mark: 'slash', code: 'shape://slash'},
    {mark: 'backslash', code: 'shape://backslash'},
    {mark: 'dot', code: 'shape://dot'},
    {mark: 'plus', code: 'shape://plus'},
    {mark: 'times', code: 'shape://times'},
    {mark: 'oarrow', code: 'shape://oarrow'},
    {mark: 'carrow', code: 'shape://carrow'},

    {mark: 'triangle-ext', code: 'extshape://triangle'},
    {mark: 'emicircle', code: 'extshape://emicircle'},
    {mark: 'triangleemicircle', code: 'extshape://triangleemicircle'}

    /* windbars */
    /* font */
  ];

  const name = head(names.filter(n => n.mark === mark.replace(/\s/g, '')));
  const wkt = mark.match(/wkt\[([^\]]+)\]/);
  if (wkt) {
    return '<WellKnownName>wkt://' + wkt[1] + '</WellKnownName>';
  }
  return name ? '<WellKnownName>' + name.code + '</WellKnownName>' : '';
};

const size = value => '<Size>' + value + '</Size>';
const opacity = value => '<Opacity>' + value + '</Opacity>';
const rotation = value => '<Rotation>' + value + '</Rotation>';

const mark = (params, css, outer = ['', '']) => {
  const name = params && params.mark && wellKnownName(params.mark) || '';
  const markSize = params && params['mark-size'] ? size(params['mark-size']) : '';
  const markOpacity = params && params['mark-opacity'] ? opacity(params['mark-opacity']) : '';
  const markRotation = params && params['mark-rotation'] ? rotation(params['mark-rotation']) : '';
  return name !== '' ? outer[0] + '<Mark>' + name + css + '</Mark>' + markSize + markOpacity + markRotation + outer[1] : '';
};

const pattern = (params, css, outer = ['', '']) => {
  const name = params && params.pattern && wellKnownName(params.pattern) || '';
  const markSize = params && params['pattern-size'] ? size(params['pattern-size']) : '';
  const markOpacity = params && params['pattern-opacity'] ? opacity(params['pattern-opacity']) : '';
  const markRotation = params && params['pattern-rotation'] ? rotation(params['pattern-rotation']) : '';
  return name !== '' ? outer[0] + '<Mark>' + name + css + '</Mark>' + markSize + markOpacity + markRotation + outer[1] : '';
};

const scaleDenominator = params => {
  const maxScaleDenominator = params['max-scale'] ? '<MaxScaleDenominator>' + params['max-scale'] + '</MaxScaleDenominator>\n' : '';
  const minScaleDenominator = params['min-scale'] ? '<MinScaleDenominator>' + params['min-scale'] + '</MinScaleDenominator>\n' : '';
  return maxScaleDenominator + minScaleDenominator;
};

const filterProperty = (type, key, params) => {
  const keys = Object.keys(params);
  return key === filterName[type] && keys && keys.length > 0 && params[keys[0]] && '<ogc:' + type + '><ogc:PropertyName>' + keys[0] + '</ogc:PropertyName><ogc:Literal>' + params[keys[0]] + '</ogc:Literal></ogc:' + type + '>' || '';
};

const filter = params => {
  const rules = params && params.filter && Object.keys(params.filter).reduce((a, key) => {
    const filterProperties = Object.keys(filterName).reduce((f, k) => {
      return f + filterProperty(k, key, params.filter[key]);
    }, '');
    return a + filterProperties;
  }, '') || '';
  return rules !== '' && '<ogc:Filter>' + rules + '</ogc:Filter>' || '';
};

const getCssParameters = (constant, params, fields, prefix) => {
  const currentCssParams = Object.keys(params).filter(key => params[key] !== 'none').map(key => {
    return head(constant.filter(p => p === key));
  }).filter(v => v);
  const groupByKey = currentCssParams.reduce((a, b) => {
    const keys = head(Object.keys(a).filter(k => b.match(k.toLowerCase())));
    return keys ? {...a, [keys]: [...a[keys], {key: prefix ? b.replace(prefix, '') : b, value: params[b]}]}
    : {...a};
  }, {...fields});
  return Object.keys(groupByKey).reduce((a, key) => a + addCssParameters(key, groupByKey[key], fields[key]), '');
};

const vendorOption = (key, value) => '<VendorOption name="' + key + '">' + value + '</VendorOption>\n';

const symbolText = (symbol, params) => {
  const label = params.label && '<Label>\n<ogc:PropertyName>' + params.label + '</ogc:PropertyName>\n</Label>\n' || '';
  const font = getCssParameters(['font-family', 'font-style', 'font-weight', 'font-size'], params, {Font: []});
  const fill = getCssParameters(['label-fill', 'label-fill-opacity'], params, {Fill: []}, 'label-');
  const haloFill = getCssParameters(['halo-fill', 'halo-fill-opacity'], params, {Fill: []}, 'halo-');
  const haloRadius = params['halo-radius'] && '<Radius>' + params['halo-radius'] + '</Radius>' || '';
  const halo = haloFill + haloRadius ? '<Halo>' + haloFill + haloRadius + '</Halo>' : '';

  const anchor = params['label-anchor'] && params['label-anchor'].match(/(-\d+\.?\d*|\d+\.?\d*) (-\d+\.?\d*|\d+\.?\d*)/) && '<AnchorPoint><AnchorPointX>' + params['label-anchor'].split(' ')[0] + '</AnchorPointX><AnchorPointY>' + params['label-anchor'].split(' ')[1] + '</AnchorPointY></AnchorPoint>' || '';
  const displacement = params['label-displacement'] && params['label-displacement'].match(/(-\d+\.?\d*|\d+\.?\d*) (-\d+\.?\d*|\d+\.?\d*)/) && '<Displacement><DisplacementX>' + params['label-displacement'].split(' ')[0] + '</DisplacementX><DisplacementY>' + params['label-displacement'].split(' ')[1] + '</DisplacementY></Displacement>' || '';
  const labelRotation = params['label-rotation'] && '<Rotation>' + params['label-rotation'] + '</Rotation>' || '';
  const pointPlacement = anchor + displacement + labelRotation ? '<PointPlacement>' + anchor + displacement + labelRotation + '</PointPlacement>' : '';

  const linePlacement = params['label-offset'] && '<LinePlacement><PerpendicularOffset>' + params['label-offset'] + '</PerpendicularOffset></LinePlacement>' || '';

  const labelPlacement = pointPlacement + linePlacement ? '<LabelPlacement>' + pointPlacement + linePlacement + '</LabelPlacement>' : '';
  const priority = params['label-priority'] && '<Priority><PropertyName>' + params['label-priority'] + '</PropertyName></Priority>' || '';

  const group = params['label-group'] && vendorOption('group', params['label-group']) || '';
  const labelAllGroup = params['label-all-group'] && vendorOption('labelAllGroup', params['label-all-group']) || '';
  const spaceAround = params['label-space-around'] && vendorOption('spaceAround', params['label-space-around']) || '';
  const followLine = params['label-follow-line'] && vendorOption('followLine', params['label-follow-line']) || '';
  const labelMaxDisplacement = params['label-max-displacement'] && vendorOption('maxDisplacement', params['label-max-displacement']) || '';
  const repeat = params['label-repeat'] && vendorOption('repeat', params['label-repeat']) || '';
  const maxAngleDelta = params['label-max-angle-delta'] && vendorOption('maxAngleDelta', params['label-max-angle-delta']) || '';
  const autoWrap = params['label-auto-wrap'] && vendorOption('autoWrap', params['label-auto-wrap']) || '';
  const forceLeftToRight = params['label-force-left-to-right'] && vendorOption('forceLeftToRight', params['label-force-left-to-right']) || '';
  const conflictResolution = params['label-conflict-resolution'] && vendorOption('conflictResolution', params['label-conflict-resolution']) || '';
  const goodnessOfFit = params['label-goodness-of-fit'] && vendorOption('goodnessOfFit', params['label-goodness-of-fit']) || '';
  const polygonAlign = params['label-polygon-align'] && vendorOption('polygonAlign', params['label-polygon-align']) || '';
  const graphicResize = params['label-graphic-resize'] && vendorOption('graphic-resize', params['label-graphic-resize']) || '';
  const graphicMargin = params['label-graphic-margin'] && vendorOption('graphic-margin', params['label-graphic-margin']) || '';
  const partials = params['label-partials'] && vendorOption('partials', params['label-partials']) || '';
  const underlineText = params['label-underline-text'] && vendorOption('underlineText', params['label-underline-text']) || '';
  const strikethroughText = params['label-strikethrough-text'] && vendorOption('strikethroughText', params['label-strikethrough-text']) || '';
  const charSpacing = params['label-char-spacing'] && vendorOption('charSpacing', params['label-char-spacing']) || '';
  const wordSpacing = params['label-word-spacing'] && vendorOption('wordSpacing', params['label-word-spacing']) || '';

  const vendor = group +
    labelAllGroup +
    spaceAround +
    followLine +
    labelMaxDisplacement +
    repeat +
    maxAngleDelta +
    autoWrap +
    forceLeftToRight +
    conflictResolution +
    goodnessOfFit +
    polygonAlign +
    graphicResize +
    graphicMargin +
    partials +
    underlineText +
    strikethroughText +
    charSpacing +
    wordSpacing;

  const rules = label + font + halo + labelPlacement + fill + priority + vendor;

  return rules !== '' ? '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n' : '';
};

const divider = (symbol, params, rl = () => '') => {

  const valueArray = Object.keys(params).map(key => isArray(params[key]) && params[key].length || null).filter(v => v);
  const n = valueArray[0] && valueArray.reduce((a, b) => b > a ? a : b, valueArray[0]) || 1;
  const count = range(n);

  const newParams = count.map(i => {
    return Object.keys(params).reduce((a, b) => {
      const param = isArray(params[b]) ? {[b]: params[b][i]} : {[b]: params[b]};
      return {...a, ...param};
    }, {});
  });

  const rules = newParams.reduce((a, p) => {
    return a + rl(p);
  }, '');

  const title = params.title && '<Title>' + params.title + '</Title>' || '';
  const label = symbol !== '#text' && params.label && symbolText('#text', params) || '';

  return rules !== '' ? '<Rule>\n' + scaleDenominator(params) + filter(params) + title + rules + label + '</Rule>\n' : '';
};

const text = (symbol, params) => {
  return divider(symbol, params, (p) => {
    const rules = symbolText(symbol, p);
    return rules !== '' && rules || '';
  });
};

const point = (symbol, params) => {
  return divider(symbol, params, (p) => {
    const markParams = mark(
      p,
      getCssParameters(['mark-fill', 'mark-fill-opacity', 'mark-stroke', 'mark-stroke-width'], p, {Fill: [], Stroke: []}, 'mark-'),
      ['<Graphic>\n', '</Graphic>\n']);
    const rules = markParams;
    return rules !== '' && '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n' || '';
  });

};

const line = (symbol, params) => {
  return divider(symbol, params, (p) => {
    const graphicStroke = mark(
      p,
      getCssParameters(['mark-fill', 'mark-fill-opacity', 'mark-stroke', 'mark-stroke-width'], p, {Fill: [], Stroke: []}, 'mark-'),
      ['<GraphicStroke>\n<Graphic>\n', '</Graphic>\n</GraphicStroke>\n']);

    const css = getCssParameters(['stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset'], p, {Stroke: [graphicStroke]});

    const graphic = css === '' && graphicStroke !== '' && '<Stroke>' + graphicStroke + '</Stroke>' || '';

    const offset = p.offset && '<PerpendicularOffset>' + p.offset + '</PerpendicularOffset>' || '';
    return '<' + Symbolizer[symbol] + '>\n' + css + graphic + offset + '</' + Symbolizer[symbol] + '>\n';
  }, '');
};

const polygon = (symbol, params) => {
  return divider(symbol, params, (p) => {
    const graphicStroke = mark(
      p,
      getCssParameters(['mark-fill', 'mark-fill-opacity', 'mark-stroke', 'mark-stroke-width'], p, {Fill: [], Stroke: []}, 'mark-'),
      ['<GraphicStroke>\n<Graphic>\n', '</Graphic>\n</GraphicStroke>\n']);

    const graphicFill = pattern(
      p,
      getCssParameters(['pattern-fill', 'pattern-fill-opacity', 'pattern-stroke', 'pattern-stroke-width'], p, {Fill: [], Stroke: []}, 'pattern-'),
      ['<GraphicFill>\n<Graphic>\n', '</Graphic>\n</GraphicFill>\n']);

    const css = getCssParameters(['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linejoin', 'stroke-linecap', 'stroke-dasharray', 'stroke-dashoffset'], p, {Fill: [graphicFill], Stroke: [graphicStroke]});

    const cssFill = graphicFill !== '' && '<Fill>' + graphicFill + '</Fill>' || '';
    const cssStroke = graphicStroke !== '' && '<Stroke>' + graphicStroke + '</Stroke>' || '';
    const rules = css === '' && cssFill + cssStroke || css || '';
    return rules !== '' && '<' + Symbolizer[symbol] + '>\n' + rules + '</' + Symbolizer[symbol] + '>\n' || '';
  });
};

const rule = (type, params) => {

  const symbol = head(Object.keys(Symbolizer).filter(key => type.match(key)));
  if (!symbol) { return ''; }

  switch (symbol) {
    case '#polygon':
      return polygon(symbol, params);
    case '#point':
      return point(symbol, params);
    case '#line':
      return line(symbol, params);
    case '#text':
      return text(symbol, params);
    default:
      return '';
  }

};

const featureTypeStyle = json => {
  const rules = Object.keys(json).reduce((string, section) => {
    return string + Object.keys(json[section]).reduce((a, key) => a + rule(key, json[section][key]), '');
  }, '');
  return rules !== '' ? '<FeatureTypeStyle>\n' + rules + '</FeatureTypeStyle>\n' : '';
};

const styledLayerDescriptor = (json, featureStyle) => {
  const name = json['@layer'] ? '<Name>' + json['@layer'] + '</Name>\n' : '';
  const styleName = json['@name'] ? '<Name>' + json['@name'] + '</Name>\n' : '';
  const title = json['@title'] ? '<Title>' + json['@title'] + '</Title>\n' : '';
  const abstract = json['@abstract'] ? '<Abstract>' + json['@abstract'] + '</Abstract>\n' : '';
  return encoding +
  '\n<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml">\n' +
  '<NamedLayer>\n' +
    name +
    '<UserStyle>\n' +
      styleName +
      title +
      abstract +
      featureStyle +
    '</UserStyle>\n' +
  '</NamedLayer>\n' +
  '</StyledLayerDescriptor>';
};

const toSLD = json => {
  const style = featureTypeStyle(json);
  return style !== '' ? styledLayerDescriptor(json, style) : '';
};

export default toSLD;
