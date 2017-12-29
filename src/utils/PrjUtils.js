
const TILE_SIDE_PX = 256;
const EARTH_RADIUS = 6378137.0;
const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;
const ABS_MAX_LAT = 85.0511;

const deg = r => r / (Math.PI / 180.0);
const rad = d => d * (Math.PI / 180.0);
const resolution = (lat, z) => EARTH_CIRCUMFERENCE * Math.cos(lat * Math.PI / 180) / Math.pow(2, z + 8);
const scale = (lat, z, dpi) => dpi * 39.37 * resolution(lat, z);
const maxTileBBox = z => [[0, Math.pow(2, z) - 1], [Math.pow(2, z) - 1, 0]];
const lnToTx = (lon, z) =>Math.floor((lon + 180) / 360 * Math.pow(2, z));
const ltToTy = (lat, z) => Math.floor((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2 * Math.pow(2, z));
const txToLn = (x, z) =>x / Math.pow(2, z) * 360 - 180;

const tyToLt = (y, z) => {
  let n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const llToTl = (lon, lat, z) => [lnToTx(lon, z), ltToTy(lat, z)];
const tlToLl = (x, y, z) => [txToLn(x, z), tyToLt(y, z)];
const xToLon = x => deg(x / EARTH_RADIUS);
const yToLat = y => deg(2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2);
const lonToX = lon => rad(lon) * EARTH_RADIUS;
const latToY = lat => Math.log(Math.tan(rad(lat) / 2 + Math.PI / 4)) * EARTH_RADIUS;
const wgs84 = coord => [xToLon(coord[0]), yToLat(coord[1])];
const pseudo = coord => [lonToX(coord[0]), latToY(coord[1])];

const xyz = (x, y, z, url) => {
  let u = url;
  [{r: /\{x\}/g, v: x}, {r: /\{y\}/g, v: y}, {r: /\{z\}/g, v: z}].forEach((c) => {
    u = u.replace(c.r, c.v);
  });
  return u;
};

const getTileBbox = coords => {
  const a = tlToLl(coords.x, coords.y + 1, coords.z);
  const b = tlToLl(coords.x + 1, coords.y, coords.z);
  return { minx: a[0], miny: a[1], maxx: b[0], maxy: b[1] };
};

const bboxToString = bbox => (bbox.minx - 0.001) + ',' + (bbox.miny - 0.001) + ',' + (bbox.maxx + 0.001) + ',' + (bbox.maxy + 0.001);

export {
  TILE_SIDE_PX,
  ABS_MAX_LAT,
  resolution,
  scale,
  maxTileBBox,
  llToTl,
  tlToLl,
  wgs84,
  pseudo,
  xyz,
  getTileBbox,
  bboxToString
};
