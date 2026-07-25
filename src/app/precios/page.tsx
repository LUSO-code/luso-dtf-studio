"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { AmbientBackground } from "@components/ui/AmbientBackground";
import { CheckCircle2, Zap, Sparkles, Building2, Layers, ArrowRight } from "lucide-react";

export default function PreciosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12 relative overflow-hidden">
      {/* Background visual ambience */}
      <AmbientBackground />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary shadow-glow-cyan">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Planes y Tarifas LUSO DTF STUDIO</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-on-surface tracking-tight">
          Planes diseñados para cada etapa de producción DTF
        </h1>

        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
          Desde pequeños talleres independientes hasta imprentas industriales con múltiples impresoras y operadores.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Plan 1: GRATUITO */}
        <GlassCard glow="cyan" className="p-8 space-y-6 flex flex-col justify-between border border-white/10 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30">
                Plan Inicial
              </span>
              <Layers className="w-5 h-5 text-secondary" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">Gratuito</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Ideal para probar herramientas de optimización y pequeños pedidos.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-on-surface">0€</span>
              <span className="text-xs text-on-surface-variant font-mono">/ mes</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-on-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Incluye:
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 15 diseños almacenados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 5 planchas de impresión DTF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>1.0 GB de almacenamiento</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 2 miembros de equipo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Exportación Color + Blanco 300 DPI</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href={isAuthenticated ? "/" : "/registro"}>
              <NeuButton variant="secondary" size="md" active className="w-full justify-center shadow-glow-cyan">
                <span>{isAuthenticated ? "Plan Activo Actual" : "Crear Cuenta Gratis"}</span>
              </NeuButton>
            </Link>
          </div>
        </GlassCard>

        {/* Plan 2: PROFESIONAL (Featured) */}
        <GlassCard glow="violet" className="p-8 space-y-6 flex flex-col justify-between border-2 border-primary/50 relative shadow-glow-violet scale-105">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-surface-container-lowest font-display font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
            Recomendado
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/20 border border-primary/40">
                Alta Producción
              </span>
              <Zap className="w-5 h-5 text-primary" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">Profesional</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Para talleres en crecimiento que necesitan maquetar planchas a diario.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-on-surface">29€</span>
              <span className="text-xs text-on-surface-variant font-mono">/ mes</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-on-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Todo lo de Gratuito, más:
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Hasta 200 diseños almacenados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Hasta 50 planchas DTF por mes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>25 GB de almacenamiento</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Hasta 10 miembros de equipo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Procesamiento prioritario en servidor</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <NeuButton
              variant="primary"
              size="md"
              active
              onClick={() => alert("El procesamiento de suscripciones comerciales en directo estará disponible próximamente.")}
              className="w-full justify-center shadow-glow-violet"
            >
              <span>{isAuthenticated ? "Solicitar Acceso Pro" : "Comenzar con Pro"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </NeuButton>
          </div>
        </GlassCard>

        {/* Plan 3: ESTUDIO / EMPRESA */}
        <GlassCard className="p-8 space-y-6 flex flex-col justify-between border border-white/10 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                Industrial
              </span>
              <Building2 className="w-5 h-5 text-on-surface-variant" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-on-surface">Estudio</h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Para grandes operaciones e imprentas con múltiples sucursales.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-extrabold text-on-surface">79€</span>
              <span className="text-xs text-on-surface-variant font-mono">/ mes</span>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-on-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Capacidad Industrial:
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 5,000 diseños almacenados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 1,000 planchas DTF por mes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>200 GB de almacenamiento dedicado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                <span>Hasta 50 miembros y 10 espacios</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <NeuButton
              variant="glass"
              size="md"
              onClick={() => alert("El procesamiento de suscripciones comerciales en directo estará disponible próximamente.")}
              className="w-full justify-center"
            >
              <span>Contactar Ventas</span>
            </NeuButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
