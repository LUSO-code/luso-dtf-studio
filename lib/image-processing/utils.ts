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

    img.onload = () => {
      resolve(img);
    };

    img.onerror = (err) => {
      reject(
        new Error(
          "Error al cargar la imagen. Verifique que el archivo no esté dañado y sea una imagen válida."
        )
      );
    };

    img.src = src;

    // Synchronous memory-cache / Blob URL resolution safeguard
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
    }
  });
}
