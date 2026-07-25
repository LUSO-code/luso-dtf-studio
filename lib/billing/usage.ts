import { SupabaseClient } from "@supabase/supabase-js";
import {
  WorkspaceUsage,
  SubscriptionPlan,
  WorkspaceSubscription,
  UsageMetricPercentage,
  PlanLimits,
} from "./types";

// Default FREE Plan Fallback definition
export const DEFAULT_FREE_PLAN: SubscriptionPlan = {
  id: "free-fallback-id",
  name: "Gratuito",
  slug: "free",
  description: "Plan inicial esencial para talleres DTF y emprendedores",
  monthly_price: 0,
  yearly_price: 0,
  currency: "EUR",
  is_active: true,
  limits: {
    max_workspaces: 1,
    max_team_members: 2,
    max_designs: 15,
    max_print_sheets: 5,
    max_storage_mb: 1000,
    max_monthly_exports: 10,
    max_monthly_processing_jobs: 25,
  },
  features: {
    image_lab: true,
    background_removal: true,
    underbase: true,
    smart_nesting: true,
    print_sheet_export: true,
    dual_export: true,
    team_members: true,
    advanced_underbase: false,
    priority_processing: false,
    future_ai_tools: false,
  },
};

/**
 * Calculates current real-time resource consumption for a workspace.
 */
export async function getWorkspaceUsage(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<WorkspaceUsage> {
  const [{ count: designCount }, { count: printSheetCount }, { count: memberCount }] = await Promise.all([
    supabase.from("designs").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("print_sheets").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("workspace_members").select("*", { count: "exact", head: true }).eq("workspace_id", workspaceId),
  ]);

  // Estimate storage usage: ~2MB per design average or calculate exact if present
  const estimatedStorageBytes = (designCount || 0) * 2 * 1024 * 1024;

  return {
    designCount: designCount || 0,
    printSheetCount: printSheetCount || 0,
    storageBytes: estimatedStorageBytes,
    memberCount: memberCount || 0,
    exportCount: (printSheetCount || 0) * 2,
  };
}

/**
 * Resolves active subscription and plan for a workspace. Falls back to FREE plan if absent.
 */
export async function getWorkspaceSubscription(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<{ subscription: WorkspaceSubscription | null; plan: SubscriptionPlan }> {
  const { data: subData } = await supabase
    .from("workspace_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("workspace_id", workspaceId)
    .single();

  if (!subData || !subData.subscription_plans) {
    return {
      subscription: null,
      plan: DEFAULT_FREE_PLAN,
    };
  }

  const rawPlan = subData.subscription_plans;
  const plan: SubscriptionPlan = {
    id: rawPlan.id,
    name: rawPlan.name,
    slug: rawPlan.slug,
    description: rawPlan.description,
    monthly_price: Number(rawPlan.monthly_price || 0),
    yearly_price: Number(rawPlan.yearly_price || 0),
    currency: rawPlan.currency || "EUR",
    is_active: rawPlan.is_active ?? true,
    limits: {
      max_workspaces: rawPlan.max_workspaces || 1,
      max_team_members: rawPlan.max_team_members || 2,
      max_designs: rawPlan.max_designs || 15,
      max_print_sheets: rawPlan.max_print_sheets || 5,
      max_storage_mb: rawPlan.max_storage_mb || 1000,
      max_monthly_exports: rawPlan.max_monthly_exports || 10,
      max_monthly_processing_jobs: rawPlan.max_monthly_processing_jobs || 25,
    },
    features: {
      image_lab: rawPlan.features?.image_lab ?? true,
      background_removal: rawPlan.features?.background_removal ?? true,
      underbase: rawPlan.features?.underbase ?? true,
      smart_nesting: rawPlan.features?.smart_nesting ?? true,
      print_sheet_export: rawPlan.features?.print_sheet_export ?? true,
      dual_export: rawPlan.features?.dual_export ?? true,
      team_members: rawPlan.features?.team_members ?? true,
      advanced_underbase: rawPlan.features?.advanced_underbase ?? false,
      priority_processing: rawPlan.features?.priority_processing ?? false,
      future_ai_tools: rawPlan.features?.future_ai_tools ?? false,
    },
  };

  const subscription: WorkspaceSubscription = {
    id: subData.id,
    workspace_id: subData.workspace_id,
    plan_id: subData.plan_id,
    status: subData.status,
    trial_started_at: subData.trial_started_at,
    trial_ends_at: subData.trial_ends_at,
    trial_status: subData.trial_status || "none",
    current_period_start: subData.current_period_start,
    current_period_end: subData.current_period_end,
    plan,
  };

  return { subscription, plan };
}

/**
 * Calculates metric percentage utilization.
 */
export function getWorkspaceUsagePercentage(
  usage: WorkspaceUsage,
  limits: PlanLimits
): UsageMetricPercentage {
  return {
    designsPct: limits.max_designs > 0 ? Math.min(100, Math.round((usage.designCount / limits.max_designs) * 100)) : 0,
    sheetsPct: limits.max_print_sheets > 0 ? Math.min(100, Math.round((usage.printSheetCount / limits.max_print_sheets) * 100)) : 0,
    storagePct: limits.max_storage_mb > 0 ? Math.min(100, Math.round(((usage.storageBytes / (1024 * 1024)) / limits.max_storage_mb) * 100)) : 0,
    membersPct: limits.max_team_members > 0 ? Math.min(100, Math.round((usage.memberCount / limits.max_team_members) * 100)) : 0,
    exportsPct: limits.max_monthly_exports > 0 ? Math.min(100, Math.round((usage.exportCount / limits.max_monthly_exports) * 100)) : 0,
  };
}

/**
 * Server-side Limit Guards
 */
export async function canCreateDesign(supabase: SupabaseClient, workspaceId: string): Promise<boolean> {
  const [usage, { plan }] = await Promise.all([
    getWorkspaceUsage(supabase, workspaceId),
    getWorkspaceSubscription(supabase, workspaceId),
  ]);
  return usage.designCount < plan.limits.max_designs;
}

export async function canCreatePrintSheet(supabase: SupabaseClient, workspaceId: string): Promise<boolean> {
  const [usage, { plan }] = await Promise.all([
    getWorkspaceUsage(supabase, workspaceId),
    getWorkspaceSubscription(supabase, workspaceId),
  ]);
  return usage.printSheetCount < plan.limits.max_print_sheets;
}

export async function canAddMember(supabase: SupabaseClient, workspaceId: string): Promise<boolean> {
  const [usage, { plan }] = await Promise.all([
    getWorkspaceUsage(supabase, workspaceId),
    getWorkspaceSubscription(supabase, workspaceId),
  ]);
  return usage.memberCount < plan.limits.max_team_members;
}
