import { messages } from "@/i18n";
import type { DemoBookingStatus } from "@/services/demo/types";

const styles: Record<DemoBookingStatus, string> = {
  requested: "bg-amber-100 text-amber-900",
  confirmed: "bg-blue-100 text-blue-800",
  checked_in: "bg-emerald-100 text-emerald-800",
  checked_out: "bg-zinc-200 text-zinc-700",
  rejected: "bg-rose-100 text-rose-800",
  cancelled: "bg-red-100 text-red-700",
};

export function DemoStatusBadge({ status }: { status: DemoBookingStatus }) {
  const copy = messages();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {copy.statuses[status]}
    </span>
  );
}
