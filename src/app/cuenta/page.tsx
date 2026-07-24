import { redirect } from "next/navigation";
import { createClient } from "@lib/supabase/server";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { signoutAction } from "@app/auth/actions";
import { User, Shield, Mail, Calendar, LogOut, Layers } from "lucide-react";

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, created_at")
    .eq("user_id", user.id)
    .single();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(name, created_at)")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Operador DTF";
  const workspaceName = (member?.workspaces as any)?.name || "Mi espacio";
  const userRole = member?.role || "owner";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Cuenta de Usuario
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Información personal, sesión y espacio de trabajo activo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <GlassCard glow="violet" className="lg:col-span-2 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-glow-violet">
                <div className="w-full h-full bg-surface-container-high rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-on-surface" />
                </div>
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-on-surface">{displayName}</h3>
                <p className="text-xs text-on-surface-variant">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                    Rol: {userRole}
                  </span>
                </div>
              </div>
            </div>

            <form action={signoutAction}>
              <NeuButton variant="glass" size="sm" className="text-error border-error/20 hover:bg-error/10">
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </NeuButton>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl neu-pressed bg-surface-container/60 space-y-1">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Mail className="w-4 h-4 text-primary" />
                <span>Correo de Cuenta:</span>
              </div>
              <p className="font-semibold text-on-surface font-mono">{user.email}</p>
            </div>

            <div className="p-3.5 rounded-xl neu-pressed bg-surface-container/60 space-y-1">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>Miembro Desde:</span>
              </div>
              <p className="font-semibold text-on-surface">
                {new Date(user.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Workspace Card */}
        <GlassCard glow="cyan" className="p-6 space-y-4">
          <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Layers className="w-5 h-5 text-secondary" />
            <span>Espacio de Trabajo</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl neu-pressed bg-surface-container/60 space-y-1">
              <span className="text-on-surface-variant">Nombre del Espacio:</span>
              <p className="font-bold text-sm text-secondary">{workspaceName}</p>
            </div>

            <div className="p-3.5 rounded-xl neu-pressed bg-surface-container/60 space-y-1">
              <span className="text-on-surface-variant">Seguridad de Datos:</span>
              <p className="font-semibold text-primary">Row Level Security (RLS) Activo</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
