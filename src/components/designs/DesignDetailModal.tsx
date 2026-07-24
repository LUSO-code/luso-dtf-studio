"use client";

import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { calculateDesignStatus } from "@lib/workflow/types";
import {
  X,
  Sparkles,
  Wrench,
  Layers,
  Grid,
  Download,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  FileCheck2,
} from "lucide-react";

export interface DesignDetailRecord {
  id: string;
  name: string;
  original_file_url?: string;
  processed_file_url?: string;
  underbase_file_url?: string;
  print_width_cm?: number;
  print_height_cm?: number;
  dpi?: number;
  original_format?: string;
  file_size?: number;
  created_at?: string;
}

interface DesignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  design: DesignDetailRecord | null;
}

export function DesignDetailModal({ isOpen, onClose, design }: DesignDetailModalProps) {
  if (!isOpen || !design) return null;

  const status = calculateDesignStatus(design);
  const displayUrl = design.processed_file_url || design.original_file_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-2xl p-6 space-y-6 border border-white/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shadow-glow-cyan">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                  {status.statusBadge}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-on-surface truncate max-w-[320px]">
                {design.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Left Preview */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div className="h-56 w-full rounded-2xl neu-pressed bg-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden border border-white/10">
              {displayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayUrl}
                  alt={design.name}
                  className="max-h-full max-w-full object-contain drop-shadow-lg"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-on-surface-variant/40" />
              )}
            </div>
          </div>

          {/* Right Metadata & Checklist */}
          <div className="sm:col-span-7 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Especificaciones de Impresión
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-surface-container/60 border border-white/5 space-y-0.5">
                  <span className="text-on-surface-variant text-[11px]">Tamaño Físico:</span>
                  <p className="font-bold text-on-surface font-mono">
                    {design.print_width_cm || 30} x {design.print_height_cm || 30} cm
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container/60 border border-white/5 space-y-0.5">
                  <span className="text-on-surface-variant text-[11px]">Resolución:</span>
                  <p className="font-bold text-secondary font-mono">{design.dpi || 300} DPI</p>
                </div>
              </div>
            </div>

            {/* Progressive Workflow Status Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Estado del Flujo de Producción
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span>Archivo original subido</span>
                </div>

                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      status.hasProcessed ? "text-secondary" : "text-on-surface-variant/40"
                    }`}
                  />
                  <span className={status.hasProcessed ? "font-semibold" : "opacity-50"}>
                    Optimización DTF y 300 DPI
                  </span>
                </div>

                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      status.hasUnderbase ? "text-secondary" : "text-on-surface-variant/40"
                    }`}
                  />
                  <span className={status.hasUnderbase ? "font-semibold" : "opacity-50"}>
                    Máscara de tinta blanca preparada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Contextual Action CTAs */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Link href={`/herramientas/image-lab?designId=${design.id}`}>
            <NeuButton variant="glass" size="md">
              <Wrench className="w-4 h-4 text-primary" />
              <span>Editar en Image Lab</span>
            </NeuButton>
          </Link>

          <Link href={`/herramientas/mascara?designId=${design.id}`}>
            <NeuButton variant="primary" size="md" active className="shadow-glow-violet">
              <Layers className="w-4 h-4" />
              <span>Preparar Máscara</span>
            </NeuButton>
          </Link>

          <Link href={`/planchas/nueva?designId=${design.id}`}>
            <NeuButton variant="secondary" size="md" active className="shadow-glow-cyan">
              <Grid className="w-4 h-4" />
              <span>Añadir a Plancha</span>
            </NeuButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
