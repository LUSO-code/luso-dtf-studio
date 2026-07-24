"use client";

import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Lock, Sparkles, UserPlus, LogIn, X } from "lucide-react";

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  actionTitle?: string;
}

export function AuthGateModal({
  isOpen,
  onClose,
  redirectTo = "/herramientas/image-lab",
  actionTitle = "para guardar y procesar tus diseños",
}: AuthGateModalProps) {
  if (!isOpen) return null;

  const loginUrl = `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
  const registerUrl = `/registro?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-md p-6 sm:p-8 space-y-6 relative border border-secondary/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Seguir explorando"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-secondary to-primary-dark p-[1px] shadow-glow-cyan mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-secondary" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[11px] font-semibold text-secondary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acceso Gratuito Requerido</span>
          </div>

          <h2 className="font-display text-xl font-extrabold text-on-surface tracking-tight">
            Continúa con <span className="text-secondary">LUSO DTF STUDIO</span>
          </h2>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Para continuar {actionTitle} necesitas una cuenta gratuita. ¡Toma menos de 1 minuto!
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <Link href={registerUrl} className="block w-full">
            <NeuButton variant="secondary" size="lg" active className="w-full justify-center shadow-glow-cyan">
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta Gratis</span>
            </NeuButton>
          </Link>

          <Link href={loginUrl} className="block w-full">
            <NeuButton variant="glass" size="lg" className="w-full justify-center">
              <LogIn className="w-4 h-4 text-primary" />
              <span>Ya tengo una cuenta</span>
            </NeuButton>
          </Link>
        </div>

        {/* Dismiss Footer */}
        <div className="text-center pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-medium"
          >
            Seguir explorando sin iniciar sesión
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
