import { BookingsTable } from "@/components/admin/bookings-table";
import { KpiGrid } from "@/components/admin/kpi-grid";
import { DemoRequestsPage } from "@/components/demo/demo-admin";
import { todayISO } from "@/lib/dates";
import { buildMetrics } from "@/lib/metrics";
import { listBookingsForStaff, listRoomsForStaff } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ReservasPage() {
  if (!isSupabaseConfigured()) return <DemoRequestsPage />;

  const [rooms, bookings] = await Promise.all([
    listRoomsForStaff(),
    listBookingsForStaff(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <KpiGrid metrics={buildMetrics(rooms, bookings, todayISO())} />
      <BookingsTable bookings={bookings} />
    </div>
  );
}
