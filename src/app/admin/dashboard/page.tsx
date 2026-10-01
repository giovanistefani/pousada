import { DemoDashboard } from "@/components/demo/demo-admin";
import { DashboardView } from "@/components/admin/dashboard-view";
import { todayISO } from "@/lib/dates";
import { buildMetrics } from "@/lib/metrics";
import { listBookingsForStaff, listRoomsForStaff } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <DemoDashboard />;

  const [rooms, bookings] = await Promise.all([
    listRoomsForStaff(),
    listBookingsForStaff(),
  ]);
  const today = todayISO();

  return <DashboardView rooms={rooms} metrics={buildMetrics(rooms, bookings, today)} today={today} />;
}
