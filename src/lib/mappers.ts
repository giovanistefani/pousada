import type { Booking, BookingStatus, OperationalStatus, Room } from "@/lib/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const ROOM_STATUSES = new Set([
  "available",
  "occupied",
  "cleaning",
  "maintenance",
]);

const BOOKING_STATUSES = new Set([
  "pending_payment",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
]);

export function mapRoom(value: unknown): Room | null {
  const row = asRecord(value);
  if (!row || typeof row.id !== "string") return null;
  const status = asString(row.operational_status, "available");
  return {
    id: row.id,
    name: asString(row.name),
    category: asString(row.category),
    capacity: asNumber(row.capacity),
    base_price: asNumber(row.base_price),
    size: typeof row.size === "string" ? row.size : null,
    bed_type: typeof row.bed_type === "string" ? row.bed_type : null,
    amenities: asStringArray(row.amenities),
    operational_status: (ROOM_STATUSES.has(status)
      ? status
      : "available") as OperationalStatus,
    images: asStringArray(row.images),
    description: typeof row.description === "string" ? row.description : null,
    is_active: row.is_active !== false,
    bookable: typeof row.bookable === "boolean" ? row.bookable : undefined,
  };
}

export function mapBooking(value: unknown): Booking | null {
  const row = asRecord(value);
  if (!row || typeof row.id !== "string") return null;
  const status = asString(row.status, "confirmed");
  const nested = asRecord(row.rooms) ?? (Array.isArray(row.rooms) ? asRecord(row.rooms[0]) : null);
  const checkIn = asString(row.check_in).slice(0, 10);
  const checkOut = asString(row.check_out).slice(0, 10);

  return {
    id: row.id,
    room_id: asString(row.room_id),
    room_name: asString(row.room_name) || asString(nested?.name) || asString(row.room_id),
    guest_name: asString(row.guest_name),
    guest_email: asString(row.guest_email),
    guest_phone: asString(row.guest_phone),
    guests_count: asNumber(row.guests_count),
    check_in: checkIn,
    check_out: checkOut,
    nights: asNumber(row.nights),
    total_price: asNumber(row.total_price),
    status: (BOOKING_STATUSES.has(status) ? status : "confirmed") as BookingStatus,
    special_requests:
      typeof row.special_requests === "string" ? row.special_requests : null,
    created_at: asString(row.created_at).slice(0, 10),
  };
}
