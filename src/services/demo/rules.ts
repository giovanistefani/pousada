import { nightsBetween, rangesOverlap, todayISO } from "@/lib/dates";
import { createSeedState } from "@/mocks/seed";
import type {
  DemoAction,
  DemoBooking,
  DemoBookingStatus,
  DemoFailure,
  DemoSearch,
  DemoState,
  DemoSuccess,
  RoomOffer,
} from "@/services/demo/types";

export const DEMO_STORAGE_KEY = "pousada-demo-v1";
export const DEMO_STORAGE_VERSION = 1;

const BLOCKING = new Set<DemoBookingStatus>([
  "requested",
  "confirmed",
  "checked_in",
]);

const ACTION_TO_STATUS: Record<DemoAction, DemoBookingStatus> = {
  confirm: "confirmed",
  reject: "rejected",
  cancel: "cancelled",
  check_in: "checked_in",
  check_out: "checked_out",
};

const ALLOWED: Record<DemoBookingStatus, DemoBookingStatus[]> = {
  requested: ["confirmed", "rejected", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  rejected: [],
  cancelled: [],
};

export function blocksPeriod(status: DemoBookingStatus) {
  return BLOCKING.has(status);
}

export function guestTotal(adults: number, children: number) {
  return adults + children;
}

export function canTransition(from: DemoBookingStatus, to: DemoBookingStatus) {
  return ALLOWED[from].includes(to);
}

export function calculateBookingPrice(
  nightlyRate: number,
  checkIn: string,
  checkOut: string,
) {
  const nights = nightsBetween(checkIn, checkOut);
  if (!Number.isFinite(nightlyRate) || nightlyRate < 0) {
    return { ok: false as const, error: "Tarifa do quarto inválida." };
  }
  if (nights <= 0) {
    return {
      ok: false as const,
      error: "A data de check-out precisa ser posterior ao check-in.",
    };
  }
  if (nights > 60) {
    return {
      ok: false as const,
      error: "Estadias acima de 60 diárias devem ser tratadas pela recepção.",
    };
  }
  return { ok: true as const, nights, total: nightlyRate * nights };
}

export function hasConflict(
  state: DemoState,
  roomId: string,
  checkIn: string,
  checkOut: string,
  ignoreBookingId?: string,
) {
  return state.bookings.some(
    (booking) =>
      booking.roomId === roomId &&
      booking.id !== ignoreBookingId &&
      blocksPeriod(booking.status) &&
      rangesOverlap(booking.checkIn, booking.checkOut, checkIn, checkOut),
  );
}

export function getRooms(state: DemoState) {
  return state.rooms;
}

export function getBookings(state: DemoState) {
  return [...state.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export function getAvailableRooms(state: DemoState, query: DemoSearch): DemoSuccess<RoomOffer[]> | DemoFailure {
  const nights = nightsBetween(query.checkIn, query.checkOut);
  if (nights <= 0) {
    return { ok: false, error: "A data de check-out precisa ser posterior ao check-in." };
  }
  if (query.adults < 1) {
    return { ok: false, error: "Informe pelo menos um adulto." };
  }
  if (query.children < 0) {
    return { ok: false, error: "A quantidade de crianças não pode ser negativa." };
  }

  const guests = guestTotal(query.adults, query.children);
  const rooms = state.rooms
    .filter((room) => room.is_active)
    .filter((room) => (query.category === "all" ? true : room.category === query.category))
    .filter((room) => room.capacity >= guests)
    .map((room) => ({
      ...room,
      bookable:
        room.operational_status !== "maintenance" &&
        !hasConflict(state, room.id, query.checkIn, query.checkOut),
    }));

  return { ok: true, data: rooms };
}

export type CreateInput = {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  adults: number;
  children: number;
  checkIn: string;
  checkOut: string;
  notes?: string;
};

function nextCode(existing: string[], random: () => number) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `VS-${1000 + Math.floor(random() * 9000)}`;
    if (!existing.includes(code)) return code;
  }
  return `VS-${String(Math.floor(random() * 1_000_000)).padStart(6, "0")}`;
}

export function createBooking(
  state: DemoState,
  input: CreateInput,
  options?: { today?: string; random?: () => number; now?: string },
): DemoSuccess<{ state: DemoState; booking: DemoBooking }> | DemoFailure {
  const today = options?.today ?? todayISO();
  const name = input.guestName.trim();
  const email = input.guestEmail.trim().toLowerCase();
  const phone = input.guestPhone.trim();

  if (name.length < 3) return { ok: false, error: "Nome completo é obrigatório." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "E-mail inválido." };
  }
  if (phone.length < 8) return { ok: false, error: "Telefone inválido." };
  if (input.adults < 1) return { ok: false, error: "Informe pelo menos um adulto." };
  if (input.children < 0) return { ok: false, error: "A quantidade de crianças não pode ser negativa." };
  if (input.checkIn < today) {
    return { ok: false, error: "A data de check-in não pode estar no passado." };
  }

  const room = state.rooms.find((item) => item.id === input.roomId && item.is_active);
  if (!room) return { ok: false, error: "Quarto não encontrado." };
  if (room.operational_status === "maintenance") {
    return { ok: false, error: "Este quarto está em manutenção e não aceita solicitações." };
  }

  const guests = guestTotal(input.adults, input.children);
  if (guests > room.capacity) {
    return { ok: false, error: "A acomodação não comporta essa quantidade de hóspedes." };
  }

  const price = calculateBookingPrice(room.base_price, input.checkIn, input.checkOut);
  if (!price.ok) return price;

  if (hasConflict(state, room.id, input.checkIn, input.checkOut)) {
    return { ok: false, error: "Este quarto não está mais disponível para o período escolhido." };
  }

  const booking: DemoBooking = {
    id: nextCode(state.bookings.map((item) => item.id), options?.random ?? Math.random),
    roomId: room.id,
    guestName: name,
    guestEmail: email,
    guestPhone: phone,
    adults: input.adults,
    children: input.children,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: price.nights,
    totalPrice: price.total,
    status: "requested",
    notes: input.notes?.trim() ? input.notes.trim() : null,
    createdAt: today,
  };

  const next: DemoState = {
    ...state,
    bookings: [booking, ...state.bookings],
    events: [
      {
        id: `EV-${booking.id}`,
        bookingId: booking.id,
        fromStatus: null,
        toStatus: "requested",
        at: options?.now ?? new Date().toISOString(),
      },
      ...state.events,
    ],
  };

  return { ok: true, data: { state: next, booking } };
}

