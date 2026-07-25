"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, User, LogOut } from "lucide-react";
import { NeuButton } from "@components/ui/NeuButton";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { createClient } from "@lib/supabase/client";
import { signoutAction } from "@app/auth/actions";

export function FloatingTopbar() {
  const [user, setUser] = useState<{ displayName: string; email: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

          setUser({
            displayName: profile?.display_name || authUser.email?.split("@")[0] || "Operador DTF",
            email: authUser.email || "",
          });
        }
      } catch {
        // Fallback for unauthenticated
      }
    }

    loadUserData();
  }, []);

  return (
    <>
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <header className="fixed top-4 left-4 right-4 lg:left-[312px] h-[72px] z-20 hidden md:flex glass-panel rounded-2xl px-6 items-center justify-between">
        {/* Search Input Bar */}
        <div className="relative w-64 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar diseños, planchas..."
            className="w-full neu-pressed bg-surface-container-lowest/80 text-on-surface text-sm rounded-xl pl-10 pr-4 py-2 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-secondary/50 border border-white/5"
          />
        </div>

        {/* Right Section: Workspace Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Workspace Switcher */}
          <WorkspaceSwitcher onOpenCreateModal={() => setIsCreateModalOpen(true)} />

          {/* User Profile Info */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <Link href="/cuenta" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs shadow-glow-violet">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-on-surface leading-tight truncate max-w-[120px]">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-on-surface-variant truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </Link>

              <form action={signoutAction}>
                <NeuButton variant="glass" size="sm" type="submit" className="px-2.5">
                  <LogOut className="w-3.5 h-3.5 text-on-surface-variant hover:text-error transition-colors" />
                </NeuButton>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <NeuButton variant="glass" size="sm">
                  <span>Iniciar Sesión</span>
                </NeuButton>
              </Link>
              <Link href="/registro">
                <NeuButton variant="secondary" size="sm" active className="shadow-glow-cyan">
                  <span>Registrarse</span>
                </NeuButton>
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
