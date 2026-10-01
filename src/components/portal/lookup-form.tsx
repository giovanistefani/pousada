"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { lookupBookingAction } from "@/actions/bookings";
import { DemoStatusBadge } from "@/components/demo/demo-status";
import { BookingStatusBadge } from "@/components/status-badges";
import { useDemoStoreOptional } from "@/hooks/demo-store";
import { messages } from "@/i18n";
import { formatDateBR } from "@/lib/dates";
import { formatBRL } from "@/lib/format";
import type { Booking } from "@/lib/types";
import type { DemoBooking } from "@/services/demo/types";

export function LookupForm({ supabaseConfigured }: { supabaseConfigured: boolean }) {
  const copy = messages();
  const demoStore = useDemoStoreOptional();
  const demoMode = !supabaseConfigured && demoStore !== null;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [demoBooking, setDemoBooking] = useState<DemoBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-3xl font-bold text-stone-900">Consultar minha reserva</h1>
      <p className="mt-2 text-sm text-stone-500">
        Informe o código localizador e o mesmo e-mail usado na reserva. Os dois dados são
        necessários para abrir o voucher.
      </p>
      {demoMode && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {copy.demoBanner}. Experimente VS-1001 com ana.demo@example.com.
        </p>
      )}
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const code = String(form.get("code") ?? "");
          const email = String(form.get("email") ?? "");
          setError(null);
          setBooking(null);
          setDemoBooking(null);

          if (demoMode && demoStore) {
            const found = demoStore.state.bookings.find(
              (item) =>
                item.id.toLowerCase() === code.trim().toLowerCase() &&
                item.guestEmail.toLowerCase() === email.trim().toLowerCase(),
            );
            if (!found) {
              setError("Nenhuma solicitação encontrada com esses dados.");
              return;
            }
            setDemoBooking(found);
            return;
          }

          startTransition(async () => {
            const result = await lookupBookingAction({ code, email });
            if (!result.success) {
              setError(result.error);
              return;
            }
            setBooking(result.data);
          });
        }}
      >
        <label className="block text-xs font-semibold text-stone-700">
          Código localizador
          <input
            required
            name="code"
            placeholder="VS-8821"
            className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-stone-700">
          E-mail da reserva
          <input
            required
            type="email"
            name="email"
            className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
        >
          <Search className="h-3.5 w-3.5" />
          {pending ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {demoBooking && demoStore && (
        <div className="mt-6 space-y-2 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="font-mono font-bold text-amber-900">{demoBooking.id}</span>
            <DemoStatusBadge status={demoBooking.status} />
          </div>
          <p className="font-bold text-stone-900">{demoBooking.guestName}</p>
          <p className="text-stone-500">
            {demoStore.state.rooms.find((room) => room.id === demoBooking.roomId)?.name}
          </p>
          <p>
            <strong>Datas:</strong> {formatDateBR(demoBooking.checkIn)} até{" "}
            {formatDateBR(demoBooking.checkOut)} ({demoBooking.nights} noites)
          </p>
          <p>
            <strong>Valor estimado:</strong> {formatBRL(demoBooking.totalPrice)}
          </p>
          <p className="text-xs text-stone-500">{copy.demoNote}</p>
        </div>
      )}

      {booking && (
        <div className="mt-6 space-y-2 rounded-2xl border border-stone-200 bg-white p-4 text-sm">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="font-mono font-bold text-amber-900">{booking.id}</span>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="font-bold text-stone-900">{booking.guest_name}</p>
          <p className="text-stone-500">{booking.room_name}</p>
          <p>
            <strong>Datas:</strong> {formatDateBR(booking.check_in)} até{" "}
            {formatDateBR(booking.check_out)} ({booking.nights} noites)
          </p>
          <p>
            <strong>Valor total:</strong> {formatBRL(booking.total_price)}
          </p>
        </div>
      )}
    </div>
  );
}
