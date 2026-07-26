import { PlacedItem } from "@lib/nesting/types";
import { embedPngDpi } from "@lib/image-processing/png-dpi";
import { safeLoadImage } from "@lib/image-processing/utils";

export interface RenderProgressCallback {
  (message: string, percentage: number): void;
}

export class PrintSheetRenderer {
  /**
   * Renders the complete print sheet at production 300 DPI resolution,
   * returning a PNG Blob with embedded 300 DPI pHYs chunk.
   */
  async renderToBlob(
    items: PlacedItem[],
    sheetWidthCm: number,
    sheetHeightCm: number,
    targetDpi: number = 300,
    onProgress?: RenderProgressCallback
  ): Promise<Blob> {
    onProgress?.("Inicializando lienzo de alta resolución...", 10);

    // Formula: pixels = (cm / 2.54) * DPI
    const widthPx = Math.round((sheetWidthCm / 2.54) * targetDpi);
    const heightPx = Math.round((sheetHeightCm / 2.54) * targetDpi);

    // Canvas size safeguard (Max 16384px height)
    const safeWidthPx = Math.min(widthPx, 16384);
    const safeHeightPx = Math.min(heightPx, 16384);

    const canvas = document.createElement("canvas");
    canvas.width = safeWidthPx;
    canvas.height = safeHeightPx;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      throw new Error("No se pudo crear el contexto de renderizado de plancha.");
    }

    // Transparent background by default
    ctx.clearRect(0, 0, safeWidthPx, safeHeightPx);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    onProgress?.("Cargando elementos y recursos procesados...", 30);

    // Render items onto high-res canvas
    let loadedCount = 0;
    for (const item of items) {
      const srcUrl = item.processedFileUrl || item.thumbnailUrl;
      if (!srcUrl) continue;

      let img: HTMLImageElement;
      try {
        img = await safeLoadImage(srcUrl, "anonymous");
      } catch (e) {
        continue; // Skip failing image cleanly without crashing job
      }

      // Calculate pixel coordinates
      const itemXPx = Math.round((item.xCm / 2.54) * targetDpi);
      const itemYPx = Math.round((item.yCm / 2.54) * targetDpi);
      const itemWPx = Math.round((item.widthCm / 2.54) * targetDpi);
      const itemHPx = Math.round((item.heightCm / 2.54) * targetDpi);

      ctx.save();

      // Translate to item center for rotation
      const centerX = itemXPx + itemWPx / 2;
      const centerY = itemYPx + itemHPx / 2;
      ctx.translate(centerX, centerY);

      if (item.rotation) {
        ctx.rotate((item.rotation * Math.PI) / 180);
      }

      // Draw centered image
      ctx.drawImage(img, -itemWPx / 2, -itemHPx / 2, itemWPx, itemHPx);

      ctx.restore();

      loadedCount++;
      const progressPercent = 30 + Math.round((loadedCount / items.length) * 40);
      onProgress?.(`Renderizando elemento ${loadedCount} de ${items.length}...`, progressPercent);
    }

    onProgress?.("Generando archivo PNG para RIP...", 80);

    // Export PNG Blob
    const rawBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Error al exportar PNG de plancha."));
      }, "image/png");
    });

    onProgress?.("Inyectando metadatos pHYs (300 DPI)...", 95);

    // Inject pHYs 300 DPI chunk
    const finalBlob = await embedPngDpi(rawBlob, targetDpi);

    onProgress?.("Exportación completada exitosamente.", 100);

    return finalBlob;
  }
}
