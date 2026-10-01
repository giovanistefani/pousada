"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BedDouble, CheckCircle2, LogIn, Mail, Phone, Sparkles } from "lucide-react";
import { transitionBookingAction } from "@/actions/bookings";
import { updateRoomStatusAction } from "@/actions/rooms";
import { RoomStatusBadge } from "@/components/status-badges";
import { KpiGrid } from "@/components/admin/kpi-grid";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import type { buildMetrics } from "@/lib/metrics";
import type { Booking, OperationalStatus, Room } from "@/lib/types";

type Metrics = ReturnType<typeof buildMetrics>;

export function DashboardView({
  rooms,
  metrics,
  today,
}: {
  rooms: Room[];
  metrics: Metrics;
  today: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <KpiGrid metrics={metrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Arrivals bookings={metrics.todayCheckIns} today={today} />
          <RoomBoard rooms={rooms} />
        </div>
        <div className="space-y-6">
          <Housekeeping rooms={rooms} metrics={metrics} />
          <aside className="rounded-2xl bg-stone-900 p-6 text-stone-200 shadow-sm">
            <h4 className="font-serif text-base font-bold text-white">Recepção Villa Serena</h4>
            <p className="mt-2 text-xs leading-relaxed text-stone-400">
              Atendimento das 07h00 às 22h00. Para emergências noturnas, acionar o ramal 009.
            </p>
            <div className="mt-4 space-y-2 text-xs text-stone-300">
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                (48) 3288-9900
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                reservas@pousadavillaserena.com.br
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Arrivals({ bookings, today }: { bookings: Booking[]; today: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-stone-900">
          <LogIn className="h-5 w-5 text-emerald-600" />
          Chegadas previstas para hoje
        </h3>
        <span className="text-xs text-stone-500">{formatDateBR(today)}</span>
      </div>
      {error && <p className="mb-3 text-xs text-red-700">{error}</p>}
      {bookings.length === 0 ? (
        <p className="rounded-xl bg-stone-50 py-4 text-center text-sm text-stone-500">
          Nenhum check-in pendente para hoje.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-bold text-stone-900">
                  {booking.guest_name}{" "}
                  <span className="text-xs font-normal text-stone-400">({booking.id})</span>
                </p>
                <p className="mt-0.5 text-xs text-stone-600">
                  {booking.room_name} • {booking.nights} noites • {booking.guests_count} hóspedes
                </p>
                {booking.special_requests && (
                  <p className="mt-1 inline-block rounded border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800 italic">
                    Nota: {booking.special_requests}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={pendingId === booking.id}
                onClick={() => {
                  setPendingId(booking.id);
                  startTransition(async () => {
                    const result = await transitionBookingAction(booking.id, "checked_in");
                    setPendingId(null);
                    if (!result.success) {
                      setError(result.error);
                      return;
                    }
                    setError(null);
                    router.refresh();
                  });
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Realizar check-in
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RoomBoard({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-stone-900">
          <BedDouble className="h-5 w-5 text-amber-700" />
          Quadro visual de acomodações
        </h3>
        <Link href="/admin/quartos" className="text-xs font-semibold text-amber-700 hover:underline">
          Gerenciar todos
        </Link>
      </div>
      {error && <p className="mb-3 text-xs text-red-700">{error}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded bg-stone-200/70 px-2 py-0.5 font-mono text-xs font-bold text-stone-700">
                {room.id}
              </span>
              <RoomStatusBadge status={room.operational_status} />
            </div>
            <h4 className="line-clamp-1 text-xs font-semibold text-stone-900">{room.name}</h4>
            <p className="mt-0.5 text-[11px] text-stone-500">{formatBRL(room.base_price)}/noite</p>
            <label className="mt-3 flex items-center justify-between border-t border-stone-200/60 pt-2 text-[11px] text-stone-400">
              Alterar
              <select
                value={room.operational_status}
                onChange={(event) => {
                  const status = event.target.value as OperationalStatus;
                  void updateRoomStatusAction(room.id, status).then((result) => {
                    if (!result.success) {
                      setError(result.error);
                      return;
                    }
                    setError(null);
                    router.refresh();
                  });
                }}
                className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-700"
              >
                <option value="available">Disponível</option>
                <option value="occupied">Ocupado</option>
                <option value="cleaning">Limpeza</option>
                <option value="maintenance">Manutenção</option>
              </select>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function Housekeeping({ rooms, metrics }: { rooms: Room[]; metrics: Metrics }) {
  const router = useRouter();
  const cleaning = rooms.filter((room) => room.operational_status === "cleaning");

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-stone-900">
        <Sparkles className="h-5 w-5 text-sky-600" />
        Governança e limpeza
      </h3>
      {cleaning.length === 0 ? (
        <p className="rounded-xl bg-stone-50 py-3 text-center text-xs text-stone-500">
          Nenhum quarto com limpeza pendente.
        </p>
      ) : (
        <div className="space-y-2.5">
          {cleaning.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/70 p-3"
            >
              <div>
                <span className="block text-xs font-bold text-sky-950">{room.name}</span>
                <span className="text-[11px] text-sky-700">{room.id}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void updateRoomStatusAction(room.id, "available").then((result) => {
                    if (result.success) router.refresh();
                  });
                }}
                className="rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Pronto
              </button>
            </div>
          ))}
        </div>
      )}
      <dl className="mt-6 space-y-1.5 border-t border-stone-100 pt-4 text-xs text-stone-600">
        <Stat label="Disponíveis" value={metrics.availableCount} className="text-emerald-700" />
        <Stat label="Ocupados" value={metrics.occupiedCount} className="text-amber-700" />
        <Stat label="Limpeza" value={metrics.cleaningCount} className="text-sky-700" />
        <Stat label="Manutenção" value={metrics.maintenanceCount} className="text-rose-700" />
      </dl>
    </section>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className={`font-bold ${className}`}>{value}</dd>
    </div>
  );
}
