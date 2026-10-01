import type { BookingStatus, OperationalStatus } from "@/lib/types";

const roomStyles: Record<OperationalStatus, string> = {
  available: "bg-emerald-100 text-emerald-800 border-emerald-300",
  occupied: "bg-amber-100 text-amber-800 border-amber-300",
  cleaning: "bg-sky-100 text-sky-800 border-sky-300",
  maintenance: "bg-rose-100 text-rose-800 border-rose-300",
};

const roomLabels: Record<OperationalStatus, string> = {
  available: "Disponível",
  occupied: "Ocupado",
  cleaning: "Limpeza pendente",
  maintenance: "Em manutenção",
};

const roomDots: Record<OperationalStatus, string> = {
  available: "bg-emerald-600",
  occupied: "bg-amber-600",
  cleaning: "bg-sky-600",
  maintenance: "bg-rose-600",
};

const bookingStyles: Record<BookingStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  checked_in: "bg-emerald-100 text-emerald-800",
  checked_out: "bg-zinc-200 text-zinc-700",
  cancelled: "bg-red-100 text-red-700",
};

const bookingLabels: Record<BookingStatus, string> = {
  pending_payment: "Pagamento pendente",
  confirmed: "Confirmada",
  checked_in: "Check-in realizado",
  checked_out: "Finalizada",
  cancelled: "Cancelada",
};

export function RoomStatusBadge({ status }: { status: OperationalStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roomStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${roomDots[status]}`} />
      {roomLabels[status]}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bookingStyles[status]}`}
    >
      {bookingLabels[status]}
    </span>
  );
}
