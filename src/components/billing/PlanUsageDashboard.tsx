"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { getWorkspaceUsage, getWorkspaceSubscription, getWorkspaceUsagePercentage } from "@lib/billing/usage";
import { WorkspaceUsage, SubscriptionPlan, UsageMetricPercentage } from "@lib/billing/types";
import { Zap, HardDrive, Layers, Grid, Users, ArrowUpRight } from "lucide-react";

interface PlanUsageDashboardProps {
  workspaceId: string;
}

export function PlanUsageDashboard({ workspaceId }: PlanUsageDashboardProps) {
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [pct, setPct] = useState<UsageMetricPercentage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      const [u, { plan: p }] = await Promise.all([
        getWorkspaceUsage(supabase, workspaceId),
        getWorkspaceSubscription(supabase, workspaceId),
      ]);

      setUsage(u);
      setPlan(p);
      setPct(getWorkspaceUsagePercentage(u, p.limits));
      setIsLoading(false);
    }

    if (workspaceId) loadData();
  }, [workspaceId]);

  if (isLoading || !usage || !plan || !pct) {
    return <div className="p-4 text-xs text-on-surface-variant">Cargando consumo del plan...</div>;
  }

  function getBarColorClass(percentage: number) {
    if (percentage > 90) return "bg-error";
    if (percentage > 70) return "bg-warning";
    return "bg-secondary";
  }

  function getStatusLabel(percentage: number) {
    if (percentage > 100) return "SUPERADO";
    if (percentage >= 90) return "LÍMITE ALCANZADO";
    if (percentage >= 70) return "CERCA DEL LÍMITE";
    return "NORMAL";
  }

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg font-bold text-on-surface">
              Mi Plan y Consumo de Recursos
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant">
            Uso en tiempo real de tu espacio de trabajo en el plan <strong className="text-secondary font-display font-bold uppercase">{plan.name}</strong>.
          </p>
        </div>

        <Link href="/precios">
          <NeuButton variant="secondary" size="md" active className="shadow-glow-cyan">
            <span>Mejorar Plan</span>
            <ArrowUpRight className="w-4 h-4" />
          </NeuButton>
        </Link>
      </div>

      {/* Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Diseños */}
        <div className="p-4 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-on-surface">
              <Layers className="w-4 h-4 text-secondary" />
              <span>Diseños Almacenados</span>
            </div>
            <span className="font-mono font-bold text-on-surface">
              {usage.designCount} / {plan.limits.max_designs}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColorClass(pct.designsPct)}`}
              style={{ width: `${Math.min(100, pct.designsPct)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
            <span>Estado: {getStatusLabel(pct.designsPct)}</span>
            <span>{pct.designsPct}%</span>
          </div>
        </div>

        {/* Metric 2: Planchas */}
        <div className="p-4 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-on-surface">
              <Grid className="w-4 h-4 text-primary" />
              <span>Planchas Creadas</span>
            </div>
            <span className="font-mono font-bold text-on-surface">
              {usage.printSheetCount} / {plan.limits.max_print_sheets}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColorClass(pct.sheetsPct)}`}
              style={{ width: `${Math.min(100, pct.sheetsPct)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
            <span>Estado: {getStatusLabel(pct.sheetsPct)}</span>
            <span>{pct.sheetsPct}%</span>
          </div>
        </div>

        {/* Metric 3: Miembros de Equipo */}
        <div className="p-4 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-on-surface">
              <Users className="w-4 h-4 text-secondary" />
              <span>Miembros del Equipo</span>
            </div>
            <span className="font-mono font-bold text-on-surface">
              {usage.memberCount} / {plan.limits.max_team_members}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColorClass(pct.membersPct)}`}
              style={{ width: `${Math.min(100, pct.membersPct)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
            <span>Estado: {getStatusLabel(pct.membersPct)}</span>
            <span>{pct.membersPct}%</span>
          </div>
        </div>

        {/* Metric 4: Almacenamiento */}
        <div className="p-4 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-on-surface">
              <HardDrive className="w-4 h-4 text-primary" />
              <span>Almacenamiento (MB)</span>
            </div>
            <span className="font-mono font-bold text-on-surface">
              {Math.round(usage.storageBytes / (1024 * 1024))} / {plan.limits.max_storage_mb} MB
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColorClass(pct.storagePct)}`}
              style={{ width: `${Math.min(100, pct.storagePct)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
            <span>Estado: {getStatusLabel(pct.storagePct)}</span>
            <span>{pct.storagePct}%</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
