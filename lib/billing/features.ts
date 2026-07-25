import { SupabaseClient } from "@supabase/supabase-js";
import { FeatureKey } from "./types";
import { getWorkspaceSubscription } from "./usage";

/**
 * Server-side Feature Gating Resolver.
 * Validates active workspace, subscription plan features, and subscription lifecycle status.
 */
export async function hasFeatureAccess(
  supabase: SupabaseClient,
  workspaceId: string,
  featureKey: FeatureKey
): Promise<{ allowed: boolean; reason?: string }> {
  const { subscription, plan } = await getWorkspaceSubscription(supabase, workspaceId);

  // Check if feature flag is enabled on the active plan
  const isFeatureEnabledOnPlan = plan.features[featureKey] ?? false;
  if (!isFeatureEnabledOnPlan) {
    return {
      allowed: false,
      reason: `La función "${featureKey}" no está incluida en tu plan actual (${plan.name}).`,
    };
  }

  // If subscription exists, check if active or trialing
  if (subscription) {
    const isDegradedState = ["past_due", "canceled", "incomplete_expired"].includes(subscription.status);
    if (isDegradedState) {
      // Basic feature access allowed in degraded state for viewing existing assets; premium feature creation restricted
      if (["advanced_underbase", "priority_processing", "future_ai_tools"].includes(featureKey)) {
        return {
          allowed: false,
          reason: "Tu suscripción ha caducado o está inactiva. Renueva tu plan para acceder a herramientas avanzadas.",
        };
      }
    }
  }

  return { allowed: true };
}
