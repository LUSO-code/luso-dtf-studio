import { ImageProcessingProvider, ProcessingConfig, ProcessingResult } from "../provider";
import { analyzeImage, ImageAnalysis } from "../analyzer";
import { runDtfPreflight } from "../preflight";

export class LocalCanvasProvider implements ImageProcessingProvider {
  name = "Local Canvas Deterministic Engine";

  async process(
    sourceImage: HTMLImageElement,
    config: ProcessingConfig,
    originalAnalysis: ImageAnalysis
  ): Promise<ProcessingResult> {
    const startTime = performance.now();

    // 1. Calculate Target Pixel Dimensions
    const targetWidthInches = config.targetWidthCm / 2.54;
    const targetWidthPx = Math.round(targetWidthInches * config.targetDpi);
    const targetHeightPx = Math.round(targetWidthPx / originalAnalysis.aspectRatio);

    // 2. Setup Canvas
    const canvas = document.createElement("canvas");
    canvas.width = targetWidthPx;
    canvas.height = targetHeightPx;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo obtener el contexto de dibujo Canvas 2D.");
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw original image scaled to target canvas
    ctx.drawImage(sourceImage, 0, 0, targetWidthPx, targetHeightPx);

    // 3. Perform Deterministic Transformations (Alpha Cleanup & Thresholding)
    if (config.cleanAlpha || config.removeSemiTransparency || config.removeBackground) {
      const imageData = ctx.getImageData(0, 0, targetWidthPx, targetHeightPx);
      const data = imageData.data;
      const threshold = config.alphaThreshold || 30;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const alpha = data[i + 3];

        // Background color key removal (e.g., pure white background removal)
        if (config.removeBackground) {
          if (r > 245 && g > 245 && b > 245) {
            data[i + 3] = 0; // Make transparent
            continue;
          }
        }

        // Semi-transparency & Alpha Thresholding
        if (alpha < threshold) {
          data[i + 3] = 0; // Cut off low-alpha noise completely
        } else if (config.removeSemiTransparency && alpha < 255) {
          // Normalize semi-transparent edges to full opacity for crisp DTF white underbase
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // 4. Convert Canvas to PNG Blob
    const processedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al exportar PNG procesado."));
      }, "image/png");
    });

    // 5. Re-analyze Processed Image
    const tempImg = new Image();
    tempImg.src = URL.createObjectURL(processedBlob);
    await new Promise((resolve) => (tempImg.onload = resolve));

    const updatedAnalysis = await analyzeImage(tempImg, processedBlob.size, "png");
    URL.revokeObjectURL(tempImg.src);

    // 6. Run Pre-Flight Report
    const preflight = runDtfPreflight(updatedAnalysis, config.targetWidthCm, config.targetDpi);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      processedCanvas: canvas,
      processedBlob,
      analysis: updatedAnalysis,
      preflight,
      processingTimeMs,
    };
  }
}
