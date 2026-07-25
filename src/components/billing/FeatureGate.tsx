"use client";

import { ReactNode, useState } from "react";
import { FeatureKey } from "@lib/billing/types";
import { UpgradeModal } from "./UpgradeModal";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  featureKey: FeatureKey;
  allowed: boolean;
  children: ReactNode;
  fallbackText?: string;
}

export function FeatureGate({
  featureKey,
  allowed,
  children,
  fallbackText = "Esta función está disponible en los planes Pro y Estudio.",
}: FeatureGateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <>
      <UpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Función Premium"
        description={fallbackText}
        featureName={featureKey}
      />

      <div
        onClick={() => setIsModalOpen(true)}
        className="relative group cursor-pointer border border-dashed border-white/20 rounded-2xl p-4 bg-surface-container-lowest/40 hover:border-secondary/50 transition-all"
      >
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-on-surface">{fallbackText}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/15 border border-secondary/30 px-2 py-0.5 rounded-full">
            Mejorar Plan
          </span>
        </div>
      </div>
    </>
  );
}
