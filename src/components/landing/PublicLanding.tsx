"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { AuthGateModal } from "@components/auth/AuthGateModal";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  Wrench,
  Grid,
  FileCheck2,
  Image as ImageIcon,
  CheckCircle2,
  UserPlus,
  LogIn,
  ShieldCheck,
  Cpu,
  Scissors,
} from "lucide-react";

export function PublicLanding() {
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [authGateDestination, setAuthGateDestination] = useState("/herramientas/image-lab");
  const [authGateAction, setAuthGateAction] = useState("para acceder a las herramientas");

  function triggerAuthGate(dest: string, actionText: string) {
    setAuthGateDestination(dest);
    setAuthGateAction(actionText);
    setIsAuthGateOpen(true);
  }

  return (
    <div className="space-y-16 py-4">
      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        redirectTo={authGateDestination}
        actionTitle={authGateAction}
      />

      {/* Hero Section */}
      <section className="relative glass-panel rounded-3xl p-8 md:p-14 overflow-hidden border border-white/10 shadow-glow-violet">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6 text-center mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high/80 border border-secondary/30 text-xs font-semibold text-secondary shadow-sm">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span>Suite Profesional de Preparación para Impresión DTF</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-on-surface tracking-tight leading-[1.1]">
            Prepara tus diseños. <br />
            <span className="bg-gradient-to-r from-secondary via-primary-light to-secondary bg-clip-text text-transparent">
              Estampa mejor.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            LUSO DTF STUDIO ayuda a talleres y profesionales de la impresión textil a optimizar imágenes, limpiar transparencias, verificar DPI y maquetar planchas de impresión listas para RIP.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/registro">
              <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
                <UserPlus className="w-5 h-5" />
                <span>Empezar Gratis</span>
              </NeuButton>
            </Link>

            <Link href="/herramientas/image-lab">
              <NeuButton variant="primary" size="lg" active className="shadow-glow-violet">
                <Wrench className="w-5 h-5" />
                <span>Probar Image Lab</span>
              </NeuButton>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-on-surface-variant/80 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary" /> Sin tarjetas de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" /> RLS en PostgreSQL
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-secondary" /> Renderizado Híbrido GPU
            </span>
          </div>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface">
            Capabilidades del <span className="text-secondary">Image Lab</span>
          </h2>
          <p className="text-sm text-on-surface-variant">
            Herramientas especializadas diseñadas exclusivamente para las exigencias técnicas del DTF
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: "Limpieza de Transparencias",
              desc: "Elimina difuminados y píxeles semi-transparentes para evitar bordes blancos borrosos en la tinta.",
              icon: Scissors,
              href: "/herramientas/image-lab",
              glow: "cyan",
              badge: "Disponible",
            },
            {
              title: "DTF Pre-Flight Engine",
              desc: "Analiza automáticamente el tamaño físico en cm y evalúa la resolución efectiva a 300 DPI.",
              icon: FileCheck2,
              href: "/herramientas/image-lab",
              glow: "violet",
              badge: "Disponible",
            },
            {
              title: "Ajuste de Tamaño y DPI",
              desc: "Re-muestrea y escala imágenes preservando la relación de aspecto para pliegos de impresión.",
              icon: ImageIcon,
              href: "/herramientas/image-lab",
              glow: "cyan",
              badge: "Disponible",
            },
            {
              title: "Eliminación de Fondos",
              desc: "Aísla el estampado retirando fondos sólidos o blancos sin destruir detalles finos.",
              icon: Zap,
              href: "/herramientas/image-lab",
              glow: "violet",
              badge: "Disponible",
            },
            {
              title: "Smart Nesting",
              desc: "Algoritmo de anidación optimizada para maximizar aprovechamiento de metros en rollo.",
              icon: Grid,
              href: "/herramientas/image-lab",
              glow: "none",
              badge: "Próximamente",
            },
            {
              title: "Semitonos para DTF",
              desc: "Genera tramas de semitono para estampados suaves y respirables en prendas oscuras.",
              icon: Layers,
              href: "/herramientas/image-lab",
              glow: "none",
              badge: "Próximamente",
            },
            {
              title: "Editor de Máscara",
              desc: "Contracción (choke/underbase) configurable para la capa de blanco.",
              icon: Wrench,
              href: "/herramientas/image-lab",
              glow: "none",
              badge: "Próximamente",
            },
            {
              title: "Upscaling Inteligente",
              desc: "Aumenta la resolución de logos de baja calidad mediante red neuronal.",
              icon: Cpu,
              href: "/herramientas/image-lab",
              glow: "none",
              badge: "Próximamente",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            const isAvailable = feature.badge === "Disponible";

            return (
              <GlassCard
                key={feature.title}
                glow={feature.glow as "violet" | "cyan" | "none"}
                className="h-full flex flex-col justify-between p-6 space-y-4 group hover:scale-[1.02] transition-all cursor-pointer"
                onClick={() => {
                  if (isAvailable) {
                    triggerAuthGate("/herramientas/image-lab", "para utilizar el Image Lab");
                  }
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center text-primary group-hover:text-secondary group-hover:border-secondary/30 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAvailable
                          ? "bg-secondary/15 text-secondary border-secondary/30"
                          : "bg-surface-container-highest/80 text-on-surface-variant border-white/10"
                      }`}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center text-xs font-semibold text-secondary group-hover:translate-x-1 transition-transform">
                  <span>Probar en Image Lab</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 space-y-8 border border-white/10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface">
            Flujo Simplificado de 5 Pasos
          </h2>
          <p className="text-sm text-on-surface-variant">
            Desde el archivo del cliente hasta la plancha lista para imprimir
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {[
            { step: "01", title: "SUBE", desc: "Archivos PNG, JPG o WEBP" },
            { step: "02", title: "OPTIMIZA", desc: "Limpia alfas y transparencias" },
            { step: "03", title: "PREPARA", desc: "Verifica DPI y tamaño físico" },
            { step: "04", title: "ACOMODA", desc: "Maqueta pliegos o rollos DTF" },
            { step: "05", title: "IMPRIME", desc: "Exporta en alta resolución" },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="neu-pressed bg-surface-container/60 p-5 rounded-2xl space-y-3 relative border border-white/5"
            >
              <span className="font-display font-black text-2xl text-secondary/40">
                {item.step}
              </span>
              <h3 className="font-display font-bold text-base text-on-surface tracking-wider">
                {item.title}
              </h3>
              <p className="text-xs text-on-surface-variant/80">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-secondary/30 shadow-glow-cyan">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface">
            ¿Listo para optimizar tus impresiones DTF?
          </h2>
          <p className="text-sm text-on-surface-variant">
            Crea tu cuenta gratuita y guarda tus primeros diseños optimizados en tu espacio de trabajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/registro">
            <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
              <UserPlus className="w-5 h-5" />
              <span>Crear Cuenta Gratis</span>
            </NeuButton>
          </Link>

          <Link href="/login">
            <NeuButton variant="glass" size="lg">
              <LogIn className="w-5 h-5 text-primary" />
              <span>Iniciar Sesión</span>
            </NeuButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
