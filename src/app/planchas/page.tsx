import Link from "next/link";
import { createClient } from "@lib/supabase/server";
import { GlassCard } from "@components/ui/GlassCard";
import { NeuButton } from "@components/ui/NeuButton";
import {
  Layers,
  Plus,
  Maximize2,
  Calendar,
  Grid,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function PlanchasHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sheets: any[] = [];

  if (user) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (member?.workspace_id) {
      const { data } = await supabase
        .from("print_sheets")
        .select("*, print_sheet_items(count)")
        .eq("workspace_id", member.workspace_id)
        .order("updated_at", { ascending: false });

      if (data) sheets = data;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-xs font-semibold text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestor de Maquetación DTF</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-on-surface">
            Mis Planchas de Impresión
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant">
            Pliegos y rollos maquetados con optimización de material Smart Nesting.
          </p>
        </div>

        <Link href="/planchas/nueva">
          <NeuButton variant="secondary" size="md" active className="shadow-glow-cyan">
            <Plus className="w-4 h-4" />
            <span>Crear Nueva Plancha</span>
          </NeuButton>
        </Link>
      </div>

      {/* Grid of Saved Print Sheets */}
      {sheets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sheets.map((sheet) => {
            const itemCount = sheet.print_sheet_items?.[0]?.count || 0;
            const updatedDate = new Date(sheet.updated_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Link key={sheet.id} href={`/planchas/${sheet.id}`}>
                <GlassCard
                  glow="cyan"
                  className="p-6 space-y-4 flex flex-col justify-between group hover:scale-[1.01] transition-transform cursor-pointer h-full border border-white/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high/80 border border-white/10 flex items-center justify-center text-secondary group-hover:border-secondary/30 transition-colors shadow-glow-cyan">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                        {sheet.sheet_width_cm} × {sheet.sheet_height_cm} cm
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                        {sheet.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {itemCount} diseño(s) maquetado(s)
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-on-surface-variant">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{updatedDate}</span>
                    </div>

                    <div className="font-mono text-secondary font-bold">
                      Uso: {sheet.efficiency_percentage || 0}%
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <GlassCard glow="violet" className="p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-white/10 flex items-center justify-center text-secondary mx-auto shadow-glow-cyan">
            <Layers className="w-10 h-10" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="font-display text-xl font-bold text-on-surface">
              No tienes planchas de impresión guardadas
            </h2>
            <p className="text-xs text-on-surface-variant">
              Crea tu primera plancha de impresión, añade diseños de tu biblioteca y optimiza la distribución automáticamente.
            </p>
          </div>

          <Link href="/planchas/nueva" className="inline-block">
            <NeuButton variant="secondary" size="lg" active className="shadow-glow-cyan">
              <Plus className="w-5 h-5" />
              <span>Crear Mi Primera Plancha</span>
            </NeuButton>
          </Link>
        </GlassCard>
      )}
    </div>
  );
}
