const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a valid PNG file purely in Node.js standard library (using zlib and CRC32)
function createPng(width, height, getPixel) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC Table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate SnapForm 128x128 Squircle Logo
const size = 128;
const radius = 28;

// Check if point is inside rounded rect
function isInsideRoundedRect(x, y, w, h, r) {
  if (x < 0 || x >= w || y < 0 || y >= h) return false;
  if (x >= r && x <= w - r) return true;
  if (y >= r && y <= h - r) return true;
  
  // Corners
  const cx = x < r ? r : w - r;
  const cy = y < r ? r : h - r;
  const dx = x - cx;
  const dy = y - cy;
  return (dx * dx + dy * dy) <= r * r;
}

// Distance to rounded rect edge for antialiasing
function roundedRectCoverage(x, y, w, h, r) {
  let insideCount = 0;
  const subSamples = 3;
  for (let sx = 0; sx < subSamples; sx++) {
    for (let sy = 0; sy < subSamples; sy++) {
      const px = x + (sx + 0.5) / subSamples;
      const py = y + (sy + 0.5) / subSamples;
      if (isInsideRoundedRect(px, py, w, h, r)) {
        insideCount++;
      }
    }
  }
  return insideCount / (subSamples * subSamples);
}

// Check polygon inclusion for SnapForm glyph
function pointInPoly(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// SnapForm SVG glyph paths scaled to 128x128
// SVG coordinates 0..32 x 0..48, scaled by ~1.6 and centered in 128x128
const scale = 1.7;
const offsetX = 37;
const offsetY = 24;

function transformPoly(pts) {
  return pts.map(([x, y]) => [x * scale + offsetX, y * scale + offsetY]);
}

const p1 = transformPoly([[0.6, 19.2], [10.2, 19.2], [10.2, 28.8], [0.6, 28.8]]);
const p2 = transformPoly([[21.8, 28.8], [31.4, 28.8], [31.4, 38.4], [21.8, 38.4]]);
const p3 = transformPoly([[10.2, 19.2], [21.8, 9.6], [21.8, 19.2], [10.2, 28.8]]);
const p4 = transformPoly([[21.8, 28.8], [10.2, 38.4], [10.2, 28.8], [21.8, 19.2]]);
const p5 = transformPoly([[0.6, 19.2], [21.8, 0], [21.8, 9.6], [10.2, 19.2]]);
const p6 = transformPoly([[31.4, 28.8], [10.2, 48.0], [10.2, 38.4], [21.8, 28.8]]);

function getGlyphIntensity(px, py) {
  let intensity = 0;
  if (pointInPoly(px, py, p1)) intensity = Math.max(intensity, 1.0);
  if (pointInPoly(px, py, p2)) intensity = Math.max(intensity, 1.0);
  if (pointInPoly(px, py, p3)) intensity = Math.max(intensity, 0.4);
  if (pointInPoly(px, py, p4)) intensity = Math.max(intensity, 0.65);
  if (pointInPoly(px, py, p5)) intensity = Math.max(intensity, 0.75);
  if (pointInPoly(px, py, p6)) intensity = Math.max(intensity, 0.85);
  return intensity;
}

const pngBuffer = createPng(size, size, (x, y) => {
  const coverage = roundedRectCoverage(x, y, size, size, radius);
  if (coverage <= 0) return [0, 0, 0, 0];

  // Background color: #121216 with subtle top-to-bottom shading
  const bgR = 18;
  const bgG = 18;
  const bgB = 22;

  // Subsample glyph for supersharp rendering
  let glyphTotal = 0;
  const subSamples = 3;
  for (let sx = 0; sx < subSamples; sx++) {
    for (let sy = 0; sy < subSamples; sy++) {
      const px = x + (sx + 0.5) / subSamples;
      const py = y + (sy + 0.5) / subSamples;
      glyphTotal += getGlyphIntensity(px, py);
    }
  }
  const glyph = glyphTotal / (subSamples * subSamples);

  // Blend white glyph over dark squircle background
  const finalR = Math.round(bgR * (1 - glyph) + 255 * glyph);
  const finalG = Math.round(bgG * (1 - glyph) + 255 * glyph);
  const finalB = Math.round(bgB * (1 - glyph) + 255 * glyph);
  const finalA = Math.round(coverage * 255);

  return [finalR, finalG, finalB, finalA];
});

const outputPath = path.join(__dirname, '..', 'public', 'logo.png');
fs.writeFileSync(outputPath, pngBuffer);
console.log('Successfully generated public/logo.png with size:', pngBuffer.length, 'bytes');
