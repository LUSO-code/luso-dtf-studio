"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { NAV_ITEMS } from "./MobileNav";
import { PlusCircle } from "lucide-react";
import { NeuButton } from "@components/ui/NeuButton";

export function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-4 left-4 bottom-4 w-[280px] z-30 hidden lg:flex flex-col glass-panel rounded-2xl p-5 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-1 mb-5 border-b border-white/10 pb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark via-primary to-secondary p-[1px] shadow-glow-violet">
          <div className="w-full h-full bg-surface-container-lowest rounded-xl flex items-center justify-center">
            <span className="font-display font-black text-xl text-primary">L</span>
          </div>
        </div>
        <div>
          <h1 className="font-display font-extrabold text-base tracking-tight text-on-surface">
            LUSO <span className="text-secondary font-medium">DTF</span>
          </h1>
          <p className="text-[10px] tracking-widest uppercase font-semibold text-on-surface-variant">
            STUDIO PRO
          </p>
        </div>
      </div>

      {/* Quick Project Trigger */}
      <div className="mb-5">
        <Link href="/proyecto/nuevo" className="w-full block">
          <NeuButton variant="primary" size="md" active className="w-full py-2.5 shadow-glow-violet">
            <PlusCircle className="w-4 h-4" />
            <span>Crear Proyecto</span>
          </NeuButton>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "neu-pressed bg-surface-container-high/90 text-primary border border-primary/30 shadow-glow-violet font-semibold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              )}
            >
              <Icon
                className={clsx(
                  "w-4.5 h-4.5 transition-colors",
                  isActive ? "text-primary" : "text-on-surface-variant/70"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-on-surface-variant/80 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-glow-cyan" />
          <span className="text-[11px] font-medium">Sistema Listo</span>
        </div>
        <span className="font-mono text-[10px] opacity-60">v0.1.0</span>
      </div>
    </aside>
  );
}
