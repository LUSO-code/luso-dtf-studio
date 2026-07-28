"use client";

import { Suspense } from "react";
import { useState, useRef, ChangeEvent, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { AuthGateModal } from "@components/auth/AuthGateModal";
import { UpgradeModal } from "@components/billing/UpgradeModal";
import { Breadcrumbs } from "@components/layout/Breadcrumbs";
import { ImageAnalysis } from "@lib/image-processing/analyzer";
import { executeDtfAutoPrep, AutoPrepResult } from "@lib/image-processing/dtf-auto-prep";
import { getStorageService } from "@lib/storage/StorageService";
import { canCreateDesign } from "@lib/billing/usage";
import { createClient } from "@lib/supabase/client";
import {
  Upload,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
  Grid,
  ChevronDown,
  ChevronUp,
  Shirt,
  Image as ImageIcon,
  Sun,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export type VisualTabMode = "shirt" | "color" | "underbase" | "original";

function ImageLabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const designIdParam = searchParams.get("designId");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [underbaseUrl, setUnderbaseUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [underbaseBlob, setUnderbaseBlob] = useState<Blob | null>(null);
  const [prepResult, setPrepResult] = useState<AutoPrepResult | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);

  // Active Visual Preview Tab
  const [activeTab, setActiveTab] = useState<VisualTabMode>("shirt");

  // Simple Customization Settings (Level 2)
  const [targetWidthCm, setTargetWidthCm] = useState<number>(30);
  const [bgTreatment, setBgTreatment] = useState<"auto" | "preserve" | "remove_white" | "remove_color" | "keep_intact">("auto");
  const [edgeCleaning, setEdgeCleaning] = useState<"suave" | "estandar" | "agresiva">("estandar");
  const [chokeSetting, setChokeSetting] = useState<"fino" | "estandar" | "fuerte" | "custom">("estandar");

  // Advanced RIP Settings (Level 3 - Collapsed)
  const [targetDpi, setTargetDpi] = useState<number>(300);
  const [customChokeMm, setCustomChokeMm] = useState<number>(0.35);

  // Collapsible UI Sections
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Workflow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Condition for Continuing Production Workflow
  const canContinue = useMemo(() => {
    return (
      !isSaving &&
      !isProcessing &&
      (Boolean(processedBlob) || Boolean(savedDesignId) || Boolean(processedUrl))
    );
  }, [isSaving, isProcessing, processedBlob, savedDesignId, processedUrl]);

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
          setOriginalUrl(data.original_file_url || url);
          setProcessedUrl(url);
          setUnderbaseUrl(data.underbase_file_url || null);
          setSavedDesignId(data.id);
          if (data.print_width_cm) setTargetWidthCm(data.print_width_cm);
          if (data.dpi) setTargetDpi(data.dpi);
        }
      }
    }

    loadExistingDesign();
  }, [designIdParam]);

  // Execute DTF Auto Prep Orchestrator Pipeline
  const runAutoPrepPipeline = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        console.log(`[IMAGE_LAB_DEBUG] DTF_AUTO_PREP_START fileName=${file.name} size=${file.size}`);
        const result = await executeDtfAutoPrep(file, {
          targetWidthCm,
          targetDpi,
          bgTreatment,
          edgeCleaning,
          chokeSetting,
          customChokeMm,
        });

        setPrepResult(result);
        setAnalysis(result.analysis);
        setProcessedBlob(result.colorBlob);
        setUnderbaseBlob(result.underbaseBlob);
        setProcessedUrl(result.colorUrl);
        setUnderbaseUrl(result.underbaseUrl);
        console.log(`[IMAGE_LAB_DEBUG] DTF_AUTO_PREP_SUCCESS colorSize=${result.colorBlob.size} underbaseSize=${result.underbaseBlob.size}`);
      } catch (err: any) {
        console.error("[IMAGE_LAB_DEBUG] DTF_AUTO_PREP_ERROR", err);
        setErrorMessage(err?.message || "Error al preparar el diseño para DTF.");
      } finally {
        setIsProcessing(false);
      }
    },
    [targetWidthCm, targetDpi, bgTreatment, edgeCleaning, chokeSetting, customChokeMm]
  );

  // Handle File Select
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSaveSuccess(false);

    console.log(`[IMAGE_LAB_DEBUG] FILE_SELECTED name=${file.name} size=${file.size} type=${file.type}`);

    const format = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["png", "jpg", "jpeg", "webp"].includes(format)) {
      setErrorMessage("Formato de imagen no compatible. Por favor sube un archivo en formato PNG, JPG o WEBP.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("El archivo de imagen supera el límite máximo de 50 MB.");
      return;
    }

    setSelectedFile(file);
    const origObjectUrl = URL.createObjectURL(file);
    setOriginalUrl(origObjectUrl);

    await runAutoPrepPipeline(file);
  }

  // Reactive Re-processing on setting changes if selectedFile is present
  useEffect(() => {
    if (selectedFile) {
      runAutoPrepPipeline(selectedFile);
    }
  }, [targetWidthCm, targetDpi, bgTreatment, edgeCleaning, chokeSetting, customChokeMm]);

  // Save Design Record to Supabase & Storage
  async function saveDesignRecord(): Promise<string | null> {
    if (savedDesignId && (!selectedFile || !processedBlob)) {
      return savedDesignId;
    }

    if (!selectedFile || (!processedBlob && !processedUrl)) {
      setErrorMessage("No hay archivo procesado disponible para guardar.");
      return null;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthGateOpen(true);
      setIsSaving(false);
      return null;
    }

    try {
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!member?.workspace_id) throw new Error("Espacio de trabajo no encontrado.");

      const workspaceId = member.workspace_id;

      // Server-Side Design Limit Guard ONLY for new design creations
      if (!savedDesignId) {
        const allowed = await canCreateDesign(supabase, workspaceId);
        if (!allowed) {
          setIsUpgradeModalOpen(true);
          throw new Error("Has alcanzado el límite de diseños incluidos en tu plan comercial.");
        }
      }

      const designId = savedDesignId || crypto.randomUUID();
      const storageService = getStorageService();

      // Upload original file
      const originalPath = `${workspaceId}/designs/${designId}/original/${selectedFile.name}`;
      const originalUpload = await storageService.upload("designs", originalPath, selectedFile);

      // Upload processed color file
      const processedPath = `${workspaceId}/designs/${designId}/processed/dtf_optimized_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
      const processedFile = new File([processedBlob!], `dtf_optimized_${selectedFile.name}`, { type: "image/png" });
      const processedUpload = await storageService.upload("designs", processedPath, processedFile);

      // Upload white underbase file if available
      let underbaseUploadUrl = "";
      if (underbaseBlob) {
        const underbasePath = `${workspaceId}/designs/${designId}/underbase/white_mask_${selectedFile.name.replace(/\.[^/.]+$/, "")}.png`;
        const underbaseFile = new File([underbaseBlob], `white_mask_${selectedFile.name}`, { type: "image/png" });
        const ubRes = await storageService.upload("designs", underbasePath, underbaseFile);
        underbaseUploadUrl = ubRes.url;
      }

      // Upsert record in Supabase designs table
      const { error: errInsert } = await supabase.from("designs").upsert({
        id: designId,
        workspace_id: workspaceId,
        name: selectedFile.name.replace(/\.[^/.]+$/, ""),
        original_file_url: originalUpload.url,
        processed_file_url: processedUpload.url,
        underbase_file_url: underbaseUploadUrl || null,
        print_width_cm: targetWidthCm,
        print_height_cm: analysis ? Math.round((targetWidthCm / analysis.aspectRatio) * 10) / 10 : targetWidthCm,
        dpi: targetDpi,
        choke_mm: customChokeMm,
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

  // Primary Action: Save & Redirect Directly to Smart Nesting Print Sheet Editor
  async function handleSaveAndGoToPrintSheet() {
    const id = await saveDesignRecord();
    if (id) {
      router.push(`/planchas/nueva?designId=${id}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs
          items={[
            { label: "Herramientas", href: "/herramientas" },
            { label: "Preparador DTF", href: "/herramientas/image-lab" },
          ]}
        />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Preparador DTF
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sube tu diseño y nosotros lo preparamos automáticamente para impresión DTF.
            </p>
          </div>

          {selectedFile && (
            <NeuButton
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 self-start md:self-auto text-sm"
            >
              <Upload className="w-4 h-4" /> Cambiar Imagen
            </NeuButton>
          )}
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">{errorMessage}</p>
              <p className="text-xs text-rose-400/80">
                Verifique que el archivo no esté dañado y sea una imagen válida en formato PNG, JPG o WEBP.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS BANNER */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Diseño guardado correctamente en tu espacio de trabajo.</span>
            </div>
          </div>
        )}

        {/* MAIN UPLOAD / WORKFLOW CONTAINER */}
        {!originalUrl ? (
          /* STEP 1: INITIAL UPLOAD AREA */
          <GlassCard className="p-12 text-center border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">Subir diseño para impresión DTF</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Arrastra tu archivo aquí o haz clic para examinar (PNG, JPG, WEBP hasta 50 MB)
                </p>
              </div>
              <NeuButton
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Seleccionar Imagen
              </NeuButton>
            </div>
          </GlassCard>
        ) : (
          /* STEP 2: AUTOMATED DTF WORKFLOW & UNIFIED PREVIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: UNIFIED VISUAL PREVIEW & DETECTION BADGE */}
            <div className="lg:col-span-7 space-y-4">
              {/* SMART AUTO DETECTION BADGE */}
              {prepResult?.detection && (
                <div className="p-3.5 bg-slate-900/80 border border-cyan-500/30 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs text-slate-300 flex-1">
                    <span className="font-semibold text-cyan-300">Detección Inteligente DTF: </span>
                    {prepResult.detection.userMessage}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Confianza {Math.round(prepResult.detection.confidence * 100)}%
                  </span>
                </div>
              )}

              {/* UNIFIED VISUAL TAB CONTROLS */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("shirt")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "shirt"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" /> Vista en camiseta
                </button>
                <button
                  onClick={() => setActiveTab("color")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "color"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Diseño DTF
                </button>
                <button
                  onClick={() => setActiveTab("underbase")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "underbase"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Base blanca
                </button>
                <button
                  onClick={() => setActiveTab("original")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "original"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Original
                </button>
              </div>

              {/* CANVAS / PREVIEW SCREEN CONTAINER */}
              <GlassCard className="p-4 relative min-h-[420px] flex items-center justify-center overflow-hidden">
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                    <p className="text-sm font-bold text-cyan-300 animate-pulse">
                      Preparando automáticamente para DTF...
                    </p>
                  </div>
                )}

                {activeTab === "shirt" && (
                  <div className="relative w-full h-[400px] bg-[#12141C] rounded-xl flex items-center justify-center p-6 border border-slate-800 shadow-inner">
                    {/* Simulated Black Shirt Background */}
                    <div className="relative max-w-[280px] max-h-[360px] flex items-center justify-center">
                      <img
                        src={processedUrl || originalUrl}
                        alt="DTF Shirt Preview"
                        className="max-w-full max-h-[340px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                      />
                    </div>
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                      Simulación en Camiseta Negra
                    </span>
                  </div>
                )}

                {activeTab === "color" && (
                  <div className="relative w-full h-[400px] bg-[radial-gradient(#262936_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 rounded-xl flex items-center justify-center p-6 border border-slate-800">
                    <img
                      src={processedUrl || originalUrl}
                      alt="DTF Color Artwork"
                      className="max-w-full max-h-[360px] object-contain"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-cyan-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
                      Color DTF Limpio
                    </span>
                  </div>
                )}

                {activeTab === "underbase" && (
                  <div className="relative w-full h-[400px] bg-slate-950 rounded-xl flex items-center justify-center p-6 border border-slate-800">
                    {underbaseUrl ? (
                      <img
                        src={underbaseUrl}
                        alt="White Ink Underbase Mask"
                        className="max-w-full max-h-[360px] object-contain filter invert opacity-90"
                      />
                    ) : (
                      <div className="text-xs text-slate-500">Generando capa de blanco...</div>
                    )}
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-amber-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-amber-500/30">
                      Máscara de Blanco (Anti-fuga {customChokeMm}mm)
                    </span>
                  </div>
                )}

                {activeTab === "original" && (
                  <div className="relative w-full h-[400px] bg-slate-950 rounded-xl flex items-center justify-center p-6 border border-slate-800">
                    <img
                      src={originalUrl}
                      alt="Original Uploaded Artwork"
                      className="max-w-full max-h-[360px] object-contain"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                      Archivo Original
                    </span>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* RIGHT COLUMN: SIMPLE CONTROLS & PRIMARY CTA */}
            <div className="lg:col-span-5 space-y-5">
              {/* PRINT METRICS & QUALITY CARD */}
              <GlassCard className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Tamaño de Impresión
                </h3>

                {/* Print Width Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Ancho de Impresión (cm)</span>
                    <span className="font-bold text-cyan-400">{targetWidthCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={targetWidthCm}
                    onChange={(e) => setTargetWidthCm(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                  {analysis && (
                    <p className="text-[11px] text-slate-400">
                      Alto aproximado:{" "}
                      <span className="text-slate-200 font-semibold">
                        {Math.round((targetWidthCm / analysis.aspectRatio) * 10) / 10} cm
                      </span>
                    </p>
                  )}
                </div>

                {/* SMART QUALITY BADGE */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Calidad para DTF</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {targetDpi} DPI — Excelente
                  </span>
                </div>
              </GlassCard>

              {/* PRIMARY DOMINANT ACTION BUTTON */}
              <GlassCard className="p-5 space-y-3 bg-gradient-to-b from-slate-900/80 to-slate-950/90 border-cyan-500/40">
                <NeuButton
                  variant="primary"
                  onClick={handleSaveAndGoToPrintSheet}
                  disabled={!canContinue}
                  className="w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-transform"
                >
                  <Grid className="w-5 h-5" /> Guardar y Agregar a Plancha <ArrowRight className="w-5 h-5" />
                </NeuButton>

                <button
                  onClick={saveDesignRecord}
                  disabled={!canContinue}
                  className="w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar en Mis Diseños
                </button>
              </GlassCard>

              {/* LEVEL 2: COLLAPSIBLE "PERSONALIZAR RESULTADO" */}
              <GlassCard className="p-4 space-y-3">
                <button
                  onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Personalizar Resultado
                  </span>
                  {isCustomizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isCustomizeOpen && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 text-xs animate-fadeIn">
                    {/* Background Treatment */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-medium">Tratamiento de Fondo</label>
                      <select
                        value={bgTreatment}
                        onChange={(e: any) => setBgTreatment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      >
                        <option value="auto">Automático (Recomendado)</option>
                        <option value="preserve">Sin fondo (Transparente)</option>
                        <option value="remove_white">Quitar fondo blanco</option>
                        <option value="keep_intact">Conservar fondo original</option>
                      </select>
                    </div>

                    {/* Edge Cleaning */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-medium">Limpieza de Bordes</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["suave", "estandar", "agresiva"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setEdgeCleaning(mode)}
                            className={`py-1.5 rounded-lg border font-semibold text-[11px] capitalize ${
                              edgeCleaning === mode
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Anti-Borde Blanco (Choke) */}
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-medium">Anti-Borde Blanco (Choke)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["fino", "estandar", "fuerte"] as const).map((setting) => (
                          <button
                            key={setting}
                            onClick={() => {
                              setChokeSetting(setting);
                              if (setting === "fino") setCustomChokeMm(0.2);
                              if (setting === "estandar") setCustomChokeMm(0.35);
                              if (setting === "fuerte") setCustomChokeMm(0.6);
                            }}
                            className={`py-1.5 rounded-lg border font-semibold text-[11px] capitalize ${
                              chokeSetting === setting
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            {setting}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* LEVEL 3: COLLAPSED "AJUSTES AVANZADOS RIP" */}
              <GlassCard className="p-4 space-y-3">
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-400" /> Ajustes Avanzados RIP
                  </span>
                  {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isAdvancedOpen && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-slate-400">Resolución Objetivo (DPI)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[300, 600].map((dpi) => (
                          <button
                            key={dpi}
                            onClick={() => setTargetDpi(dpi)}
                            className={`py-1.5 rounded-lg border font-semibold ${
                              targetDpi === dpi
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                                : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}
                          >
                            {dpi} DPI
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400">Choke Exacto (mm)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1.5"
                        value={customChokeMm}
                        onChange={(e) => {
                          setCustomChokeMm(Number(e.target.value));
                          setChokeSetting("custom");
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}
      </div>

      <AuthGateModal isOpen={isAuthGateOpen} onClose={() => setIsAuthGateOpen(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
}

export default function ImageLabPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-cyan-400 text-sm">
          Cargando Preparador DTF...
        </div>
      }
    >
      <ImageLabContent />
    </Suspense>
  );
}
