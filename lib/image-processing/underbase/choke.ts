/**
 * Converts physical choke measurement in millimeters to pixel radius at a given DPI.
 * Formula: pixels = Math.round((chokeMm / 25.4) * targetDpi)
 */
export function mmToPixels(chokeMm: number, targetDpi: number = 300): number {
  if (chokeMm <= 0) return 0;
  return Math.round((chokeMm / 25.4) * targetDpi);
}

/**
 * Morphological Erosion Engine for White Ink Underbase Choking.
 * Erodes the alpha channel mask inward by `chokePixels` to prevent white ink bleed on dark garments.
 */
export function applyChokeErosion(
  alphaBuffer: Uint8Array,
  width: number,
  height: number,
  chokePixels: number
): Uint8Array {
  if (chokePixels <= 0) {
    return new Uint8Array(alphaBuffer);
  }

  const radius = Math.min(15, chokePixels); // Cap max erosion radius for performance
  const output = new Uint8Array(width * height);

  // Separable or Min-Filter Kernel Erosion
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const currentAlpha = alphaBuffer[idx];

      if (currentAlpha === 0) {
        output[idx] = 0;
        continue;
      }

      let minAlpha = currentAlpha;

      // Inspect neighborhood in radius
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) {
          minAlpha = 0; // Border pixels erode outward
          break;
        }

        for (let dx = -radius; dx <= radius; dx++) {
          // Circular kernel constraint: dx^2 + dy^2 <= radius^2
          if (dx * dx + dy * dy > radius * radius) continue;

          const nx = x + dx;
          if (nx < 0 || nx >= width) {
            minAlpha = 0;
            break;
          }

          const nIdx = ny * width + nx;
          if (alphaBuffer[nIdx] < minAlpha) {
            minAlpha = alphaBuffer[nIdx];
          }
        }
        if (minAlpha === 0) break;
      }

      output[idx] = minAlpha;
    }
  }

  return output;
}
