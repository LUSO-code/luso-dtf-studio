import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { PlusCircle, Layers, Grid, Download } from "lucide-react";

export default function PlanchasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Mis Planchas
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Gestión de pliegos y rollos DTF optimizados mediante Smart Nesting.
          </p>
        </div>
        <NeuButton variant="primary" size="md" active>
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Plancha</span>
        </NeuButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <GlassCard glow="cyan" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Rollo 58 cm
            </span>
            <span className="text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              94% Eficiencia
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-on-surface">
              Plancha_Rollo_58cm_V1
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Dimensiones: 580 mm x 1500 mm (1.5 metros)
            </p>
          </div>
          <div className="neu-pressed bg-surface-container/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Diseños incluidos:</span>
            <span className="font-semibold text-on-surface">14 elementos</span>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <NeuButton variant="glass" size="sm" className="w-full">
              <Grid className="w-3.5 h-3.5" />
              <span>Editar Nesting</span>
            </NeuButton>
            <NeuButton variant="secondary" size="sm" className="w-full">
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </NeuButton>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Pliego A3
            </span>
            <span className="text-xs font-bold text-secondary px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
              88% Eficiencia
            </span>
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-on-surface">
              Pliego_A3_Standard_02
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Dimensiones: 297 mm x 420 mm
            </p>
          </div>
          <div className="neu-pressed bg-surface-container/60 p-3 rounded-xl flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Diseños incluidos:</span>
            <span className="font-semibold text-on-surface">4 elementos</span>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <NeuButton variant="glass" size="sm" className="w-full">
              <Grid className="w-3.5 h-3.5" />
              <span>Editar Nesting</span>
            </NeuButton>
            <NeuButton variant="secondary" size="sm" className="w-full">
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </NeuButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
