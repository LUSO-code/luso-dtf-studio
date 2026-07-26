/**
 * PNG DPI Metadata Helper
 * Injects or updates the 'pHYs' chunk in PNG binary data to set physical resolution (e.g. 300 DPI).
 */

// CRC32 table for PNG chunk validation
const crcTable: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
})();

function calcCrc(buf: Uint8Array, offset: number, length: number): number {
  let c = 0xffffffff;
  for (let i = offset; i < offset + length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Sets DPI metadata in a PNG Blob by inserting a 'pHYs' chunk after the 'IHDR' chunk.
 * Fixed: Correct pHYs chunk buffer size (21 bytes total: 4 len + 4 type + 9 payload + 4 crc)
 */
export async function embedPngDpi(pngBlob: Blob, dpi: number = 300): Promise<Blob> {
  try {
    const arrayBuffer = await pngBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Validate PNG Signature: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes.length < 33 ||
      bytes[0] !== 0x89 ||
      bytes[1] !== 0x50 ||
      bytes[2] !== 0x4e ||
      bytes[3] !== 0x47 ||
      bytes[4] !== 0x0d ||
      bytes[5] !== 0x0a ||
      bytes[6] !== 0x1a ||
      bytes[7] !== 0x0a
    ) {
      return pngBlob; // Not a valid PNG, return unchanged
    }

    // Convert DPI to pixels per meter (1 inch = 0.0254 meters)
    const ppm = Math.round(dpi / 0.0254);

    // Construct pHYs chunk payload (9 bytes)
    // Payload: 4 bytes PPM_X, 4 bytes PPM_Y, 1 byte unit (1 = meter)
    const physPayload = new Uint8Array(9);
    const view = new DataView(physPayload.buffer);
    view.setUint32(0, ppm, false); // PPM X
    view.setUint32(4, ppm, false); // PPM Y
    physPayload[8] = 1; // Unit specifier: 1 = meter

    // Type: 'pHYs' (0x70 0x48 0x59 0x73)
    const chunkType = new Uint8Array([0x70, 0x48, 0x59, 0x73]);

    // Combine Type + Payload for CRC calculation (13 bytes total)
    const crcTarget = new Uint8Array(13);
    crcTarget.set(chunkType, 0);
    crcTarget.set(physPayload, 4);

    const crc = calcCrc(crcTarget, 0, 13);

    // Full pHYs Chunk Array (21 bytes total: 4 len + 4 type + 9 payload + 4 crc)
    const physChunk = new Uint8Array(21);
    const physView = new DataView(physChunk.buffer);
    physView.setUint32(0, 9, false); // Length = 9
    physChunk.set(chunkType, 4); // Chunk Type at offset 4
    physChunk.set(physPayload, 8); // Payload at offset 8 (covers 8..16)
    physView.setUint32(17, crc, false); // CRC at offset 17 (covers 17..20)

    // Find IHDR chunk position (starts at offset 8, IHDR is 25 bytes total: 4 len + 4 type + 13 data + 4 crc)
    // Insert pHYs chunk immediately after IHDR (offset 33)
    const ihdrEndOffset = 33;

    const newBytes = new Uint8Array(bytes.length + physChunk.length);
    newBytes.set(bytes.subarray(0, ihdrEndOffset), 0);
    newBytes.set(physChunk, ihdrEndOffset);
    newBytes.set(bytes.subarray(ihdrEndOffset), ihdrEndOffset + physChunk.length);

    return new Blob([newBytes], { type: "image/png" });
  } catch (err) {
    console.error("[IMAGE_LAB_DEBUG] Error embedding PNG DPI metadata, returning raw blob fallback:", err);
    return pngBlob;
  }
}
