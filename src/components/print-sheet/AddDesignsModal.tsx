"use client";

import { useState, useEffect } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { NestingInputItem } from "@lib/nesting/types";
import { Search, Plus, Check, Image as ImageIcon, X, AlertTriangle } from "lucide-react";

interface AddDesignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDesigns: (items: NestingInputItem[]) => void;
}

interface DesignRecord {
  id: string;
  name: string;
  original_file_url: string;
  processed_file_url: string;
  print_width_cm: number;
  print_height_cm: number;
  dpi: number;
  has_alpha: boolean;
}

export function AddDesignsModal({ isOpen, onClose, onAddDesigns }: AddDesignsModalProps) {
  const [designs, setDesigns] = useState<DesignRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [targetWidths, setTargetWidths] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchDesigns() {
      setIsLoading(true);
      const supabase = createClient();

      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .single();

      if (!member?.workspace_id) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("designs")
        .select("*")
        .eq("workspace_id", member.workspace_id)
        .order("created_at", { ascending: false });

      if (data) {
        setDesigns(data as DesignRecord[]);
        const initialQty: Record<string, number> = {};
        const initialWidths: Record<string, number> = {};
        data.forEach((d) => {
          initialQty[d.id] = 1;
          initialWidths[d.id] = d.print_width_cm || 30;
        });
        setQuantities(initialQty);
        setTargetWidths(initialWidths);
      }
      setIsLoading(false);
    }

    fetchDesigns();
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleSelect(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function handleConfirmAdd() {
    const itemsToAdd: NestingInputItem[] = [];

    selectedIds.forEach((id) => {
      const design = designs.find((d) => d.id === id);
      if (!design) return;

      const qty = quantities[id] || 1;
      const customW = targetWidths[id] || design.print_width_cm || 30;
      const aspectRatio = (design.print_width_cm || 30) / (design.print_height_cm || 30) || 1;
      const customH = Number((customW / aspectRatio).toFixed(2));

      for (let i = 0; i < qty; i++) {
        itemsToAdd.push({
          id: crypto.randomUUID(),
          designId: design.id,
          name: design.name,
          thumbnailUrl: design.processed_file_url || design.original_file_url,
          processedFileUrl: design.processed_file_url || design.original_file_url,
          widthCm: customW,
          heightCm: customH,
          aspectRatio,
          allowRotation: true,
        });
      }
    });

    onAddDesigns(itemsToAdd);
    onClose();
  }

  const filteredDesigns = designs.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-3xl max-h-[85vh] flex flex-col p-6 space-y-5 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface">
              Agregar Diseños a la Plancha
            </h2>
            <p className="text-xs text-on-surface-variant">
              Selecciona los diseños optimizados de tu biblioteca "Mis Diseños"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre de diseño..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </div>

        {/* Designs List / Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px] space-y-3 pr-1">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-on-surface-variant">
              Cargando biblioteca de diseños...
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ImageIcon className="w-8 h-8 text-on-surface-variant mx-auto opacity-50" />
              <p className="text-xs text-on-surface-variant">
                No se encontraron diseños. Sube una imagen en el Image Lab primero.
              </p>
            </div>
          ) : (
            filteredDesigns.map((design) => {
              const isSelected = selectedIds.includes(design.id);
              const qty = quantities[design.id] || 1;
              const width = targetWidths[design.id] || design.print_width_cm || 30;

              return (
                <div
                  key={design.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-secondary/10 border-secondary shadow-glow-cyan"
                      : "bg-surface-container/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className="flex items-center gap-3.5 cursor-pointer flex-1"
                    onClick={() => toggleSelect(design.id)}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-secondary border-secondary text-surface-container-lowest"
                          : "border-white/30 bg-surface-container-high"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={design.processed_file_url || design.original_file_url}
                        alt={design.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-on-surface line-clamp-1">
                        {design.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                        Original: {design.print_width_cm || 30} x {design.print_height_cm || 30} cm • {design.dpi || 300} DPI
                      </p>
                    </div>
                  </div>

                  {/* Size Presets & Quantity Controls */}
                  {isSelected && (
                    <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {/* Size Selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-on-surface-variant">Ancho:</span>
                        <select
                          value={width}
                          onChange={(e) =>
                            setTargetWidths({ ...targetWidths, [design.id]: parseFloat(e.target.value) })
                          }
                          className="neu-pressed bg-surface-container-lowest text-on-surface text-[11px] font-mono rounded-lg px-2 py-1 border border-white/10"
                        >
                          <option value={20}>20 cm</option>
                          <option value={25}>25 cm</option>
                          <option value={30}>30 cm</option>
                          <option value={35}>35 cm</option>
                          <option value={40}>40 cm</option>
                        </select>
                      </div>

                      {/* Quantity Multiplier */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-on-surface-variant">Cant:</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={qty}
                          onChange={(e) =>
                            setQuantities({ ...quantities, [design.id]: parseInt(e.target.value) || 1 })
                          }
                          className="w-12 text-center neu-pressed bg-surface-container-lowest text-on-surface text-[11px] font-bold rounded-lg px-1.5 py-1 border border-white/10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-on-surface-variant font-medium">
            {selectedIds.length} diseño(s) seleccionado(s)
          </span>

          <div className="flex gap-3">
            <NeuButton variant="glass" size="md" onClick={onClose}>
              Cancelar
            </NeuButton>
            <NeuButton
              variant="secondary"
              size="md"
              active
              onClick={handleConfirmAdd}
              disabled={selectedIds.length === 0}
              className="shadow-glow-cyan"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar a Plancha</span>
            </NeuButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
