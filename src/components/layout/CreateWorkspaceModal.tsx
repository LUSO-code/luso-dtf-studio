"use client";

import { useState } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { Building2, X, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCreateWorkspace() {
    if (!name.trim()) {
      setErrorMessage("Por favor ingresa un nombre para el espacio de trabajo.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado.");

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // 1. Create Workspace
      const { data: newWs, error: errWs } = await supabase
        .from("workspaces")
        .insert({
          name: name.trim(),
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          owner_id: user.id,
        })
        .select()
        .single();

      if (errWs) throw new Error(errWs.message);

      // 2. Add owner membership
      const { error: errMem } = await supabase.from("workspace_members").insert({
        workspace_id: newWs.id,
        user_id: user.id,
        role: "owner",
      });

      if (errMem) throw new Error(errMem.message);

      // Store new active workspace and reload
      localStorage.setItem("luso_active_workspace_id", newWs.id);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al crear el espacio de trabajo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-md p-6 space-y-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg font-bold text-on-surface">
              Crear Nuevo Espacio de Trabajo
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Nombre del Espacio de Trabajo
            </label>
            <input
              type="text"
              placeholder="Ej: Imprenta DTF Madrid"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <NeuButton variant="glass" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </NeuButton>

          <NeuButton
            variant="secondary"
            size="md"
            active
            onClick={handleCreateWorkspace}
            disabled={isSubmitting}
            className="shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? "Creando..." : "Crear Espacio"}</span>
          </NeuButton>
        </div>
      </GlassCard>
    </div>
  );
}
