"use client";

import { useState, useEffect } from "react";
import { createClient } from "@lib/supabase/client";
import { ChevronDown, Building2, Plus, Check, ShieldCheck, UserCheck } from "lucide-react";

export interface WorkspaceItem {
  id: string;
  name: string;
  role: string;
}

interface WorkspaceSwitcherProps {
  onOpenCreateModal?: () => void;
}

export function WorkspaceSwitcher({ onOpenCreateModal }: WorkspaceSwitcherProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserWorkspaces() {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: members } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(id, name)")
        .eq("user_id", user.id);

      if (members && members.length > 0) {
        const list: WorkspaceItem[] = members.map((m: any) => ({
          id: m.workspaces.id,
          name: m.workspaces.name,
          role: m.role,
        }));

        setWorkspaces(list);

        // Retrieve stored active workspace or default to first
        const storedId = localStorage.getItem("luso_active_workspace_id");
        const found = list.find((w) => w.id === storedId) || list[0];
        setActiveWorkspace(found);
      }

      setIsLoading(false);
    }

    fetchUserWorkspaces();
  }, []);

  function handleSelectWorkspace(ws: WorkspaceItem) {
    setActiveWorkspace(ws);
    localStorage.setItem("luso_active_workspace_id", ws.id);
    setIsOpen(false);
    // Reload window to refresh server context
    window.location.reload();
  }

  if (isLoading || !activeWorkspace) {
    return (
      <div className="px-3 py-1.5 rounded-xl neu-pressed bg-surface-container-lowest/50 text-[11px] text-on-surface-variant flex items-center gap-2">
        <Building2 className="w-3.5 h-3.5" />
        <span>Espacio de trabajo...</span>
      </div>
    );
  }

  const roleLabelMap: Record<string, string> = {
    owner: "Propietario",
    admin: "Admin",
    member: "Miembro",
    viewer: "Lectura",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl neu-pressed bg-surface-container-lowest/80 border border-white/10 text-xs font-semibold text-on-surface hover:border-secondary/40 transition-all flex items-center gap-2"
      >
        <Building2 className="w-3.5 h-3.5 text-secondary shrink-0" />
        <span className="truncate max-w-[130px] font-display font-bold">{activeWorkspace.name}</span>
        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
          {roleLabelMap[activeWorkspace.role] || activeWorkspace.role}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl glass-panel bg-surface-container-high/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-white/5">
            Espacios de Trabajo
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {workspaces.map((ws) => {
              const isSelected = ws.id === activeWorkspace.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-secondary/15 text-secondary font-bold"
                      : "text-on-surface hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{ws.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/5 text-on-surface-variant">
                      {roleLabelMap[ws.role] || ws.role}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-secondary shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {onOpenCreateModal && (
            <div className="border-t border-white/10 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenCreateModal();
                }}
                className="w-full p-2 rounded-xl text-xs font-semibold text-secondary hover:bg-secondary/10 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Espacio</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
