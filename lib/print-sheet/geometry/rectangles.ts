import { PlacedItem } from "@lib/nesting/types";

export interface Rectangle {
  xCm: number;
  yCm: number;
  widthCm: number;
  heightCm: number;
}

/**
 * Checks if two design instance rectangles overlap.
 */
export function checkOverlap(rectA: Rectangle, rectB: Rectangle): boolean {
  return (
    rectA.xCm < rectB.xCm + rectB.widthCm &&
    rectA.xCm + rectA.widthCm > rectB.xCm &&
    rectA.yCm < rectB.yCm + rectB.heightCm &&
    rectA.yCm + rectA.heightCm > rectB.yCm
  );
}

/**
 * Checks if a design instance is fully inside the printable sheet area (respecting outer margins).
 */
export function isWithinSheet(
  rect: Rectangle,
  sheetWidthCm: number,
  sheetHeightCm: number,
  marginCm: number = 0
): boolean {
  return (
    rect.xCm >= marginCm &&
    rect.yCm >= marginCm &&
    rect.xCm + rect.widthCm <= sheetWidthCm - marginCm + 0.01 &&
    rect.yCm + rect.heightCm <= sheetHeightCm - marginCm + 0.01
  );
}

/**
 * Validates minimum spacing between placed items.
 */
export function validateSpacing(
  items: PlacedItem[],
  minSpacingCm: number
): { valid: boolean; errorItemIds: string[] } {
  const errorItemIds = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const itemA = items[i];
      const itemB = items[j];

      // Expanded box with minSpacing
      const expandedA: Rectangle = {
        xCm: itemA.xCm - minSpacingCm / 2,
        yCm: itemA.yCm - minSpacingCm / 2,
        widthCm: itemA.widthCm + minSpacingCm,
        heightCm: itemA.heightCm + minSpacingCm,
      };

      if (checkOverlap(expandedA, itemB)) {
        errorItemIds.add(itemA.id);
        errorItemIds.add(itemB.id);
      }
    }
  }

  return {
    valid: errorItemIds.size === 0,
    errorItemIds: Array.from(errorItemIds),
  };
}

/**
 * Snaps a physical cm value to grid steps (e.g. 0.5 cm or 1.0 cm).
 */
export function snapToGrid(valueCm: number, gridSizeCm: number = 0.5): number {
  if (gridSizeCm <= 0) return valueCm;
  return Number((Math.round(valueCm / gridSizeCm) * gridSizeCm).toFixed(2));
}
