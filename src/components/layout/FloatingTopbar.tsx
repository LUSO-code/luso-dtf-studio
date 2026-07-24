"use client";

import { Bell, Search, User } from "lucide-react";
import { NeuButton } from "@components/ui/NeuButton";

export function FloatingTopbar() {
  return (
    <header className="fixed top-4 left-4 right-4 lg:left-[312px] h-[72px] z-20 glass-panel rounded-2xl px-6 flex items-center justify-between">
      {/* Search Input Bar */}
      <div className="relative w-72 md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Buscar trabajos, archivos, clientes..."
          className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-secondary/50 border border-white/5"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <NeuButton variant="glass" size="sm" className="rounded-full w-10 h-10 p-0">
          <Bell className="w-4 h-4 text-on-surface-variant" />
        </NeuButton>

        <div className="h-6 w-[1px] bg-white/10 mx-1" />

        <div className="flex items-center gap-3 pl-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] shadow-glow-cyan">
            <div className="w-full h-full bg-surface-container-high rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-on-surface" />
            </div>
          </div>
          <div className="hidden sm:block text-left text-xs">
            <p className="font-semibold text-on-surface leading-tight">Operador DTF</p>
            <p className="text-[10px] text-on-surface-variant/70">Estudio Principal</p>
          </div>
        </div>
      </div>
    </header>
  );
}
