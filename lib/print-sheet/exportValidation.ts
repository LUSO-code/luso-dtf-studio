import { PlacedItem } from "@lib/nesting/types";
import { checkOverlap, isWithinSheet } from "./geometry/rectangles";

export interface PreExportValidationCheck {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

export interface PreExportValidationResult {
  isValid: boolean;
  checks: PreExportValidationCheck[];
}

export function validatePrintSheetForExport(
  items: PlacedItem[],
  sheetWidthCm: number,
  sheetHeightCm: number,
  marginCm: number,
  spacingCm: number
): PreExportValidationResult {
  const checks: PreExportValidationCheck[] = [];

  // 1. Non-empty check
  const hasItems = items.length > 0;
  checks.push({
    id: "item_count",
    name: "Diseños en Plancha",
    passed: hasItems,
    message: hasItems
      ? `Plancha contiene ${items.length} elemento(s).`
      : "La plancha debe contener al menos un diseño para exportar.",
  });

  // 2. Sheet Boundary Check
  let outOfBoundsCount = 0;
  items.forEach((item) => {
    if (!isWithinSheet(item, sheetWidthCm, sheetHeightCm, marginCm)) {
      outOfBoundsCount++;
    }
  });

  checks.push({
    id: "boundary",
    name: "Límites de Plancha y Margen",
    passed: outOfBoundsCount === 0,
    message:
      outOfBoundsCount === 0
        ? "Todos los diseños están dentro del área imprimible."
        : `${outOfBoundsCount} diseño(s) sobresalen de los márgenes de la plancha.`,
  });

  // 3. Overlap Check
  let overlapCount = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (checkOverlap(items[i], items[j])) {
        overlapCount++;
      }
    }
  }

  checks.push({
    id: "overlap",
    name: "Superposición de Diseños",
    passed: overlapCount === 0,
    message:
      overlapCount === 0
        ? "Sin superposiciones entre diseños."
        : `Se detectaron ${overlapCount} superposición(es) entre elementos.`,
  });

  // 4. Asset Availability Check
  let missingAssetCount = 0;
  items.forEach((item) => {
    if (!item.processedFileUrl && !item.thumbnailUrl) {
      missingAssetCount++;
    }
  });

  checks.push({
    id: "assets",
    name: "Disponibilidad de Archivos Procesados",
    passed: missingAssetCount === 0,
    message:
      missingAssetCount === 0
        ? "Todos los archivos procesados de alta resolución están disponibles."
        : `${missingAssetCount} diseño(s) no poseen archivo de imagen fuente.`,
  });

  const isValid = checks.every((c) => c.passed);

  return {
    isValid,
    checks,
  };
}
