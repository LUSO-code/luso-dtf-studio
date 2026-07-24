"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  FilePlus,
  Layers,
  Sparkles,
  Palette,
  Grid,
  Settings,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Trabajos", href: "/trabajos", icon: Printer },
  { name: "Nuevo Trabajo", href: "/trabajos/nuevo", icon: FilePlus },
  { name: "Pre-Flight DTF", href: "/dtf-preflight", icon: Sparkles },
  { name: "Preparación Imagen", href: "/preparacion-imagen", icon: ImageIcon },
  { name: "Editor de Máscara", href: "/editor-mascara", icon: Layers },
  { name: "Smart Nesting", href: "/smart-nesting", icon: Grid },
  { name: "Config. Plancha", href: "/configuracion-plancha", icon: Settings },
  { name: "Mis Diseños", href: "/mis-disenos", icon: FolderOpen },
  { name: "Perfiles Producción", href: "/perfiles-produccion", icon: Palette },
];

export function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-4 left-4 bottom-4 w-[280px] z-30 hidden lg:flex flex-col glass-panel rounded-2xl p-5 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-2 mb-6 border-b border-white/10 pb-4">
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

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "neu-pressed bg-surface-container-high/90 text-primary border border-primary/30 shadow-glow-violet"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "text-on-surface-variant/70"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / System Status */}
      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-on-surface-variant/80 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-glow-cyan" />
          <span>Sistema En Línea</span>
        </div>
        <span className="font-mono text-[10px] opacity-60">v0.1.0</span>
      </div>
    </aside>
  );
}
