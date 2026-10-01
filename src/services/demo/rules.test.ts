import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDaysISO } from "@/lib/dates";
import { messages } from "@/i18n";
import { createSeedState } from "@/mocks/seed";
import {
  applyAction,
  calculateBookingPrice,
  coversNight,
  createBooking,
  getAvailableRooms,
  hasConflict,
  parseStored,
  restoreDemoData,
  summarize,
} from "@/services/demo/rules";

const today = "2026-10-01";
const random = () => 0.42;

function seed() {
  return createSeedState(today);
}

describe("disponibilidade", () => {
  it("bloqueia o quarto assim que a solicitação é criada", () => {
    const created = createBooking(
      seed(),
      {
        roomId: "RM-104",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 1,
        children: 0,
        checkIn: addDaysISO(today, 12),
        checkOut: addDaysISO(today, 14),
      },
      { today, random },
    );
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal(created.data.booking.status, "requested");
    assert.equal(
      hasConflict(
        created.data.state,
        "RM-104",
        addDaysISO(today, 12),
        addDaysISO(today, 14),
      ),
      true,
    );
  });

  it("rejeita sobreposição no mesmo quarto", () => {
    const result = createBooking(
      seed(),
      {
        roomId: "RM-101",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 2,
        children: 0,
        checkIn: today,
        checkOut: addDaysISO(today, 1),
      },
      { today, random },
    );
    assert.equal(result.ok, false);
  });

  it("permite estadia que começa no dia do check-out anterior", () => {
    const result = createBooking(
      seed(),
      {
        roomId: "RM-101",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 2,
        children: 0,
        checkIn: addDaysISO(today, 2),
        checkOut: addDaysISO(today, 4),
      },
      { today, random },
    );
    assert.equal(result.ok, true);
  });

  it("mantém o bloqueio enquanto a solicitação está pendente", () => {
    const state = seed();
    assert.equal(
      hasConflict(state, "RM-102", addDaysISO(today, 5), addDaysISO(today, 8)),
      true,
    );
  });

  it("libera o período ao recusar", () => {
    const rejected = applyAction(seed(), "VS-1002", "reject", "2026-10-01T12:00:00.000Z");
    assert.equal(rejected.ok, true);
    if (!rejected.ok) return;
    assert.equal(
      hasConflict(rejected.data, "RM-102", addDaysISO(today, 5), addDaysISO(today, 8)),
      false,
    );
  });

  it("libera o período ao cancelar", () => {
    const cancelled = applyAction(seed(), "VS-1004", "cancel", "2026-10-01T12:00:00.000Z");
    assert.equal(cancelled.ok, true);
    if (!cancelled.ok) return;
    assert.equal(
      hasConflict(cancelled.data, "RM-106", addDaysISO(today, 1), addDaysISO(today, 4)),
      false,
    );
  });

  it("encerra o bloqueio no checkout", () => {
    const done = applyAction(seed(), "VS-1001", "check_out", "2026-10-01T12:00:00.000Z");
    assert.equal(done.ok, true);
    if (!done.ok) return;
    assert.equal(hasConflict(done.data, "RM-101", addDaysISO(today, -1), addDaysISO(today, 2)), false);
    assert.equal(
      done.data.rooms.find((room) => room.id === "RM-101")?.operational_status,
      "cleaning",
    );
  });

  it("respeita a capacidade do quarto", () => {
    const result = createBooking(
      seed(),
      {
        roomId: "RM-104",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 2,
        children: 2,
        checkIn: addDaysISO(today, 12),
        checkOut: addDaysISO(today, 14),
      },
      { today, random },
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.error, /comporta/);
  });
});

