"use server";

import { revalidatePath } from "next/cache";
import { nightsBetween } from "@/lib/dates";
import { mapBooking, mapRoom } from "@/lib/mappers";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getStaffProfile } from "@/lib/auth";
import type { ActionResult, Booking, ConfirmedBooking, Room } from "@/lib/types";
import {
  bookingInputSchema,
  lookupInputSchema,
  searchInputSchema,
} from "@/lib/validators";

function revalidateBookingViews(roomId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reservas");
  revalidatePath("/admin/governanca");
  revalidatePath("/admin/quartos");
  if (roomId) revalidatePath(`/quartos/${roomId}`);
}

export async function searchRoomsAction(input: {
  checkIn: string;
  checkOut: string;
  guests: number;
  category: string;
}): Promise<ActionResult<Room[]>> {
  const parsed = searchInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Busca inválida." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase ainda não está configurado." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_available_rooms", {
    p_check_in: parsed.data.checkIn,
    p_check_out: parsed.data.checkOut,
    p_guests: parsed.data.guests,
    p_category: parsed.data.category,
  });

  if (error) {
    return { success: false, error: "Não foi possível consultar a disponibilidade." };
  }

  const payload = data as { success?: boolean; error?: string; rooms?: unknown[] } | null;
  if (!payload?.success) {
    return { success: false, error: payload?.error ?? "Não foi possível consultar a disponibilidade." };
  }

  const rooms = (payload.rooms ?? [])
    .map(mapRoom)
    .filter((room): room is Room => room !== null);

  return { success: true, data: rooms };
}

export async function createBookingAction(
  input: unknown,
): Promise<ActionResult<ConfirmedBooking>> {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (nightsBetween(parsed.data.checkIn, parsed.data.checkOut) <= 0) {
    return { success: false, error: "A data de check-out precisa ser posterior ao check-in." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "As reservas reais dependem do Supabase. Configure as variáveis de ambiente.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_booking_atomic", {
    p_room_id: parsed.data.roomId,
    p_guest_name: parsed.data.guestName,
    p_guest_email: parsed.data.guestEmail,
    p_guest_phone: parsed.data.guestPhone,
    p_guests_count: parsed.data.guestsCount,
    p_check_in: parsed.data.checkIn,
    p_check_out: parsed.data.checkOut,
    p_special_requests: parsed.data.specialRequests || null,
  });

  if (error) {
    return { success: false, error: "Falha na comunicação com o banco de dados." };
  }

  const payload = data as {
    success?: boolean;
    error?: string;
    booking_id?: string;
    room_name?: string;
    guest_name?: string;
    check_in?: string;
    check_out?: string;
    nights?: number;
    total_price?: number;
  } | null;

  if (!payload?.success || !payload.booking_id) {
    return { success: false, error: payload?.error ?? "Não foi possível criar a reserva." };
  }

  revalidateBookingViews(parsed.data.roomId);

  return {
    success: true,
    data: {
      bookingId: payload.booking_id,
      roomName: payload.room_name ?? parsed.data.roomId,
      guestName: payload.guest_name ?? parsed.data.guestName,
      checkIn: String(payload.check_in).slice(0, 10),
      checkOut: String(payload.check_out).slice(0, 10),
      nights: Number(payload.nights),
      totalPrice: Number(payload.total_price),
    },
  };
}

export async function lookupBookingAction(input: {
  code: string;
  email: string;
}): Promise<ActionResult<Booking>> {
  const parsed = lookupInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase ainda não está configurado." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lookup_booking", {
    p_id: parsed.data.code,
    p_email: parsed.data.email,
  });

  if (error) {
    return { success: false, error: "Não foi possível consultar a reserva." };
  }

  const payload = data as { success?: boolean; error?: string; booking?: unknown } | null;
  if (!payload?.success) {
    return { success: false, error: payload?.error ?? "Nenhuma reserva encontrada com esses dados." };
  }

  const booking = mapBooking(payload.booking);
  if (!booking) {
    return { success: false, error: "Nenhuma reserva encontrada com esses dados." };
  }

  return { success: true, data: booking };
}

export async function transitionBookingAction(
  bookingId: string,
  status: "checked_in" | "checked_out" | "cancelled",
): Promise<ActionResult<null>> {
  const staff = await getStaffProfile();
  if (!staff) return { success: false, error: "Acesso restrito à equipe." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("transition_booking", {
    p_id: bookingId,
    p_status: status,
  });

  if (error) {
    return { success: false, error: "Não foi possível atualizar a reserva." };
  }

  const payload = data as { success?: boolean; error?: string } | null;
  if (!payload?.success) {
    return { success: false, error: payload?.error ?? "Não foi possível atualizar a reserva." };
  }

  revalidateBookingViews();
  return { success: true, data: null };
}
