import { DashboardView } from "@/components/admin/dashboard-view";
import { DemoHousekeeping } from "@/components/demo/demo-admin";
import { todayISO } from "@/lib/dates";
import { buildMetrics } from "@/lib/metrics";
import { listBookingsForStaff, listRoomsForStaff } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function GovernancaPage() {
  if (!isSupabaseConfigured()) return <DemoHousekeeping />;

  const [rooms, bookings] = await Promise.all([
    listRoomsForStaff(),
    listBookingsForStaff(),
  ]);
  const today = todayISO();

  return (
    <DashboardView rooms={rooms} metrics={buildMetrics(rooms, bookings, today)} today={today} />
  );
}
