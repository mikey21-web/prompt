// Generates a minimal valid 512x512 PNG with a solid violet color.
// Pure JS, no deps. Uses CRC32 + zlib.deflate from node.
const fs = require('fs');
const zlib = require('zlib');

const SIZE = 512;
const COLOR = [124, 58, 237]; // violet-600

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

const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;  // bit depth
ihdr[9] = 2;  // color type: truecolor
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// Raw image data: per row a filter byte (0) followed by RGB pixels
const row = Buffer.alloc(1 + SIZE * 3);
row[0] = 0;
for (let x = 0; x < SIZE; x++) {
  row[1 + x * 3 + 0] = COLOR[0];
  row[1 + x * 3 + 1] = COLOR[1];
  row[1 + x * 3 + 2] = COLOR[2];
}
const raw = Buffer.alloc(SIZE * row.length);
for (let y = 0; y < SIZE; y++) row.copy(raw, y * row.length);

const idat = zlib.deflateSync(raw);

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync('assets/icon.png', png);
console.log('Wrote assets/icon.png', png.length, 'bytes');
