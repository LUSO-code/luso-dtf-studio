"use client";

import { useState } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { generateInvitationToken, hashInvitationToken, getInvitationExpiration } from "@lib/auth/invitations";
import { WorkspaceRole } from "@lib/auth/rbac";
import { UserPlus, X, Copy, CheckCircle2, AlertTriangle } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function InviteMemberModal({ isOpen, onClose, workspaceId }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCreateInvitation() {
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado.");

      const rawToken = generateInvitationToken();
      const tokenHash = hashInvitationToken(rawToken);
      const expiresAt = getInvitationExpiration(7).toISOString();

      const { error: errInsert } = await supabase.from("workspace_invitations").insert({
        workspace_id: workspaceId,
        email: email.trim().toLowerCase(),
        role,
        token_hash: tokenHash,
        invited_by: user.id,
        expires_at: expiresAt,
      });

      if (errInsert) throw new Error(errInsert.message);

      const inviteUrl = `${window.location.origin}/invitacion/aceptar?token=${rawToken}`;
      setCreatedInviteUrl(inviteUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al crear la invitación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopyUrl() {
    if (!createdInviteUrl) return;
    navigator.clipboard.writeText(createdInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-md p-6 space-y-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg font-bold text-on-surface">
              Invitar Miembro al Equipo
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!createdInviteUrl ? (
          /* Form View */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="operador@tallerdtf.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Rol en el Espacio
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="admin">Administrador (Gestión de miembros y producción)</option>
                <option value="member">Miembro (Crear y exportar diseños/planchas)</option>
                <option value="viewer">Lector (Solo lectura de planchas)</option>
              </select>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <NeuButton variant="glass" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </NeuButton>

              <NeuButton
                variant="secondary"
                size="md"
                active
                onClick={handleCreateInvitation}
                disabled={isSubmitting}
                className="shadow-glow-cyan"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? "Generando..." : "Generar Invitación"}</span>
              </NeuButton>
            </div>
          </div>
        ) : (
          /* Generated Invite URL View */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">¡Invitación generada con éxito!</span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Copia y envía este enlace seguro al usuario para que se una a tu equipo:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={createdInviteUrl}
                className="w-full font-mono text-[11px] neu-pressed bg-surface-container-lowest text-on-surface rounded-xl px-3 py-2 border border-white/5 select-all"
              />
              <NeuButton variant="secondary" size="md" active onClick={handleCopyUrl} className="shrink-0">
                <Copy className="w-4 h-4" />
                <span>{copied ? "¡Copiado!" : "Copiar"}</span>
              </NeuButton>
            </div>

            <div className="flex items-center justify-end border-t border-white/10 pt-4">
              <NeuButton variant="glass" size="md" onClick={onClose}>
                Cerrar
              </NeuButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
