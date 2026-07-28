import { ImageAnalysis } from "./analyzer";

export type ImageClassification =
  | "NATIVE_TRANSPARENCY"
  | "WHITE_OR_LIGHT_BACKGROUND"
  | "SOLID_COLOR_BACKGROUND"
  | "COMPLEX_BACKGROUND";

export interface AutoDetectionResult {
  classification: ImageClassification;
  confidence: number; // 0.0 to 1.0
  hasTransparentBorder: boolean;
  isWhiteBackground: boolean;
  isSolidColorBackground: boolean;
  dominantBorderColor: { r: number; g: number; b: number } | null;
  recommendedAction: "preserve" | "remove_white_bg" | "remove_color_bg" | "keep_intact";
  recommendedChokeMm: number; // default 0.35 mm
  userMessage: string;
  qualityBadge: "EXCELLENT" | "GOOD" | "LOW_RES";
  backgroundMask?: Uint8Array; // 1 byte per pixel: 1 = background to remove, 0 = keep
}

/**
 * Perimeter-based Auto-Decision Engine for DTF Auto Prep.
 * Performs perimeter color analysis & flood-fill segmentation to safely distinguish
 * external removable backgrounds from internal artwork elements (e.g., white letters, eyes, highlights).
 */
export function detectImageCharacteristics(
  canvas: HTMLCanvasElement,
  analysis: ImageAnalysis
): AutoDetectionResult {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx || width === 0 || height === 0) {
    return {
      classification: "COMPLEX_BACKGROUND",
      confidence: 0,
      hasTransparentBorder: false,
      isWhiteBackground: false,
      isSolidColorBackground: false,
      dominantBorderColor: null,
      recommendedAction: "keep_intact",
      recommendedChokeMm: 0.35,
      userMessage: "No se pudo inspeccionar el lienzo de la imagen.",
      qualityBadge: "GOOD",
    };
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  // 1. Perimeter Sampling (Top, Bottom, Left, Right edges)
  let transparentBorderCount = 0;
  let whiteBorderCount = 0;
  let borderPixelCount = 0;
  const borderColorCounts: Map<string, number> = new Map();

  const samplePixelAt = (x: number, y: number) => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    borderPixelCount++;

    if (a < 20) {
      transparentBorderCount++;
    } else {
      if (r > 235 && g > 235 && b > 235) {
        whiteBorderCount++;
      }
      // Quantize color to 16-level buckets to identify dominant solid background key
      const key = `${Math.floor(r / 16) * 16},${Math.floor(g / 16) * 16},${Math.floor(b / 16) * 16}`;
      borderColorCounts.set(key, (borderColorCounts.get(key) || 0) + 1);
    }
  };

  // Sample top & bottom rows
  for (let x = 0; x < width; x += Math.max(1, Math.floor(width / 100))) {
    samplePixelAt(x, 0);
    samplePixelAt(x, height - 1);
  }

  // Sample left & right columns
  for (let y = 0; y < height; y += Math.max(1, Math.floor(height / 100))) {
    samplePixelAt(0, y);
    samplePixelAt(width - 1, y);
  }

  const transparentBorderRatio = transparentBorderCount / borderPixelCount;
  const whiteBorderRatio = whiteBorderCount / borderPixelCount;

  // Evaluate Resolution Quality Badge
  let qualityBadge: "EXCELLENT" | "GOOD" | "LOW_RES" = "EXCELLENT";
  if (analysis.width < 800 || analysis.height < 800) {
    qualityBadge = "LOW_RES";
  } else if (analysis.width < 1500 || analysis.height < 1500) {
    qualityBadge = "GOOD";
  }

  // CASO A: NATIVE_TRANSPARENCY (PNG/WebP with transparent border)
  if (analysis.hasTransparency && (transparentBorderRatio > 0.3 || analysis.transparentPixelCount > totalPixels * 0.1)) {
    return {
      classification: "NATIVE_TRANSPARENCY",
      confidence: 1.0,
      hasTransparentBorder: true,
      isWhiteBackground: false,
      isSolidColorBackground: false,
      dominantBorderColor: null,
      recommendedAction: "preserve",
      recommendedChokeMm: 0.35,
      userMessage: "Transparencia nativa detectada. Fondo recortado limpiamente.",
      qualityBadge,
    };
  }

  // CASO B: WHITE_OR_LIGHT_BACKGROUND (Opaque image with solid white/light border)
  if (whiteBorderRatio > 0.85) {
    // Generate Perimeter Connected Flood-Fill Mask to strictly protect internal white artwork
    const backgroundMask = new Uint8Array(totalPixels);
    const queue: number[] = [];

    // Seed outer perimeter
    for (let x = 0; x < width; x++) {
      queue.push(0 * width + x);
      queue.push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      queue.push(y * width + 0);
      queue.push(y * width + (width - 1));
    }

    while (queue.length > 0) {
      const pIdx = queue.pop()!;
      if (backgroundMask[pIdx] === 1) continue;

      const px = pIdx % width;
      const py = Math.floor(pIdx / width);
      const dataIdx = pIdx * 4;

      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      const a = data[dataIdx + 3];

      // Connected background pixel condition: opaque white/light
      if (a >= 20 && r > 230 && g > 230 && b > 230) {
        backgroundMask[pIdx] = 1;

        // Push 4-connected neighbors
        if (px > 0 && backgroundMask[pIdx - 1] === 0) queue.push(pIdx - 1);
        if (px < width - 1 && backgroundMask[pIdx + 1] === 0) queue.push(pIdx + 1);
        if (py > 0 && backgroundMask[pIdx - width] === 0) queue.push(pIdx - width);
        if (py < height - 1 && backgroundMask[pIdx + width] === 0) queue.push(pIdx + width);
      }
    }

    return {
      classification: "WHITE_OR_LIGHT_BACKGROUND",
      confidence: 0.95,
      hasTransparentBorder: false,
      isWhiteBackground: true,
      isSolidColorBackground: false,
      dominantBorderColor: { r: 255, g: 255, b: 255 },
      recommendedAction: "remove_white_bg",
      recommendedChokeMm: 0.35,
      userMessage: "Fondo blanco detectado. Remoción perimetral segura activada.",
      qualityBadge,
      backgroundMask,
    };
  }

  // CASO C: SOLID_COLOR_BACKGROUND (Opaque image with dominant solid color border)
  let maxCount = 0;
  let dominantKey = "";
  borderColorCounts.forEach((cnt: number, key: string) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      dominantKey = key;
    }
  });

  if (dominantKey !== "" && maxCount / borderPixelCount > 0.8) {
    const [dr, dg, db] = dominantKey.split(",").map(Number);
    return {
      classification: "SOLID_COLOR_BACKGROUND",
      confidence: 0.85,
      hasTransparentBorder: false,
      isWhiteBackground: false,
      isSolidColorBackground: true,
      dominantBorderColor: { r: dr, g: dg, b: db },
      recommendedAction: "remove_color_bg",
      recommendedChokeMm: 0.35,
      userMessage: `Fondo de color sólido detectado (${dr},${dg},${db}).`,
      qualityBadge,
    };
  }

  // CASO D: COMPLEX_BACKGROUND (Photo, gradient, heterogeneous border)
  return {
    classification: "COMPLEX_BACKGROUND",
    confidence: 0.0,
    hasTransparentBorder: false,
    isWhiteBackground: false,
    isSolidColorBackground: false,
    dominantBorderColor: null,
    recommendedAction: "keep_intact",
    recommendedChokeMm: 0.35,
    userMessage: "Fondo complejo / fotografía. Conservado intacto para proteger el arte.",
    qualityBadge,
  };
}
