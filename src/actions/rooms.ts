"use server";

import { revalidatePath } from "next/cache";
import { getStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, OperationalStatus } from "@/lib/types";
import { roomInputSchema } from "@/lib/validators";

function revalidateRoomViews(roomId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/quartos");
  revalidatePath("/admin/governanca");
  if (roomId) revalidatePath(`/quartos/${roomId}`);
}

export async function updateRoomStatusAction(
  roomId: string,
  status: OperationalStatus,
): Promise<ActionResult<null>> {
  const staff = await getStaffProfile();
  if (!staff) return { success: false, error: "Acesso restrito à equipe." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("rooms")
    .update({ operational_status: status })
    .eq("id", roomId);

  if (error) return { success: false, error: "Não foi possível atualizar o quarto." };

  revalidateRoomViews(roomId);
  return { success: true, data: null };
}

export async function saveRoomAction(
  input: unknown,
  mode: "create" | "edit",
): Promise<ActionResult<string>> {
  const staff = await getStaffProfile();
  if (!staff) return { success: false, error: "Acesso restrito à equipe." };

  const parsed = roomInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const row = {
    id: parsed.data.id.toUpperCase(),
    name: parsed.data.name,
    category: parsed.data.category,
    capacity: parsed.data.capacity,
    base_price: parsed.data.basePrice,
    size: parsed.data.size || null,
    bed_type: parsed.data.bedType || null,
    operational_status: parsed.data.operationalStatus,
    images: [parsed.data.image],
    description: parsed.data.description || null,
    amenities: parsed.data.amenities,
    is_active: parsed.data.isActive,
  };

  const supabase = await createClient();

  if (mode === "create") {
    const { error } = await supabase.from("rooms").insert(row);
    if (error) {
      return {
        success: false,
        error: error.code === "23505" ? "Já existe um quarto com esse código." : "Não foi possível cadastrar o quarto.",
      };
    }
  } else {
    const { id, ...changes } = row;
    const { error } = await supabase.from("rooms").update(changes).eq("id", id);
    if (error) return { success: false, error: "Não foi possível salvar o quarto." };
  }

  revalidateRoomViews(row.id);
  return { success: true, data: row.id };
}
