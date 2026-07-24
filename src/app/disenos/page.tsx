import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Upload, FolderOpen, Search, Filter } from "lucide-react";

export default function DisenosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Mis Diseños
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant mt-1">
            Biblioteca de imágenes y archivos gráficos cargados para impresión DTF.
          </p>
        </div>
        <NeuButton variant="primary" size="md" active>
          <Upload className="w-4 h-4" />
          <span>Subir Nuevo Diseño</span>
        </NeuButton>
      </div>

      <GlassCard className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar por nombre o etiqueta..."
            className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-xs rounded-xl pl-9 pr-4 py-2 border border-white/5"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <NeuButton variant="glass" size="sm" className="gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </NeuButton>
        </div>
      </GlassCard>

      <GlassCard className="text-center py-16 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center mx-auto text-secondary shadow-glow-cyan">
          <FolderOpen className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-display font-bold text-base text-on-surface">
            Biblioteca de Diseños Lista
          </h3>
          <p className="text-xs text-on-surface-variant">
            Sube imágenes PNG con transparencia o archivos vectoriales en alta resolución para comenzar.
          </p>
        </div>
        <NeuButton variant="primary" size="md">
          <Upload className="w-4 h-4" />
          <span>Examinar Archivos</span>
        </NeuButton>
      </GlassCard>
    </div>
  );
}
