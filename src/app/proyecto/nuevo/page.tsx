"use client";

import { useState } from "react";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import {
  Upload,
  PlusCircle,
  FileCheck2,
  ImageIcon,
  Maximize2,
  Grid,
  Eye,
  Download,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
} from "lucide-react";

const WORKFLOW_STEPS = [
  { id: 1, name: "Proyecto", icon: PlusCircle },
  { id: 2, name: "Diseños", icon: Upload },
  { id: 3, name: "Preparar", icon: ImageIcon },
  { id: 4, name: "Tamaño", icon: Maximize2 },
  { id: 5, name: "Procesar", icon: FileCheck2 },
  { id: 6, name: "Plancha", icon: Layers },
  { id: 7, name: "Nesting", icon: Grid },
  { id: 8, name: "Vista Previa", icon: Eye },
  { id: 9, name: "Exportar", icon: Download },
];

export default function NuevoProyectoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState("Proyecto DTF - " + new Date().toLocaleDateString("es-ES"));
  const [sheetType, setSheetType] = useState<"rollo" | "pliego">("rollo");
  const [sheetWidth, setSheetWidth] = useState(580); // mm

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-secondary uppercase tracking-widest">
            Flujo de Maquetación DTF
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            {projectName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <NeuButton
            variant="glass"
            size="sm"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </NeuButton>

          <NeuButton
            variant="primary"
            size="sm"
            active
            disabled={currentStep === 9}
            onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
          >
            <span>Siguiente Paso</span>
            <ArrowRight className="w-4 h-4" />
          </NeuButton>
        </div>
      </div>

      {/* 9-Step Horizontal Workflow Indicator */}
      <GlassCard className="p-3 md:p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isCurrent
                    ? "neu-pressed bg-surface-container-high/90 text-primary border border-primary/30 shadow-glow-violet font-semibold"
                    : isDone
                    ? "text-secondary hover:bg-white/5"
                    : "text-on-surface-variant/50 hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    isCurrent
                      ? "bg-primary text-primary-dark font-bold"
                      : isDone
                      ? "bg-secondary/20 text-secondary"
                      : "bg-surface-container-high text-on-surface-variant/50"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                </div>
                <span>{step.name}</span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Step Dynamic Workspace Foundation */}
      <GlassCard className="p-6 md:p-8 min-h-[420px] flex flex-col justify-between">
        {currentStep === 1 && (
          <div className="space-y-6 max-w-xl">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold text-on-surface">Paso 1: Nombre del Proyecto</h2>
              <p className="text-xs text-on-surface-variant">
                Define el identificador para este trabajo de maquetación y preparación de plancha.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Nombre de la Plancha / Proyecto:
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-sm rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold text-on-surface">Paso 2: Cargar Diseños</h2>
              <p className="text-xs text-on-surface-variant">
                Sube las imágenes PNG (con fondo transparente) o vectores que formarán parte de la plancha.
              </p>
            </div>

            <div className="border-2 border-dashed border-white/15 hover:border-secondary/40 rounded-2xl p-12 text-center space-y-3 cursor-pointer transition-colors bg-surface-container/30">
              <Upload className="w-10 h-10 text-secondary mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-on-surface">Arrastra tus archivos aquí o haz clic para examinar</p>
                <p className="text-xs text-on-surface-variant">Formatos soportados: PNG, TIFF, SVG, PDF (hasta 300 DPI)</p>
              </div>
            </div>
          </div>
        )}

        {currentStep >= 3 && currentStep <= 8 && (
          <div className="space-y-4 text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
              <Grid className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h2 className="font-display text-lg font-bold text-on-surface">
                Arquitectura de Interfaz - {WORKFLOW_STEPS[currentStep - 1].name}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Módulo UI preparado para el procesamiento de gráficos, underbase de blanco, nesting y maquetación de pliego en la siguiente fase.
              </p>
            </div>
          </div>
        )}

        {currentStep === 9 && (
          <div className="space-y-6 max-w-xl">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold text-on-surface">Paso 9: Exportar Plancha PNG</h2>
              <p className="text-xs text-on-surface-variant">
                Genera la imagen rasterizada final a 300 DPI con capa de tinta blanca lista para enviar al software RIP.
              </p>
            </div>

            <NeuButton variant="primary" size="lg" active className="w-full justify-center">
              <Download className="w-5 h-5" />
              <span>Generar Plancha en Alta Resolución</span>
            </NeuButton>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Paso {currentStep} de 9
          </span>
          <div className="flex items-center gap-3">
            {currentStep < 9 && (
              <NeuButton variant="primary" size="sm" active onClick={() => setCurrentStep((prev) => prev + 1)}>
                <span>Continuar a {WORKFLOW_STEPS[currentStep].name}</span>
                <ArrowRight className="w-4 h-4" />
              </NeuButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
