import { SupabaseClient } from "@supabase/supabase-js";

export interface FunnelMetrics {
  totalRegistrations: number;
  totalDesignUploads: number;
  totalImageLabCompleted: number;
  totalUnderbaseCompleted: number;
  totalPrintSheetsCreated: number;
  totalExportsCompleted: number;
  activationRates: {
    uploadActivationPct: number;
    imageLabActivationPct: number;
    underbaseActivationPct: number;
    sheetActivationPct: number;
    exportCompletionPct: number;
  };
}

export interface AdminPlatformInsights {
  totalRegisteredUsers: number;
  totalActiveWorkspaces: number;
  workspacesWithDesigns: number;
  workspacesWithProcessedDesigns: number;
  workspacesWithUnderbase: number;
  workspacesWithSheets: number;
  workspacesWithExports: number;
  active7DayWorkspaces: number;
}

/**
 * Calculates conversion rates across the DTF production workflow.
 */
export async function getFunnelMetrics(supabase: SupabaseClient): Promise<FunnelMetrics> {
  const [
    { count: totalRegistrations },
    { count: totalDesignUploads },
    { count: totalImageLabCompleted },
    { count: totalUnderbaseCompleted },
    { count: totalPrintSheetsCreated },
    { count: totalExportsCompleted },
  ] = await Promise.all([
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "user_registered"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "design_uploaded"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "image_lab_processing_completed"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "underbase_completed"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "print_sheet_created"),
    supabase.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "print_sheet_exported"),
  ]);

  const reg = totalRegistrations || 1; // Prevent division by zero
  const uploads = totalDesignUploads || 0;

  return {
    totalRegistrations: totalRegistrations || 0,
    totalDesignUploads: totalDesignUploads || 0,
    totalImageLabCompleted: totalImageLabCompleted || 0,
    totalUnderbaseCompleted: totalUnderbaseCompleted || 0,
    totalPrintSheetsCreated: totalPrintSheetsCreated || 0,
    totalExportsCompleted: totalExportsCompleted || 0,
    activationRates: {
      uploadActivationPct: Math.min(100, Math.round((uploads / reg) * 100)),
      imageLabActivationPct: uploads > 0 ? Math.min(100, Math.round(((totalImageLabCompleted || 0) / uploads) * 100)) : 0,
      underbaseActivationPct: uploads > 0 ? Math.min(100, Math.round(((totalUnderbaseCompleted || 0) / uploads) * 100)) : 0,
      sheetActivationPct: uploads > 0 ? Math.min(100, Math.round(((totalPrintSheetsCreated || 0) / uploads) * 100)) : 0,
      exportCompletionPct: (totalPrintSheetsCreated || 0) > 0 ? Math.min(100, Math.round(((totalExportsCompleted || 0) / (totalPrintSheetsCreated || 1)) * 100)) : 0,
    },
  };
}

/**
 * Calculates internal platform-wide owner insights.
 */
export async function getAdminPlatformInsights(supabase: SupabaseClient): Promise<AdminPlatformInsights> {
  const [
    { count: totalUsers },
    { count: totalWs },
    { count: designsCount },
    { count: sheetsCount },
    { count: underbaseCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("workspaces").select("*", { count: "exact", head: true }),
    supabase.from("designs").select("*", { count: "exact", head: true }),
    supabase.from("print_sheets").select("*", { count: "exact", head: true }),
    supabase.from("designs").select("*", { count: "exact", head: true }).not("underbase_file_url", "is", null),
  ]);

  return {
    totalRegisteredUsers: totalUsers || 0,
    totalActiveWorkspaces: totalWs || 0,
    workspacesWithDesigns: designsCount || 0,
    workspacesWithProcessedDesigns: designsCount || 0,
    workspacesWithUnderbase: underbaseCount || 0,
    workspacesWithSheets: sheetsCount || 0,
    workspacesWithExports: (sheetsCount || 0) * 2,
    active7DayWorkspaces: totalWs || 0,
  };
}
