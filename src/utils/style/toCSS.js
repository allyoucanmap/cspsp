/* copyright 2017, stefano bovio @allyoucanmap. */

import {head, isArray} from 'lodash';
import {xmlToJson, parseXML} from '../Utils';

const vendorOptions = {
  'group': 'label-group',
  'labelAllGroup': 'label-all-group',
  'spaceAround': 'label-space-around',
  'followLine': 'label-follow-line',
  'maxDisplacement': 'label-max-displacement',
  'repeat': 'label-repeat',
  'maxAngleDelta': 'label-max-angle-delta',
  'autoWrap': 'label-auto-wrap',
  'forceLeftToRight': 'label-force-left-to-right',
  'conflictResolution': 'label-conflict-resolution',
  'goodnessOfFit': 'label-goodness-of-fit',
  'polygonAlign': 'label-polygon-align',
  'graphic-resize': 'label-graphic-resize',
  'graphic-margin': 'label-graphic-margin',
  'partials': 'label-partials',
  'underlineText': 'label-underline-text',
  'strikethroughText': 'label-strikethrough-text',
  'charSpacing': 'label-char-spacing',
  'wordSpacing': 'label-word-spacing'
};

const writeLine = (key, value, tab) => {
  if (isArray(value)) {
    const v = value.reduce((a, b, i) => i === value.length - 1 && a + b || a + b + '\n\t' + tab + '| ', '');
    return tab + key + ': ' + v + ';\n';
  }
  return tab + key + ': ' + value + ';\n';
};

const ogcFilter = filter => {
  if (filter) {
    /* if (filter['ogc:PropertyIsBetween']) {
      return '[between(' + filter['ogc:PropertyIsBetween']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsBetween']['ogc:LowerBoundary']['ogc:Literal'] + ', ' + filter['ogc:PropertyIsBetween']['ogc:UpperBoundary']['ogc:Literal'] + ')]';
    }*/
    if (filter['ogc:PropertyIsEqualTo']) {
      return '[equal(' + filter['ogc:PropertyIsEqualTo']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsEqualTo']['ogc:Literal'] + ')]';
    }
    if (filter['ogc:PropertyIsNotEqualTo']) {
      return '[notEqual(' + filter['ogc:PropertyIsNotEqualTo']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsNotEqualTo']['ogc:Literal'] + ')]';
    }
    if (filter['ogc:PropertyIsLessThan']) {
      return '[less(' + filter['ogc:PropertyIsLessThan']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsLessThan']['ogc:Literal'] + ')]';
    }
    if (filter['ogc:PropertyIsLessThanOrEqualTo']) {
      return '[lessEqual(' + filter['ogc:PropertyIsLessThanOrEqualTo']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsLessThanOrEqualTo']['ogc:Literal'] + ')]';
    }
    if (filter['ogc:PropertyIsGreaterThan']) {
      return '[greater(' + filter['ogc:PropertyIsGreaterThan']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsGreaterThan']['ogc:Literal'] + ')]';
    }
    if (filter['ogc:PropertyIsGreaterThanOrEqualTo']) {
      return '[greaterEqual(' + filter['ogc:PropertyIsGreaterThanOrEqualTo']['ogc:PropertyName'] + ', ' + filter['ogc:PropertyIsGreaterThanOrEqualTo']['ogc:Literal'] + ')]';
    }
  }
  return '';
};

const writeObject = (key, value) => ({[key]: value});

const cssObject = (cssParameter, prefix = '') => {
  if (cssParameter['@attributes']) {
    return {[prefix + cssParameter['@attributes'].name]: cssParameter['#text']};
  }
  return cssParameter.reduce((a, b) => ({...a, [prefix + b['@attributes'].name]: b['#text']}), {});
};

