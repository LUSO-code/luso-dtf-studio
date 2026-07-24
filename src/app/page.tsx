import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Printer, Sparkles, Layers, FileUp, CheckCircle2, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Panel de Control
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Resumen de producción DTF, estado de impresora y cola de impresión en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NeuButton variant="glass" size="md">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Pre-Flight Rápido</span>
          </NeuButton>
          <NeuButton variant="primary" size="md" active>
            <FileUp className="w-4 h-4" />
            <span>Nuevo Trabajo</span>
          </NeuButton>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard glow="violet">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Trabajos Activos
            </span>
            <div className="p-2 rounded-xl bg-primary-dark/30 text-primary">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-on-surface">12</span>
            <span className="text-xs text-secondary ml-2 font-medium">↑ 4 en cola</span>
          </div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Metros Lineales (Hoy)
            </span>
            <div className="p-2 rounded-xl bg-secondary-dark/30 text-secondary">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-on-surface">48.5 m</span>
            <span className="text-xs text-on-surface-variant ml-2">Rollo 58cm</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Aprovechamiento
            </span>
            <div className="p-2 rounded-xl bg-surface-container-highest text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-3xl font-bold text-on-surface">94.2%</span>
            <span className="text-xs text-secondary ml-2">Smart Nesting</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Estado Impresora
            </span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
          <div className="mt-4">
            <span className="font-display text-xl font-bold text-secondary">EPSON I3200</span>
            <p className="text-xs text-on-surface-variant mt-0.5">Tinta Blanca: 82%</p>
          </div>
        </GlassCard>
      </div>

      {/* Production Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Queue Preview (2 Columns) */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Últimos Trabajos de Impresión</span>
            </h2>
            <span className="text-xs text-on-surface-variant cursor-pointer hover:text-primary">
              Ver Todos →
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: "DTF-1092", title: "Diseño Deportivo Vectorial", client: "SportClub", meters: "4.2m", status: "Imprimiendo", color: "text-secondary" },
              { id: "DTF-1091", title: "Logo Textil Ilustrado", client: "Moda Urbana", meters: "1.8m", status: "Listo", color: "text-primary" },
              { id: "DTF-1090", title: "Colección Verano 2026", client: "Luso Brand", meters: "12.0m", status: "Pre-Flight", color: "text-tertiary" },
            ].map((job) => (
              <div
                key={job.id}
                className="neu-pressed bg-surface-container/60 rounded-xl p-4 flex items-center justify-between hover:bg-surface-container-high/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{job.id}</span>
                    <h3 className="text-sm font-semibold text-on-surface">{job.title}</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Cliente: {job.client} • Longitud: {job.meters}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-surface-container-highest/80 ${job.color}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* System Architecture & Status (1 Column) */}
        <GlassCard className="space-y-4">
          <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-4">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <span>Infraestructura LUSO</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/40">
              <span className="text-on-surface-variant">Base de Datos:</span>
              <span className="font-semibold text-primary">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/40">
              <span className="text-on-surface-variant">Hosting & CDN:</span>
              <span className="font-semibold text-secondary">Vercel Edge</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/40">
              <span className="text-on-surface-variant">Almacenamiento:</span>
              <span className="font-semibold text-on-surface">Supabase Storage (R2 Ready)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-surface-container-high/40">
              <span className="text-on-surface-variant">Edge & DNS:</span>
              <span className="font-semibold text-on-surface">Cloudflare OAuth Connected</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
