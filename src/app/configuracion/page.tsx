"use client";

import { useState, useEffect } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { InviteMemberModal } from "@components/workspace/InviteMemberModal";
import { PlanUsageDashboard } from "@components/billing/PlanUsageDashboard";
import { hasPermission, WorkspaceRole } from "@lib/auth/rbac";
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Mail,
} from "lucide-react";

export default function ConfiguracionPage() {
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  // Workspace Settings
  const [workspaceName, setWorkspaceName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkspaceData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      setCurrentUserId(user.id);

      const activeId = localStorage.getItem("luso_active_workspace_id");

      let memberRecord: any = null;
      if (activeId) {
        const { data: mem } = await supabase
          .from("workspace_members")
          .select("workspace_id, role, workspaces(*)")
          .eq("user_id", user.id)
          .eq("workspace_id", activeId)
          .single();
        memberRecord = mem;
      }

      if (!memberRecord) {
        const { data: firstMem } = await supabase
          .from("workspace_members")
          .select("workspace_id, role, workspaces(*)")
          .eq("user_id", user.id)
          .single();
        memberRecord = firstMem;
      }

      if (memberRecord?.workspaces) {
        const ws = memberRecord.workspaces;
        setWorkspace(ws);
        setWorkspaceName(ws.name);
        setUserRole(memberRecord.role as WorkspaceRole);

        // Fetch team members
        const { data: memberList } = await supabase
          .from("workspace_members")
          .select("id, role, user_id, created_at, profiles!user_id(display_name)")
          .eq("workspace_id", ws.id);

        if (memberList) setMembers(memberList);

        // Fetch invitations
        const { data: inviteList } = await supabase
          .from("workspace_invitations")
          .select("id, email, role, created_at, expires_at, accepted_at")
          .eq("workspace_id", ws.id)
          .is("accepted_at", null);

        if (inviteList) setInvitations(inviteList);
      }
    }

    loadWorkspaceData();
  }, []);

  // Update Workspace Name
  async function handleUpdateName() {
    if (!workspace || !workspaceName.trim()) return;
    setIsUpdatingName(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name: workspaceName.trim() })
        .eq("id", workspace.id);

      if (error) throw new Error(error.message);
      setStatusMessage("¡Nombre del espacio de trabajo actualizado!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al actualizar el nombre.");
    } finally {
      setIsUpdatingName(false);
    }
  }

  // Change Member Role
  async function handleChangeRole(memberId: string, newRole: WorkspaceRole) {
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw new Error(error.message);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      setStatusMessage("Rol de miembro actualizado correctamente.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al actualizar el rol.");
    }
  }

  // Remove Member
  async function handleRemoveMember(memberId: string) {
    if (!confirm("¿Estás seguro de eliminar este miembro del equipo?")) return;
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);
      if (error) throw new Error(error.message);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setStatusMessage("Miembro eliminado del equipo.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al eliminar miembro.");
    }
  }

  // Revoke Invitation
  async function handleRevokeInvitation(inviteId: string) {
    try {
      const supabase = createClient();
      await supabase.from("workspace_invitations").delete().eq("id", inviteId);
      setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch {}
  }

  const canManageMembers = hasPermission(userRole, "members.invite");
  const canUpdateWorkspace = hasPermission(userRole, "workspace.update");

  return (
    <div className="space-y-6 max-w-5xl">
      {workspace && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          workspaceId={workspace.id}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Configuración del Espacio de Trabajo
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant">
          Gestiona tu plan comercial, consumo de recursos, equipo y preferencias de producción.
        </p>
      </div>

      {/* Status & Error Alerts */}
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

      {/* Resource Usage & SaaS Plan Dashboard */}
      {workspace && <PlanUsageDashboard workspaceId={workspace.id} />}

      {/* General Settings Card */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
          <Building2 className="w-4 h-4 text-secondary" />
          <span>Información General del Espacio</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Nombre del Espacio
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={!canUpdateWorkspace}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-4 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60"
              />
              {canUpdateWorkspace && (
                <NeuButton
                  variant="secondary"
                  size="md"
                  active
                  onClick={handleUpdateName}
                  disabled={isUpdatingName}
                >
                  <span>{isUpdatingName ? "Guardando..." : "Guardar"}</span>
                </NeuButton>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Identificador (Slug)
            </label>
            <input
              type="text"
              readOnly
              value={workspace?.slug || ""}
              className="w-full neu-pressed bg-surface-container-lowest text-on-surface-variant font-mono text-xs rounded-xl px-4 py-2.5 border border-white/5 select-all"
            />
          </div>
        </div>
      </GlassCard>

      {/* Production Defaults Card */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-on-surface flex items-center gap-2 border-b border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-primary" />
          <span>Preferencias Predeterminadas de Producción</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
            <span className="text-on-surface-variant text-[11px]">Resolución (DPI):</span>
            <p className="font-mono font-bold text-secondary text-sm">300 DPI</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
            <span className="text-on-surface-variant text-[11px]">Ancho de Rollo:</span>
            <p className="font-mono font-bold text-on-surface text-sm">58.0 cm</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
            <span className="text-on-surface-variant text-[11px]">Contracción (Choke):</span>
            <p className="font-mono font-bold text-secondary text-sm">0.3 mm</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container/60 border border-white/5 space-y-1">
            <span className="text-on-surface-variant text-[11px]">Margen y Espaciado:</span>
            <p className="font-mono font-bold text-on-surface text-sm">0.5 cm</p>
          </div>
        </div>
      </GlassCard>

      {/* Team Members Card */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            <div>
              <h2 className="font-display text-base font-bold text-on-surface">
                Miembros del Equipo ({members.length})
              </h2>
              <p className="text-xs text-on-surface-variant">
                Usuarios con acceso a los diseños y planchas de este espacio.
              </p>
            </div>
          </div>

          {canManageMembers && (
            <NeuButton
              variant="secondary"
              size="md"
              active
              onClick={() => setIsInviteModalOpen(true)}
              className="shadow-glow-cyan"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invitar Miembro</span>
            </NeuButton>
          )}
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Usuario</th>
                <th className="pb-3 px-2">Rol</th>
                <th className="pb-3 px-2">Fecha</th>
                <th className="pb-3 px-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((m) => {
                const displayName = m.profiles?.display_name || "Operador DTF";
                const isMemberOwner = m.role === "owner";
                const isCurrent = m.user_id === currentUserId;

                return (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-medium text-on-surface flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-[11px] text-primary">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{displayName}</span>
                        {isCurrent && <span className="text-[10px] text-secondary ml-1 font-mono">(Tú)</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isMemberOwner
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "bg-surface-container-high text-on-surface-variant border-white/10"
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-on-surface-variant font-mono">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {canManageMembers && !isMemberOwner && !isCurrent ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={m.role}
                            onChange={(e) => handleChangeRole(m.id, e.target.value as WorkspaceRole)}
                            className="neu-pressed bg-surface-container-lowest text-on-surface text-[11px] rounded-lg px-2 py-1 border border-white/5"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Miembro</option>
                            <option value="viewer">Lector</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors"
                            title="Eliminar miembro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-on-surface-variant/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invitations Pending List */}
        {invitations.length > 0 && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-secondary" />
              <span>Invitaciones Pendientes ({invitations.length})</span>
            </h3>

            <div className="space-y-2">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-surface-container/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-on-surface">{inv.email}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      Rol: {inv.role} • Expira: {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>

                  {canManageMembers && (
                    <button
                      onClick={() => handleRevokeInvitation(inv.id)}
                      className="text-xs text-error hover:underline font-semibold"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
