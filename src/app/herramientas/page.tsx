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
  Cpu,
} from "lucide-react";
import Link from "next/link";

export default function HerramientasPage() {
  const tools = [
    {
      title: "Image Lab Studio",
      desc: "Studio principal de optimización de imágenes, limpieza de transparencias, análisis DPI y exportación PNG para DTF.",
      icon: Wrench,
      href: "/herramientas/image-lab",
      glow: "cyan",
      badge: "Principal",
    },
    {
      title: "DTF Pre-Flight Engine",
      desc: "Análisis de resolución DPI, canal de blanco y alertas de transparencias semitransparentes.",
      icon: FileCheck2,
      href: "/herramientas/image-lab",
      glow: "violet",
      badge: "Integrado",
    },
    {
      title: "Limpieza de Transparencias",
      desc: "Corrección de color, eliminación de fondo y recortes limpios para impresión textil.",
      icon: ImageIcon,
      href: "/herramientas/image-lab",
      glow: "cyan",
      badge: "Integrado",
    },
    {
      title: "Editor de Máscara de Blanco",
      desc: "Generación de underbase de blanco, encogimiento (choking) y tolerancia de mapa de bits.",
      icon: Layers,
      href: "/herramientas/mascara",
      glow: "none",
      badge: "Próximamente",
    },
    {
      title: "Smart Nesting (Anidación)",
      desc: "Algoritmo de aprovechamiento óptimo de espacio en bobina o pliego DTF.",
      icon: Grid,
      href: "/herramientas/nesting",
      glow: "none",
      badge: "Próximamente",
    },
    {
      title: "Configuración de Plancha Térmica",
      desc: "Ajuste de temperatura, tiempo de prensado, presión y recomendaciones según el tejido.",
      icon: Settings,
      href: "/herramientas/plancha",
      glow: "none",
      badge: "Próximamente",
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
            <Link key={t.title} href={t.href}>
              <GlassCard
                glow={t.glow as "violet" | "cyan" | "none"}
                className="p-6 space-y-4 flex flex-col justify-between h-full group hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center text-primary group-hover:text-secondary group-hover:border-secondary/30 transition-colors shadow-glow-violet">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                      {t.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{t.desc}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <NeuButton variant="glass" size="sm" className="w-full justify-between">
                    <span>Abrir Herramienta</span>
                    <ArrowRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                  </NeuButton>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
