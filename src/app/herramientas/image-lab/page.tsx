"use client";

import { Suspense } from "react";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { BeforeAfterSlider } from "@components/ui/BeforeAfterSlider";
import { AuthGateModal } from "@components/auth/AuthGateModal";
import { Breadcrumbs } from "@components/layout/Breadcrumbs";
import { analyzeImage, ImageAnalysis } from "@lib/image-processing/analyzer";
import { LocalCanvasProvider } from "@lib/image-processing/providers/local-provider";
import { AlphaProcessingMode } from "@lib/image-processing/provider";
import { getStorageService } from "@lib/storage/StorageService";
import { createClient } from "@lib/supabase/client";
import {
  Upload,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
  Wrench,
  Grid,
} from "lucide-react";

function ImageLabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const designIdParam = searchParams.get("designId");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);

  // Settings
  const [targetWidthCm, setTargetWidthCm] = useState<number>(30);
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [alphaMode, setAlphaMode] = useState<AlphaProcessingMode>("balanced");
  const [enableChroma, setEnableChroma] = useState<boolean>(false);
  const [chromaColor, setChromaColor] = useState<string>("#ffffff");

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth Gate Modal State
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load design if URL parameter designId is present
  useEffect(() => {
    async function loadExistingDesign() {
      if (!designIdParam) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("designs")
        .select("*")
        .eq("id", designIdParam)
        .single();

      if (data) {
        const url = data.processed_file_url || data.original_file_url;
        if (url) {
          setOriginalUrl(url);
          setProcessedUrl(url);
          setSavedDesignId(data.id);
          if (data.print_width_cm) setTargetWidthCm(data.print_width_cm);
          if (data.dpi) setTargetDpi(data.dpi);
        }
      }
    }

    loadExistingDesign();
  }, [designIdParam]);

  // Handle File Select
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSaveSuccess(false);

    const format = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["png", "jpg", "jpeg", "webp"].includes(format)) {
      setErrorMessage("Formato no compatible. Sube una imagen PNG, JPG o WEBP.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("El archivo supera el límite de 50 MB.");
      return;
    }

    setSelectedFile(file);
    const origObjectUrl = URL.createObjectURL(file);
    setOriginalUrl(origObjectUrl);

    try {
      const img = new Image();
      img.src = origObjectUrl;
      await new Promise((res) => (img.onload = res));

      const resultAnalysis = await analyzeImage(img, file.size, format);
      setAnalysis(resultAnalysis);
      await processImageWithLocalProvider(file, resultAnalysis);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al analizar la imagen.");
    }
  }

  // Execute DTF Optimization Pipeline
  async function processImageWithLocalProvider(
    file: File,
    currentAnalysis: ImageAnalysis
  ) {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res) => (img.onload = res));

      const provider = new LocalCanvasProvider();
      const result = await provider.process(
        img,
        {
          processingVersion: "1.0",
          targetWidthCm,
          targetDpi,
          alphaMode,
          alphaThreshold: 30,
          cleanAlpha: true,
          removeBackground: enableChroma,
          backgroundColorKey: enableChroma ? chromaColor : undefined,
          backgroundRemovalMode: enableChroma ? "color-key" : undefined,
        },
        currentAnalysis
      );

      const procObjectUrl = URL.createObjectURL(result.processedBlob);
      setProcessedUrl(procObjectUrl);
      setProcessedBlob(result.processedBlob);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error durante el procesamiento de la imagen.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Save Design Record to Supabase
  async function saveDesignRecord(): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthGateOpen(true);
      return null;
    }

    if (!selectedFile || !processedBlob) {
      if (savedDesignId) return savedDesignId;
      setErrorMessage("No hay archivo procesado para guardar.");
      return null;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (!member?.workspace_id) throw new Error("Espacio de trabajo no encontrado.");

      const workspaceId = member.workspace_id;
      const designId = savedDesignId || crypto.randomUUID();
      const storageService = getStorageService();

      // Upload original file
      const originalPath = `${workspaceId}/designs/${designId}/original/${selectedFile.name}`;
      const originalUpload = await storageService.upload("designs", originalPath, selectedFile);

      // Upload processed file
      const processedPath = `${workspaceId}/designs/${designId}/processed/dtf_optimized_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
      const processedFile = new File([processedBlob], `dtf_optimized_${selectedFile.name}`, { type: "image/png" });
      const processedUpload = await storageService.upload("designs", processedPath, processedFile);

      // Upsert record
      const { error: errInsert } = await supabase.from("designs").upsert({
        id: designId,
        workspace_id: workspaceId,
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
        original_file_url: originalUpload.url,
        processed_file_url: processedUpload.url,
        print_width_cm: targetWidthCm,
        print_height_cm: analysis ? Math.round((targetWidthCm / analysis.aspectRatio) * 10) / 10 : targetWidthCm,
        dpi: targetDpi,
        processing_status: "completed",
      });

      if (errInsert) throw new Error(errInsert.message);

      setSavedDesignId(designId);
      setSaveSuccess(true);
      return designId;
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al guardar el diseño.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  // Save and Navigate to Underbase Lab
  async function handleSaveAndUnderbase() {
    const id = await saveDesignRecord();
    if (id) {
      router.push(`/herramientas/mascara?designId=${id}`);
    }
  }

  // Save and Create Print Sheet
  async function handleSaveAndCreateSheet() {
    const id = await saveDesignRecord();
    if (id) {
      router.push(`/planchas/nueva?designId=${id}`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        redirectTo="/herramientas/image-lab"
        actionTitle="para guardar tus diseños procesados en tu espacio de trabajo"
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Herramientas", href: "/herramientas" },
          { label: "Image Lab Studio" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimizador de Imagen para DTF</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Image Lab Studio
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Pre-flight métrico, redimensionado para impresión, limpieza de alfas y eliminación de fondo por color.
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

      {/* Error & Success Banners */}
      {errorMessage && (
        <div className="neu-pressed bg-error-container/30 border border-error/30 text-error p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="neu-pressed bg-secondary-dark/30 border border-secondary/40 text-secondary p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">¡Diseño guardado en "Mis Diseños"!</span>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      {originalUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left/Center Interactive Stage */}
          <div className="lg:col-span-8 space-y-4">
            <GlassCard className="p-4 relative">
              <div className="h-[420px] sm:h-[500px] w-full relative rounded-2xl overflow-hidden glass-panel flex items-center justify-center border border-white/10">
                {processedUrl ? (
                  <BeforeAfterSlider
                    originalUrl={originalUrl}
                    processedUrl={processedUrl}
                    className="h-full w-full"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain p-4"
                  />
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 space-y-6">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-secondary" />
                <span>Configuración de Impresión</span>
              </h3>

              {/* Physical Width Control */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Ancho de Impresión (cm)</span>
                  <span className="font-mono text-secondary font-bold">{targetWidthCm} cm</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={targetWidthCm}
                  onChange={(e) => setTargetWidthCm(parseInt(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
              </div>

              {/* Target DPI */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Resolución Objetivo (DPI)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[300, 600].map((dpi) => (
                    <button
                      key={dpi}
                      onClick={() => setTargetDpi(dpi)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                        targetDpi === dpi
                          ? "bg-secondary text-surface-container-lowest border-secondary shadow-glow-cyan font-bold"
                          : "bg-surface-container/60 border-white/10 text-on-surface"
                      }`}
                    >
                      {dpi} DPI
                    </button>
                  ))}
                </div>
              </div>

              {/* Alpha Processing Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Modo de Limpieza de Transparencia
                </label>
                <select
                  value={alphaMode}
                  onChange={(e) => setAlphaMode(e.target.value as AlphaProcessingMode)}
                  className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="balanced">Balanceado (Recomendado)</option>
                  <option value="conservative">Conservador (Bordes suaves)</option>
                  <option value="aggressive">Agresivo (Bordes vectoriales)</option>
                </select>
              </div>

              {/* Progressive Workflow CTAs: Guardar y Continuar */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Guardar y Continuar Producción
                </span>

                <NeuButton
                  variant="secondary"
                  size="md"
                  active
                  onClick={() => saveDesignRecord()}
                  disabled={isSaving || !processedBlob}
                  className="w-full justify-center shadow-glow-cyan"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Guardando..." : "Guardar en Mis Diseños"}</span>
                </NeuButton>

                <NeuButton
                  variant="primary"
                  size="md"
                  active
                  onClick={handleSaveAndUnderbase}
                  disabled={isSaving || !processedBlob}
                  className="w-full justify-center shadow-glow-violet"
                >
                  <Layers className="w-4 h-4" />
                  <span>Guardar y Preparar Máscara</span>
                </NeuButton>

                <NeuButton
                  variant="glass"
                  size="md"
                  onClick={handleSaveAndCreateSheet}
                  disabled={isSaving || !processedBlob}
                  className="w-full justify-center"
                >
                  <Grid className="w-4 h-4 text-secondary" />
                  <span>Guardar y Crear Plancha</span>
                </NeuButton>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Empty Upload State */
        <GlassCard glow="cyan" className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
            <Wrench className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Carga tu diseño para optimización DTF
            </h2>
            <p className="text-xs text-on-surface-variant">
              Admite PNG, JPG o WEBP. Analizaremos las dimensiones físicas en cm, la resolución efectiva a 300 DPI y aplicaremos limpieza de bordes.
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

export default function ImageLabPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-on-surface-variant">Cargando Image Lab...</div>}>
      <ImageLabContent />
    </Suspense>
  );
}
