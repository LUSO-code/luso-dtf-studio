"use client";

import { useState } from "react";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { PlacedItem } from "@lib/nesting/types";
import { validatePrintSheetForExport } from "@lib/print-sheet/exportValidation";
import { PrintSheetRenderer } from "@lib/print-sheet/PrintSheetRenderer";
import { UnderbaseGenerator } from "@lib/image-processing/underbase/generator";
import { FileCheck2, Download, X, AlertTriangle, CheckCircle2, RefreshCw, Layers } from "lucide-react";

export type ExportSheetType = "color" | "underbase" | "dual";

interface PreExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PlacedItem[];
  sheetName: string;
  sheetWidthCm: number;
  sheetHeightCm: number;
  marginCm: number;
  spacingCm: number;
  targetDpi: number;
}

export function PreExportModal({
  isOpen,
  onClose,
  items,
  sheetName,
  sheetWidthCm,
  sheetHeightCm,
  marginCm,
  spacingCm,
  targetDpi,
}: PreExportModalProps) {
  const [exportType, setExportType] = useState<ExportSheetType>("color");
  const [isExporting, setIsExporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validation = validatePrintSheetForExport(
    items,
    sheetWidthCm,
    sheetHeightCm,
    marginCm,
    spacingCm
  );

  async function handleExecuteExport() {
    if (!validation.isValid) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const renderer = new PrintSheetRenderer();

      if (exportType === "color" || exportType === "dual") {
        const colorBlob = await renderer.renderToBlob(
          items,
          sheetWidthCm,
          sheetHeightCm,
          targetDpi,
          (msg, pct) => {
            setProgressMsg(`[Color] ${msg}`);
            setProgressPct(pct);
          }
        );

        const url = URL.createObjectURL(colorBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sheetName.replace(/\s+/g, "_")}_COLOR_${sheetWidthCm}x${sheetHeightCm}cm_300DPI.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      if (exportType === "underbase" || exportType === "dual") {
        // Generate Color Sheet first then extract Underbase Mask
        const colorBlob = await renderer.renderToBlob(
          items,
          sheetWidthCm,
          sheetHeightCm,
          targetDpi,
          (msg, pct) => {
            setProgressMsg(`[Máscara Blanco] ${msg}`);
            setProgressPct(pct);
          }
        );

        setProgressMsg("Generando base de blanco para plancha completa...");
        setProgressPct(90);

        const img = new Image();
        img.src = URL.createObjectURL(colorBlob);
        await new Promise((res) => (img.onload = res));

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        const generator = new UnderbaseGenerator();
        const uResult = await generator.generate(canvas, {
          underbaseVersion: "1.0",
          mode: "balanceado",
          processingType: "binary",
          chokeMm: 0.3,
          chokePixels: 4,
          alphaThreshold: 30,
          targetDpi,
          garmentColorSim: "#000000",
        });

        URL.revokeObjectURL(img.src);

        const uUrl = URL.createObjectURL(uResult.underbaseBlob);
        const aU = document.createElement("a");
        aU.href = uUrl;
        aU.download = `${sheetName.replace(/\s+/g, "_")}_BASE_BLANCO_${sheetWidthCm}x${sheetHeightCm}cm_300DPI.png`;
        document.body.appendChild(aU);
        aU.click();
        document.body.removeChild(aU);
        URL.revokeObjectURL(uUrl);
      }

      onClose();
    } catch (err: any) {
      setExportError(err?.message || "Error al renderizar y exportar la plancha.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-lg p-6 space-y-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg font-bold text-on-surface">
              Validación y Exportación para RIP
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Capa / Formato de Salida
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "color", label: "Plancha Color" },
              { id: "underbase", label: "Base de Blanco" },
              { id: "dual", label: "Paquete Dual" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setExportType(mode.id as ExportSheetType)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                  exportType === mode.id
                    ? "bg-secondary text-surface-container-lowest border-secondary shadow-glow-cyan font-bold"
                    : "bg-surface-container/60 border-white/10 text-on-surface"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Lista de Verificación de Plancha
          </h3>

          <div className="space-y-2">
            {validation.checks.map((check) => (
              <div
                key={check.id}
                className={`p-3 rounded-xl border flex items-start gap-3 text-xs ${
                  check.passed
                    ? "bg-surface-container/60 border-secondary/30 text-on-surface"
                    : "bg-error-container/20 border-error/30 text-error"
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{check.name}</p>
                  <p className="text-[11px] opacity-80 mt-0.5">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {exportError && (
          <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {/* Export Progress Bar */}
        {isExporting && (
          <div className="space-y-2 neu-pressed bg-surface-container/60 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-secondary flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{progressMsg}</span>
              </span>
              <span className="font-mono text-on-surface">{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <NeuButton variant="glass" size="md" onClick={onClose} disabled={isExporting}>
            Cancelar
          </NeuButton>

          <NeuButton
            variant="secondary"
            size="md"
            active
            onClick={handleExecuteExport}
            disabled={!validation.isValid || isExporting}
            className="shadow-glow-cyan"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Generando PNG..." : "Exportar PNG (300 DPI)"}</span>
          </NeuButton>
        </div>
      </GlassCard>
    </div>
  );
}
