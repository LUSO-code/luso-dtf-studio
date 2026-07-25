"use client";

import { useState, useEffect } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { getFunnelMetrics, getAdminPlatformInsights, FunnelMetrics, AdminPlatformInsights } from "@lib/analytics/funnel";
import { Activity, Users, Building2, Layers, Grid, Download, ShieldCheck, RefreshCw } from "lucide-react";

export default function AdminInsightsPage() {
  const [funnel, setFunnel] = useState<FunnelMetrics | null>(null);
  const [insights, setInsights] = useState<AdminPlatformInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    async function loadPlatformData() {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check if owner has owner membership in any workspace
      const { data: member } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .limit(1);

      if (!member || member.length === 0) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);

      const [f, ins] = await Promise.all([
        getFunnelMetrics(supabase),
        getAdminPlatformInsights(supabase),
      ]);

      setFunnel(f);
      setInsights(ins);
      setIsLoading(false);
    }

    loadPlatformData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-xs text-on-surface-variant">Cargando métricas de plataforma...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <GlassCard className="p-6 text-center space-y-4">
          <ShieldCheck className="w-8 h-8 text-error mx-auto" />
          <h2 className="font-display text-lg font-bold text-on-surface">Acceso Restringido</h2>
          <p className="text-xs text-on-surface-variant">
            Esta sección de análisis de plataforma requiere permisos de propietario.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-xs font-semibold text-primary mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Métricas de Plataforma & Funnel Beta</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Métricas de Producto LUSO DTF STUDIO
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Resumen global de activación, retención y producción de espacios de trabajo.
          </p>
        </div>

        <NeuButton variant="glass" size="md" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </NeuButton>
      </div>

      {/* Primary KPI Grid */}
      {insights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Usuarios Registrados</span>
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <p className="font-display text-2xl font-extrabold text-on-surface">{insights.totalRegisteredUsers}</p>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Espacios Activos</span>
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <p className="font-display text-2xl font-extrabold text-on-surface">{insights.totalActiveWorkspaces}</p>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Diseños Creados</span>
              <Layers className="w-4 h-4 text-secondary" />
            </div>
            <p className="font-display text-2xl font-extrabold text-on-surface">{insights.workspacesWithDesigns}</p>
          </GlassCard>

          <GlassCard className="p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Planchas Creadas</span>
              <Grid className="w-4 h-4 text-primary" />
            </div>
            <p className="font-display text-2xl font-extrabold text-on-surface">{insights.workspacesWithSheets}</p>
          </GlassCard>
        </div>
      )}

      {/* Funnel Activation Metrics */}
      {funnel && (
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Activity className="w-4 h-4 text-secondary" />
            <span>Tasa de Activación del Embudo de Producción</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
              <span className="text-on-surface-variant text-[11px]">Activación de Carga (Subida de Imagen):</span>
              <p className="font-mono font-bold text-secondary text-lg">{funnel.activationRates.uploadActivationPct}%</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
              <span className="text-on-surface-variant text-[11px]">Activación Image Lab:</span>
              <p className="font-mono font-bold text-primary text-lg">{funnel.activationRates.imageLabActivationPct}%</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
              <span className="text-on-surface-variant text-[11px]">Completado de Exportación:</span>
              <p className="font-mono font-bold text-secondary text-lg">{funnel.activationRates.exportCompletionPct}%</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
