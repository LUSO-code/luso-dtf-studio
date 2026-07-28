import { analyzeImage, ImageAnalysis } from "./analyzer";
import { detectImageCharacteristics, AutoDetectionResult } from "./auto-detector";
import { UnderbaseGenerator } from "./underbase/generator";
import { safeLoadImage } from "./utils";
import { embedPngDpi } from "./png-dpi";

export interface AutoPrepOptions {
  targetWidthCm?: number;
  targetDpi?: number;
  bgTreatment?: "auto" | "preserve" | "remove_white" | "remove_color" | "keep_intact";
  edgeCleaning?: "suave" | "estandar" | "agresiva"; // Alpha threshold: 15, 30, 60
  chokeSetting?: "fino" | "estandar" | "fuerte" | "custom"; // Choke mm: 0.20, 0.35, 0.60
  customChokeMm?: number;
  customChromaColor?: { r: number; g: number; b: number };
}

export interface AutoPrepResult {
  colorBlob: Blob;
  underbaseBlob: Blob;
  colorUrl: string;
  underbaseUrl: string;
  analysis: ImageAnalysis;
  detection: AutoDetectionResult;
  widthCm: number;
  heightCm: number;
  dpi: number;
  chokeMm: number;
  qualityStatus: "EXCELLENT" | "GOOD" | "LOW_RES";
  processingTimeMs: number;
}

/**
 * Unified DTF Auto Prep Orchestration Service
 * Coordinates image analysis, Auto-Decision classification, safe background treatment,
 * alpha edge cleanup, white underbase generation, choke application, and DPI metadata injection.
 */
export async function executeDtfAutoPrep(
  sourceInput: File | Blob | string,
  options: AutoPrepOptions = {}
): Promise<AutoPrepResult> {
  const startTime = performance.now();

  let srcUrl: string;
  let fileObj: File | null = null;
  let fileSize = 0;
  let fileFormat = "png";

  if (typeof sourceInput === "string") {
    srcUrl = sourceInput;
  } else {
    fileObj = sourceInput instanceof File ? sourceInput : null;
    fileSize = sourceInput.size;
    fileFormat = fileObj?.name.split(".").pop()?.toLowerCase() || "png";
    srcUrl = URL.createObjectURL(sourceInput);
  }

  try {
    // 1. Safe Load Image
    const img = await safeLoadImage(srcUrl);

    // 2. Perform Image Analysis
    const analysis = await analyzeImage(img, fileSize, fileFormat);

    // 3. Setup Processing Canvas
    const targetDpi = options.targetDpi || 300;
    const targetWidthCm = options.targetWidthCm || analysis.estimatedPrintWidthCm || 30;
    const targetWidthInches = targetWidthCm / 2.54;
    const targetWidthPx = Math.min(Math.round(targetWidthInches * targetDpi), 8192);
    const targetHeightPx = Math.round(targetWidthPx / analysis.aspectRatio);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidthPx;
    canvas.height = targetHeightPx;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo inicializar el contexto 2D para la preparación automática.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, targetWidthPx, targetHeightPx);

    // 4. Auto Detection Classification (CASO A, B, C, D)
    const detection = detectImageCharacteristics(canvas, analysis);

    // 5. Apply Safe Background Treatment
    const treatment = options.bgTreatment || "auto";
    const shouldRemoveWhite =
      treatment === "remove_white" ||
      (treatment === "auto" && detection.recommendedAction === "remove_white_bg");
    const shouldRemoveColor =
      treatment === "remove_color" ||
      (treatment === "auto" && detection.recommendedAction === "remove_color_bg");

    if (shouldRemoveWhite && detection.backgroundMask) {
      // Apply Safe Perimeter Flood-Fill Mask (Preserves internal white letters, eyes, highlights)
      const imageData = ctx.getImageData(0, 0, targetWidthPx, targetHeightPx);
      const data = imageData.data;

      // Resample background mask to target dimensions if scaled
      const mask = detection.backgroundMask;
      const maskW = analysis.width;
      const maskH = analysis.height;

      for (let y = 0; y < targetHeightPx; y++) {
        for (let x = 0; x < targetWidthPx; x++) {
          const origX = Math.min(Math.floor((x / targetWidthPx) * maskW), maskW - 1);
          const origY = Math.min(Math.floor((y / targetHeightPx) * maskH), maskH - 1);
          const maskIdx = origY * maskW + origX;

          if (mask[maskIdx] === 1) {
            const pIdx = (y * targetWidthPx + x) * 4;
            data[pIdx + 3] = 0; // Make perimeter background transparent
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (shouldRemoveColor && (options.customChromaColor || detection.dominantBorderColor)) {
      const targetColor = options.customChromaColor || detection.dominantBorderColor!;
      const imageData = ctx.getImageData(0, 0, targetWidthPx, targetHeightPx);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const dist = Math.sqrt(
          Math.pow(r - targetColor.r, 2) +
          Math.pow(g - targetColor.g, 2) +
          Math.pow(b - targetColor.b, 2)
        );
        if (dist < 45) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // 6. Alpha Channel Edge Cleanup
    let cutoffThreshold = 20;
    if (options.edgeCleaning === "suave") cutoffThreshold = 10;
    if (options.edgeCleaning === "agresiva") cutoffThreshold = 55;

    const imgData = ctx.getImageData(0, 0, targetWidthPx, targetHeightPx);
    const pixels = imgData.data;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < cutoffThreshold) {
        pixels[i] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 7. Export Color Blob & Embed DPI
    const rawColorBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Error al exportar PNG de color."))), "image/png");
    });
    const colorBlob = await embedPngDpi(rawColorBlob, targetDpi);
    const colorUrl = URL.createObjectURL(colorBlob);

    // 8. Generate White Ink Underbase with Recommended Choke
    let chokeMm = 0.35; // Default recomendado
    if (options.chokeSetting === "fino") chokeMm = 0.20;
    if (options.chokeSetting === "fuerte") chokeMm = 0.60;
    if (options.chokeSetting === "custom" && typeof options.customChokeMm === "number") {
      chokeMm = options.customChokeMm;
    }

    const generator = new UnderbaseGenerator();
    const underbaseResult = await generator.generate(canvas, {
      underbaseVersion: "1.0",
      mode: "agresivo",
      processingType: "binary",
      chokeMm,
      chokePixels: 4,
      alphaThreshold: cutoffThreshold,
      targetDpi,
      garmentColorSim: "#000000",
    });

    const underbaseBlob = underbaseResult.underbaseBlob;
    const underbaseUrl = URL.createObjectURL(underbaseBlob);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      colorBlob,
      underbaseBlob,
      colorUrl,
      underbaseUrl,
      analysis,
      detection,
      widthCm: targetWidthCm,
      heightCm: Number(((targetHeightPx / targetDpi) * 2.54).toFixed(2)),
      dpi: targetDpi,
      chokeMm,
      qualityStatus: detection.qualityBadge,
      processingTimeMs,
    };
  } finally {
    if (typeof sourceInput !== "string") {
      URL.revokeObjectURL(srcUrl);
    }
  }
}
