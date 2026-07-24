"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Search, User, LogOut, Layers } from "lucide-react";
import { NeuButton } from "@components/ui/NeuButton";
import { createClient } from "@lib/supabase/client";
import { signoutAction } from "@app/auth/actions";

export function FloatingTopbar() {
  const [user, setUser] = useState<{ displayName: string; email: string; workspaceName: string } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", authUser.id)
            .single();

          const { data: member } = await supabase
            .from("workspace_members")
            .select("workspace_id, workspaces(name)")
            .eq("user_id", authUser.id)
            .single();

          const wsName = (member?.workspaces as any)?.name || "Mi espacio";

          setUser({
            displayName: profile?.display_name || authUser.email?.split("@")[0] || "Operador DTF",
            email: authUser.email || "",
            workspaceName: wsName,
          });
        }
      } catch {
        // Fallback for unauthenticated or initial render
      }
    }

    loadUserData();
  }, []);

  return (
    <header className="fixed top-4 left-4 right-4 lg:left-[312px] h-[72px] z-20 hidden md:flex glass-panel rounded-2xl px-6 items-center justify-between">
      {/* Search Input Bar */}
      <div className="relative w-72 lg:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Buscar proyectos, planchas, diseños..."
          className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-secondary/50 border border-white/5"
        />
      </div>

      {/* Action Controls & User Account */}
      <div className="flex items-center gap-3">
        <NeuButton variant="glass" size="sm" className="rounded-full w-10 h-10 p-0" title="Notificaciones">
          <Bell className="w-4 h-4 text-on-surface-variant" />
        </NeuButton>

        <div className="h-6 w-[1px] bg-white/10 mx-1" />

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/cuenta" className="flex items-center gap-3 pl-1 group cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary p-[1px] shadow-glow-cyan group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-surface-container-high rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-on-surface" />
                </div>
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">
                  {user.displayName}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-secondary">
                  <Layers className="w-3 h-3" />
                  <span>{user.workspaceName}</span>
                </div>
              </div>
            </Link>

            <form action={signoutAction}>
              <NeuButton variant="ghost" size="sm" title="Cerrar Sesión" className="w-9 h-9 p-0 rounded-xl text-on-surface-variant hover:text-error">
                <LogOut className="w-4 h-4" />
              </NeuButton>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <NeuButton variant="primary" size="sm" active>
              <User className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </NeuButton>
          </Link>
        )}
      </div>
    </header>
  );
}
