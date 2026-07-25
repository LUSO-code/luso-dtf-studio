"use client";

import { useState } from "react";
import { createClient } from "@lib/supabase/client";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import { MessageSquare, X, Send, CheckCircle2, AlertTriangle, Bug, Sparkles, HelpCircle } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<"bug" | "feature" | "general">("general");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmitFeedback() {
    if (!message.trim()) {
      setErrorMessage("Por favor escribe tu comentario o sugerencia.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Debes iniciar sesión para enviar comentarios.");

      const activeWorkspaceId = localStorage.getItem("luso_active_workspace_id");

      const { error: errInsert } = await supabase.from("user_feedback").insert({
        user_id: user.id,
        workspace_id: activeWorkspaceId || null,
        type,
        message: message.trim(),
      });

      if (errInsert) throw new Error(errInsert.message);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err?.message || "Error al enviar el comentario.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow="cyan" className="w-full max-w-md p-6 space-y-6 border border-white/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-secondary" />
            <h2 className="font-display text-lg font-bold text-on-surface">
              Sugerencias y Comentarios
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

        {isSuccess ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display text-base font-bold text-on-surface">¡Gracias por tu opinión!</h3>
            <p className="text-xs text-on-surface-variant">
              Tus comentarios ayudan a mejorar LUSO DTF STUDIO constantemente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Feedback Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Tipo de Mensaje
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType("general")}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    type === "general"
                      ? "bg-secondary/15 text-secondary border-secondary/40 font-bold"
                      : "bg-surface-container/60 border-white/10 text-on-surface-variant"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>General</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("feature")}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    type === "feature"
                      ? "bg-primary/20 text-primary border-primary/40 font-bold"
                      : "bg-surface-container/60 border-white/10 text-on-surface-variant"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Idea</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    type === "bug"
                      ? "bg-error-container/40 text-error border-error/40 font-bold"
                      : "bg-surface-container/60 border-white/10 text-on-surface-variant"
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Error</span>
                </button>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Detalles del Comentario
              </label>
              <textarea
                rows={4}
                placeholder="Cuéntanos qué función te gustaría ver o si encontraste algún problema..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full neu-pressed bg-surface-container-lowest text-on-surface text-xs rounded-xl p-3.5 border border-white/5 focus:outline-none focus:ring-1 focus:ring-secondary resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <NeuButton variant="glass" size="md" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </NeuButton>

              <NeuButton
                variant="secondary"
                size="md"
                active
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="shadow-glow-cyan"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Enviando..." : "Enviar Comentario"}</span>
              </NeuButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
