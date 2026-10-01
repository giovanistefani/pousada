"use client";

import { useMemo, useState } from "react";
import { addDaysISO, formatDateBR, todayISO } from "@/lib/dates";
import { coversNight } from "@/services/demo/rules";
import { useDemoStore } from "@/hooks/demo-store";
import type { DemoBookingStatus } from "@/services/demo/types";

const DAY_COUNT = 14;

const cell: Record<DemoBookingStatus, string> = {
  requested: "bg-amber-200 text-amber-950",
  confirmed: "bg-blue-200 text-blue-950",
  checked_in: "bg-emerald-200 text-emerald-950",
  checked_out: "bg-zinc-100 text-zinc-500",
  rejected: "bg-rose-100 text-rose-700",
  cancelled: "bg-red-100 text-red-700",
};

export function DemoCalendar() {
  const store = useDemoStore();
  const [start, setStart] = useState(() => todayISO());
  const days = useMemo(
    () => Array.from({ length: DAY_COUNT }, (_, index) => addDaysISO(start, index)),
    [start],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {formatDateBR(days[0])} — {formatDateBR(days[days.length - 1])}. A noite do check-out fica livre.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setStart(addDaysISO(start, -7))} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold">
            Semana anterior
          </button>
          <button type="button" onClick={() => setStart(todayISO())} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold">
            Hoje
          </button>
          <button type="button" onClick={() => setStart(addDaysISO(start, 7))} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold">
            Próxima semana
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="min-w-[920px] w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-stone-50 px-3 py-2 text-left">Quarto</th>
              {days.map((day) => (
                <th key={day} className="px-1 py-2 text-center font-medium text-stone-500">
                  {formatDateBR(day).slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {store.state.rooms.map((room) => (
              <tr key={room.id} className="border-t border-stone-100">
                <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-semibold text-stone-800">
                  {room.name}
                </th>
                {days.map((day) => {
                  const booking = store.state.bookings.find((item) => item.roomId === room.id && coversNight(item, day));
                  return (
                    <td key={day} className="p-1">
                      {booking ? (
                        <span className={`block truncate rounded px-1 py-2 ${cell[booking.status]}`} title={booking.guestName}>
                          {booking.guestName.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="block rounded bg-stone-50 px-1 py-2 text-stone-300">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
