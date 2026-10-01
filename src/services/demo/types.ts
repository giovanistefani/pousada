import type { Room } from "@/lib/types";

/** Estados só da demonstração. O banco real não usa requested/rejected. */
export const DEMO_STATUSES = [
  "requested",
  "confirmed",
  "checked_in",
  "checked_out",
  "rejected",
  "cancelled",
] as const;

export type DemoBookingStatus = (typeof DEMO_STATUSES)[number];

export type DemoAction =
  | "confirm"
  | "reject"
  | "cancel"
  | "check_in"
  | "check_out";

export type DemoRoom = Room;

export type DemoBooking = {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: DemoBookingStatus;
  notes: string | null;
  createdAt: string;
};

export type DemoEvent = {
  id: string;
  bookingId: string;
  fromStatus: DemoBookingStatus | null;
  toStatus: DemoBookingStatus;
  at: string;
};

export type DemoState = {
  version: 1;
  rooms: DemoRoom[];
  bookings: DemoBooking[];
  events: DemoEvent[];
};

export type DemoSearch = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  category: string;
};

export type RoomOffer = DemoRoom & { bookable: boolean };

export type DemoFailure = { ok: false; error: string };
export type DemoSuccess<T> = { ok: true; data: T };
