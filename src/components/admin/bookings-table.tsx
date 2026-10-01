"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { transitionBookingAction } from "@/actions/bookings";
import { BookingStatusBadge } from "@/components/status-badges";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (status !== "all" && booking.status !== status) return false;
      if (!term) return true;
      return (
        booking.guest_name.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term)
      );
    });
  }, [bookings, query, status]);

  function transition(id: string, next: "checked_in" | "checked_out" | "cancelled") {
    setPendingId(id);
    startTransition(async () => {
      const result = await transitionBookingAction(id, next);
      setPendingId(null);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-center">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Reservas registradas</h3>
          <p className="mt-1 text-xs text-stone-500">
            Check-in, check-out e cancelamento. Cancelar libera o período na trava de overbooking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hóspede ou código"
              className="w-48 rounded-lg border border-stone-300 py-1.5 pr-3 pl-8 text-xs sm:w-56"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as "all" | BookingStatus)}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs"
          >
            <option value="all">Todos os status</option>
            <option value="confirmed">Confirmada</option>
            <option value="checked_in">Check-in realizado</option>
            <option value="checked_out">Finalizada</option>
            <option value="cancelled">Cancelada</option>
            <option value="pending_payment">Pagamento pendente</option>
          </select>
        </div>
      </div>
      {error && <p className="mt-4 text-xs text-red-700">{error}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 font-semibold tracking-wider text-stone-500 uppercase">
              <th className="px-3 py-3">Código / hóspede</th>
              <th className="px-3 py-3">Acomodação</th>
              <th className="px-3 py-3">Check-in / out</th>
              <th className="px-3 py-3">Noites</th>
              <th className="px-3 py-3">Valor</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {visible.map((booking) => (
              <tr key={booking.id} className="hover:bg-stone-50">
                <td className="px-3 py-3.5">
                  <span className="block font-mono font-bold text-amber-900">{booking.id}</span>
                  <span className="font-semibold text-stone-900">{booking.guest_name}</span>
                  <span className="block text-[11px] text-stone-400">{booking.guest_phone}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className="font-medium text-stone-800">{booking.room_name}</span>
                  <span className="block text-[11px] text-stone-400">
                    {booking.guests_count} hóspedes
                  </span>
                </td>
                <td className="px-3 py-3.5 font-medium">
                  <div>{formatDateBR(booking.check_in)}</div>
                  <div className="text-[11px] text-stone-400">
                    até {formatDateBR(booking.check_out)}
                  </div>
                </td>
                <td className="px-3 py-3.5 font-semibold">{booking.nights}</td>
                <td className="px-3 py-3.5 font-bold text-stone-900">
                  {formatBRL(booking.total_price)}
                </td>
                <td className="px-3 py-3.5">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-3 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => transition(booking.id, "checked_in")}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Check-in
                      </button>
                    )}
                    {booking.status === "checked_in" && (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => transition(booking.id, "checked_out")}
                        className="rounded bg-stone-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
                      >
                        Check-out
                      </button>
                    )}
                    {booking.status !== "cancelled" && booking.status !== "checked_out" && (
                      <button
                        type="button"
                        disabled={pendingId === booking.id}
                        onClick={() => transition(booking.id, "cancelled")}
                        className="rounded px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-500">Nenhuma reserva neste filtro.</p>
        )}
      </div>
    </section>
  );
}
