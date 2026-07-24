"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { DesignDetailModal, DesignDetailRecord } from "@components/designs/DesignDetailModal";
import { calculateDesignStatus } from "@lib/workflow/types";
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Layers,
  Wrench,
  Grid,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function DisenosHubPage() {
  const [designs, setDesigns] = useState<DesignDetailRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDesign, setSelectedDesign] = useState<DesignDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDesigns() {
      setIsLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (member?.workspace_id) {
        const { data } = await supabase
          .from("designs")
          .select("*")
          .eq("workspace_id", member.workspace_id)
          .order("created_at", { ascending: false });

        if (data) setDesigns(data as DesignDetailRecord[]);
      }
      setIsLoading(false);
    }

    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Design Detail Modal */}
      <DesignDetailModal
        isOpen={Boolean(selectedDesign)}
        onClose={() => setSelectedDesign(null)}
        design={selectedDesign}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biblioteca de Diseños DTF</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Mis Diseños
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Archivos optimizados, mapas de bits y máscaras de tinta blanca de tu espacio de trabajo.
          </p>
        </div>

        <Link href="/herramientas/image-lab">
          <NeuButton variant="secondary" size="md" active className="shadow-glow-cyan">
            <Upload className="w-4 h-4" />
            <span>Optimizar Nueva Imagen</span>
          </NeuButton>
        </Link>
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

      {/* Designs Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-on-surface-variant">
          Cargando biblioteca de diseños...
        </div>
      ) : filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDesigns.map((design) => {
            const status = calculateDesignStatus(design);
            const displayUrl = design.processed_file_url || design.original_file_url;

            return (
              <GlassCard
                key={design.id}
                glow="cyan"
                className="p-5 space-y-4 flex flex-col justify-between group hover:scale-[1.01] transition-all cursor-pointer border border-white/10"
                onClick={() => setSelectedDesign(design)}
              >
                <div className="space-y-3">
                  <div className="h-44 w-full rounded-xl neu-pressed bg-surface-container-lowest flex items-center justify-center p-3 overflow-hidden relative border border-white/5">
                    {displayUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayUrl}
                        alt={design.name}
                        className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-on-surface-variant/40" />
                    )}

                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high/90 text-secondary border border-secondary/30">
                      {status.statusBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {design.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                      {design.print_width_cm || 30} x {design.print_height_cm || 30} cm • {design.dpi || 300} DPI
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-secondary group-hover:translate-x-1 transition-transform">
                  <span>Ver Detalle y Acciones</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <GlassCard glow="violet" className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
            <ImageIcon className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-xl font-bold text-on-surface">
              Tu biblioteca de diseños está vacía
            </h2>
            <p className="text-xs text-on-surface-variant">
              Carga tu primera imagen en el Image Lab para analizar DPI, limpiar transparencias y guardarla en tu espacio de trabajo.
            </p>
          </div>

          <Link href="/herramientas/image-lab" className="inline-block">
            <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
              <Upload className="w-5 h-5" />
              <span>Optimizar Mi Primer Diseño</span>
            </NeuButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
