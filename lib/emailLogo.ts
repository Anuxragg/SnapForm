import zlib from 'zlib';

/**
 * Creates a valid PNG Buffer purely in Node.js standard library (using zlib and CRC32)
 */
function createPngBuffer(
  width: number,
  height: number,
  getPixel: (x: number, y: number, w: number, h: number) => [number, number, number, number]
): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC Table
  const crcTable: number[] = [];
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

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
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
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
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

// Point in polygon test
function pointInPoly(px: number, py: number, vertices: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0];
    const yi = vertices[i][1];
    const xj = vertices[j][0];
    const yj = vertices[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

let cachedLogoBuffer: Buffer | null = null;

/**
 * Returns a high-res crisp PNG buffer of the SnapForm logo icon (56x56 px with transparent background)
 */
export function getSnapFormLogoPngBuffer(): Buffer {
  if (cachedLogoBuffer) {
    return cachedLogoBuffer;
  }

  const size = 64;
  const scale = 0.95;
  const offsetX = 17;
  const offsetY = 9;

  function transformPoly(pts: [number, number][]): [number, number][] {
    return pts.map(([x, y]) => [x * scale + offsetX, y * scale + offsetY]);
  }

  const p1 = transformPoly([[0.6, 19.2], [10.2, 19.2], [10.2, 28.8], [0.6, 28.8]]);
  const p2 = transformPoly([[21.8, 28.8], [31.4, 28.8], [31.4, 38.4], [21.8, 38.4]]);
  const p3 = transformPoly([[10.2, 19.2], [21.8, 9.6], [21.8, 19.2], [10.2, 28.8]]);
  const p4 = transformPoly([[21.8, 28.8], [10.2, 38.4], [10.2, 28.8], [21.8, 19.2]]);
  const p5 = transformPoly([[0.6, 19.2], [21.8, 0], [21.8, 9.6], [10.2, 19.2]]);
  const p6 = transformPoly([[31.4, 28.8], [10.2, 48.0], [10.2, 38.4], [21.8, 28.8]]);

  function getIntensity(px: number, py: number): number {
    let intensity = 0;
    if (pointInPoly(px, py, p1)) intensity = Math.max(intensity, 1.0);
    if (pointInPoly(px, py, p2)) intensity = Math.max(intensity, 1.0);
    if (pointInPoly(px, py, p3)) intensity = Math.max(intensity, 0.45);
    if (pointInPoly(px, py, p4)) intensity = Math.max(intensity, 0.7);
    if (pointInPoly(px, py, p5)) intensity = Math.max(intensity, 0.8);
    if (pointInPoly(px, py, p6)) intensity = Math.max(intensity, 0.9);
    return intensity;
  }

  cachedLogoBuffer = createPngBuffer(size, size, (x, y) => {
    // Supersample for ultra crisp edges
    let total = 0;
    const subSamples = 3;
    for (let sx = 0; sx < subSamples; sx++) {
      for (let sy = 0; sy < subSamples; sy++) {
        const px = x + (sx + 0.5) / subSamples;
        const py = y + (sy + 0.5) / subSamples;
        total += getIntensity(px, py);
      }
    }
    const alpha = total / (subSamples * subSamples);
    if (alpha <= 0.01) return [0, 0, 0, 0];

    return [255, 255, 255, Math.round(alpha * 255)];
  });

  return cachedLogoBuffer;
}