const wellKnownNameObject = (wkn, name = 'mark') => {
  if (wkn && wkn.match(/wkt:\/\//)) {
    const wkt = wkn.replace(/wkt:\/\//, '');
    return writeObject(name, 'wkt[' + wkt + ']');
  }

  if (wkn && wkn.match(/shape:\/\//)) {
    const shape = wkn.replace(/shape:\/\//, '');
    return writeObject(name, shape);
  }

  if (wkn && wkn.match(/extshape:\/\//)) {
    const extshape = wkn.replace(/extshape:\/\//, '');
    return writeObject(name, extshape);
  }
  return writeObject(name, wkn);
};

const mergeSymbolizers = (symbololizers, data = {}) => {
  const symbolParams = symbololizers.map(symbololizer => {
    return {...data(symbololizer)};
  });
  const single = symbolParams.reduce((a, b) => [...a, ...Object.keys(b)], []).reduce((a, b) => a.indexOf(b) === -1 ? [...a, b] : [...a], []);

  const newParams = symbolParams.map(s => single.reduce((a, key) => !s[key] && {...a, [key]: 'none'} || {...a, [key]: s[key]}, {}));

  return newParams.reduce((a, b) => {
    const params = Object.keys(b).reduce((p, k) => {
      if (a[k] && isArray(a[k])) {
        return {...p, [k]: [...a[k], b[k]]};
      }
      if (a[k]) {
        return {...p, ...{[k]: a[k] === b[k] ? b[k] : [a[k], b[k]]}};
      }
      return {...p, [k]: b[k]};
    }, {});
    return {...a, ...params};
  }, {});
};

const textSymbolizerObject = textSymbolizer => {
  return textSymbolizer && mergeSymbolizers(isArray(textSymbolizer) ? textSymbolizer : [textSymbolizer], symbololizer => {
    const label = symbololizer.Label && symbololizer.Label['ogc:PropertyName'] && writeObject('label', symbololizer.Label['ogc:PropertyName']) || {};
    const fill = symbololizer.Fill && symbololizer.Fill.CssParameter && cssObject(symbololizer.Fill.CssParameter, 'label-') || {};
    const halo = symbololizer.Halo || null;
    const haloFill = halo && halo.Fill.CssParameter && cssObject(halo.Fill.CssParameter, 'halo-') || {};
    const haloRadius = halo && halo.Radius && writeObject('halo-radius', halo.Radius) || {};
    const font = symbololizer.Font && symbololizer.Font.CssParameter && cssObject(symbololizer.Font.CssParameter) || {};

    const labelPlacement = symbololizer.LabelPlacement || null;
    const linePlacement = labelPlacement && labelPlacement.LinePlacement && labelPlacement.LinePlacement.PerpendicularOffset && writeObject('label-offset', labelPlacement.LinePlacement.PerpendicularOffset) || {};

    const pointPlacement = labelPlacement && labelPlacement.PointPlacement || null;
    const anchor = pointPlacement && pointPlacement.AnchorPoint && pointPlacement.AnchorPoint.AnchorPointX && pointPlacement.AnchorPoint.AnchorPointY && writeObject('label-anchor', pointPlacement.AnchorPoint.AnchorPointX + ' ' + pointPlacement.AnchorPoint.AnchorPointY) || {};
    const displacement = pointPlacement && pointPlacement.Displacement && pointPlacement.Displacement.DisplacementX && pointPlacement.Displacement.DisplacementY && writeObject('label-displacement', pointPlacement.Displacement.DisplacementX + ' ' + pointPlacement.Displacement.DisplacementY) || {};
    const labelRotation = pointPlacement && pointPlacement.Rotation && writeObject('label-rotation', pointPlacement.Rotation) || {};

    const priority = symbololizer.Priority && symbololizer.Priority.PropertyName && writeObject('label-priority', symbololizer.Priority.PropertyName) || {};

    const vendor = symbololizer.VendorOption || [];
    const vendorArray = isArray(vendor) ? vendor : [vendor];
    const vendorOpitionObject = vendorArray.reduce((a, option) => {
      return option['@attributes'] && option['#text'] && option['@attributes'].name && vendorOptions[option['@attributes'].name] && {...a, ...writeObject(vendorOptions[option['@attributes'].name], option['#text'])} || {...a};
    }, {});

    return {
      ...label,
      ...fill,
      ...font,
      ...haloFill,
      ...haloRadius,
      ...linePlacement,
      ...anchor,
      ...displacement,
      ...labelRotation,
      ...vendorOpitionObject,
      ...priority
    };
  }) || {};
};

const pointSymbolizerObject = pointSymbolizer => {
  return pointSymbolizer && mergeSymbolizers(isArray(pointSymbolizer) ? pointSymbolizer : [pointSymbolizer], symbololizer => {
    const graphic = symbololizer.Graphic || {};
    const mark = graphic.Mark || {};
    const rotation = graphic.Rotation && writeObject('mark-rotation', graphic.Rotation) || {};
    const size = graphic.Size && writeObject('mark-size', graphic.Size) || {};
    const opacity = graphic.Opacity && writeObject('mark-opacity', graphic.Opacity) || {};
    const wellKnownName = mark.WellKnownName && wellKnownNameObject(mark.WellKnownName) || {};
    const fill = mark.Fill && mark.Fill.CssParameter && cssObject(mark.Fill.CssParameter, 'mark-') || {};
    const stroke = mark.Stroke && mark.Stroke.CssParameter && cssObject(mark.Stroke.CssParameter, 'mark-') || {};
    return {
      ...wellKnownName,
      ...fill,
      ...stroke,
      ...opacity,
      ...size,
      ...rotation
    };
  }) || {};
};

const lineSymbolizerObject = lineSymbolizer => {
  return lineSymbolizer && mergeSymbolizers(isArray(lineSymbolizer) ? lineSymbolizer : [lineSymbolizer], symbololizer => {
    const strokeCss = symbololizer.Stroke && symbololizer.Stroke.CssParameter && cssObject(symbololizer.Stroke.CssParameter) || {};
    const offset = symbololizer.PerpendicularOffset && {offset: symbololizer.PerpendicularOffset} || {};
    const graphic = symbololizer.Stroke && symbololizer.Stroke.GraphicStroke && symbololizer.Stroke.GraphicStroke.Graphic || {};
    const mark = graphic && graphic.Mark || null;
    const rotation = graphic && graphic.Rotation && writeObject('mark-rotation', graphic.Rotation) || {};
    const size = graphic && graphic.Size && writeObject('mark-size', graphic.Size) || {};
    const opacity = graphic && graphic.Opacity && writeObject('mark-opacity', graphic.Opacity) || {};
    const wellKnownName = mark && mark.WellKnownName && wellKnownNameObject(mark.WellKnownName) || {};
    const markFill = mark && mark.Fill && mark.Fill.CssParameter && cssObject(mark.Fill.CssParameter, 'mark-') || {};
    const markStroke = mark && mark.Stroke && mark.Stroke.CssParameter && cssObject(mark.Stroke.CssParameter, 'mark-') || {};
    return {
      ...strokeCss,
      ...offset,
      ...wellKnownName,
      ...markFill,
      ...markStroke,
      ...opacity,
      ...size,
      ...rotation
    };
  });
};

const polygonSymbolizerObject = polygonSymbolizer => {
  return polygonSymbolizer && mergeSymbolizers(isArray(polygonSymbolizer) ? polygonSymbolizer : [polygonSymbolizer], symbololizer => {

    const fill = symbololizer.Fill && symbololizer.Fill.CssParameter && cssObject(symbololizer.Fill.CssParameter) || {};
    const stroke = symbololizer.Stroke && symbololizer.Stroke.CssParameter && cssObject(symbololizer.Stroke.CssParameter) || {};

    const graphicFill = symbololizer.Fill && symbololizer.Fill.GraphicFill && symbololizer.Fill.GraphicFill.Graphic || {};
    const pattern = graphicFill && graphicFill.Mark || {};
    const patternRotation = graphicFill && graphicFill.Rotation && writeObject('pattern-rotation', graphicFill.Rotation) || {};
    const patternSize = graphicFill && graphicFill.Size && writeObject('pattern-size', graphicFill.Size) || {};
    const patternOpacity = graphicFill && graphicFill.Opacity && writeObject('pattern-opacity', graphicFill.Opacity) || {};
    const patternWellKnownName = pattern && pattern.WellKnownName && wellKnownNameObject(pattern.WellKnownName, 'pattern') || {};
    const patternFill = pattern && pattern.Fill && pattern.Fill.CssParameter && cssObject(pattern.Fill.CssParameter, 'pattern-') || {};
    const patternStroke = pattern && pattern.Stroke && pattern.Stroke.CssParameter && cssObject(pattern.Stroke.CssParameter, 'pattern-') || {};

    const graphicStroke = symbololizer.Stroke && symbololizer.Stroke.GraphicStroke && symbololizer.Stroke.GraphicStroke.Graphic || {};
    const mark = graphicStroke && graphicStroke.Mark || '';
    const markRotation = graphicStroke && graphicStroke.Rotation && writeObject('mark-rotation', graphicStroke.Rotation) || {};
    const markSize = graphicStroke && graphicStroke.Size && writeObject('mark-size', graphicStroke.Size) || {};
    const markOpacity = graphicStroke && graphicStroke.Opacity && writeObject('mark-opacity', graphicStroke.Opacity) || {};
    const markWellKnownName = mark && mark.WellKnownName && wellKnownNameObject(mark.WellKnownName) || {};
    const markFill = mark && mark.Fill && mark.Fill.CssParameter && cssObject(mark.Fill.CssParameter, 'mark-') || {};
    const markStroke = mark && mark.Stroke && mark.Stroke.CssParameter && cssObject(mark.Stroke.CssParameter, 'mark-') || {};

    return {
      ...fill,
      ...stroke,

      ...patternWellKnownName,
      ...patternFill,
      ...patternStroke,
      ...patternRotation,
      ...patternSize,
      ...patternOpacity,

      ...markWellKnownName,
      ...markFill,
      ...markStroke,
      ...markRotation,
      ...markSize,
      ...markOpacity
    };
  });
};

const textSymbolizerCSS = (textSymbolizer, filter, title, t) => {
  const tab = t ? ['\t', '\t\t'] : ['', '\t'];
  const cssTitle = title && writeObject('title', title) || {};
  const mergedSymbolizer = textSymbolizerObject(textSymbolizer);
  const lines = {...cssTitle, ...mergedSymbolizer};
  const css = Object.keys(lines).reduce((a, param) => {
    return a + writeLine(param, lines[param], tab[1]);
  }, '');
  return tab[0] + '#text' + ogcFilter(filter) + ' {\n' + css + tab[0] + '}\n';
};

const pointSymbolizerCSS = (pointSymbolizer, filter, title, text, t) => {
  const tab = t ? ['\t', '\t\t'] : ['', '\t'];
  const cssTitle = title && writeObject('title', title) || {};
  const mergedSymbolizer = pointSymbolizerObject(pointSymbolizer);
  const mergedTextSymbolizer = textSymbolizerObject(text);
  const lines = {...cssTitle, ...mergedSymbolizer, ...mergedTextSymbolizer};
  const css = Object.keys(lines).reduce((a, param) => {
    return a + writeLine(param, lines[param], tab[1]);
  }, '');
  return tab[0] + '#point' + ogcFilter(filter) + ' {\n' + css + tab[0] + '}\n';
};

const lineSymbolizerCSS = (lineSymbolizer, filter, title, text, t) => {
  const tab = t ? ['\t', '\t\t'] : ['', '\t'];
  const cssTitle = title && writeObject('title', title) || {};
  const mergedSymbolizer = lineSymbolizerObject(lineSymbolizer);
  const mergedTextSymbolizer = textSymbolizerObject(text);
  const lines = {...cssTitle, ...mergedSymbolizer, ...mergedTextSymbolizer};
  const css = Object.keys(lines).reduce((a, param) => {
    return a + writeLine(param, lines[param], tab[1]);
  }, '');
  return tab[0] + '#line' + ogcFilter(filter) + ' {\n' + css + tab[0] + '}\n\n';
};

const polygonSymbolizerCSS = (polygonSymbolizer, filter, title, text, t) => {
  const tab = t ? ['\t', '\t\t'] : ['', '\t'];
  const cssTitle = title && writeObject('title', title) || {};
  const mergedSymbolizer = polygonSymbolizerObject(polygonSymbolizer);
  const mergedTextSymbolizer = textSymbolizerObject(text);
  const lines = {...cssTitle, ...mergedSymbolizer, ...mergedTextSymbolizer};
  const css = Object.keys(lines).reduce((a, param) => {
    return a + writeLine(param, lines[param], tab[1]);
  }, '');
  return tab[0] + '#polygon' + ogcFilter(filter) + ' {\n' + css + tab[0] + '}\n\n';
};

const getRule = (rule, tab) => {
  const PointSymbolizer = rule.PointSymbolizer;
  const LineSymbolizer = rule.LineSymbolizer;
  const PolygonSymbolizer = rule.PolygonSymbolizer;
  const TextSymbolizer = rule.TextSymbolizer;
  const filter = rule['ogc:Filter'];
  const title = rule.Title;

  if (PointSymbolizer) {
    return pointSymbolizerCSS(PointSymbolizer, filter, title, TextSymbolizer, tab);
  } else if (LineSymbolizer) {
    return lineSymbolizerCSS(LineSymbolizer, filter, title, TextSymbolizer, tab);
  } else if (PolygonSymbolizer) {
    return polygonSymbolizerCSS(PolygonSymbolizer, filter, title, TextSymbolizer, tab);
  } else if (TextSymbolizer) {
    return textSymbolizerCSS(TextSymbolizer, filter, title, tab);
  }
  return '';
};

const sortRules = rule => {
  return Object.keys(rule).reduce((a, i) => {
    const maxScaleDenominator = rule[i].MaxScaleDenominator;
    const minScaleDenominator = rule[i].MinScaleDenominator;
    if (maxScaleDenominator && !minScaleDenominator) {
      if (a['max:' + maxScaleDenominator]) {
        const newDenominator = [...a['max:' + maxScaleDenominator], rule[i]];
        return {...a, ['max:' + maxScaleDenominator]: newDenominator};
      }
      return {...a, ['max:' + maxScaleDenominator]: [rule[i]]};
    }
    if (!maxScaleDenominator && minScaleDenominator) {
      if (a['min:' + minScaleDenominator]) {
        const newDenominator = [...a['min:' + minScaleDenominator], rule[i]];
        return {...a, ['min:' + minScaleDenominator]: newDenominator};
      }
      return {...a, ['min:' + minScaleDenominator]: [rule[i]]};
    }
    if (maxScaleDenominator && minScaleDenominator) {
      if (a[maxScaleDenominator + ':' + minScaleDenominator]) {
        const newDenominator = [...a[maxScaleDenominator + ':' + minScaleDenominator], rule[i]];
        return {...a, [maxScaleDenominator + ':' + minScaleDenominator]: newDenominator};
      }
      return {...a, [maxScaleDenominator + ':' + minScaleDenominator]: [rule[i]]};
    }
    if (a['@style']) {
      const newDenominator = [...a['@style'], rule[i]];
      return {...a, ['@style']: newDenominator};
    }
    return {...a, ['@style']: [rule[i]]};
  }, {});
};

const toCSS = sld => {
  const str = sld.replace(/<\?([^\?]+)\?>/g, '');
  const json = xmlToJson(parseXML(str));
  const StyledLayerDescriptor = json && {...json.StyledLayerDescriptor} || '';
  const NamedLayer = StyledLayerDescriptor && {...StyledLayerDescriptor.NamedLayer} || '';
  const LayerName = NamedLayer && NamedLayer.Name && '@layer: ' + NamedLayer.Name + ';\n' || '';
  const UserStyle = NamedLayer && {...NamedLayer.UserStyle} || '';
  const StyleTitle = UserStyle && UserStyle.Title && '@title: ' + UserStyle.Title + ';\n' || '';
  const StyleName = UserStyle && UserStyle.Name && '@name: ' + UserStyle.Name + ';\n' || '';
  const StyleAbstract = UserStyle && UserStyle.Abstract && '@abstract: ' + UserStyle.Name + ';\n' || '';
  const FeatureTypeStyle = UserStyle && {...UserStyle.FeatureTypeStyle} || null;
  const Rule = FeatureTypeStyle && {...FeatureTypeStyle.Rule} || null;

  const ruleKeys = Rule && Object.keys(Rule) || null;
  const styleHead = LayerName + StyleTitle + StyleName + StyleAbstract + '\n';
  if (ruleKeys) {
    const isObject = head(ruleKeys.filter(k => isNaN(parseFloat(k))));
    const sortedRules = isObject ? sortRules({0: Rule}) : sortRules(Rule);
    const scales = Object.keys(sortedRules).reduce((r, c) => {
      if (c !== '@style') {
        const scale = c.split(':');
        const rules = sortedRules[c] && Object.keys(sortedRules[c]).reduce((a, i) => {
          return a + getRule(sortedRules[c][i], true);
        }, '');
        if (scale[0] === 'max') {
          return r + '@map (max-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
        }
        if (scale[0] === 'min') {
          return r + '@map (min-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
        }
        return r + '@map (max-scale: ' + scale[0] + ') (min-scale: ' + scale[1] + ') {\n\n' + rules + '}\n\n';
      }
      return r + '';
    }, '');

    const rules = sortedRules['@style'] && Object.keys(sortedRules['@style']).reduce((a, i) => {
      return a + getRule(sortedRules['@style'][i]);
    }, '') || '';

    return styleHead + rules + scales;
  }

  return styleHead;
};

export default toCSS;
