import Link from "next/link";
import { createClient } from "@lib/supabase/server";
import { PublicLanding } from "@components/landing/PublicLanding";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import {
  Upload,
  PlusCircle,
  Sparkles,
  Layers,
  Wrench,
  Grid,
  Settings,
  Image as ImageIcon,
  ArrowRight,
  FileCheck2,
  Maximize2,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If unauthenticated, render Public Welcome / Landing experience
  if (!user) {
    return <PublicLanding />;
  }

  // If authenticated, render existing Inicio Dashboard experience
  return (
    <div className="space-y-8">
      {/* Workflow Primary Hero Banner */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Suite de Preparación para Impresión DTF</span>
          </div>

          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Flujo de Preparación e Optimización de <span className="text-secondary">Planchas DTF</span>
          </h1>

          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl leading-relaxed">
            Prepara tus imágenes vectoriales y rásster, ajusta la máscara de tinta blanca, optimiza el aprovechamiento de película con Smart Nesting y exporta planchas listas para RIP.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/proyecto/nuevo">
              <NeuButton variant="primary" size="lg" active className="shadow-glow-violet">
                <PlusCircle className="w-5 h-5" />
                <span>Crear Nuevo Proyecto</span>
              </NeuButton>
            </Link>

            <Link href="/herramientas/image-lab">
              <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
                <Wrench className="w-5 h-5" />
                <span>Abrir Image Lab</span>
              </NeuButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Tools Grid */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <span>Acceso Rápido a Herramientas</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: "Image Lab Studio",
              desc: "Análisis DPI y limpieza de alfas",
              icon: Wrench,
              href: "/herramientas/image-lab",
              glow: "cyan",
            },
            {
              title: "DTF Pre-Flight",
              desc: "Verificación de DPI y transparencias",
              icon: FileCheck2,
              href: "/herramientas/preflight",
              glow: "violet",
            },
            {
              title: "Editor de Máscara",
              desc: "Underbase y encogimiento de blanco",
              icon: Layers,
              href: "/herramientas/mascara",
              glow: "violet",
            },
            {
              title: "Smart Nesting",
              desc: "Anidación optimizada en rollo",
              icon: Grid,
              href: "/herramientas/nesting",
              glow: "cyan",
            },
            {
              title: "Config. Plancha",
              desc: "Parámetros de prensado térmico",
              icon: Settings,
              href: "/herramientas/plancha",
              glow: "none",
            },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.title} href={tool.href}>
                <GlassCard
                  glow={tool.glow as "violet" | "cyan" | "none"}
                  className="h-full flex flex-col justify-between group hover:scale-[1.02] transition-all cursor-pointer p-5"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center text-primary group-hover:text-secondary group-hover:border-secondary/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant/80 mt-1 leading-snug">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center text-xs font-semibold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Abrir</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Workflow Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Diseños Recientes */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-secondary" />
                <span>Diseños Recientes</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Archivos subidos listos para procesar
              </p>
            </div>
            <Link href="/disenos">
              <span className="text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer">
                Ver todos →
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Ilustracion_Deportiva_V2.png",
                size: "45 cm x 30 cm",
                dpi: "300 DPI",
                status: "Verificado",
                color: "text-secondary border-secondary/30",
              },
              {
                name: "Logo_Emblema_Vintage.png",
                size: "28 cm x 28 cm",
                dpi: "300 DPI",
                status: "Máscara Lista",
                color: "text-primary border-primary/30",
              },
              {
                name: "Estampa_Frente_Camiseta.png",
                size: "35 cm x 40 cm",
                dpi: "240 DPI",
                status: "Requiere Ajuste",
                color: "text-tertiary border-tertiary/30",
              },
            ].map((design) => (
              <div
                key={design.name}
                className="neu-pressed bg-surface-container/60 rounded-xl p-3.5 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-white/10 flex items-center justify-center text-on-surface-variant">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-on-surface truncate max-w-[200px] sm:max-w-[260px]">
                      {design.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {design.size} • {design.dpi}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-highest/80 border ${design.color}`}
                >
                  {design.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Section 2: Planchas Recientes */}
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Planchas en Preparación</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pliegos y rollos DTF activos
              </p>
            </div>
            <Link href="/planchas">
              <span className="text-xs font-semibold text-primary hover:text-secondary transition-colors cursor-pointer">
                Ver todas →
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Plancha_Rollo_58cm_V1",
                dims: "58 cm x 150 cm",
                efficiency: "94% aprovechamiento",
                designs: "14 diseños",
                status: "Lista para PNG",
                color: "text-secondary border-secondary/30",
              },
              {
                name: "Pliego_A3_Standard_02",
                dims: "29.7 cm x 42 cm",
                efficiency: "88% aprovechamiento",
                designs: "4 diseños",
                status: "En Maquetación",
                color: "text-primary border-primary/30",
              },
              {
                name: "Plancha_Rollo_58cm_V2",
                dims: "58 cm x 200 cm",
                efficiency: "91% aprovechamiento",
                designs: "22 diseños",
                status: "Borrador",
                color: "text-on-surface-variant border-white/10",
              },
            ].map((sheet) => (
              <div
                key={sheet.name}
                className="neu-pressed bg-surface-container/60 rounded-xl p-3.5 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-white/10 flex items-center justify-center text-on-surface-variant">
                    <Maximize2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-on-surface truncate max-w-[180px] sm:max-w-[240px]">
                      {sheet.name}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {sheet.dims} • {sheet.designs}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-highest/80 border ${sheet.color}`}
                  >
                    {sheet.status}
                  </span>
                  <p className="text-[10px] text-secondary font-medium mt-1">
                    {sheet.efficiency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
