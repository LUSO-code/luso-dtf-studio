import { createClient } from "@lib/supabase/server";
import { notFound } from "next/navigation";
import { PrintSheetEditor } from "@components/print-sheet/PrintSheetEditor";
import { PlacedItem } from "@lib/nesting/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarPlanchaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch Parent Print Sheet Record
  const { data: sheet, error: errSheet } = await supabase
    .from("print_sheets")
    .select("*")
    .eq("id", id)
    .single();

  if (errSheet || !sheet) {
    notFound();
  }

  // Fetch Saved Child Items with joined design metadata
  const { data: rawItems } = await supabase
    .from("print_sheet_items")
    .select("*, designs(*)")
    .eq("print_sheet_id", id)
    .order("z_index", { ascending: true });

  const initialItems: PlacedItem[] = (rawItems || []).map((item) => {
    const design = item.designs;
    return {
      id: item.id,
      designId: item.design_id || "",
      name: design?.name || "Diseño Imprimible",
      thumbnailUrl: design?.processed_file_url || design?.original_file_url,
      processedFileUrl: design?.processed_file_url || design?.original_file_url,
      xCm: Number(item.x_cm),
      yCm: Number(item.y_cm),
      widthCm: Number(item.width_cm),
      heightCm: Number(item.height_cm),
      rotation: (item.rotation as 0 | 90 | 180 | 270) || 0,
      areaCm2: Number(item.width_cm) * Number(item.height_cm),
    };
  });

  return (
    <PrintSheetEditor
      initialSheetId={sheet.id}
      initialName={sheet.name}
      initialWidthCm={Number(sheet.sheet_width_cm) || 58}
      initialHeightCm={Number(sheet.sheet_height_cm) || 100}
      initialMarginCm={Number(sheet.margin_cm) || 1.0}
      initialSpacingCm={Number(sheet.spacing_cm) || 0.5}
      initialItems={initialItems}
    />
  );
}
