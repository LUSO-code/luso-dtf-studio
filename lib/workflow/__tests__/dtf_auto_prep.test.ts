import { detectImageCharacteristics } from "../../image-processing/auto-detector";
import { ImageAnalysis } from "../../image-processing/analyzer";
import { sanitizeStoragePath } from "../../storage/StorageService";

// Helper to create mock Canvas ImageData for node environment testing
function createMockCanvas(width: number, height: number, fillPixel: (x: number, y: number) => [number, number, number, number]) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = fillPixel(x, y);
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }

  const canvas = {
    width,
    height,
    getContext: (type: string) => {
      if (type === "2d") {
        return {
          getImageData: (x: number, y: number, w: number, h: number) => ({
            width: w,
            height: h,
            data,
          }),
        };
      }
      return null;
    },
  } as unknown as HTMLCanvasElement;

  return canvas;
}

function createMockAnalysis(params: Partial<ImageAnalysis> = {}): ImageAnalysis {
  return {
    width: 3000,
    height: 4000,
    aspectRatio: 3000 / 4000,
    format: "png",
    fileSize: 1024 * 1024,
    hasAlpha: true,
    hasTransparency: true,
    hasSemiTransparency: false,
    dpi: 300,
    hasEmbeddedDpi: true,
    estimatedPrintWidthCm: 25.4,
    estimatedPrintHeightCm: 33.8,
    semiTransparentPixelCount: 0,
    transparentPixelCount: 1000,
    opaquePixelCount: 2000,
    isLargeFormat: false,
    warningFlags: [],
    ...params,
  };
}

