import type { ReactNode } from "react";
import { DollarSign, LogIn, LogOut, TrendingUp } from "lucide-react";
import { formatBRL } from "@/lib/format";
import type { buildMetrics } from "@/lib/metrics";

type Metrics = ReturnType<typeof buildMetrics>;

export function KpiGrid({ metrics }: { metrics: Metrics }) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
            Taxa de ocupação
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-2xl font-bold text-stone-900">
            {metrics.occupancyRate}%
          </span>
          <span className="text-xs text-stone-500">
            ({metrics.occupiedCount} de {metrics.totalRooms})
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-amber-600"
            style={{ width: `${metrics.occupancyRate}%` }}
          />
        </div>
      </article>
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <Header icon={<LogIn className="h-4 w-4" />} tone="emerald" label="Check-ins hoje" />
        <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
          {metrics.todayCheckIns.length}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">Chegadas confirmadas</p>
      </article>
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <Header icon={<LogOut className="h-4 w-4" />} tone="sky" label="Check-outs hoje" />
        <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
          {metrics.todayCheckOuts.length}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">Liberações programadas</p>
      </article>
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <Header icon={<DollarSign className="h-4 w-4" />} tone="amber" label="Receita confirmada" />
        <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
          {formatBRL(metrics.activeRevenue)}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {metrics.activeBookingCount} reservas não canceladas
        </p>
      </article>
    </div>
  );
}

function Header({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: "emerald" | "sky" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">{label}</span>
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
        {icon}
      </div>
    </div>
  );
}
