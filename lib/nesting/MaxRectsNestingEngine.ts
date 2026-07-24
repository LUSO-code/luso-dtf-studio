import { NestingEngine } from "./NestingEngine";
import { NestingConfig, NestingInputItem, NestingResult, PlacedItem } from "./types";

interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class MaxRectsNestingEngine implements NestingEngine {
  name = "MaxRects Production 2D Nesting Engine";

  nest(items: NestingInputItem[], config: NestingConfig): NestingResult {
    const startTime = performance.now();

    const { sheetWidthCm, sheetHeightCm, marginCm, spacingCm, allowRotation } = config;

    // Usable Area inside sheet margins
    const usableX = marginCm;
    const usableY = marginCm;
    const usableWidth = Math.max(0, sheetWidthCm - 2 * marginCm);
    const usableHeight = Math.max(0, sheetHeightCm - 2 * marginCm);
    const usableSheetAreaCm2 = usableWidth * usableHeight;

    // Initialize Free Rectangles pool with full usable sheet area
    let freeRectangles: FreeRectangle[] = [
      {
        x: usableX,
        y: usableY,
        width: usableWidth,
        height: usableHeight,
      },
    ];

    // Sort items by descending area (Best-Area-Fit heuristic for MaxRects)
    const sortedItems = [...items].sort((a, b) => b.widthCm * b.heightCm - a.widthCm * a.heightCm);

    const placedItems: PlacedItem[] = [];
    const unplacedItems: NestingInputItem[] = [];
    let totalUsedAreaCm2 = 0;

    for (const item of sortedItems) {
      let bestRect: FreeRectangle | null = null;
      let bestRotated = false;
      let bestShortSideFit = Infinity;

      const itemW = item.widthCm;
      const itemH = item.heightCm;

      // Evaluate placement across free rectangles
      for (const rect of freeRectangles) {
        // Option A: 0° Rotation (widthCm x heightCm)
        if (rect.width >= itemW && rect.height >= itemH) {
          const leftoverX = rect.width - itemW;
          const leftoverY = rect.height - itemH;
          const shortSideFit = Math.min(leftoverX, leftoverY);

          if (shortSideFit < bestShortSideFit) {
            bestShortSideFit = shortSideFit;
            bestRect = rect;
            bestRotated = false;
          }
        }

        // Option B: 90° Rotation (heightCm x widthCm)
        if (allowRotation && item.allowRotation !== false) {
          if (rect.width >= itemH && rect.height >= itemW) {
            const leftoverX = rect.width - itemH;
            const leftoverY = rect.height - itemW;
            const shortSideFit = Math.min(leftoverX, leftoverY);

            if (shortSideFit < bestShortSideFit) {
              bestShortSideFit = shortSideFit;
              bestRect = rect;
              bestRotated = true;
            }
          }
        }
      }

      if (bestRect) {
        const placedW = bestRotated ? itemH : itemW;
        const placedH = bestRotated ? itemW : itemH;
        const rotation = bestRotated ? 90 : 0;

        const placed: PlacedItem = {
          id: item.id,
          designId: item.designId,
          name: item.name,
          thumbnailUrl: item.thumbnailUrl,
          processedFileUrl: item.processedFileUrl,
          xCm: Number(bestRect.x.toFixed(2)),
          yCm: Number(bestRect.y.toFixed(2)),
          widthCm: Number(placedW.toFixed(2)),
          heightCm: Number(placedH.toFixed(2)),
          rotation,
          areaCm2: placedW * placedH,
        };

        placedItems.push(placed);
        totalUsedAreaCm2 += itemW * itemH;

        // Splitting box accounts for item dimensions plus required spacingCm padding
        const occupiedBox: FreeRectangle = {
          x: bestRect.x,
          y: bestRect.y,
          width: placedW + spacingCm,
          height: placedH + spacingCm,
        };

        // Split free rectangles by occupied area
        freeRectangles = splitFreeRectangles(freeRectangles, occupiedBox);
      } else {
        unplacedItems.push(item);
      }
    }

    const rawUtilization = usableSheetAreaCm2 > 0 ? (totalUsedAreaCm2 / usableSheetAreaCm2) * 100 : 0;
    const utilizationPercentage = Number(Math.min(100, Math.max(0, rawUtilization)).toFixed(1));
    const wastePercentage = Number((100 - utilizationPercentage).toFixed(1));
    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      placedItems,
      unplacedItems,
      utilizationPercentage,
      wastePercentage,
      usableSheetAreaCm2: Number(usableSheetAreaCm2.toFixed(1)),
      totalUsedAreaCm2: Number(totalUsedAreaCm2.toFixed(1)),
      executionTimeMs,
    };
  }
}

/**
 * Splits existing free rectangles when a new rectangle is placed inside.
 */
function splitFreeRectangles(freeRects: FreeRectangle[], used: FreeRectangle): FreeRectangle[] {
  const result: FreeRectangle[] = [];

  for (const rect of freeRects) {
    if (!intersects(rect, used)) {
      result.push(rect);
      continue;
    }

    // Top leftover
    if (used.y > rect.y && used.y < rect.y + rect.height) {
      result.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: used.y - rect.y,
      });
    }

    // Bottom leftover
    if (used.y + used.height < rect.y + rect.height) {
      result.push({
        x: rect.x,
        y: used.y + used.height,
        width: rect.width,
        height: rect.y + rect.height - (used.y + used.height),
      });
    }

    // Left leftover
    if (used.x > rect.x && used.x < rect.x + rect.width) {
      result.push({
        x: rect.x,
        y: rect.y,
        width: used.x - rect.x,
        height: rect.height,
      });
    }

    // Right leftover
    if (used.x + used.width < rect.x + rect.width) {
      result.push({
        x: used.x + used.width,
        y: rect.y,
        width: rect.x + rect.width - (used.x + used.width),
        height: rect.height,
      });
    }
  }

  // Filter out redundant enclosed rectangles
  return pruneFreeRectangles(result);
}

function intersects(a: FreeRectangle, b: FreeRectangle): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function pruneFreeRectangles(rects: FreeRectangle[]): FreeRectangle[] {
  const pruned: FreeRectangle[] = [];
  for (let i = 0; i < rects.length; i++) {
    let isContained = false;
    for (let j = 0; j < rects.length; j++) {
      if (i === j) continue;
      if (isEnclosed(rects[i], rects[j])) {
        isContained = true;
        break;
      }
    }
    if (!isContained && rects[i].width > 0.1 && rects[i].height > 0.1) {
      pruned.push(rects[i]);
    }
  }
  return pruned;
}

function isEnclosed(a: FreeRectangle, b: FreeRectangle): boolean {
  return a.x >= b.x && a.y >= b.y && a.x + a.width <= b.x + b.width && a.y + a.height <= b.y + b.height;
}
