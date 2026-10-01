"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { messages } from "@/i18n";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import { RoomStatusBadge } from "@/components/status-badges";
import { DemoStatusBadge } from "@/components/demo/demo-status";
import { useDemoStore } from "@/hooks/demo-store";
import type { DemoAction, DemoBooking } from "@/services/demo/types";

const links = [
  { href: "/admin/dashboard", label: "Visão geral" },
  { href: "/admin/reservas", label: "Solicitações" },
  { href: "/admin/calendario", label: "Calendário" },
  { href: "/admin/governanca", label: "Quartos" },
  { href: "/admin/quartos", label: "Tarifas" },
];

export function DemoAdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const copy = messages();
  const store = useDemoStore();
  const [notice, setNotice] = useState<string | null>(null);

  function restore() {
    if (!window.confirm(copy.restoreConfirm)) return;
    store.restore();
    setNotice("Dados demonstrativos restaurados.");
  }

  return (
    <div className="flex-1 bg-stone-100/60 pb-16">
      <p className="bg-amber-800 px-4 py-2 text-center text-xs font-semibold tracking-wide text-amber-50">
        {copy.demoBanner}
      </p>
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">Painel demonstrativo</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Sem login. As mudanças ficam neste navegador.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={restore}
              className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
            >
              {copy.restore}
            </button>
          </div>
        </div>
      </div>
      {notice && (
        <p className="mx-auto mt-4 max-w-7xl px-4 text-sm text-emerald-800 sm:px-6 lg:px-8">{notice}</p>
      )}
      {children}
    </div>
  );
}

export function DemoDashboard() {
  const store = useDemoStore();
  const cards = [
    ["Quartos", store.metrics.totalRooms],
    ["Ocupados", store.metrics.occupied],
    ["Disponíveis", store.metrics.available],
    ["Solicitações", store.metrics.pendingRequests],
    ["Confirmadas", store.metrics.confirmed],
    ["Check-ins", store.metrics.checkIns],
    ["Check-outs", store.metrics.checkOuts],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm text-stone-500">Indicadores calculados do cenário atual desta demonstração.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">{label}</p>
            <p className="mt-2 font-serif text-3xl font-bold text-stone-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <DemoRequestList limit={5} />
      </div>
    </div>
  );
}

export function DemoRequestsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <DemoRequestList />
    </div>
  );
}

