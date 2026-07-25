import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side authorization check for Platform Admin privileges.
 * Strictly queries public.platform_admins table.
 * Never infers platform admin permissions from workspace_members.
 */
export async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId?: string
): Promise<boolean> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      targetUserId = user?.id;
    }

    if (!targetUserId) return false;

    const { data, error } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side guard requiring explicit Platform Admin privileges.
 * Throws an error if unauthorized.
 */
export async function requirePlatformAdmin(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado. Acceso denegado.");
  }

  const isAdmin = await isPlatformAdmin(supabase, user.id);
  if (!isAdmin) {
    throw new Error("Acceso denegado: Se requieren permisos de administrador de plataforma.");
  }

  return user.id;
}
