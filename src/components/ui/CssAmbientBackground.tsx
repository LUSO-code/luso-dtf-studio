"use client";

import React from "react";
import { AMBIENT_TOKENS } from "@lib/theme/tokens";

interface CssAmbientBackgroundProps {
  staticMode?: boolean;
}

export function CssAmbientBackground({ staticMode = false }: CssAmbientBackgroundProps) {
  const { colors } = AMBIENT_TOKENS;

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none bg-[#0b1326]">
      {/* Soft atmospheric gradient spheres */}
      <div
        className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full mix-blend-screen opacity-50 blur-[100px] ${
          staticMode ? "" : "animate-ambient-pulse-slow"
        }`}
        style={{
          background: `radial-gradient(circle, ${colors.violet} 0%, ${colors.indigo} 70%, transparent 100%)`,
        }}
      />

      <div
        className={`absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full mix-blend-screen opacity-40 blur-[120px] ${
          staticMode ? "" : "animate-ambient-shift-slow"
        }`}
        style={{
          background: `radial-gradient(circle, ${colors.magenta} 0%, ${colors.purple} 60%, transparent 100%)`,
        }}
      />

      <div
        className={`absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full mix-blend-screen opacity-35 blur-[110px] ${
          staticMode ? "" : "animate-ambient-pulse-alt"
        }`}
        style={{
          background: `radial-gradient(circle, ${colors.subtleCyan} 0%, ${colors.indigo} 70%, transparent 100%)`,
        }}
      />

      {/* Atmospheric noise texture layer */}
      <div className="absolute inset-0 bg-surface/30 backdrop-blur-[60px]" />
    </div>
  );
}
