export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
  fileSize: number;
  hasAlpha: boolean;
  hasTransparency: boolean;
  hasSemiTransparency: boolean;
  dpi: number; // Target / Estimated DPI
  hasEmbeddedDpi: boolean;
  estimatedPrintWidthCm: number;
  estimatedPrintHeightCm: number;
  semiTransparentPixelCount: number;
  transparentPixelCount: number;
  opaquePixelCount: number;
  isLargeFormat: boolean; // Flag for > 5000px images requiring memory caution
  warningFlags: string[];
}

/**
 * Analyzes an HTMLImageElement to extract pixel dimensions,
 * transparency status, semi-transparency counts, and estimated print size.
 * Includes safeguards for large format images (> 5000px).
 */
export async function analyzeImage(
  image: HTMLImageElement,
  fileSize: number = 0,
  fileFormat: string = "png"
): Promise<ImageAnalysis> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const aspectRatio = width / height;
  const warningFlags: string[] = [];

  const isLargeFormat = width > 5000 || height > 5000;
  if (isLargeFormat) {
    warningFlags.push("Imagen de gran formato (> 5000 px). Renderizado optimizado activado.");
  }

  // Create sampling canvas (limit max sampling dimension to 2048px for browser memory safety & smooth UI)
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(width, 2048);
  canvas.height = Math.round(canvas.width / aspectRatio);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
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

  // Exact DTF Math Formula: 300 DPI = (width / 300) * 2.54 cm
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
    hasEmbeddedDpi: false, // Default false unless PNG pHYs chunk is explicitly parsed
    estimatedPrintWidthCm,
    estimatedPrintHeightCm,
    semiTransparentPixelCount,
    transparentPixelCount,
    opaquePixelCount,
    isLargeFormat,
    warningFlags,
  };
}