function DemoRequestList({ limit }: { limit?: number }) {
  const store = useDemoStore();
  const copy = messages();
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<DemoAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const rows = store.state.bookings.slice(0, limit ?? store.state.bookings.length);
  const current = store.state.bookings.find((booking) => booking.id === selected) ?? null;

  function roomName(roomId: string) {
    return store.state.rooms.find((room) => room.id === roomId)?.name ?? roomId;
  }

  function run(action: DemoAction) {
    if (!current) return;
    const result = store.act(current.id, action);
    setPending(null);
    setFeedback(result.ok ? `${copy.actions[action]} concluída.` : result.error);
  }

  return (
    <div>
      {feedback && (
        <p className="mb-4 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800">{feedback}</p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
            <tr>
              <th className="px-3 py-3">Código</th>
              <th className="px-3 py-3">Hóspede</th>
              <th className="px-3 py-3">Quarto</th>
              <th className="px-3 py-3">Entrada</th>
              <th className="px-3 py-3">Saída</th>
              <th className="px-3 py-3">Hóspedes</th>
              <th className="px-3 py-3">Valor</th>
              <th className="px-3 py-3">Pedido</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((booking) => (
              <tr key={booking.id} className="border-t border-stone-100">
                <td className="px-3 py-3 font-mono text-xs font-semibold text-amber-900">{booking.id}</td>
                <td className="px-3 py-3">{booking.guestName}</td>
                <td className="px-3 py-3">{roomName(booking.roomId)}</td>
                <td className="px-3 py-3">{formatDateBR(booking.checkIn)}</td>
                <td className="px-3 py-3">{formatDateBR(booking.checkOut)}</td>
                <td className="px-3 py-3">{booking.adults + booking.children}</td>
                <td className="px-3 py-3">{formatBRL(booking.totalPrice)}</td>
                <td className="px-3 py-3">{formatDateBR(booking.createdAt)}</td>
                <td className="px-3 py-3">
                  <button type="button" onClick={() => { setSelected(booking.id); setFeedback(null); }} className="text-left">
                    <DemoStatusBadge status={booking.status} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {current && (
        <DemoDetail
          booking={current}
          roomName={roomName(current.roomId)}
          events={store.state.events.filter((event) => event.bookingId === current.id)}
          onClose={() => setSelected(null)}
          onAsk={setPending}
        />
      )}
      {current && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-stone-900">{copy.actions[pending]}</h3>
            <p className="mt-2 text-sm text-stone-600">
              {current.id} • {current.guestName}. A disponibilidade pública acompanha esta mudança.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPending(null)} className="rounded-xl border border-stone-300 px-4 py-2 text-sm">
                Voltar
              </button>
              <button type="button" onClick={() => run(pending)} className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoDetail({
  booking,
  roomName,
  events,
  onClose,
  onAsk,
}: {
  booking: DemoBooking;
  roomName: string;
  events: { id: string; fromStatus: DemoBooking["status"] | null; toStatus: DemoBooking["status"] }[];
  onClose: () => void;
  onAsk: (action: DemoAction) => void;
}) {
  const copy = messages();
  const actions: DemoAction[] =
    booking.status === "requested"
      ? ["confirm", "reject", "cancel"]
      : booking.status === "confirmed"
        ? ["check_in", "cancel"]
        : booking.status === "checked_in"
          ? ["check_out"]
          : [];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-bold text-amber-900">{booking.id}</p>
            <h3 className="font-serif text-2xl font-bold text-stone-900">{booking.guestName}</h3>
          </div>
          <DemoStatusBadge status={booking.status} />
        </div>
        <dl className="mt-4 space-y-2 text-sm text-stone-700">
          <div className="flex justify-between gap-4"><dt>Quarto</dt><dd>{roomName}</dd></div>
          <div className="flex justify-between gap-4"><dt>Período</dt><dd>{formatDateBR(booking.checkIn)} → {formatDateBR(booking.checkOut)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Hóspedes</dt><dd>{booking.adults} adultos, {booking.children} crianças</dd></div>
          <div className="flex justify-between gap-4"><dt>Valor estimado</dt><dd>{formatBRL(booking.totalPrice)}</dd></div>
          <div className="flex justify-between gap-4"><dt>E-mail</dt><dd>{booking.guestEmail}</dd></div>
          <div className="flex justify-between gap-4"><dt>Telefone</dt><dd>{booking.guestPhone}</dd></div>
        </dl>
        {booking.notes && <p className="mt-3 text-sm text-stone-500">{booking.notes}</p>}
        <h4 className="mt-5 text-xs font-semibold tracking-wide text-stone-500 uppercase">Histórico</h4>
        <ul className="mt-2 space-y-1 text-sm text-stone-700">
          {events.map((event) => (
            <li key={event.id}>
              {event.fromStatus ? `${copy.statuses[event.fromStatus]} → ` : ""}
              {copy.statuses[event.toStatus]}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAsk(action)}
              className="rounded-xl bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
            >
              {copy.actions[action]}
            </button>
          ))}
          <button type="button" onClick={onClose} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-600">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoHousekeeping() {
  const store = useDemoStore();
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
      {store.state.rooms.map((room) => (
        <article key={room.id} className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs text-stone-500">{room.id}</p>
          <h3 className="font-serif text-lg font-bold text-stone-900">{room.name}</h3>
          <div className="mt-3">
            <RoomStatusBadge status={room.operational_status} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function DemoRates() {
  const store = useDemoStore();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm text-stone-500">
        A estimativa usa só a diária base. Não há tarifa de fim de semana nem cobrança extra por criança.
      </p>
      <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        {store.state.rooms.map((room) => (
          <li key={room.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span>
              <span className="block font-semibold text-stone-900">{room.name}</span>
              <span className="text-stone-500">Até {room.capacity} hóspedes</span>
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">{formatBRL(room.base_price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
