import { GlassCard } from "@components/ui/GlassCard";
import { ShoppingBag, Search, Sparkles } from "lucide-react";

export default function CatalogoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Catálogo de Plantillas
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Plantillas vectoriales y diseños prediseñados listos para maquetar en tu plancha DTF.
        </p>
      </div>

      <GlassCard className="p-4 flex gap-3 items-center">
        <Search className="w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Buscar plantillas textiles, números, escudos..."
          className="w-full bg-transparent border-none text-xs text-on-surface focus:outline-none"
        />
      </GlassCard>

      <GlassCard className="text-center py-16 space-y-3">
        <ShoppingBag className="w-10 h-10 text-secondary mx-auto" />
        <h3 className="font-display font-bold text-base text-on-surface">
          Catálogo DTF En Preparación
        </h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          Próximamente podrás integrar colecciones de vectores, dorsales y parches deportivos directamente a tus proyectos.
        </p>
      </GlassCard>
    </div>
  );
}
