"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { PrintSheetEditor } from "@components/print-sheet/PrintSheetEditor";
import { PlacedItem } from "@lib/nesting/types";
import { MaxRectsNestingEngine } from "@lib/nesting/MaxRectsNestingEngine";
import { Breadcrumbs } from "@components/layout/Breadcrumbs";
import { Grid, Sparkles, Save, ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";

function NuevaPlanchaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const designIdParam = searchParams.get("designId");

  const [sheetName, setSheetName] = useState("Nueva Plancha DTF");
  const [sheetWidthCm, setSheetWidthCm] = useState(58);
  const [sheetHeightCm, setSheetHeightCm] = useState(100);
  const [marginCm, setMarginCm] = useState(0.5);
  const [spacingCm, setSpacingCm] = useState(0.5);
  const [targetDpi, setTargetDpi] = useState(300);

  const [items, setItems] = useState<PlacedItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically load design if designIdParam is present
  useEffect(() => {
    async function loadInitialDesign() {
      if (!designIdParam) return;
      const supabase = createClient();
      const { data: design } = await supabase
        .from("designs")
        .select("*")
        .eq("id", designIdParam)
        .single();

      if (design) {
        const itemWidth = design.print_width_cm || 30;
        const itemHeight = design.print_height_cm || 30;

        const engine = new MaxRectsNestingEngine();
        const result = engine.nest(
          [
            {
              id: design.id,
              designId: design.id,
              name: design.name,
              thumbnailUrl: design.processed_file_url || design.original_file_url,
              processedFileUrl: design.processed_file_url || design.original_file_url,
              widthCm: itemWidth,
              heightCm: itemHeight,
              aspectRatio: itemWidth / itemHeight,
            },
          ],
          {
            sheetWidthCm,
            sheetHeightCm,
            marginCm,
            spacingCm,
            allowRotation: true,
          }
        );

        if (result.placedItems.length > 0) {
          setItems(result.placedItems);
        }
      }
    }

    loadInitialDesign();
  }, [designIdParam, sheetWidthCm, sheetHeightCm, marginCm, spacingCm]);

  async function handleSaveSheet() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirectTo=/planchas/nueva");
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
      const sheetId = crypto.randomUUID();

      // Calculate efficiency
      const totalUsed = items.reduce((acc, it) => acc + it.widthCm * it.heightCm, 0);
      const usableArea = (sheetWidthCm - marginCm * 2) * (sheetHeightCm - marginCm * 2);
      const efficiency = usableArea > 0 ? Math.min(100, (totalUsed / usableArea) * 100) : 0;
      const waste = Math.max(0, 100 - efficiency);

      // Insert print sheet
      const { error: errSheet } = await supabase.from("print_sheets").insert({
        id: sheetId,
        workspace_id: workspaceId,
        name: sheetName,
        sheet_width_cm: sheetWidthCm,
        sheet_height_cm: sheetHeightCm,
        target_dpi: targetDpi,
        margin_cm: marginCm,
        spacing_cm: spacingCm,
        efficiency_percentage: Math.round(efficiency * 10) / 10,
        waste_percentage: Math.round(waste * 10) / 10,
        status: "draft",
      });

      if (errSheet) throw new Error(errSheet.message);

      // Insert items
      if (items.length > 0) {
        const itemRows = items.map((it, idx) => ({
          id: crypto.randomUUID(),
          print_sheet_id: sheetId,
          design_id: it.designId,
          x_cm: it.xCm,
          y_cm: it.yCm,
          width_cm: it.widthCm,
          height_cm: it.heightCm,
          rotation: it.rotation,
          z_index: idx,
        }));

        const { error: errItems } = await supabase.from("print_sheet_items").insert(itemRows);
        if (errItems) throw new Error(errItems.message);
      }

      router.push(`/planchas/${sheetId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al guardar la plancha.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Mis Planchas", href: "/planchas" },
          { label: "Nueva Plancha DTF" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maquetador de Planchas de Impresión</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Crear Nueva Plancha DTF
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Configura las dimensiones del pliego o rollo, añade diseños y ejecuta el motor Smart Nesting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NeuButton variant="glass" size="md" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </NeuButton>

          <NeuButton
            variant="secondary"
            size="md"
            active
            onClick={handleSaveSheet}
            disabled={isSaving}
            className="shadow-glow-cyan"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Plancha"}</span>
          </NeuButton>
        </div>
      </div>

      {errorMessage && (
        <div className="neu-pressed bg-error-container/30 border border-error/30 text-error p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Editor Component */}
      <PrintSheetEditor
        initialName={sheetName}
        initialWidthCm={sheetWidthCm}
        initialHeightCm={sheetHeightCm}
        initialMarginCm={marginCm}
        initialSpacingCm={spacingCm}
        initialItems={items}
      />
    </div>
  );
}

export default function NuevaPlanchaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-on-surface-variant">Cargando Maquetador de Plancha...</div>}>
      <NuevaPlanchaContent />
    </Suspense>
  );
}
