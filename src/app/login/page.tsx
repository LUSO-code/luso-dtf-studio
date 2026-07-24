"use client";

import { Suspense, useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { loginAction } from "@app/auth/actions";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      {/* Validation Error Alert */}
      {state?.error && (
        <div className="neu-pressed bg-error-container/30 border border-error/30 text-error p-3.5 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{state.error}</span>
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Contraseña
          </label>
          <Link
            href="/recuperar-contrasena"
            className="text-xs text-secondary hover:text-primary transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="••••••••"
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

      {/* Remember Session */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          defaultChecked
          className="rounded bg-surface-container-high border-white/10 text-primary focus:ring-secondary"
        />
        <label htmlFor="remember" className="text-xs text-on-surface-variant cursor-pointer select-none">
          Recordar mi sesión en este navegador
        </label>
      </div>

      {/* Submit Button */}
      <NeuButton
        type="submit"
        variant="primary"
        size="lg"
        active
        disabled={isPending}
        className="w-full py-3 mt-2 shadow-glow-violet justify-center"
      >
        <LogIn className="w-4 h-4" />
        <span>{isPending ? "Ingresando..." : "Iniciar Sesión"}</span>
      </NeuButton>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <GlassCard glow="violet" className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-dark via-primary to-secondary p-[1px] shadow-glow-violet mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-surface-container-lowest rounded-2xl flex items-center justify-center">
              <span className="font-display font-black text-2xl text-primary">L</span>
            </div>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface tracking-tight">
            LUSO <span className="text-secondary font-medium">DTF</span> STUDIO
          </h1>
          <p className="text-xs text-on-surface-variant">
            Ingresa a tu cuenta para gestionar tus planchas y proyectos DTF
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-xs text-on-surface-variant">Cargando formulario...</div>}>
          <LoginForm />
        </Suspense>

        {/* Footer Registration Link */}
        <div className="text-center pt-2 border-t border-white/10 text-xs text-on-surface-variant">
          ¿No tienes una cuenta aún?{" "}
          <Link href="/registro" className="font-semibold text-secondary hover:text-primary transition-colors">
            Regístrate aquí
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
