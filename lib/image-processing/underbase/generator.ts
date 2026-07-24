import { UnderbaseConfig, UnderbaseResult } from "./types";
import { applyChokeErosion, mmToPixels } from "./choke";
import { embedPngDpi } from "../png-dpi";

export class UnderbaseGenerator {
  /**
   * Generates a White Ink Underbase Mask from an RGBA image canvas.
   */
  async generate(
    sourceCanvas: HTMLCanvasElement,
    config: UnderbaseConfig
  ): Promise<UnderbaseResult> {
    const startTime = performance.now();

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    const ctx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo obtener el contexto 2D para la generación de base de blanco.");
    }

    const sourceData = ctx.getImageData(0, 0, width, height);
    const data = sourceData.data;

    // Extract 8-bit Alpha Channel
    const alphaBuffer = new Uint8Array(width * height);
    for (let i = 0; i < alphaBuffer.length; i++) {
      alphaBuffer[i] = data[i * 4 + 3];
    }

    // 1. Calculate Choke Radius in Pixels
    const chokePixels = mmToPixels(config.chokeMm, config.targetDpi || 300);

    // 2. Apply Morphological Erosion (Choke/Shrink)
    const erodedAlpha = applyChokeErosion(alphaBuffer, width, height, chokePixels);

    // 3. Create Underbase Grayscale / RGBA Canvas
    const underbaseCanvas = document.createElement("canvas");
    underbaseCanvas.width = width;
    underbaseCanvas.height = height;

    const uCtx = underbaseCanvas.getContext("2d");
    if (!uCtx) {
      throw new Error("No se pudo crear el lienzo para la máscara de base de blanco.");
    }

    const underbaseData = uCtx.createImageData(width, height);
    const uData = underbaseData.data;

    const threshold = config.alphaThreshold || 30;
    const isBinary = config.processingType === "binary" || config.mode === "agresivo";

    for (let i = 0; i < erodedAlpha.length; i++) {
      const alpha = erodedAlpha[i];
      const pixelIdx = i * 4;

      if (alpha < threshold) {
        // Fully transparent pixel (No white ink)
        uData[pixelIdx] = 0;
        uData[pixelIdx + 1] = 0;
        uData[pixelIdx + 2] = 0;
        uData[pixelIdx + 3] = 0;
      } else {
        // White ink mask pixel
        const maskDensity = isBinary ? 255 : alpha;
        uData[pixelIdx] = 255;     // Red = 255 (White)
        uData[pixelIdx + 1] = 255; // Green = 255
        uData[pixelIdx + 2] = 255; // Blue = 255
        uData[pixelIdx + 3] = maskDensity; // Alpha channel = White Ink Density
      }
    }

    uCtx.putImageData(underbaseData, 0, 0);

    // 4. Export PNG Blob
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      underbaseCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al exportar PNG de base de blanco."));
      }, "image/png");
    });

    // 5. Inject pHYs 300 DPI Metadata Chunk
    const underbaseBlob = await embedPngDpi(rawBlob, config.targetDpi || 300);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return {
      underbaseCanvas,
      underbaseBlob,
      chokePixels,
      config: {
        ...config,
        chokePixels,
      },
      processingTimeMs,
    };
  }
}
