// github chinchang/xmlToJson.js
// https://gist.github.com/chinchang/8106a82c56ad007e27b1
const xmlToJson = xml => {
  let obj = {};
  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3 && !obj['@attributes']) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if (obj[nodeName] === undefined) {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (obj[nodeName].push === undefined) {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }

  return obj;
};
// end github chinchang/xmlToJson.js

const parseXML = xml => {
  if (document.implementation && document.implementation.createDocument) {
    return new DOMParser().parseFromString(xml, 'text/xml');
  }
  return null;
};

const mapValue = (val, v1, v2, v3, v4) => v3 + (v4 - v3) * ((val - v1) / (v2 - v1));

const inside = (p, a) => {
  let ins = false;
  for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
    if (a[i][1] > p[1] !== a[j][1] > p[1] && p[0] < (a[j][0] - a[i][0]) * (p[1] - a[i][1]) / (a[j][1] - a[i][1]) + a[i][0]) {
      ins = !ins;
    }
  }
  return ins;
};

export {
  xmlToJson,
  parseXML,
  mapValue,
  inside
};
