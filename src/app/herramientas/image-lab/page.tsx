"use client";

import { useState, useRef, ChangeEvent } from "react";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { BeforeAfterSlider } from "@components/ui/BeforeAfterSlider";
import { AuthGateModal } from "@components/auth/AuthGateModal";
import { analyzeImage, ImageAnalysis } from "@lib/image-processing/analyzer";
import { runDtfPreflight, PreflightReport } from "@lib/image-processing/preflight";
import { ImagePipeline } from "@lib/image-processing/pipeline";
import { getStorageService } from "@lib/storage/StorageService";
import { createClient } from "@lib/supabase/client";
import {
  Upload,
  Sparkles,
  Wrench,
  FileCheck2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sliders,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function ImageLabPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [preflight, setPreflight] = useState<PreflightReport | null>(null);

  // Processing Parameters
  const [targetWidthCm, setTargetWidthCm] = useState<number>(30);
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [cleanAlpha, setCleanAlpha] = useState<boolean>(true);
  const [removeSemiTransparency, setRemoveSemiTransparency] = useState<boolean>(true);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(30);

  // States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth Gate Modal State
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Handle Image File Selection
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSaveSuccess(false);

    // Validate format
    const format = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["png", "jpg", "jpeg", "webp"].includes(format)) {
      setErrorMessage("Formato no compatible. Sube una imagen PNG, JPG o WEBP.");
      return;
    }

    // Validate max size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("El archivo supera el tamaño máximo permitido (50 MB).");
      return;
    }

    setSelectedFile(file);
    setIsAnalyzing(true);

    const objectUrl = URL.createObjectURL(file);
    setOriginalImageUrl(objectUrl);
    setProcessedImageUrl(objectUrl); // Initial fallback

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = objectUrl;

    img.onload = async () => {
      sourceImageRef.current = img;
      try {
        const initialAnalysis = await analyzeImage(img, file.size, format);
        setAnalysis(initialAnalysis);
        setTargetWidthCm(initialAnalysis.estimatedPrintWidthCm || 30);

        const initialPreflight = runDtfPreflight(initialAnalysis, initialAnalysis.estimatedPrintWidthCm || 30, targetDpi);
        setPreflight(initialPreflight);
      } catch (err) {
        setErrorMessage("No se pudo analizar la imagen seleccionada.");
      } finally {
        setIsAnalyzing(false);
      }
    };
  }

  // Run Processing Pipeline
  async function handleProcessImage() {
    if (!sourceImageRef.current || !selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const pipeline = new ImagePipeline();
      const format = selectedFile.name.split(".").pop() || "png";

      const result = await pipeline.run(sourceImageRef.current, selectedFile.size, format, {
        targetWidthCm,
        targetDpi,
        cleanAlpha,
        alphaThreshold,
        removeSemiTransparency,
        removeBackground: false,
      });

      const processedUrl = URL.createObjectURL(result.processedBlob);
      setProcessedImageUrl(processedUrl);
      setProcessedBlob(result.processedBlob);
      setAnalysis(result.analysis);
      setPreflight(result.preflight);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al procesar la imagen.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Save to Designs (Workspace-scoped authenticated operation)
  async function handleSaveToDesigns() {
    setErrorMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If unauthenticated, trigger Progressive Auth Gate Modal
    if (!user) {
      setIsAuthGateOpen(true);
      return;
    }

    if (!selectedFile || !processedBlob || !analysis) {
      setErrorMessage("No hay imagen procesada disponible para guardar.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Get user active workspace
      const { data: member, error: errMember } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (errMember || !member?.workspace_id) {
        throw new Error("No se pudo verificar el espacio de trabajo del usuario.");
      }

      const workspaceId = member.workspace_id;
      const designId = crypto.randomUUID();
      const storageService = getStorageService();

      // 2. Upload Original File
      const originalExt = selectedFile.name.split(".").pop() || "png";
      const originalPath = `${workspaceId}/designs/${designId}/original/${selectedFile.name}`;
      const originalUpload = await storageService.upload("designs", originalPath, selectedFile);

      // 3. Upload Processed PNG File
      const processedPath = `${workspaceId}/designs/${designId}/processed/dtf_optimized_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
      const processedFile = new File([processedBlob], `dtf_optimized_${selectedFile.name}`, { type: "image/png" });
      const processedUpload = await storageService.upload("designs", processedPath, processedFile);

      // 4. Save Record in public.designs
      const { error: errInsert } = await supabase.from("designs").insert({
        id: designId,
        workspace_id: workspaceId,
        name: selectedFile.name.replace(/\.[^/.]+$/, "") + " (Optimizado DTF)",
        original_file_url: originalUpload.url,
        processed_file_url: processedUpload.url,
        width_mm: Math.round(targetWidthCm * 10),
        height_mm: Math.round((targetWidthCm / analysis.aspectRatio) * 10),
        dpi: targetDpi,
        print_width_cm: targetWidthCm,
        print_height_cm: Number((targetWidthCm / analysis.aspectRatio).toFixed(2)),
        processing_status: "completed",
        original_format: originalExt,
        processed_format: "png",
        file_size: processedBlob.size,
        has_alpha: analysis.hasAlpha,
        has_transparency: analysis.hasTransparency,
        processing_config: {
          targetWidthCm,
          targetDpi,
          cleanAlpha,
          alphaThreshold,
          removeSemiTransparency,
        },
        analyzer_metadata: analysis,
      });

      if (errInsert) {
        throw new Error(errInsert.message);
      }

      setSaveSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al guardar el diseño en el espacio de trabajo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        redirectTo="/herramientas/image-lab"
        actionTitle="para guardar el diseño optimizado en tu biblioteca"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio de Optimización DTF</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Image Lab
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Limpia transparencias, evalúa DPI y optimiza imágenes para estampación textil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />
          <NeuButton
            variant="secondary"
            size="md"
            active
            onClick={() => fileInputRef.current?.click()}
            className="shadow-glow-cyan"
          >
            <Upload className="w-4 h-4" />
            <span>{selectedFile ? "Cambiar Imagen" : "Cargar Imagen"}</span>
          </NeuButton>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="neu-pressed bg-error-container/30 border border-error/30 text-error p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="neu-pressed bg-secondary-dark/30 border border-secondary/40 text-secondary p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">¡Diseño guardado exitosamente en "Mis Diseños"!</span>
          </div>
        </div>
      )}

      {/* Main Studio View */}
      {originalImageUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: Interactive Before/After Split Comparison */}
          <div className="lg:col-span-8 space-y-4">
            <GlassCard glow="cyan" className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface border-b border-white/10 pb-3">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-secondary" />
                  <span>Comparativa Visual Antes / Después (Desliza para inspeccionar)</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {analysis ? `${analysis.width} x ${analysis.height} px` : ""}
                </span>
              </div>

              <div className="h-[420px] sm:h-[500px] w-full">
                <BeforeAfterSlider
                  originalUrl={originalImageUrl}
                  processedUrl={processedImageUrl || originalImageUrl}
                  className="h-full w-full"
                />
              </div>
            </GlassCard>

            {/* Pre-Flight Analysis Card */}
            {preflight && (
              <GlassCard glow="violet" className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-base text-on-surface">
                      Reporte DTF Pre-Flight
                    </h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      preflight.overallStatus === "optimal"
                        ? "bg-secondary/15 text-secondary border-secondary/30"
                        : preflight.overallStatus === "warning"
                        ? "bg-primary/15 text-primary-light border-primary/30"
                        : "bg-error/15 text-error border-error/30"
                    }`}
                  >
                    Estado: {preflight.overallStatus === "optimal" ? "Óptimo" : preflight.overallStatus === "warning" ? "Advertencia" : "Requiere Atención"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl neu-pressed bg-surface-container/60 space-y-1 text-xs">
                    <span className="text-on-surface-variant">DPI Efectivo:</span>
                    <p className="font-bold text-sm text-secondary">{preflight.effectiveDpi} DPI</p>
                  </div>

                  <div className="p-3 rounded-xl neu-pressed bg-surface-container/60 space-y-1 text-xs">
                    <span className="text-on-surface-variant">Tamaño Objetivo:</span>
                    <p className="font-bold text-sm text-on-surface">{preflight.targetWidthCm} x {preflight.targetHeightCm} cm</p>
                  </div>

                  <div className="p-3 rounded-xl neu-pressed bg-surface-container/60 space-y-1 text-xs">
                    <span className="text-on-surface-variant">Puntuación Técnica:</span>
                    <p className="font-bold text-sm text-primary">{preflight.overallScore} / 100</p>
                  </div>
                </div>

                {/* Detailed Checks */}
                <div className="space-y-2 pt-1">
                  {preflight.checks.map((check) => (
                    <div
                      key={check.id}
                      className="p-3 rounded-xl bg-surface-container-high/60 border border-white/5 flex items-start gap-3 text-xs"
                    >
                      <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-on-surface">{check.message}</p>
                        {check.detail && <p className="text-on-surface-variant/80 mt-0.5 text-[11px] leading-relaxed">{check.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Right Panel: Controls & Options */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 space-y-6">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-secondary" />
                <span>Parámetros de Impresión</span>
              </h3>

              {/* Target Print Width (cm) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Ancho de Estampado (cm)</span>
                  <span className="font-mono text-secondary font-bold">{targetWidthCm} cm</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={0.5}
                  value={targetWidthCm}
                  onChange={(e) => setTargetWidthCm(parseFloat(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
              </div>

              {/* Target DPI */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Resolución Target (DPI)
                </label>
                <select
                  value={targetDpi}
                  onChange={(e) => setTargetDpi(parseInt(e.target.value))}
                  className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value={300}>300 DPI (Estándar DTF Recomendado)</option>
                  <option value={240}>240 DPI (Calidad Media)</option>
                  <option value={150}>150 DPI (Baja Resolución)</option>
                </select>
              </div>

              <div className="h-[1px] bg-white/10" />

              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>Filtros de Tinta Blanca</span>
              </h3>

              {/* Clean Alpha Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-surface-container/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-on-surface">Limpieza de Transparencias</p>
                  <p className="text-[10px] text-on-surface-variant">Elimina píxeles semi-transparentes ruidosos</p>
                </div>
                <input
                  type="checkbox"
                  checked={cleanAlpha}
                  onChange={(e) => setCleanAlpha(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary cursor-pointer"
                />
              </div>

              {/* Remove Semi Transparency Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-surface-container/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-on-surface">Normalizar Bordes de Máscara</p>
                  <p className="text-[10px] text-on-surface-variant">Previene difuminado en la base blanca</p>
                </div>
                <input
                  type="checkbox"
                  checked={removeSemiTransparency}
                  onChange={(e) => setRemoveSemiTransparency(e.target.checked)}
                  className="rounded text-primary focus:ring-secondary cursor-pointer"
                />
              </div>

              {/* Threshold Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Umbral de Corte de Alfa</span>
                  <span className="font-mono text-primary font-bold">{alphaThreshold} / 255</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  value={alphaThreshold}
                  onChange={(e) => setAlphaThreshold(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <NeuButton
                  variant="primary"
                  size="lg"
                  active
                  onClick={handleProcessImage}
                  disabled={isProcessing || isAnalyzing}
                  className="w-full justify-center shadow-glow-violet"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>{isProcessing ? "Procesando..." : "Procesar Imagen"}</span>
                </NeuButton>

                <NeuButton
                  variant="secondary"
                  size="lg"
                  active
                  onClick={handleSaveToDesigns}
                  disabled={isSaving || !processedBlob}
                  className="w-full justify-center shadow-glow-cyan"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Guardando en Mis Diseños..." : "Guardar en Mis Diseños"}</span>
                </NeuButton>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone View */
        <GlassCard glow="violet" className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
            <Upload className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Selecciona una imagen para comenzar
            </h2>
            <p className="text-xs text-on-surface-variant">
              Admite formatos PNG, JPG y WEBP de hasta 50 MB. Analizaremos automáticamente DPI, dimensiones e integridad de transparencias.
            </p>
          </div>

          <NeuButton
            variant="secondary"
            size="lg"
            active
            onClick={() => fileInputRef.current?.click()}
            className="shadow-glow-cyan mx-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Seleccionar Archivo de Imagen</span>
          </NeuButton>
        </GlassCard>
      )}
    </div>
  );
}
