import { ImageProcessingProvider, ProcessingConfig, ProcessingResult } from "../provider";
import { analyzeImage, ImageAnalysis } from "../analyzer";
import { runDtfPreflight } from "../preflight";
import { embedPngDpi } from "../png-dpi";

export class LocalCanvasProvider implements ImageProcessingProvider {
  name = "Local Canvas Deterministic Engine v1.0";

  async process(
    sourceImage: HTMLImageElement,
    config: ProcessingConfig,
    originalAnalysis: ImageAnalysis
  ): Promise<ProcessingResult> {
    const startTime = performance.now();

    // 1. Calculate Target Pixel Dimensions
    // Formula: pixels = (centimeters / 2.54) * targetDpi
    const targetWidthInches = config.targetWidthCm / 2.54;
    const targetWidthPx = Math.round(targetWidthInches * config.targetDpi);
    const targetHeightPx = Math.round(targetWidthPx / originalAnalysis.aspectRatio);

    // Safeguard: Limit max Canvas dimension to 8192px to prevent browser GPU/Canvas OOM crashes
    const safeWidthPx = Math.min(targetWidthPx, 8192);
    const safeHeightPx = Math.round(safeWidthPx / originalAnalysis.aspectRatio);

    // 2. Setup Canvas
    const canvas = document.createElement("canvas");
    canvas.width = safeWidthPx;
    canvas.height = safeHeightPx;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo inicializar el motor de renderizado Canvas 2D.");
    }

    // High Quality Bilinear/Bicubic Resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw Source Image
    ctx.drawImage(sourceImage, 0, 0, safeWidthPx, safeHeightPx);

    // 3. Alpha Channel Transformations (Conservative / Balanced / Aggressive Modes)
    if (config.cleanAlpha || config.removeBackground) {
      const imageData = ctx.getImageData(0, 0, safeWidthPx, safeHeightPx);
      const data = imageData.data;

      // Thresholds according to mode
      let cutoffThreshold = config.alphaThreshold || 30;
      if (config.alphaMode === "conservative") {
        cutoffThreshold = Math.min(cutoffThreshold, 15);
      } else if (config.alphaMode === "aggressive") {
        cutoffThreshold = Math.max(cutoffThreshold, 65);
      }

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        // Color-Key Background Removal (Chroma)
        if (config.removeBackground && config.backgroundRemovalMode === "color-key") {
          // Pure white / high-light background keying
          if (r > 245 && g > 245 && b > 245) {
            data[i + 3] = 0;
            continue;
          }
        }

        // Alpha Mode Transformations
        if (alpha < cutoffThreshold) {
          data[i + 3] = 0; // Cut off low opacity noise completely
        } else if (config.alphaMode === "aggressive" && alpha < 255) {
          data[i + 3] = 255; // Force crisp opaque edges for aggressive mode
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // 4. Export PNG Blob
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al generar archivo PNG."));
      }, "image/png");
    });

    // 5. Inject pHYs DPI Chunk (300 DPI metadata) into PNG Binary
    const processedBlob = await embedPngDpi(rawBlob, config.targetDpi);

    // 6. Re-analyze Processed Image
    const tempImg = new Image();
    tempImg.src = URL.createObjectURL(processedBlob);
    await new Promise((resolve) => (tempImg.onload = resolve));

    const updatedAnalysis = await analyzeImage(tempImg, processedBlob.size, "png");
    updatedAnalysis.hasEmbeddedDpi = true;
    URL.revokeObjectURL(tempImg.src);

    // 7. Run Pre-Flight Report
    const preflight = runDtfPreflight(updatedAnalysis, config.targetWidthCm, config.targetDpi);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      processedCanvas: canvas,
      processedBlob,
      analysis: updatedAnalysis,
      preflight,
      processingTimeMs,
      config,
    };
  }
}
