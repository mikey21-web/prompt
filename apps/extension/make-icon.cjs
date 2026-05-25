// Generates a 512x512 PNG with a lightning bolt on a violet background.
// Pure JS, no deps.
const fs = require('fs');
const zlib = require('zlib');

const SIZE = 512;
const BG = [124, 58, 237];      // violet-600
const FG = [255, 255, 255];     // white bolt

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Lightning-bolt polygon in normalized (0..1) coordinates, top-left origin
const BOLT = [
  [0.55, 0.10],
  [0.30, 0.52],
  [0.46, 0.52],
  [0.37, 0.90],
  [0.70, 0.42],
  [0.52, 0.42],
  [0.62, 0.10],
];

function inBolt(x, y) {
  // Ray-casting point-in-polygon
  let inside = false;
  const px = x / SIZE;
  const py = y / SIZE;
  for (let i = 0, j = BOLT.length - 1; i < BOLT.length; j = i++) {
    const [xi, yi] = BOLT[i];
    const [xj, yj] = BOLT[j];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function inRoundedSquare(x, y) {
  const r = SIZE * 0.18; // 18% radius
  // Inside the rect, bevel the corners
  if (x < r && y < r) return (x - r) ** 2 + (y - r) ** 2 <= r * r;
  if (x >= SIZE - r && y < r) return (x - (SIZE - r)) ** 2 + (y - r) ** 2 <= r * r;
  if (x < r && y >= SIZE - r) return (x - r) ** 2 + (y - (SIZE - r)) ** 2 <= r * r;
  if (x >= SIZE - r && y >= SIZE - r) return (x - (SIZE - r)) ** 2 + (y - (SIZE - r)) ** 2 <= r * r;
  return true;
}

const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 6;  // color type: RGBA
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

// 4 bytes per pixel + 1 filter byte per row
const rowLen = 1 + SIZE * 4;
const raw = Buffer.alloc(SIZE * rowLen);

for (let y = 0; y < SIZE; y++) {
  const rowOff = y * rowLen;
  raw[rowOff] = 0; // filter type: none
  for (let x = 0; x < SIZE; x++) {
    const px = rowOff + 1 + x * 4;
    if (!inRoundedSquare(x, y)) {
      // outside rounded square -> transparent
      raw[px] = 0;
      raw[px + 1] = 0;
      raw[px + 2] = 0;
      raw[px + 3] = 0;
    } else if (inBolt(x, y)) {
      raw[px] = FG[0];
      raw[px + 1] = FG[1];
      raw[px + 2] = FG[2];
      raw[px + 3] = 255;
    } else {
      raw[px] = BG[0];
      raw[px + 1] = BG[1];
      raw[px + 2] = BG[2];
      raw[px + 3] = 255;
    }
  }
}

const idat = zlib.deflateSync(raw);

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/icon.png', png);
console.log('Wrote assets/icon.png', png.length, 'bytes', SIZE + 'x' + SIZE);
