import { ImageAnalysis } from "./analyzer";

export interface PreflightCheckItem {
  id: string;
  name: string;
  status: "optimal" | "warning" | "low";
  message: string;
  detail?: string;
}

export interface PreflightReport {
  overallStatus: "optimal" | "warning" | "low";
  overallScore: number; // 0 - 100
  effectiveDpiWidth: number;
  effectiveDpiHeight: number;
  effectiveDpi: number;
  targetWidthCm: number;
  targetHeightCm: number;
  requiredPixelsWidth: number;
  requiredPixelsHeight: number;
  checks: PreflightCheckItem[];
  recommendation: string;
}

/**
 * Evaluates print suitability for DTF printing based on target print width in cm and target DPI.
 * Uses exact formula: requiredPixels = (printWidthCm / 2.54) * targetDpi
 */
export function runDtfPreflight(
  analysis: ImageAnalysis,
  targetWidthCm: number,
  targetDpi: number = 300
): PreflightReport {
  const checks: PreflightCheckItem[] = [];
  let score = 100;

  // Target Height preserving aspect ratio
  const targetHeightCm = Number((targetWidthCm / analysis.aspectRatio).toFixed(2));

  // Required Pixels for 100% 300 DPI Quality
  const requiredPixelsWidth = Math.round((targetWidthCm / 2.54) * targetDpi);
  const requiredPixelsHeight = Math.round((targetHeightCm / 2.54) * targetDpi);

  // Effective DPI at target print dimensions
  const effectiveDpiWidth = Math.round(analysis.width / (targetWidthCm / 2.54));
  const effectiveDpiHeight = Math.round(analysis.height / (targetHeightCm / 2.54));
  const effectiveDpi = Math.min(effectiveDpiWidth, effectiveDpiHeight);

  // 1. Resolution & Effective DPI Check
  if (effectiveDpi >= 280) {
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "optimal",
      message: `Resolución efectiva óptima (${effectiveDpi} DPI).`,
      detail: `Píxeles disponibles (${analysis.width} × ${analysis.height} px) superan o igualan el objetivo técnico para ${targetWidthCm} cm.`,
    });
  } else if (effectiveDpi >= 180) {
    score -= 25;
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "warning",
      message: `Resolución moderada (${effectiveDpi} DPI).`,
      detail: `Para obtener 300 DPI nítidos a ${targetWidthCm} cm se requieren ${requiredPixelsWidth} × ${requiredPixelsHeight} px.`,
    });
  } else {
    score -= 50;
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "low",
      message: `Resolución muy baja (${effectiveDpi} DPI).`,
      detail: `Riesgo de pixelado visible en la impresión DTF a ${targetWidthCm} cm.`,
    });
  }

  // 2. Transparency & Alpha Edge Check
  if (analysis.hasSemiTransparency) {
    score -= 15;
    checks.push({
      id: "transparency",
      name: "Bordes Semi-Transparentes",
      status: "warning",
      message: "Se detectaron píxeles semi-transparentes en los bordes del diseño.",
      detail: "En DTF, los bordes semi-transparentes pueden provocar halos blancos alrededor de la tinta al aplicar la base de blanco.",
    });
  } else if (analysis.hasTransparency) {
    checks.push({
      id: "transparency",
      name: "Transparencia y Canal Alfa",
      status: "optimal",
      message: "Transparencia limpia sin difuminados.",
      detail: "Manejo nítido del mapa de bits para la máscara de blanco.",
    });
  } else {
    checks.push({
      id: "transparency",
      name: "Fondo Opaco",
      status: "warning",
      message: "El archivo no posee fondo transparente.",
      detail: "Usa la herramienta 'Eliminar Fondo por Color' si deseas aislar el estampado.",
    });
  }

  // 3. Format & Large Format Check
  if (analysis.isLargeFormat) {
    checks.push({
      id: "format",
      name: "Formato de Imagen",
      status: "optimal",
      message: "Imagen de alta resolución de gran formato.",
      detail: "Apta para impresiones de gran escala en rollo.",
    });
  }

  // Overall Status Determination
  let overallStatus: "optimal" | "warning" | "low" = "optimal";
  if (score < 55 || checks.some((c) => c.status === "low")) {
    overallStatus = "low";
  } else if (score < 90 || checks.some((c) => c.status === "warning")) {
    overallStatus = "warning";
  }

  let recommendation = "Diseño optimizado y listo para maquetación en plancha DTF.";
  if (overallStatus === "low") {
    recommendation = "Reducir el tamaño de estampado o suministrar un archivo fuente de mayor resolución.";
  } else if (overallStatus === "warning") {
    recommendation = "Apto para imprimir. Aplica el modo de alfa balanceado o conservador según el tipo de diseño.";
  }

  return {
    overallStatus,
    overallScore: Math.max(0, score),
    effectiveDpiWidth,
    effectiveDpiHeight,
    effectiveDpi,
    targetWidthCm,
    targetHeightCm,
    requiredPixelsWidth,
    requiredPixelsHeight,
    checks,
    recommendation,
  };
}
