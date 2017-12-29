/* copyright 2017, stefano bovio @allyoucanmap. */

import {head} from 'lodash';

const variables = [
  'title',
  'layer',
  'name',
  'abstract'
];

const filter = string => {
  let jsonString = string[1]
    .replace(/(equal|notEqual|less|lessEqual|greater|greaterEqual)(\()/g, '$1:$2')
    .replace(/\(/g, '{')
    .replace(/\)/g, '}')
    .replace(/\b(\w+)\b,\s|,|\s,|\s,\s\b(\w+)\b/g, '$1:')
    .replace(/\b(\w+\.\w+|\w+)\b/g, '"$1"');
  jsonString = '{ "filter": {' + jsonString + '} }';
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return {};
  }
};

const checkValueArray = value => {
  const values = value.split('|') || [];
  return values[0] !== '' && values.length > 1 && values.map(v => v.trim()) || value;
};

const rules = (css, attr = {}) => {
  return css
    .map(c => c.replace(/\t|\n|\}/g, '').split(/\{/)
    ).reduce((a, b) => {
      const filterString = b[0].match(/\[([^\]]+)\]/);
      return {...a, [b[0].trim()]: b[1].split(/;/).filter(v => v)
        .reduce((c, d) => {
          const v = d.split(/:/);
          const value = v[1] ? v[1] : '';
          return v[0].trim() === '' ? {...c} : {...c, [v[0].trim()]: checkValueArray(value.trim())};
        }, {...attr, ...(filterString ? filter(filterString) : {})})
      };
    }, {});
};

const toJSON = css => {

  const paramsString = css.match(/@([^;]+);/g);
  const params = paramsString && paramsString.map(p => {
    const param = p.split(/:(.+)/);
    const key = param[0] && param[0].replace(/\s/, '');
    const value = param[1] && param[1].replace(';', '');
    return key && value && {[key]: value[0] === ' ' ? value.substring(1, value.length) : value };
  })
  .filter(p => p && head(variables.filter(v => '@' + v === Object.keys(p)[0])))
  .reduce((a, b) => {
    return {...a, ...b};
  }, {}) || {};

  const rulesMatch = css.replace(/\/\*([^\*\/]+)\*\/|@map([^@]+)\{([^@]+)\}([\s]+)\}|@map([^@]+)\{([^@]+)\}\}|@([^;]+)\;/g, '').match(/([^}]+)\{([^}]+)\}/g);
  const styleRules = rulesMatch ? rules(rulesMatch) : {};

  const mapRulesMatch = css.replace(/\/\*([^\*\/]+)\*\//g, '').match(/@map([^@]+)\{([^@]+)\}([\s]+)\}|@map([^@]+)\{([^@]+)\}\}/g);
  const mapRules = mapRulesMatch ? mapRulesMatch.reduce((a, c) => {
    const key = c.split(/\{/)[0];
    const scales = key.replace(/and|@map|\s/g, '').match(/\((max-scale[^)]+)\)|\((min-scale[^)]+)\)/g);

    const attr = scales ? scales.reduce((ac, s) => {
      let att = s.replace(/\(|\)/g, '').split(/:/);
      return {...ac, [att[0]]: att[1]};
    }, {}) : null;

    const body = c.replace(key, '');
    const match = body.substring(1, body.length - 1).replace(/\/\*([^\*\/]+)\*\/|@map([^}]+)\{([^@]+)\}([\s|\t|\n]+)\}|@map([^}]+)\{([^@]+)\}\}/g, '').match(/([^}]+)\{([^}]+)\}/g);
    return {...a, [key.trim()]: match && attr ? rules(match, attr) : {}};
  }, {}) : null;

  return {...params, ['@style']: styleRules, ...mapRules };

};

export default toJSON;
