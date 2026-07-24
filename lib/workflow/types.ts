export type WorkflowStep =
  | "upload"
  | "image_lab"
  | "underbase_lab"
  | "print_sheet"
  | "export";

export interface DesignStatusSummary {
  hasOriginal: boolean;
  hasProcessed: boolean;
  hasUnderbase: boolean;
  isReadyForSheet: boolean;
  statusBadge: "ORIGINAL" | "PROCESADO" | "DTF OPTIMIZADO" | "MÁSCARA DE BLANCO LISTA" | "LISTO PARA PLANCHA";
}

export interface WorkflowState {
  lastActiveDesignId?: string;
  lastActiveDesignName?: string;
  lastActiveSheetId?: string;
  lastActiveSheetName?: string;
  currentStep?: WorkflowStep;
  updatedAt?: string;
}

/**
 * Calculates progressive status badge for a design record.
 */
export function calculateDesignStatus(design: {
  original_file_url?: string;
  processed_file_url?: string;
  underbase_file_url?: string;
}): DesignStatusSummary {
  const hasOriginal = Boolean(design.original_file_url);
  const hasProcessed = Boolean(design.processed_file_url);
  const hasUnderbase = Boolean(design.underbase_file_url);
  const isReadyForSheet = hasProcessed;

  let statusBadge: DesignStatusSummary["statusBadge"] = "ORIGINAL";
  if (hasUnderbase) {
    statusBadge = "LISTO PARA PLANCHA";
  } else if (hasProcessed) {
    statusBadge = "MÁSCARA DE BLANCO LISTA";
  }

  return {
    hasOriginal,
    hasProcessed,
    hasUnderbase,
    isReadyForSheet,
    statusBadge,
  };
}
