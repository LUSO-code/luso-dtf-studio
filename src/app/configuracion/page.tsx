import { GlassCard } from "@components/ui/GlassCard";
import { Settings, Sliders, Database, Cpu } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Configuración General
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Parámetros globales del estudio, unidades de medida y renderizado ambiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Unidades y Planchas</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Unidad Predeterminada:</span>
              <span className="font-semibold text-on-surface">Milímetros (mm) / Centímetros (cm)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Ancho Estándar de Rollo:</span>
              <span className="font-semibold text-secondary">580 mm (58 cm)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Margen de Seguridad:</span>
              <span className="font-semibold text-on-surface">5 mm</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Cpu className="w-4 h-4 text-secondary" />
            <span>Rendimiento Visual</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Fondo "Luz Líquida":</span>
              <span className="font-semibold text-secondary">Híbrido Adaptativo (WebGL + CSS)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Sensibilidad de Movimiento:</span>
              <span className="font-semibold text-on-surface">Auto (prefers-reduced-motion)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Pausa en Pestaña Oculta:</span>
              <span className="font-semibold text-primary">Activado (Visibility API)</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
