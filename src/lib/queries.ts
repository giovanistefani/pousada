import { mapBooking, mapRoom } from "@/lib/mappers";
import { createClient } from "@/lib/supabase/server";
import type { Booking, Room } from "@/lib/types";

const BOOKING_COLUMNS = `
  id,
  room_id,
  guest_name,
  guest_email,
  guest_phone,
  guests_count,
  check_in,
  check_out,
  nights,
  total_price,
  status,
  special_requests,
  created_at,
  rooms ( name )
`;

export async function listRoomsForStaff(): Promise<Room[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, name, category, capacity, base_price, size, bed_type, amenities, operational_status, images, description, is_active",
    )
    .order("id");

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRoom).filter((room): room is Room => room !== null);
}

export async function listBookingsForStaff(): Promise<Booking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .order("check_in", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map(mapBooking)
    .filter((booking): booking is Booking => booking !== null);
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id, name, category, capacity, base_price, size, bed_type, amenities, operational_status, images, description, is_active",
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return mapRoom(data);
}
