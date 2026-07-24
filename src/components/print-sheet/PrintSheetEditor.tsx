"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { AddDesignsModal } from "./AddDesignsModal";
import { PreExportModal } from "./PreExportModal";
import { NestingInputItem, PlacedItem } from "@lib/nesting/types";
import { MaxRectsNestingEngine } from "@lib/nesting/MaxRectsNestingEngine";
import { isWithinSheet, checkOverlap, snapToGrid } from "@lib/print-sheet/geometry/rectangles";
import { createClient } from "@lib/supabase/client";
import {
  Grid,
  Plus,
  RotateCw,
  Copy,
  Trash2,
  Save,
  Download,
  Wrench,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Move,
  Eye,
} from "lucide-react";

interface PrintSheetEditorProps {
  initialSheetId?: string;
  initialName?: string;
  initialWidthCm?: number;
  initialHeightCm?: number;
  initialMarginCm?: number;
  initialSpacingCm?: number;
  initialItems?: PlacedItem[];
}

export function PrintSheetEditor({
  initialSheetId,
  initialName = "Plancha Rollo 58cm V1",
  initialWidthCm = 58,
  initialHeightCm = 100,
  initialMarginCm = 1.0,
  initialSpacingCm = 0.5,
  initialItems = [],
}: PrintSheetEditorProps) {
  const router = useRouter();

  // Sheet State
  const [sheetId, setSheetId] = useState<string | undefined>(initialSheetId);
  const [sheetName, setSheetName] = useState<string>(initialName);
  const [sheetWidthCm, setSheetWidthCm] = useState<number>(initialWidthCm);
  const [sheetHeightCm, setSheetHeightCm] = useState<number>(initialHeightCm);
  const [marginCm, setMarginCm] = useState<number>(initialMarginCm);
  const [spacingCm, setSpacingCm] = useState<number>(initialSpacingCm);
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // Layout Items & Selection
  const [items, setItems] = useState<PlacedItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [unplacedItems, setUnplacedItems] = useState<NestingInputItem[]>([]);

  // Editor Toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [enableSnap, setEnableSnap] = useState<boolean>(true);
  const [allowRotation, setAllowRotation] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.5); // 50% display scale default

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dragging State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; itemX: number; itemY: number } | null>(null);

  // Calculate Real-Time Utilization
  const usableW = Math.max(0, sheetWidthCm - 2 * marginCm);
  const usableH = Math.max(0, sheetHeightCm - 2 * marginCm);
  const usableArea = usableW * usableH;

  const usedArea = items.reduce((acc, item) => acc + item.widthCm * item.heightCm, 0);
  const utilizationPercentage = usableArea > 0 ? Number(Math.min(100, (usedArea / usableArea) * 100).toFixed(1)) : 0;
  const wastePercentage = Number((100 - utilizationPercentage).toFixed(1));

  // Run Smart Nesting Optimization
  const handleAutoNest = useCallback(() => {
    if (items.length === 0) return;

    setErrorMessage(null);
    setSaveMessage(null);

    const inputItems: NestingInputItem[] = items.map((item) => ({
      id: item.id,
      designId: item.designId,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl,
      processedFileUrl: item.processedFileUrl,
      widthCm: item.rotation === 90 || item.rotation === 270 ? item.heightCm : item.widthCm,
      heightCm: item.rotation === 90 || item.rotation === 270 ? item.widthCm : item.heightCm,
      aspectRatio: item.widthCm / item.heightCm || 1,
      allowRotation,
    }));

    const engine = new MaxRectsNestingEngine();
    const result = engine.nest(inputItems, {
      sheetWidthCm,
      sheetHeightCm,
      marginCm,
      spacingCm,
      allowRotation,
    });

    setItems(result.placedItems);
    setUnplacedItems(result.unplacedItems);
  }, [items, sheetWidthCm, sheetHeightCm, marginCm, spacingCm, allowRotation]);

  // Handle Add Designs from Selection Modal
  function handleAddDesigns(newInputItems: NestingInputItem[]) {
    const engine = new MaxRectsNestingEngine();

    // Convert existing items back to input items
    const existingInputs: NestingInputItem[] = items.map((item) => ({
      id: item.id,
      designId: item.designId,
      name: item.name,
      thumbnailUrl: item.thumbnailUrl,
      processedFileUrl: item.processedFileUrl,
      widthCm: item.rotation === 90 || item.rotation === 270 ? item.heightCm : item.widthCm,
      heightCm: item.rotation === 90 || item.rotation === 270 ? item.widthCm : item.heightCm,
      aspectRatio: item.widthCm / item.heightCm || 1,
      allowRotation,
    }));

    const allInputs = [...existingInputs, ...newInputItems];

    const result = engine.nest(allInputs, {
      sheetWidthCm,
      sheetHeightCm,
      marginCm,
      spacingCm,
      allowRotation,
    });

    setItems(result.placedItems);
    setUnplacedItems(result.unplacedItems);
  }

  // Handle Item Operations
  function handleRotateItem(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newRotation = ((item.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        const newW = item.heightCm;
        const newH = item.widthCm;
        return {
          ...item,
          rotation: newRotation,
          widthCm: newW,
          heightCm: newH,
        };
      })
    );
  }

  function handleDuplicateItem(id: string) {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const newItem: PlacedItem = {
      ...target,
      id: crypto.randomUUID(),
      xCm: Math.min(sheetWidthCm - target.widthCm - marginCm, target.xCm + 2),
      yCm: Math.min(sheetHeightCm - target.heightCm - marginCm, target.yCm + 2),
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  }

  function handleDeleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  }

  // Drag and Drop Handling on Interactive Canvas
  function handleMouseDown(e: React.MouseEvent, item: PlacedItem) {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggedItemId(item.id);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.xCm,
      itemY: item.yCm,
    };
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedItemId || !dragStartPos.current || !canvasRef.current) return;

      const deltaX = (e.clientX - dragStartPos.current.x) / (37.795 * zoomLevel); // 1cm ≈ 37.795px
      const deltaY = (e.clientY - dragStartPos.current.y) / (37.795 * zoomLevel);

      let rawNewX = dragStartPos.current.itemX + deltaX;
      let rawNewY = dragStartPos.current.itemY + deltaY;

      if (enableSnap) {
        rawNewX = snapToGrid(rawNewX, 0.5);
        rawNewY = snapToGrid(rawNewY, 0.5);
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== draggedItemId) return item;
          const clampedX = Math.max(marginCm, Math.min(sheetWidthCm - item.widthCm - marginCm, rawNewX));
          const clampedY = Math.max(marginCm, Math.min(sheetHeightCm - item.heightCm - marginCm, rawNewY));
          return {
            ...item,
            xCm: Number(clampedX.toFixed(2)),
            yCm: Number(clampedY.toFixed(2)),
          };
        })
      );
    },
    [draggedItemId, zoomLevel, enableSnap, marginCm, sheetWidthCm, sheetHeightCm]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedItemId(null);
    dragStartPos.current = null;
  }, []);

  useEffect(() => {
    if (draggedItemId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedItemId, handleMouseMove, handleMouseUp]);

  // Save Layout to Supabase
  async function handleSavePrintSheet() {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Debes iniciar sesión para guardar la plancha.");
      }

      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (!member?.workspace_id) {
        throw new Error("Espacio de trabajo no encontrado.");
      }

      const workspaceId = member.workspace_id;
      const targetId = sheetId || crypto.randomUUID();

      // Upsert Parent Print Sheet Record
      const { error: errSheet } = await supabase.from("print_sheets").upsert({
        id: targetId,
        workspace_id: workspaceId,
        name: sheetName,
        sheet_width_cm: sheetWidthCm,
        sheet_height_cm: sheetHeightCm,
        target_dpi: targetDpi,
        margin_cm: marginCm,
        spacing_cm: spacingCm,
        efficiency_percentage: utilizationPercentage,
        waste_percentage: wastePercentage,
        status: "draft",
      });

      if (errSheet) throw new Error(errSheet.message);

      // Delete old items and insert updated items
      await supabase.from("print_sheet_items").delete().eq("print_sheet_id", targetId);

      if (items.length > 0) {
        const itemsToInsert = items.map((item, idx) => ({
          print_sheet_id: targetId,
          design_id: item.designId,
          x_cm: item.xCm,
          y_cm: item.yCm,
          width_cm: item.widthCm,
          height_cm: item.heightCm,
          rotation: item.rotation,
          z_index: idx,
        }));

        const { error: errItems } = await supabase.from("print_sheet_items").insert(itemsToInsert);
        if (errItems) throw new Error(errItems.message);
      }

      setSheetId(targetId);
      setSaveMessage("¡Plancha guardada exitosamente!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al guardar la plancha.");
    } finally {
      setIsSaving(false);
    }
  }

  // Display pixels scale (1cm ≈ 37.795px at 100% scale)
  const displayPxWidth = Math.round(sheetWidthCm * 37.795 * zoomLevel);
  const displayPxHeight = Math.round(sheetHeightCm * 37.795 * zoomLevel);

  return (
    <div className="space-y-6">
      {/* Modals */}
      <AddDesignsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDesigns={handleAddDesigns}
      />

      <PreExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        items={items}
        sheetName={sheetName}
        sheetWidthCm={sheetWidthCm}
        sheetHeightCm={sheetHeightCm}
        marginCm={marginCm}
        spacingCm={spacingCm}
        targetDpi={targetDpi}
      />

      {/* Top Action Bar */}
      <GlassCard glow="cyan" className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="font-display text-lg font-extrabold text-on-surface bg-transparent border-b border-transparent hover:border-white/20 focus:border-secondary focus:outline-none px-1 py-0.5"
          />
          <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30 shrink-0">
            {sheetWidthCm} × {sheetHeightCm} cm
          </span>
        </div>

        {/* Real-time Material Utilization Badge */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-on-surface-variant">Uso de Material:</span>
            <span className="text-secondary font-mono font-bold text-sm">{utilizationPercentage}%</span>
          </div>

          <div className="flex items-center gap-2 font-semibold border-l border-white/10 pl-4">
            <span className="text-on-surface-variant">Desperdicio:</span>
            <span className="text-primary font-mono font-bold text-sm">{wastePercentage}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <NeuButton
            variant="glass"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 text-secondary" />
            <span>Agregar Diseños</span>
          </NeuButton>

          <NeuButton
            variant="primary"
            size="md"
            active
            onClick={handleAutoNest}
            disabled={items.length === 0}
            className="shadow-glow-violet"
          >
            <Sparkles className="w-4 h-4" />
            <span>Acomodar Automático</span>
          </NeuButton>

          <NeuButton
            variant="glass"
            size="md"
            onClick={() => setIsExportModalOpen(true)}
            disabled={items.length === 0}
          >
            <Download className="w-4 h-4 text-secondary" />
            <span>Exportar PNG</span>
          </NeuButton>

          <NeuButton
            variant="secondary"
            size="md"
            active
            onClick={handleSavePrintSheet}
            disabled={isSaving}
            className="shadow-glow-cyan"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Guardando..." : "Guardar"}</span>
          </NeuButton>
        </div>
      </GlassCard>

      {/* Save / Error Banners */}
      {saveMessage && (
        <div className="p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Unplaced Items Warning Banner */}
      {unplacedItems.length > 0 && (
        <div className="neu-pressed bg-error-container/20 border border-error/30 text-error p-4 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              <strong>{unplacedItems.length} diseño(s) no pudieron acomodarse.</strong> Aumenta la longitud de la plancha o reduce tamaños.
            </span>
          </div>
          <NeuButton
            variant="glass"
            size="sm"
            onClick={() => setSheetHeightCm((prev) => prev + 100)}
          >
            Aumentar Longitud (+100 cm)
          </NeuButton>
        </div>
      )}

      {/* Main Studio Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Interactive Canvas Viewport */}
        <div className="lg:col-span-8 space-y-4">
          <GlassCard glow="cyan" className="p-4 space-y-3">
            {/* Viewport Zoom & Display Controls */}
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-on-surface-variant font-semibold">Escala de Visualización:</span>
                {[0.25, 0.5, 0.75, 1.0].map((level) => (
                  <button
                    key={level}
                    onClick={() => setZoomLevel(level)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                      zoomLevel === level
                        ? "bg-secondary text-surface-container-lowest font-bold"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {level * 100}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span>Cuadrícula</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={enableSnap}
                    onChange={(e) => setEnableSnap(e.target.checked)}
                    className="rounded text-primary focus:ring-secondary"
                  />
                  <span>Ajuste (0.5cm)</span>
                </label>
              </div>
            </div>

            {/* Canvas Container Viewport */}
            <div className="w-full overflow-auto max-h-[650px] p-6 bg-surface-container-lowest/80 rounded-2xl flex items-center justify-center relative select-none">
              <div
                ref={canvasRef}
                style={{
                  width: `${displayPxWidth}px`,
                  height: `${displayPxHeight}px`,
                }}
                className={`relative border-2 border-secondary/40 rounded-xl overflow-hidden shadow-2xl transition-all ${
                  showGrid ? "bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:18.9px_18.9px]" : "bg-surface-container/40"
                }`}
              >
                {/* Outer Margins Visual Guide */}
                <div
                  style={{
                    top: `${marginCm * 37.795 * zoomLevel}px`,
                    left: `${marginCm * 37.795 * zoomLevel}px`,
                    right: `${marginCm * 37.795 * zoomLevel}px`,
                    bottom: `${marginCm * 37.795 * zoomLevel}px`,
                  }}
                  className="absolute border border-dashed border-primary/40 pointer-events-none"
                />

                {/* Render Placed Design Instance Cards */}
                {items.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  const itemPxX = item.xCm * 37.795 * zoomLevel;
                  const itemPxY = item.yCm * 37.795 * zoomLevel;
                  const itemPxW = item.widthCm * 37.795 * zoomLevel;
                  const itemPxH = item.heightCm * 37.795 * zoomLevel;

                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleMouseDown(e, item)}
                      style={{
                        transform: `translate(${itemPxX}px, ${itemPxY}px)`,
                        width: `${itemPxW}px`,
                        height: `${itemPxH}px`,
                      }}
                      className={`absolute top-0 left-0 cursor-move border rounded-lg transition-shadow flex items-center justify-center p-1 group ${
                        isSelected
                          ? "border-secondary bg-secondary/20 shadow-glow-cyan z-30"
                          : "border-white/20 bg-surface-container-high/70 hover:border-white/40 z-10"
                      }`}
                    >
                      {/* Thumbnail Image */}
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-md"
                          style={{
                            transform: `rotate(${item.rotation}deg)`,
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-on-surface font-mono truncate">
                          {item.name}
                        </span>
                      )}

                      {/* Quick Action Overlay on Selection */}
                      {isSelected && (
                        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-surface-container-high border border-white/10 p-1 rounded-lg shadow-xl z-40">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRotateItem(item.id);
                            }}
                            className="p-1 text-on-surface hover:text-secondary rounded hover:bg-white/10"
                            title="Rotar 90°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateItem(item.id);
                            }}
                            className="p-1 text-on-surface hover:text-primary rounded hover:bg-white/10"
                            title="Duplicar"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="p-1 text-error hover:text-error-container rounded hover:bg-white/10"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Dimension Tag */}
                      <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-surface-container-lowest/80 text-on-surface px-1.5 py-0.5 rounded border border-white/10 pointer-events-none">
                        {item.widthCm}×{item.heightCm}cm
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Settings & Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <Sliders className="w-4 h-4 text-secondary" />
              <span>Configuración de Plancha</span>
            </h3>

            {/* Width Preset Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Ancho de Bobina / Pliego
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 55, 58, 60].map((w) => (
                  <button
                    key={w}
                    onClick={() => setSheetWidthCm(w)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      sheetWidthCm === w
                        ? "bg-secondary text-surface-container-lowest border-secondary shadow-glow-cyan"
                        : "bg-surface-container/60 border-white/10 text-on-surface hover:border-white/20"
                    }`}
                  >
                    {w} cm
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Length Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                <span>Longitud de Plancha (cm)</span>
                <span className="font-mono text-secondary font-bold">{sheetHeightCm} cm</span>
              </div>
              <input
                type="range"
                min={50}
                max={400}
                step={10}
                value={sheetHeightCm}
                onChange={(e) => setSheetHeightCm(parseFloat(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>

            <div className="h-[1px] bg-white/10" />

            <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
              <Layers className="w-4 h-4 text-primary" />
              <span>Márgenes y Separaciones</span>
            </h3>

            {/* Margin Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                <span>Margen Exterior (cm)</span>
                <span className="font-mono text-primary font-bold">{marginCm} cm</span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={0.5}
                value={marginCm}
                onChange={(e) => setMarginCm(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Spacing Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                <span>Separación entre Diseños (cm)</span>
                <span className="font-mono text-primary font-bold">{spacingCm} cm</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.1}
                value={spacingCm}
                onChange={(e) => setSpacingCm(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Allow Rotation Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-surface-container/60">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-on-surface">Permitir Rotación 90°</p>
                <p className="text-[10px] text-on-surface-variant">Optimiza aprovechamiento girando imágenes</p>
              </div>
              <input
                type="checkbox"
                checked={allowRotation}
                onChange={(e) => setAllowRotation(e.target.checked)}
                className="rounded text-secondary focus:ring-secondary cursor-pointer"
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
