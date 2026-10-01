export const ROOM_CATEGORIES = [
  "Suíte Master",
  "Chalé Jardim",
  "Suíte Romântica",
  "Standard",
  "Família",
] as const;

export const OPERATIONAL_STATUSES = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
] as const;

export const BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Room = {
  id: string;
  name: string;
  category: string;
  capacity: number;
  base_price: number;
  size: string | null;
  bed_type: string | null;
  amenities: string[];
  operational_status: OperationalStatus;
  images: string[];
  description: string | null;
  is_active: boolean;
  bookable?: boolean;
};

export type Booking = {
  id: string;
  room_id: string;
  room_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guests_count: number;
  check_in: string;
  check_out: string;
  nights: number;
  total_price: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
};

export type ConfirmedBooking = {
  bookingId: string;
  roomName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
};

export type StaffProfile = {
  id: string;
  fullName: string;
  role: "staff" | "admin";
};

export type ActionFailure = { success: false; error: string };
export type ActionSuccess<T> = { success: true; data: T };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;
