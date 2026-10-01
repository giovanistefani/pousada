import { DEMO_ROOMS } from "@/mocks/rooms";

/**
 * A demonstração só conhece a diária base de cada quarto.
 * Não há tarifa de fim de semana, feriado, temporada nem acréscimo por hóspede.
 */
export const DEMO_NIGHTLY_RATES = Object.fromEntries(
  DEMO_ROOMS.map((room) => [room.id, room.base_price]),
) as Record<string, number>;
