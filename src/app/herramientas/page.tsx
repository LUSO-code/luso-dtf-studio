import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import {
  Wrench,
  Sparkles,
  Layers,
  Grid,
  Settings,
  Image as ImageIcon,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";

export default function HerramientasPage() {
  const tools = [
    {
      title: "DTF Pre-Flight",
      desc: "Análisis de resolución DPI, canal de blanco y alertas de transparencias semitransparentes.",
      icon: FileCheck2,
      href: "/herramientas/preflight",
    },
    {
      title: "Preparación de Imagen",
      desc: "Corrección de color, eliminación de fondo y recorte preciso para impresión textil.",
      icon: ImageIcon,
      href: "/herramientas/preparacion",
    },
    {
      title: "Editor de Máscara de Blanco",
      desc: "Generación de underbase de blanco, encogimiento (choking) y tolerancia de mapa de bits.",
      icon: Layers,
      href: "/herramientas/mascara",
    },
    {
      title: "Smart Nesting (Anidación)",
      desc: "Algoritmo de aprovechamiento óptimo de espacio en bobina o pliego DTF.",
      icon: Grid,
      href: "/herramientas/nesting",
    },
    {
      title: "Configuración de Plancha Térmica",
      desc: "Ajuste de temperatura, tiempo de prensado, presión y recomendaciones según el tejido.",
      icon: Settings,
      href: "/herramientas/plancha",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Herramientas de Procesamiento
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Módulos especializados para optimizar tus imágenes y planchas de impresión DTF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <GlassCard key={t.title} glow="violet" className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center text-primary shadow-glow-violet">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-on-surface">{t.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{t.desc}</p>
                </div>
              </div>

              <div className="pt-2">
                <NeuButton variant="glass" size="sm" className="w-full justify-between">
                  <span>Abrir Herramienta</span>
                  <ArrowRight className="w-4 h-4 text-secondary" />
                </NeuButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
