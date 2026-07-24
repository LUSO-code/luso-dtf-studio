"use client";

import { useState, useRef, ChangeEvent } from "react";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { UnderbasePreviewTabs } from "@components/underbase/UnderbasePreviewTabs";
import { AuthGateModal } from "@components/auth/AuthGateModal";
import { UnderbaseGenerator } from "@lib/image-processing/underbase/generator";
import { UnderbaseMode, UnderbaseProcessingType } from "@lib/image-processing/underbase/types";
import { mmToPixels } from "@lib/image-processing/underbase/choke";
import { getStorageService } from "@lib/storage/StorageService";
import { createClient } from "@lib/supabase/client";
import {
  Upload,
  Sparkles,
  Layers,
  Save,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  RefreshCw,
  Info,
} from "lucide-react";

export default function MascaraPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [colorImageUrl, setColorImageUrl] = useState<string | null>(null);
  const [underbaseImageUrl, setUnderbaseImageUrl] = useState<string | null>(null);
  const [underbaseBlob, setUnderbaseBlob] = useState<Blob | null>(null);

  // Underbase Parameters
  const [mode, setMode] = useState<UnderbaseMode>("balanceado");
  const [processingType, setProcessingType] = useState<UnderbaseProcessingType>("binary");
  const [chokeMm, setChokeMm] = useState<number>(0.3); // 0.3 mm default
  const [alphaThreshold, setAlphaThreshold] = useState<number>(30);
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth Gate Modal State
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const chokePixels = mmToPixels(chokeMm, targetDpi);

  // Handle File Selection
  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
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
    const objectUrl = URL.createObjectURL(file);
    setColorImageUrl(objectUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = objectUrl;

    img.onload = () => {
      sourceImageRef.current = img;
      handleGenerateUnderbase(img);
    };
  }

  // Generate Underbase Mask
  async function handleGenerateUnderbase(sourceImg?: HTMLImageElement) {
    const img = sourceImg || sourceImageRef.current;
    if (!img) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      // Create temporary canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo obtener el contexto Canvas.");
      ctx.drawImage(img, 0, 0);

      const generator = new UnderbaseGenerator();
      const result = await generator.generate(canvas, {
        underbaseVersion: "1.0",
        mode,
        processingType,
        chokeMm,
        chokePixels,
        alphaThreshold,
        targetDpi,
        garmentColorSim: "#000000",
      });

      const uUrl = URL.createObjectURL(result.underbaseBlob);
      setUnderbaseImageUrl(uUrl);
      setUnderbaseBlob(result.underbaseBlob);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al generar la base de blanco.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Save Underbase Asset to Workspace
  async function handleSaveUnderbase() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthGateOpen(true);
      return;
    }

    if (!selectedFile || !underbaseBlob) {
      setErrorMessage("No hay máscara de base de blanco para guardar.");
      return;
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
      const designId = crypto.randomUUID();
      const storageService = getStorageService();

      // 1. Upload Original File
      const originalPath = `${workspaceId}/designs/${designId}/original/${selectedFile.name}`;
      const originalUpload = await storageService.upload("designs", originalPath, selectedFile);

      // 2. Upload Underbase PNG File
      const underbasePath = `${workspaceId}/designs/${designId}/underbase/dtf_underbase_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
      const underbaseFile = new File([underbaseBlob], `dtf_underbase_${selectedFile.name}`, { type: "image/png" });
      const underbaseUpload = await storageService.upload("designs", underbasePath, underbaseFile);

      // 3. Insert public.designs Record
      const { error: errInsert } = await supabase.from("designs").insert({
        id: designId,
        workspace_id: workspaceId,
        name: selectedFile.name.replace(/\.[^/.]+$/, "") + " (Máscara de Blanco)",
        original_file_url: originalUpload.url,
        processed_file_url: originalUpload.url,
        underbase_file_url: underbaseUpload.url,
        dpi: targetDpi,
        processing_status: "completed",
        underbase_config: {
          underbaseVersion: "1.0",
          mode,
          processingType,
          chokeMm,
          chokePixels,
          alphaThreshold,
          targetDpi,
        },
      });

      if (errInsert) throw new Error(errInsert.message);

      setSaveSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al guardar el bajo de blanco.");
    } finally {
      setIsSaving(false);
    }
  }

  // Export Dual Package (Color PNG + White Underbase PNG)
  function handleExportDualPackage() {
    if (!colorImageUrl || !underbaseBlob || !selectedFile) return;

    // Download Color File
    const aColor = document.createElement("a");
    aColor.href = colorImageUrl;
    aColor.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_COLOR_300DPI.png`;
    document.body.appendChild(aColor);
    aColor.click();
    document.body.removeChild(aColor);

    // Download Underbase File
    const uUrl = URL.createObjectURL(underbaseBlob);
    const aUnderbase = document.createElement("a");
    aUnderbase.href = uUrl;
    aUnderbase.download = `${selectedFile.name.replace(/\.[^/.]+$/, "")}_BASE_BLANCO_300DPI.png`;
    document.body.appendChild(aUnderbase);
    aUnderbase.click();
    document.body.removeChild(aUnderbase);
    URL.revokeObjectURL(uUrl);
  }

  return (
    <div className="space-y-6">
      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        redirectTo="/herramientas/mascara"
        actionTitle="para guardar la máscara de base de blanco en tu espacio de trabajo"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Laboratorio de Base de Blanco (v1.0)</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Editor de Máscara de Blanco
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Genera underbase de blanco, ajusta contracción (choke) en milímetros y simula la prenda.
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

      {/* Banners */}
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
            <span className="font-semibold">¡Máscara de blanco guardada en "Mis Diseños"!</span>
          </div>
        </div>
      )}

      {/* Main Studio Workspace */}
      {colorImageUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center Interactive 4-Tab Preview Stage */}
          <div className="lg:col-span-8 space-y-4">
            <UnderbasePreviewTabs
              colorUrl={colorImageUrl}
              underbaseUrl={underbaseImageUrl}
            />
          </div>

          {/* Right Panel: Controls & Settings */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6 space-y-6">
              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <Sliders className="w-4 h-4 text-secondary" />
                <span>Parámetros de Base de Blanco</span>
              </h3>

              {/* Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Modo de Procesamiento
                </label>
                <select
                  value={mode}
                  onChange={(e) => {
                    const newMode = e.target.value as UnderbaseMode;
                    setMode(newMode);
                    if (newMode === "agresivo") setProcessingType("binary");
                    else if (newMode === "conservador") setProcessingType("density");
                  }}
                  className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="balanceado">Balanceado (General DTF)</option>
                  <option value="conservador">Conservador (Fondo suave / Sombras)</option>
                  <option value="agresivo">Agresivo (Vectores y Logos sólidos)</option>
                </select>
              </div>

              {/* Processing Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Tipo de Máscara
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setProcessingType("binary")}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      processingType === "binary"
                        ? "bg-secondary text-surface-container-lowest border-secondary shadow-glow-cyan font-bold"
                        : "bg-surface-container/60 border-white/10 text-on-surface"
                    }`}
                  >
                    Máscara Binaria
                  </button>
                  <button
                    onClick={() => setProcessingType("density")}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      processingType === "density"
                        ? "bg-primary text-on-primary border-primary shadow-glow-violet font-bold"
                        : "bg-surface-container/60 border-white/10 text-on-surface"
                    }`}
                  >
                    Densidad Alpha
                  </button>
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>Contracción de Blanco (Choke)</span>
              </h3>

              {/* Choke Slider in mm */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Contracción (Choke mm)</span>
                  <span className="font-mono text-secondary font-bold">{chokeMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.5}
                  step={0.1}
                  value={chokeMm}
                  onChange={(e) => setChokeMm(parseFloat(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <p className="text-[11px] font-mono text-on-surface-variant/80 text-right">
                  ≈ {chokePixels} px @ {targetDpi} DPI
                </p>
              </div>

              {/* Alpha Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                  <span>Umbral de Alfa</span>
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
                  onClick={() => handleGenerateUnderbase()}
                  disabled={isProcessing}
                  className="w-full justify-center shadow-glow-violet"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>{isProcessing ? "Generando..." : "Actualizar Máscara"}</span>
                </NeuButton>

                <NeuButton
                  variant="secondary"
                  size="lg"
                  active
                  onClick={handleSaveUnderbase}
                  disabled={isSaving || !underbaseBlob}
                  className="w-full justify-center shadow-glow-cyan"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Guardando..." : "Guardar Máscara de Blanco"}</span>
                </NeuButton>

                <NeuButton
                  variant="glass"
                  size="md"
                  onClick={handleExportDualPackage}
                  disabled={!underbaseBlob}
                  className="w-full justify-center"
                >
                  <Download className="w-4 h-4 text-secondary" />
                  <span>Exportar Color + Blanco (300 DPI)</span>
                </NeuButton>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        /* Empty Dropzone View */
        <GlassCard glow="violet" className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
            <Layers className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Selecciona una imagen para generar la base de blanco
            </h2>
            <p className="text-xs text-on-surface-variant">
              Admite imágenes PNG optimizadas con transparencia. Generaremos la máscara de tinta blanca con choke milimétrico y simulación de prenda.
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
