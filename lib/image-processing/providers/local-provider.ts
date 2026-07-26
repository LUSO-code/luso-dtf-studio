import { ImageProcessingProvider, ProcessingConfig, ProcessingResult } from "../provider";
import { analyzeImage, ImageAnalysis } from "../analyzer";
import { runDtfPreflight } from "../preflight";
import { embedPngDpi } from "../png-dpi";
import { safeLoadImage } from "../utils";

export class LocalCanvasProvider implements ImageProcessingProvider {
  name = "Local Canvas Deterministic Engine v1.0";

  async process(
    sourceImage: HTMLImageElement,
    config: ProcessingConfig,
    originalAnalysis: ImageAnalysis
  ): Promise<ProcessingResult> {
    const startTime = performance.now();
    console.log(`[IMAGE_LAB_DEBUG] PROCESSING_START targetWidthCm=${config.targetWidthCm} targetDpi=${config.targetDpi} alphaMode=${config.alphaMode}`);

    // 1. Calculate Target Pixel Dimensions
    const targetWidthInches = config.targetWidthCm / 2.54;
    const targetWidthPx = Math.round(targetWidthInches * config.targetDpi);
    const safeWidthPx = Math.min(targetWidthPx, 8192);
    const safeHeightPx = Math.round(safeWidthPx / originalAnalysis.aspectRatio);

    console.log(`[IMAGE_LAB_DEBUG] CANVAS_RENDER_START safeWidthPx=${safeWidthPx} safeHeightPx=${safeHeightPx}`);

    // 2. Setup Canvas
    const canvas = document.createElement("canvas");
    canvas.width = safeWidthPx;
    canvas.height = safeHeightPx;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo inicializar el motor de renderizado Canvas 2D.");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(sourceImage, 0, 0, safeWidthPx, safeHeightPx);

    // 3. Alpha Channel Transformations
    if (config.cleanAlpha || config.removeBackground) {
      const imageData = ctx.getImageData(0, 0, safeWidthPx, safeHeightPx);
      const data = imageData.data;

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

        if (config.removeBackground && config.backgroundRemovalMode === "color-key") {
          if (r > 245 && g > 245 && b > 245) {
            data[i + 3] = 0;
            continue;
          }
        }

        if (alpha < cutoffThreshold) {
          data[i + 3] = 0;
        } else if (config.alphaMode === "aggressive" && alpha < 255) {
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // 4. Export PNG Blob
    console.log("[IMAGE_LAB_DEBUG] CANVAS_TO_BLOB_START");
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`[IMAGE_LAB_DEBUG] CANVAS_TO_BLOB_SUCCESS blobSize=${blob.size} blobType=${blob.type}`);
          resolve(blob);
        } else {
          console.error("[IMAGE_LAB_DEBUG] CANVAS_TO_BLOB_ERROR canvas.toBlob returned null");
          reject(new Error("Error al generar archivo PNG desde el lienzo Canvas."));
        }
      }, "image/png");
    });

    // 5. Inject pHYs DPI Chunk (300 DPI metadata) into PNG Binary
    const processedBlob = await embedPngDpi(rawBlob, config.targetDpi);
    console.log(`[IMAGE_LAB_DEBUG] EMBED_DPI_SUCCESS processedBlobSize=${processedBlob.size}`);

    // 6. Re-analyze Processed Image using safeLoadImage safeguard
    const objectUrl = URL.createObjectURL(processedBlob);
    console.log("[IMAGE_LAB_DEBUG] PROCESSED_LOAD_START objectUrl generated");
    let tempImg: HTMLImageElement;
    try {
      tempImg = await safeLoadImage(objectUrl);
      console.log(`[IMAGE_LAB_DEBUG] PROCESSED_LOAD_SUCCESS tempImgWidth=${tempImg.naturalWidth} tempImgHeight=${tempImg.naturalHeight}`);
    } catch (loadErr: any) {
      console.error("[IMAGE_LAB_DEBUG] PROCESSED_LOAD_ERROR failed to load processed blob image", loadErr);
      throw loadErr;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    const updatedAnalysis = await analyzeImage(tempImg, processedBlob.size, "png");
    updatedAnalysis.hasEmbeddedDpi = true;

    const preflight = runDtfPreflight(updatedAnalysis, config.targetWidthCm, config.targetDpi);
    const processingTimeMs = Math.round(performance.now() - startTime);

    console.log(`[IMAGE_LAB_DEBUG] PROCESSING_COMPLETE durationMs=${processingTimeMs}`);

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
