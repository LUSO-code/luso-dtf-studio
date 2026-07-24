export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  fileSize: number;
  hasAlpha: boolean;
  hasTransparency: boolean;
  hasSemiTransparency: boolean;
  dpi: number;
  estimatedPrintWidthCm: number;
  estimatedPrintHeightCm: number;
  semiTransparentPixelCount: number;
  transparentPixelCount: number;
  opaquePixelCount: number;
}

/**
 * Analyzes an HTMLImageElement or ImageData to extract pixel dimensions,
 * transparency status, semi-transparency counts, and estimated print size.
 */
export async function analyzeImage(
  image: HTMLImageElement,
  fileSize: number = 0,
  fileFormat: string = "png"
): Promise<ImageAnalysis> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const aspectRatio = width / height;

  // Create temporary canvas to inspect pixel data
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(width, 2048); // Limit internal sampling canvas size for performance
  canvas.height = Math.round(canvas.width / aspectRatio);

  const ctx = canvas.getContext("2d");
  let hasAlpha = false;
  let hasTransparency = false;
  let hasSemiTransparency = false;
  let semiTransparentPixelCount = 0;
  let transparentPixelCount = 0;
  let opaquePixelCount = 0;

  if (ctx) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha < 255) {
        hasAlpha = true;
        if (alpha === 0) {
          transparentPixelCount++;
          hasTransparency = true;
        } else {
          semiTransparentPixelCount++;
          hasSemiTransparency = true;
          hasTransparency = true;
        }
      } else {
        opaquePixelCount++;
      }
    }
  }

  const dpi = 300;
  const estimatedPrintWidthCm = Number(((width / dpi) * 2.54).toFixed(2));
  const estimatedPrintHeightCm = Number(((height / dpi) * 2.54).toFixed(2));

  return {
    width,
    height,
    aspectRatio,
    format: fileFormat.toLowerCase(),
    fileSize,
    hasAlpha,
    hasTransparency,
    hasSemiTransparency,
    dpi,
    estimatedPrintWidthCm,
    estimatedPrintHeightCm,
    semiTransparentPixelCount,
    transparentPixelCount,
    opaquePixelCount,
  };
}
