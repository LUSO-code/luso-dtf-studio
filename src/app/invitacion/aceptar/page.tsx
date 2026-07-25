"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { hashInvitationToken } from "@lib/auth/invitations";
import { UserCheck, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

function AceptarInvitacionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitationData, setInvitationData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkInvitationToken() {
      if (!tokenParam) {
        setErrorMessage("Token de invitación no válido o ausente.");
        setIsLoading(false);
        return;
      }

      try {
        const tokenHash = hashInvitationToken(tokenParam);
        const supabase = createClient();

        const { data: inv, error } = await supabase
          .from("workspace_invitations")
          .select("*, workspaces(id, name), profiles!invited_by(display_name)")
          .eq("token_hash", tokenHash)
          .single();

        if (error || !inv) {
          throw new Error("La invitación no existe o ha caducado.");
        }

        if (inv.accepted_at) {
          throw new Error("Esta invitación ya ha sido aceptada.");
        }

        if (new Date(inv.expires_at) < new Date()) {
          throw new Error("Esta invitación ha expirado.");
        }

        setInvitationData(inv);
      } catch (err: any) {
        setErrorMessage(err?.message || "Error al validar la invitación.");
      } finally {
        setIsLoading(false);
      }
    }

    checkInvitationToken();
  }, [tokenParam]);

  async function handleAcceptInvitation() {
    if (!tokenParam || !invitationData) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Auth Gate: Redirect to login with return path
        router.push(`/login?redirectTo=/invitacion/aceptar?token=${tokenParam}`);
        return;
      }

      const tokenHash = hashInvitationToken(tokenParam);

      // 1. Add user to workspace_members
      const { error: errMem } = await supabase.from("workspace_members").upsert({
        workspace_id: invitationData.workspace_id,
        user_id: user.id,
        role: invitationData.role,
      });

      if (errMem) throw new Error(errMem.message);

      // 2. Mark invitation as accepted
      await supabase
        .from("workspace_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("token_hash", tokenHash);

      // 3. Set active workspace and redirect
      localStorage.setItem("luso_active_workspace_id", invitationData.workspace_id);
      setSuccessMessage(`¡Te has unido con éxito a "${invitationData.workspaces?.name}"!`);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al unirse al espacio de trabajo.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <GlassCard glow="cyan" className="p-8 text-center space-y-6 border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
          <UserCheck className="w-8 h-8" />
        </div>

        {isLoading ? (
          <div className="text-xs text-on-surface-variant">Validando invitación de equipo...</div>
        ) : errorMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <NeuButton variant="glass" size="md" onClick={() => router.push("/")} className="w-full justify-center">
              <span>Volver al Inicio</span>
            </NeuButton>
          </div>
        ) : successMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary-dark/30 border border-secondary/40 text-secondary text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <p className="text-xs text-on-surface-variant">Redirigiendo a tu espacio de trabajo...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                Invitación de Equipo
              </span>
              <h1 className="font-display text-xl font-bold text-on-surface">
                Unirse a "{invitationData.workspaces?.name}"
              </h1>
              <p className="text-xs text-on-surface-variant">
                Has sido invitado por <strong className="text-on-surface">{invitationData.profiles?.display_name || "un administrador"}</strong> con el rol de <strong className="text-secondary uppercase">{invitationData.role}</strong>.
              </p>
            </div>

            <NeuButton
              variant="secondary"
              size="lg"
              active
              onClick={handleAcceptInvitation}
              disabled={isProcessing}
              className="w-full justify-center shadow-glow-cyan"
            >
              <span>{isProcessing ? "Procesando..." : "Aceptar Invitación y Unirse"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </NeuButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function AceptarInvitacionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-on-surface-variant">Cargando invitación...</div>}>
      <AceptarInvitacionContent />
    </Suspense>
  );
}
