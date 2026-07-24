"use client";

import { useState } from "react";
import { GlassCard } from "@components/ui/GlassCard";
import { BeforeAfterSlider } from "@components/ui/BeforeAfterSlider";
import { Layers, Eye, SlidersHorizontal, Info, ShieldCheck, Sparkles } from "lucide-react";

export type PreviewTabMode = "color" | "underbase" | "garment" | "compare";

interface UnderbasePreviewTabsProps {
  colorUrl: string;
  underbaseUrl: string | null;
  className?: string;
}

export function UnderbasePreviewTabs({ colorUrl, underbaseUrl, className = "" }: UnderbasePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<PreviewTabMode>("color");
  const [garmentColor, setGarmentColor] = useState<string>("#121212"); // Black default

  const effectiveUnderbaseUrl = underbaseUrl || colorUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Selectors & Garment Color Switcher */}
      <GlassCard glow="cyan" className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "color", label: "Vista Color", icon: Eye },
            { id: "underbase", label: "Máscara de Blanco", icon: Layers },
            { id: "garment", label: "Simulación Prenda", icon: Sparkles },
            { id: "compare", label: "Comparador", icon: SlidersHorizontal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PreviewTabMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                  isActive
                    ? "bg-secondary text-surface-container-lowest shadow-glow-cyan font-bold"
                    : "bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Garment Color Swatches for Garment Mode */}
        {activeTab === "garment" && (
          <div className="flex items-center gap-2 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
            <span className="text-[11px] text-on-surface-variant font-medium">Prenda:</span>
            {[
              { color: "#121212", name: "Negra" },
              { color: "#f8f9fa", name: "Blanca" },
              { color: "#0f172a", name: "Azul Marino" },
              { color: "#334155", name: "Gris Jaspeado" },
            ].map((garment) => (
              <button
                key={garment.color}
                onClick={() => setGarmentColor(garment.color)}
                style={{ backgroundColor: garment.color }}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  garmentColor === garment.color ? "border-secondary scale-110 shadow-md" : "border-white/20"
                }`}
                title={`Camiseta ${garment.name}`}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {/* Main Preview Stage Viewport */}
      <GlassCard className="p-4 relative">
        <div className="h-[420px] sm:h-[500px] w-full relative rounded-2xl overflow-hidden glass-panel flex items-center justify-center border border-white/10 select-none">
          {activeTab === "color" && (
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] bg-surface-container-lowest flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={colorUrl}
                alt="Vista Color"
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
              <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-surface-container-high/90 text-on-surface px-2.5 py-1 rounded-full border border-white/10">
                Arte en Color RGBA
              </span>
            </div>
          )}

          {activeTab === "underbase" && (
            <div className="absolute inset-0 bg-[#0a0a0f] flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveUnderbaseUrl}
                alt="Máscara de Blanco"
                className="max-h-full max-w-full object-contain filter brightness-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              />
              <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-primary-dark/90 text-primary-light px-2.5 py-1 rounded-full border border-primary/30">
                Máscara de Tinta Blanca (Grayscale)
              </span>
            </div>
          )}

          {activeTab === "garment" && (
            <div
              style={{ backgroundColor: garmentColor }}
              className="absolute inset-0 flex items-center justify-center p-4 transition-colors duration-300"
            >
              {/* Underbase Simulation Layer */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={effectiveUnderbaseUrl}
                alt="Underbase Layer"
                className="max-h-full max-w-full object-contain opacity-90 filter blur-[0.3px]"
              />
              {/* Top Color Layer */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={colorUrl}
                alt="Color Layer"
                className="max-h-full max-w-full object-contain absolute"
              />
              <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-surface-container-high/90 text-on-surface px-2.5 py-1 rounded-full border border-white/10">
                Simulación Digital en Prenda
              </span>
            </div>
          )}

          {activeTab === "compare" && (
            <BeforeAfterSlider
              originalUrl={colorUrl}
              processedUrl={effectiveUnderbaseUrl}
              className="h-full w-full"
            />
          )}
        </div>

        {/* Physical Printing & Registration Disclaimer */}
        <div className="mt-4 p-3 rounded-xl bg-surface-container-high/50 border border-white/5 space-y-1 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2 font-semibold text-secondary">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Aviso Técnico de Impresión y Choke</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">
            El choke reduce la exposición del blanco en los bordes para ayudar a minimizar halos visibles. El resultado final puede variar según el RIP, densidad de tinta, impresora, película, prenda y proceso de planchado.
          </p>
          <p className="text-[10px] text-on-surface-variant/70 italic pt-0.5">
            Previsualización digital aproximada. El resultado final depende de la densidad de tinta del RIP y prensado térmico.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
