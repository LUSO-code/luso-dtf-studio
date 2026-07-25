"use client";

import { useState } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { FeedbackModal } from "@components/feedback/FeedbackModal";

export function BetaBadge() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="group relative px-2.5 py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 transition-all shadow-glow-cyan"
          title="Estamos mejorando LUSO DTF STUDIO. Tu opinión nos ayuda."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shrink-0" />
          <span>Beta Privada</span>
          <MessageSquare className="w-3 h-3 text-secondary opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
        </button>
      </div>
    </>
  );
}
