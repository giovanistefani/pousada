import { addDaysISO, nightsBetween } from "@/lib/dates";
import { DEMO_GUESTS } from "@/mocks/guests";
import { DEMO_ROOMS } from "@/mocks/rooms";
import { DEMO_NIGHTLY_RATES } from "@/mocks/rates";
import type { DemoBooking, DemoEvent, DemoState } from "@/services/demo/types";

function stay(
  id: string,
  roomId: string,
  guestIndex: number,
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  status: DemoBooking["status"],
  notes: string | null,
): DemoBooking {
  const guest = DEMO_GUESTS[guestIndex];
  const nights = nightsBetween(checkIn, checkOut);
  const room = DEMO_ROOMS.find((item) => item.id === roomId);
  return {
    id,
    roomId,
    guestName: guest.name,
    guestEmail: guest.email,
    guestPhone: guest.phone,
    adults,
    children,
    checkIn,
    checkOut,
    nights,
    totalPrice: (DEMO_NIGHTLY_RATES[roomId] ?? room?.base_price ?? 0) * nights,
    status,
    notes,
    createdAt: checkIn,
  };
}

/** Cenário inicial. Datas relativas a `today` para a demonstração não envelhecer. */
export function createSeedState(today: string): DemoState {
  const bookings: DemoBooking[] = [
    stay("VS-1001", "RM-101", 0, addDaysISO(today, -1), addDaysISO(today, 2), 2, 0, "checked_in", "Chegada na véspera. Dado fictício."),
    stay("VS-1002", "RM-102", 1, addDaysISO(today, 5), addDaysISO(today, 8), 2, 1, "requested", "Solicitação ainda sem retorno da equipe."),
    stay("VS-1003", "RM-104", 2, addDaysISO(today, 2), addDaysISO(today, 4), 1, 0, "requested", null),
    stay("VS-1004", "RM-106", 3, addDaysISO(today, 1), addDaysISO(today, 4), 2, 2, "confirmed", "Família com duas crianças."),
    stay("VS-1005", "RM-106", 4, addDaysISO(today, -4), today, 2, 0, "checked_out", "Saída hoje de manhã. Não bloqueia a noite de hoje."),
    stay("VS-1006", "RM-103", 5, addDaysISO(today, 3), addDaysISO(today, 5), 2, 0, "rejected", "Recusada. O período está livre."),
    stay("VS-1007", "RM-102", 6, addDaysISO(today, 10), addDaysISO(today, 12), 2, 0, "cancelled", "Cancelada. O período está livre."),
    stay("VS-1008", "RM-103", 7, addDaysISO(today, 8), addDaysISO(today, 10), 2, 0, "confirmed", "Confirmada para a semana seguinte."),
  ];

  const events: DemoEvent[] = bookings.map((booking) => ({
    id: `EV-${booking.id}`,
    bookingId: booking.id,
    fromStatus: null,
    toStatus: booking.status,
    at: `${booking.createdAt}T12:00:00.000Z`,
  }));

  return {
    version: 1,
    rooms: DEMO_ROOMS.map((room) => ({
      ...room,
      amenities: [...room.amenities],
      images: [...room.images],
    })),
    bookings,
    events,
  };
}
