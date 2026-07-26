/**
 * Safe Image Loader Utility
 * Prevents race conditions and infinite hangs when loading images from Blob URLs,
 * data URLs, or remote cross-origin endpoints.
 */
export function safeLoadImage(
  src: string,
  crossOrigin: "anonymous" | "use-credentials" | "" = "anonymous"
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (crossOrigin && !src.startsWith("data:") && !src.startsWith("blob:")) {
      img.crossOrigin = crossOrigin;
    }

    const urlType = src.startsWith("blob:") ? "blob" : src.startsWith("data:") ? "data" : "remote";
    console.log(`[IMAGE_LAB_DEBUG] PROCESSED_LOAD_START urlType=${urlType}`);

    img.onload = () => {
      console.log(
        `[IMAGE_LAB_DEBUG] PROCESSED_LOAD_SUCCESS urlType=${urlType} width=${img.width} height=${img.height} naturalWidth=${img.naturalWidth} naturalHeight=${img.naturalHeight} complete=${img.complete}`
      );
      resolve(img);
    };

    img.onerror = (err) => {
      console.error(`[IMAGE_LAB_DEBUG] PROCESSED_LOAD_ERROR urlType=${urlType}`, err);
      reject(
        new Error(
          "Error al cargar la imagen. Verifique que el archivo no esté dañado y sea una imagen válida."
        )
      );
    };

    img.src = src;

    // Synchronous memory-cache / Blob URL resolution safeguard
    if (img.complete && img.naturalWidth > 0) {
      console.log(
        `[IMAGE_LAB_DEBUG] PROCESSED_LOAD_SUCCESS_SYNC urlType=${urlType} naturalWidth=${img.naturalWidth} naturalHeight=${img.naturalHeight}`
      );
      resolve(img);
    }
  });
}
