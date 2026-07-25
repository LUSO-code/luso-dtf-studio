"use client";

import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Zap, X, CheckCircle2, ArrowRight } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  currentUsage?: number;
  maxLimit?: number;
  featureName?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Has alcanzado el límite de tu plan",
  description = "Actualiza a un plan Pro o Estudio para ampliar tus límites de almacenamiento y funciones avanzadas.",
  currentUsage,
  maxLimit,
  featureName,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const isLimitReached = currentUsage !== undefined && maxLimit !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="violet" className="w-full max-w-md p-6 space-y-6 border border-white/10 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-glow-violet">
            <Zap className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
              Límite del Plan
            </span>
            <h2 className="font-display text-xl font-extrabold text-on-surface">{title}</h2>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">{description}</p>
        </div>

        {/* Limit Meter */}
        {isLimitReached && (
          <div className="p-4 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/5 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface-variant">Uso Actual:</span>
              <span className="font-mono text-error">
                {currentUsage} / {maxLimit}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-error rounded-full w-full" />
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Lo que obtienes con un Plan Superior:
          </span>
          <ul className="text-xs text-on-surface space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Hasta 200 diseños y 50 planchas DTF</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Hasta 10 miembros de equipo con RBAC</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
              <span>Generador de Máscara de Blanco Avanzado</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <NeuButton variant="glass" size="md" onClick={onClose}>
            Más adelante
          </NeuButton>

          <Link href="/precios" onClick={onClose}>
            <NeuButton variant="primary" size="md" active className="shadow-glow-violet">
              <span>Ver Planes Comerciales</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </NeuButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
