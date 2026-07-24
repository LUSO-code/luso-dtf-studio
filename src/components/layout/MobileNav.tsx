"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  ShoppingBag,
  Wrench,
  User,
  Settings,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { NeuButton } from "@components/ui/NeuButton";

export const NAV_ITEMS = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Mis diseños", href: "/disenos", icon: FolderOpen },
  { name: "Mis planchas", href: "/planchas", icon: Layers },
  { name: "Catálogo", href: "/catalogo", icon: ShoppingBag },
  { name: "Herramientas", href: "/herramientas", icon: Wrench },
  { name: "Cuenta", href: "/cuenta", icon: User },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      {/* Mobile Sticky Floating Top Header */}
      <header className="fixed top-3 left-3 right-3 h-14 z-40 glass-panel rounded-xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-dark via-primary to-secondary p-[1px] shadow-glow-violet flex items-center justify-center">
            <span className="font-display font-black text-sm text-primary">L</span>
          </div>
          <span className="font-display font-extrabold text-sm tracking-tight text-on-surface">
            LUSO <span className="text-secondary font-medium">DTF</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/proyecto/nuevo">
            <NeuButton variant="primary" size="sm" active className="text-xs px-2.5 py-1">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </NeuButton>
          </Link>
          <NeuButton
            variant="glass"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú de navegación"
            className="w-8 h-8 p-0 rounded-lg"
          >
            {isOpen ? <X className="w-4 h-4 text-on-surface" /> : <Menu className="w-4 h-4 text-on-surface" />}
          </NeuButton>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex flex-col p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark via-primary to-secondary p-[1px] shadow-glow-violet flex items-center justify-center">
                <span className="font-display font-black text-lg text-primary">L</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-on-surface">LUSO DTF STUDIO</h2>
                <p className="text-xs text-on-surface-variant">Menú Principal</p>
              </div>
            </div>
            <NeuButton variant="glass" size="sm" onClick={() => setIsOpen(false)} className="w-9 h-9 p-0 rounded-xl">
              <X className="w-5 h-5 text-on-surface" />
            </NeuButton>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                    isActive
                      ? "neu-pressed bg-surface-container-high/90 text-primary border border-primary/30 shadow-glow-violet"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-on-surface-variant/70")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
