import { ImageAnalysis } from "./analyzer";

export interface PreflightCheckItem {
  id: string;
  name: string;
  status: "optimal" | "warning" | "attention";
  message: string;
  detail?: string;
}

export interface PreflightReport {
  overallStatus: "optimal" | "warning" | "attention";
  overallScore: number; // 0 - 100
  effectiveDpi: number;
  targetWidthCm: number;
  targetHeightCm: number;
  checks: PreflightCheckItem[];
  recommendation: string;
}

/**
 * Evaluates print suitability for DTF printing based on target print width and DPI settings.
 */
export function runDtfPreflight(
  analysis: ImageAnalysis,
  targetWidthCm: number,
  targetDpi: number = 300
): PreflightReport {
  const checks: PreflightCheckItem[] = [];
  let score = 100;

  // Calculate target height preserving aspect ratio
  const targetHeightCm = Number((targetWidthCm / analysis.aspectRatio).toFixed(2));

  // Calculate effective DPI at target print size
  const targetWidthInches = targetWidthCm / 2.54;
  const effectiveDpi = Math.round(analysis.width / targetWidthInches);

  // 1. Resolution & DPI Check
  if (effectiveDpi >= 280) {
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "optimal",
      message: `Excelente resolución de impresión (${effectiveDpi} DPI).`,
      detail: `La imagen contiene suficientes píxeles (${analysis.width}x${analysis.height} px) para imprimirse limpia a ${targetWidthCm} cm.`,
    });
  } else if (effectiveDpi >= 200) {
    score -= 20;
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "warning",
      message: `Resolución moderada (${effectiveDpi} DPI).`,
      detail: `La imagen puede perder ligera nitidez al imprimirse a ${targetWidthCm} cm. Se recomienda mejorar el archivo fuente o reducir el tamaño.`,
    });
  } else {
    score -= 45;
    checks.push({
      id: "resolution",
      name: "Resolución Efectiva",
      status: "attention",
      message: `Resolución insuficiente (${effectiveDpi} DPI).`,
      detail: `Riesgo de pixelado visible en la impresión DTF a ${targetWidthCm} cm.`,
    });
  }

  // 2. Transparency & Alpha Channel Check
  if (analysis.hasSemiTransparency) {
    score -= 15;
    checks.push({
      id: "transparency",
      name: "Bordes con Semi-Transparencia",
      status: "warning",
      message: "Se detectaron píxeles semi-transparentes en los bordes.",
      detail: "En la impresión DTF, los tonos semi-transparentes pueden causar halos blancos no deseados al aplicar la base de tinta blanca. Se recomienda ejecutar la limpieza de alfa.",
    });
  } else if (analysis.hasTransparency) {
    checks.push({
      id: "transparency",
      name: "Canal Alfa y Transparencia",
      status: "optimal",
      message: "Transparencia limpia sin bordes difusos.",
      detail: "El archivo cuenta con fondo transparente nítido para la generación de máscara de blanco.",
    });
  } else {
    checks.push({
      id: "transparency",
      name: "Fondo Opaco Detectado",
      status: "warning",
      message: "El archivo no contiene canal alfa transparente.",
      detail: "Se imprimirá todo el fondo salvo que ejecutes la herramienta de eliminación de fondo.",
    });
  }

  // 3. Format Check
  if (analysis.format === "png" || analysis.format === "webp") {
    checks.push({
      id: "format",
      name: "Formato de Archivo",
      status: "optimal",
      message: `Formato compatible (${analysis.format.toUpperCase()}).`,
    });
  } else {
    score -= 10;
    checks.push({
      id: "format",
      name: "Formato de Archivo",
      status: "warning",
      message: `Formato ${analysis.format.toUpperCase()} sin transparencia nativa.`,
      detail: "Formato no ideal para estampados recortados.",
    });
  }

  // Determine overall status
  let overallStatus: "optimal" | "warning" | "attention" = "optimal";
  if (score < 60 || checks.some((c) => c.status === "attention")) {
    overallStatus = "attention";
  } else if (score < 90 || checks.some((c) => c.status === "warning")) {
    overallStatus = "warning";
  }

  let recommendation = "Diseño listo y apto para maquetar en plancha DTF.";
  if (overallStatus === "attention") {
    recommendation = "Revisar resolución o aplicar limpieza de transparencias antes de maquetar.";
  } else if (overallStatus === "warning") {
    recommendation = "Apto para imprimir. Aplica la limpieza de alfa sugerida para optimizar la tinta blanca.";
  }

  return {
    overallStatus,
    overallScore: Math.max(0, score),
    effectiveDpi,
    targetWidthCm,
    targetHeightCm,
    checks,
    recommendation,
  };
}
