"use client";

import { useState, useEffect } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { signoutAction } from "@app/auth/actions";
import { User, KeyRound, ShieldCheck, CheckCircle2, AlertTriangle, LogOut, Building2 } from "lucide-react";

export default function CuentaPage() {
  const [user, setUser] = useState<any | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [activeWorkspaceName, setActiveWorkspaceName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser(authUser);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", authUser.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          setDisplayName(authUser.email?.split("@")[0] || "");
        }

        const activeId = localStorage.getItem("luso_active_workspace_id");
        if (activeId) {
          const { data: ws } = await supabase.from("workspaces").select("name").eq("id", activeId).single();
          if (ws?.name) setActiveWorkspaceName(ws.name);
        }
      }
    }

    loadUserData();
  }, []);

  async function handleUpdateProfile() {
    if (!user || !displayName.trim()) return;
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, display_name: displayName.trim() });

      if (error) throw new Error(error.message);
      setStatusMessage("¡Nombre de usuario actualizado con éxito!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al actualizar perfil.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Mi Cuenta de Usuario
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Gestiona tu perfil personal, credenciales de seguridad e información de inicio de sesión.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-secondary-dark/30 border border-secondary/40 text-secondary text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* User Profile Card */}
      <GlassCard className="p-6 space-y-6">
        <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
          <User className="w-4 h-4 text-secondary" />
          <span>Información de Perfil</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Nombre de Usuario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
              <NeuButton
                variant="secondary"
                size="md"
                active
                onClick={handleUpdateProfile}
                disabled={isUpdating}
              >
                <span>{isUpdating ? "Guardando..." : "Guardar"}</span>
              </NeuButton>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || ""}
              className="w-full neu-pressed bg-surface-container-lowest text-on-surface-variant font-mono text-xs rounded-xl px-4 py-2.5 border border-white/5 select-all"
            />
          </div>

          {activeWorkspaceName && (
            <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-on-surface">
                <Building2 className="w-4 h-4 text-secondary" />
                <span>Espacio de Trabajo Activo:</span>
              </div>
              <span className="font-bold text-secondary font-mono">{activeWorkspaceName}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Security & Sessions Card */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Seguridad y Sesiones</span>
        </h2>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          Tu sesión está protegida mediante Supabase SSR Authentication y tokens cifrados.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <span className="text-[11px] text-on-surface-variant/70 italic">
            Gestión avanzada de múltiples sesiones activas próximamente.
          </span>

          <form action={signoutAction}>
            <NeuButton variant="glass" size="md" type="submit">
              <LogOut className="w-4 h-4 text-error" />
              <span>Cerrar Sesión</span>
            </NeuButton>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
