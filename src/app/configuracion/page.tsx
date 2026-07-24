import { redirect } from "next/navigation";
import { createClient } from "@lib/supabase/server";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Settings, User, Layers, Sliders, Cpu, Save } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name)")
    .eq("user_id", user.id)
    .single();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Operador DTF";
  const workspaceName = (member?.workspaces as any)?.name || "Mi espacio";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Configuración
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Ajustes de perfil, preferencias de maquetación y espacio de trabajo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Perfil de Usuario */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <User className="w-4 h-4 text-primary" />
            <span>Perfil</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface-variant uppercase tracking-wider">
                Nombre de Mostrar:
              </label>
              <input
                type="text"
                defaultValue={displayName}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface-variant uppercase tracking-wider">
                Correo Electrónico:
              </label>
              <input
                type="email"
                readOnly
                value={user.email}
                className="w-full neu-pressed bg-surface-container-lowest/50 text-on-surface-variant text-xs rounded-xl px-3.5 py-2.5 border border-white/5 cursor-not-allowed"
              />
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Espacio de Trabajo */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Layers className="w-4 h-4 text-secondary" />
            <span>Espacio de Trabajo</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface-variant uppercase tracking-wider">
                Nombre del Espacio:
              </label>
              <input
                type="text"
                defaultValue={workspaceName}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div className="p-3 rounded-xl neu-pressed bg-surface-container/60 space-y-1">
              <span className="text-on-surface-variant">Aislamiento de Datos:</span>
              <p className="font-semibold text-secondary">Aislado mediante Políticas de RLS en PostgreSQL</p>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: Preferencias de Maquetación */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Preferencias de Impresión</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Unidad de Medida por Defecto:</span>
              <span className="font-semibold text-on-surface">Milímetros (mm)</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Resolución de Plancha Target:</span>
              <span className="font-semibold text-secondary">300 DPI</span>
            </div>
          </div>
        </GlassCard>

        {/* Section 4: Visuales y Rendimiento */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
            <Cpu className="w-4 h-4 text-secondary" />
            <span>Rendimiento Gráfico</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Motor de Fondo:</span>
              <span className="font-semibold text-secondary">Híbrido Adaptativo (WebGL + CSS)</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl neu-pressed bg-surface-container/60">
              <span className="text-on-surface-variant">Pausa en Pestaña Inactiva:</span>
              <span className="font-semibold text-primary">Activado (Visibility API)</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
