export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type TrialStatus = "none" | "active" | "expired" | "converted";

export type FeatureKey =
  | "image_lab"
  | "background_removal"
  | "underbase"
  | "smart_nesting"
  | "print_sheet_export"
  | "dual_export"
  | "team_members"
  | "advanced_underbase"
  | "priority_processing"
  | "future_ai_tools";

export interface PlanLimits {
  max_workspaces: number;
  max_team_members: number;
  max_designs: number;
  max_print_sheets: number;
  max_storage_mb: number;
  max_monthly_exports: number;
  max_monthly_processing_jobs: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  is_active: boolean;
  limits: PlanLimits;
  features: Record<FeatureKey, boolean>;
}

export interface WorkspaceSubscription {
  id: string;
  workspace_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  trial_status: TrialStatus;
  current_period_start: string;
  current_period_end: string;
  plan: SubscriptionPlan;
}

export interface WorkspaceUsage {
  designCount: number;
  printSheetCount: number;
  storageBytes: number;
  memberCount: number;
  exportCount: number;
}

export interface UsageMetricPercentage {
  designsPct: number;
  sheetsPct: number;
  storagePct: number;
  membersPct: number;
  exportsPct: number;
}