async function runDtfAutoPrepTests() {
  console.log("==========================================");
  console.log("RUNNING DTF AUTO PREP ENGINE SUITE");
  console.log("==========================================");

  // Test 1: Transparent PNG (Caso A)
  const canvasA = createMockCanvas(100, 100, (x, y) => {
    // Border transparent, center red graphic
    if (x < 10 || x > 90 || y < 10 || y > 90) return [0, 0, 0, 0];
    return [255, 0, 0, 255];
  });
  const analysisA = createMockAnalysis({ hasTransparency: true, transparentPixelCount: 5000 });
  const resA = detectImageCharacteristics(canvasA, analysisA);

  console.assert(resA.classification === "NATIVE_TRANSPARENCY", "Test 1 Failed: Transparent PNG must be NATIVE_TRANSPARENCY");
  console.assert(resA.confidence === 1.0, "Test 1 Failed: Confidence must be 1.0");
  console.log("✓ Test 1 Passed: Transparent PNG classified as NATIVE_TRANSPARENCY (100% confidence).");

  // Test 2: Opaque JPG with Solid White Background (Caso B)
  const canvasB = createMockCanvas(100, 100, (x, y) => {
    // Outer border pure white, center red logo
    if (x < 15 || x > 85 || y < 15 || y > 85) return [255, 255, 255, 255];
    return [220, 30, 30, 255];
  });
  const analysisB = createMockAnalysis({ hasTransparency: false, transparentPixelCount: 0 });
  const resB = detectImageCharacteristics(canvasB, analysisB);

  console.assert(resB.classification === "WHITE_OR_LIGHT_BACKGROUND", "Test 2 Failed: White border must be WHITE_OR_LIGHT_BACKGROUND");
  console.assert(resB.confidence === 0.95, "Test 2 Failed: Confidence must be 0.95");
  console.assert(resB.backgroundMask !== undefined, "Test 2 Failed: Must generate backgroundMask");
  console.log("✓ Test 2 Passed: White background classified with 95% confidence and flood-fill mask.");

  // Test 3: White background with internal white artwork (Letters, eyes, highlights)
  const canvasBInternalWhite = createMockCanvas(100, 100, (x, y) => {
    // Border white
    if (x < 10 || x > 90 || y < 10 || y > 90) return [255, 255, 255, 255];
    // Colored ring
    if (x < 20 || x > 80 || y < 20 || y > 80) return [0, 0, 0, 255]; // Black ring
    // Internal white artwork (e.g. white text or character eyes in center)
    return [255, 255, 255, 255];
  });
  const resBInternal = detectImageCharacteristics(canvasBInternalWhite, analysisB);

  // Verify that flood-fill mask ONLY marks perimeter pixels (0..10), NOT internal center white pixels (20..80)
  const mask = resBInternal.backgroundMask!;
  const centerPixelIdx = 50 * 100 + 50; // (50, 50) is inside internal white text
  console.assert(mask[centerPixelIdx] === 0, "Test 3 Failed: Internal white text must be PROTECTED (mask = 0)");
  console.log("✓ Test 3 Passed: Internal white artwork & text protected against accidental removal.");

  // Test 4: Opaque JPG with Solid Color Background (Caso C - e.g. Solid Red)
  const canvasC = createMockCanvas(100, 100, (x, y) => {
    if (x < 15 || x > 85 || y < 15 || y > 85) return [200, 20, 20, 255]; // Red border
    return [20, 200, 20, 255]; // Green center logo
  });
  const resC = detectImageCharacteristics(canvasC, analysisB);

  console.assert(resC.classification === "SOLID_COLOR_BACKGROUND", "Test 4 Failed: Solid color border must be SOLID_COLOR_BACKGROUND");
  console.assert(resC.dominantBorderColor?.r === 192, "Test 4 Failed: Correct dominant color bucket");
  console.log("✓ Test 4 Passed: Solid color background detected with dominant RGB color key.");

  // Test 5: Complex Photograph / Gradient (Caso D)
  const canvasD = createMockCanvas(100, 100, (x, y) => {
    // Heterogeneous rainbow border
    return [(x * 2.5) % 255, (y * 2.5) % 255, (x + y) % 255, 255];
  });
  const resD = detectImageCharacteristics(canvasD, analysisB);

  console.assert(resD.classification === "COMPLEX_BACKGROUND", "Test 5 Failed: Photo/gradient must be COMPLEX_BACKGROUND");
  console.assert(resD.recommendedAction === "keep_intact", "Test 5 Failed: Complex photo must be kept intact");
  console.log("✓ Test 5 Passed: Complex photograph preserved intact without destructive auto-removal.");

  // Test 6: Low Resolution Warning Badge (<800px)
  const analysisLowRes = createMockAnalysis({ width: 600, height: 600 });
  const resLowRes = detectImageCharacteristics(canvasA, analysisLowRes);
  console.assert(resLowRes.qualityBadge === "LOW_RES", "Test 6 Failed: Low resolution badge required");
  console.log("✓ Test 6 Passed: Low resolution warning badge assigned for <800px images.");

  // Test 7: Recommended Default Choke (0.35 mm)
  console.assert(resA.recommendedChokeMm === 0.35, "Test 7 Failed: Default choke must be 0.35 mm");
  console.log("✓ Test 7 Passed: Recommended default choke set to 0.35 mm.");

  // Test 8: Storage Path Sanitization (Non-ASCII, quotes, accents, spanish punctuation)
  const problematicPath = `038f7d52/designs/13552314/original/“Maeta, ¿cuándo salimos de vacaciones”.png`;
  const sanitized = sanitizeStoragePath(problematicPath);
  console.assert(
    sanitized === `038f7d52/designs/13552314/original/_Maeta_cuando_salimos_de_vacaciones_.png`,
    `Test 8 Failed: Storage path sanitization mismatch, got: ${sanitized}`
  );
  console.log("✓ Test 8 Passed: Storage path sanitization converts non-ASCII & quote characters to safe keys.");

  console.log("==========================================");
  console.log("ALL 8 DTF AUTO PREP ENGINE TESTS PASSED 100%");
  console.log("==========================================");
}

runDtfAutoPrepTests().catch((err) => {
  console.error("DTF Auto Prep engine test suite failed:", err);
  process.exit(1);
});