describe("estados", () => {
  it("aceita transições válidas", () => {
    const confirmed = applyAction(seed(), "VS-1002", "confirm");
    assert.equal(confirmed.ok, true);
    if (!confirmed.ok) return;
    const hosted = applyAction(confirmed.data, "VS-1002", "check_in");
    assert.equal(hosted.ok, true);
    if (!hosted.ok) return;
    const left = applyAction(hosted.data, "VS-1002", "check_out");
    assert.equal(left.ok, true);
  });

  it("impede transições inválidas", () => {
    assert.equal(applyAction(seed(), "VS-1004", "reject").ok, false);
    assert.equal(applyAction(seed(), "VS-1002", "check_in").ok, false);
    assert.equal(applyAction(seed(), "VS-1001", "cancel").ok, false);
  });

  it("atualiza os indicadores do painel", () => {
    const before = summarize(seed());
    const confirmed = applyAction(seed(), "VS-1002", "confirm");
    assert.equal(confirmed.ok, true);
    if (!confirmed.ok) return;
    const after = summarize(confirmed.data);
    assert.equal(after.pendingRequests, before.pendingRequests - 1);
    assert.equal(after.confirmed, before.confirmed + 1);
    const hosted = applyAction(confirmed.data, "VS-1002", "check_in");
    assert.equal(hosted.ok, true);
    if (!hosted.ok) return;
    assert.equal(summarize(hosted.data).checkIns, before.checkIns + 1);
    assert.equal(
      hosted.data.rooms.find((room) => room.id === "RM-102")?.operational_status,
      "occupied",
    );
  });

  it("marca no calendário as noites ocupadas e deixa o dia de saída livre", () => {
    const state = seed();
    const stay = state.bookings.find((booking) => booking.id === "VS-1004");
    assert.ok(stay);
    assert.equal(coversNight(stay, addDaysISO(today, 1)), true);
    assert.equal(coversNight(stay, addDaysISO(today, 3)), true);
    assert.equal(coversNight(stay, addDaysISO(today, 4)), false);
    const offers = getAvailableRooms(state, {
      checkIn: addDaysISO(today, 4),
      checkOut: addDaysISO(today, 5),
      adults: 2,
      children: 0,
      category: "all",
    });
    assert.equal(offers.ok, true);
    if (!offers.ok) return;
    assert.equal(offers.data.find((room) => room.id === "RM-106")?.bookable, true);
  });
});

describe("persistência", () => {
  it("recupera um estado gravado e ignora conteúdo inválido", () => {
    const state = seed();
    const raw = JSON.stringify(state);
    assert.deepEqual(parseStored(raw), state);
    assert.equal(parseStored("{"), null);
    assert.equal(parseStored("{}"), null);
    assert.equal(parseStored(JSON.stringify({ ...state, version: 2 })), null);
  });

  it("restaura o cenário inicial", () => {
    const created = createBooking(
      seed(),
      {
        roomId: "RM-104",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 1,
        children: 0,
        checkIn: addDaysISO(today, 12),
        checkOut: addDaysISO(today, 14),
      },
      { today, random },
    );
    assert.equal(created.ok, true);
    assert.deepEqual(restoreDemoData(today), seed());
  });

  it("gera o mesmo cenário inicial para a mesma data, sem ler armazenamento", () => {
    assert.deepEqual(createSeedState(today), createSeedState(today));
    assert.equal(createSeedState(today).version, 1);
  });
});

describe("interface", () => {
  it("usa a mensagem de recebimento e não a de reserva confirmada", () => {
    const copy = messages();
    assert.equal(
      copy.requestReceived,
      "Sua solicitação foi recebida! O período solicitado foi bloqueado no sistema demonstrativo. Nossa equipe entrará em contato para confirmar os detalhes da hospedagem.",
    );
    assert.equal(copy.requestReceived.includes("reserva confirmada"), false);
    assert.match(copy.demoNote, /demonstração/i);
  });

  it("devolve indisponibilidade quando o quarto deixa de estar livre", () => {
    const result = createBooking(
      seed(),
      {
        roomId: "RM-102",
        guestName: "Helena Teste",
        guestEmail: "helena@example.com",
        guestPhone: "48900001111",
        adults: 2,
        children: 0,
        checkIn: addDaysISO(today, 6),
        checkOut: addDaysISO(today, 7),
      },
      { today, random },
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, messages().unavailable);
  });

  it("calcula o total pela diária vezes as noites", () => {
    const price = calculateBookingPrice(340, addDaysISO(today, 12), addDaysISO(today, 15));
    assert.equal(price.ok, true);
    if (!price.ok) return;
    assert.equal(price.nights, 3);
    assert.equal(price.total, 1020);
  });
});
