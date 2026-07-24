import { GlassCard } from "@components/ui/GlassCard";
import { User, Shield, Mail, KeyRound } from "lucide-react";

export default function CuentaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
          Perfil de Cuenta
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Configuración de usuario y sesión del estudio DTF.
        </p>
      </div>

      <GlassCard className="p-6 max-w-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-glow-violet">
            <div className="w-full h-full bg-surface-container-high rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-on-surface" />
            </div>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">Operador DTF</h3>
            <p className="text-xs text-on-surface-variant">operador@lusodtf.com</p>
            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Estudio Principal
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-surface-container/60">
            <div className="flex items-center gap-2.5 text-on-surface-variant">
              <Mail className="w-4 h-4 text-primary" />
              <span>Correo Electrónico:</span>
            </div>
            <span className="font-semibold text-on-surface">operador@lusodtf.com</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl neu-pressed bg-surface-container/60">
            <div className="flex items-center gap-2.5 text-on-surface-variant">
              <Shield className="w-4 h-4 text-secondary" />
              <span>Autenticación:</span>
            </div>
            <span className="font-semibold text-secondary">Supabase Auth (Fase 02 Listo)</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