export function applyAction(
  state: DemoState,
  bookingId: string,
  action: DemoAction,
  now = new Date().toISOString(),
): DemoSuccess<DemoState> | DemoFailure {
  const current = state.bookings.find((booking) => booking.id === bookingId);
  if (!current) return { ok: false, error: "Solicitação não encontrada." };

  const target = ACTION_TO_STATUS[action];
  if (!canTransition(current.status, target)) {
    return { ok: false, error: "Esta mudança de status não é permitida." };
  }

  const bookings = state.bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status: target } : booking,
  );

  let rooms = state.rooms;
  if (target === "checked_in") {
    rooms = state.rooms.map((room) =>
      room.id === current.roomId ? { ...room, operational_status: "occupied" } : room,
    );
  }
  if (target === "checked_out") {
    rooms = state.rooms.map((room) =>
      room.id === current.roomId ? { ...room, operational_status: "cleaning" } : room,
    );
  }

  return {
    ok: true,
    data: {
      ...state,
      rooms,
      bookings,
      events: [
        {
          id: `EV-${bookingId}-${target}-${state.events.length + 1}`,
          bookingId,
          fromStatus: current.status,
          toStatus: target,
          at: now,
        },
        ...state.events,
      ],
    },
  };
}

export function restoreDemoData(today = todayISO()): DemoState {
  return createSeedState(today);
}

export function summarize(state: DemoState) {
  return {
    totalRooms: state.rooms.length,
    occupied: state.rooms.filter((room) => room.operational_status === "occupied").length,
    available: state.rooms.filter((room) => room.operational_status === "available").length,
    pendingRequests: state.bookings.filter((booking) => booking.status === "requested").length,
    confirmed: state.bookings.filter((booking) => booking.status === "confirmed").length,
    checkIns: state.bookings.filter((booking) => booking.status === "checked_in").length,
    checkOuts: state.bookings.filter((booking) => booking.status === "checked_out").length,
  };
}

export function coversNight(booking: DemoBooking, day: string) {
  return blocksPeriod(booking.status) && booking.checkIn <= day && day < booking.checkOut;
}

export function isValidDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DemoState>;
  if (record.version !== DEMO_STORAGE_VERSION) return false;
  if (!Array.isArray(record.rooms) || !Array.isArray(record.bookings) || !Array.isArray(record.events)) {
    return false;
  }
  return record.rooms.every((room) => room && typeof room === "object" && typeof (room as DemoState["rooms"][number]).id === "string")
    && record.bookings.every((booking) => {
      if (!booking || typeof booking !== "object") return false;
      const status = (booking as DemoBooking).status;
      return BLOCKING.has(status) || status === "checked_out" || status === "rejected" || status === "cancelled";
    });
}

export function parseStored(raw: string): DemoState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidDemoState(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
