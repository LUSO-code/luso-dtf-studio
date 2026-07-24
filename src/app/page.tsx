import Link from "next/link";
import { createClient } from "@lib/supabase/server";
import { PublicLanding } from "@components/landing/PublicLanding";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import {
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
  Clock,
  Play,
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

  // Fetch user active workspace & latest assets for Workflow Continuation
  let latestDesign: any = null;
  let latestSheet: any = null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  if (member?.workspace_id) {
    const { data: dData } = await supabase
      .from("designs")
      .select("*")
      .eq("workspace_id", member.workspace_id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (dData?.[0]) latestDesign = dData[0];

    const { data: sData } = await supabase
      .from("print_sheets")
      .select("*")
      .eq("workspace_id", member.workspace_id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (sData?.[0]) latestSheet = sData[0];
  }

  return (
    <div className="space-y-8">
      {/* Workflow Primary Hero Banner */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Suite de Preparación e Impresión DTF</span>
          </div>

          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
            Flujo de Preparación e Optimización de <span className="text-secondary">Planchas DTF</span>
          </h1>

          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl leading-relaxed">
            Optimiza imágenes, limpia alfas, genera base de blanco, acomoda diseños con Smart Nesting y exporta planchas 300 DPI listas para RIP.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href="/herramientas/image-lab">
              <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
                <Wrench className="w-5 h-5" />
                <span>Abrir Image Lab</span>
              </NeuButton>
            </Link>

            <Link href="/planchas/nueva">
              <NeuButton variant="primary" size="lg" active className="shadow-glow-violet">
                <PlusCircle className="w-5 h-5" />
                <span>Crear Nueva Plancha</span>
              </NeuButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Continuation Area: "Continúa tu Producción" */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
          <Clock className="w-5 h-5 text-secondary" />
          <span>Continúa tu Producción</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Último Diseño Editado */}
          <GlassCard glow="cyan" className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
                Último Diseño Editado
              </span>
              <h3 className="font-display font-bold text-base text-on-surface truncate">
                {latestDesign ? latestDesign.name : "Sin diseños recientes"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {latestDesign
                  ? `${latestDesign.print_width_cm || 30} × ${latestDesign.print_height_cm || 30} cm • ${latestDesign.dpi || 300} DPI`
                  : "Carga un archivo en el Image Lab para comenzar."}
              </p>
            </div>

            {latestDesign ? (
              <Link href={`/herramientas/mascara?designId=${latestDesign.id}`}>
                <NeuButton variant="secondary" size="sm" active className="shrink-0 shadow-glow-cyan">
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NeuButton>
              </Link>
            ) : (
              <Link href="/herramientas/image-lab">
                <NeuButton variant="glass" size="sm" className="shrink-0">
                  <span>Subir</span>
                </NeuButton>
              </Link>
            )}
          </GlassCard>

          {/* Card 2: Última Plancha Modificada */}
          <GlassCard glow="violet" className="p-5 flex items-center justify-between gap-4">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Última Plancha Modificada
              </span>
              <h3 className="font-display font-bold text-base text-on-surface truncate">
                {latestSheet ? latestSheet.name : "Sin planchas activas"}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {latestSheet
                  ? `${latestSheet.sheet_width_cm} × ${latestSheet.sheet_height_cm} cm • Uso ${latestSheet.efficiency_percentage || 0}%`
                  : "Acomoda diseños con el motor Smart Nesting."}
              </p>
            </div>

            {latestSheet ? (
              <Link href={`/planchas/${latestSheet.id}`}>
                <NeuButton variant="primary" size="sm" active className="shrink-0 shadow-glow-violet">
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NeuButton>
              </Link>
            ) : (
              <Link href="/planchas/nueva">
                <NeuButton variant="glass" size="sm" className="shrink-0">
                  <span>Crear</span>
                </NeuButton>
              </Link>
            )}
          </GlassCard>
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
              title: "Editor de Máscara",
              desc: "Underbase y contracción de blanco",
              icon: Layers,
              href: "/herramientas/mascara",
              glow: "violet",
            },
            {
              title: "Smart Nesting",
              desc: "Anidación optimizada en rollo",
              icon: Grid,
              href: "/planchas/nueva",
              glow: "cyan",
            },
            {
              title: "Mis Diseños",
              desc: "Biblioteca de archivos DTF",
              icon: ImageIcon,
              href: "/disenos",
              glow: "violet",
            },
            {
              title: "Mis Planchas",
              desc: "Pliegos y rollos maquetados",
              icon: Maximize2,
              href: "/planchas",
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
    </div>
  );
}
