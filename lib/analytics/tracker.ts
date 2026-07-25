import { SupabaseClient } from "@supabase/supabase-js";

export type AnalyticsEventName =
  | "user_registered"
  | "user_logged_in"
  | "workspace_created"
  | "design_uploaded"
  | "image_lab_processing_started"
  | "image_lab_processing_completed"
  | "design_saved"
  | "underbase_started"
  | "underbase_completed"
  | "print_sheet_created"
  | "print_sheet_exported"
  | "pricing_page_viewed"
  | "upgrade_modal_viewed"
  | "upgrade_cta_clicked"
  | "billing_limit_reached"
  | "workflow_completed";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "token_hash",
  "original_file_url",
  "processed_file_url",
  "underbase_file_url",
  "raw_blob",
  "secret",
];

/**
 * Sanitizes metadata objects to prevent logging sensitive URLs or secrets.
 */
export function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {};
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(metadata)) {
    const isSensitive = SENSITIVE_KEYS.some(
      (s) => key.toLowerCase() === s || key.toLowerCase() === `${s}_id`
    );

    if (isSensitive) {
      continue; // Skip sensitive field
    }

    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizeMetadata(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Logs a privacy-conscious analytics event to Supabase.
 */
export async function trackEvent(
  supabase: SupabaseClient,
  eventName: AnalyticsEventName,
  metadata?: Record<string, any>,
  workspaceId?: string,
  userId?: string
): Promise<boolean> {
  try {
    const cleanMeta = sanitizeMetadata(metadata);

    let finalUserId = userId;
    if (!finalUserId) {
      const { data } = await supabase.auth.getUser();
      finalUserId = data.user?.id;
    }

    const { error } = await supabase.from("analytics_events").insert({
      workspace_id: workspaceId || null,
      user_id: finalUserId || null,
      event_name: eventName,
      metadata: cleanMeta,
    });

    if (error) {
      console.warn(`[Analytics Tracker] Warning logging ${eventName}:`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[Analytics Tracker] Exception logging ${eventName}:`, err);
    return false;
  }
}
