"use client";

import { useActionState } from "react";
import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { resetPasswordAction } from "@app/auth/actions";
import { Mail, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RecuperarContrasenaPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <GlassCard glow="violet" className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center mx-auto text-primary shadow-glow-violet">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface tracking-tight">
            Recuperar Contraseña
          </h1>
          <p className="text-xs text-on-surface-variant">
            Ingresa tu correo registrado para recibir las instrucciones de restablecimiento
          </p>
        </div>

        {/* Success Alert */}
        {state?.success && (
          <div className="neu-pressed bg-secondary-dark/30 border border-secondary/40 text-secondary p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span>Correo Enviado</span>
            </div>
            <p className="leading-relaxed">{state.message}</p>
          </div>
        )}

        {/* Error Alert */}
        {state?.error && (
          <div className="neu-pressed bg-error-container/30 border border-error/30 text-error p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            <span>{state.error}</span>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="operador@lusodtf.com"
                  className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary border border-white/5"
                />
              </div>
            </div>

            <NeuButton
              type="submit"
              variant="primary"
              size="lg"
              active
              disabled={isPending}
              className="w-full py-3 mt-2 shadow-glow-violet justify-center"
            >
              <span>{isPending ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}</span>
            </NeuButton>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Iniciar Sesión</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
