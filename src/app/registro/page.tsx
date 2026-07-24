"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { signupAction } from "@app/auth/actions";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <GlassCard glow="cyan" className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary via-primary to-primary-dark p-[1px] shadow-glow-cyan mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-2xl flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface tracking-tight">
            Crear Cuenta en <span className="text-secondary font-medium">LUSO DTF</span>
          </h1>
          <p className="text-xs text-on-surface-variant">
            Registra tu usuario para comenzar a maquetar tus planchas de impresión
          </p>
        </div>

        {/* Success Confirmation Alert */}
        {state?.success && (
          <div className="neu-pressed bg-secondary-dark/30 border border-secondary/40 text-secondary p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span>¡Registro Enviado!</span>
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
            {/* Display Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Nombre de Operador / Estudio
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  name="displayName"
                  required
                  placeholder="Estudio Grafico Luso"
                  className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary border border-white/5"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Correo Electrónico
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-10 py-2.5 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary border border-white/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Repite la contraseña"
                  className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary border border-white/5"
                />
              </div>
            </div>

            {/* Submit Button */}
            <NeuButton
              type="submit"
              variant="secondary"
              size="lg"
              active
              disabled={isPending}
              className="w-full py-3 mt-2 shadow-glow-cyan justify-center"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isPending ? "Registrando..." : "Crear Cuenta"}</span>
            </NeuButton>
          </form>
        )}

        {/* Footer Login Link */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-on-surface-variant">
          ¿Ya tienes una cuenta registrada?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-secondary transition-colors">
            Inicia sesión aquí
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
