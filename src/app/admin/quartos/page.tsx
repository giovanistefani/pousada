import { RoomsManager } from "@/components/admin/rooms-manager";
import { DemoRates } from "@/components/demo/demo-admin";
import { listRoomsForStaff } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function QuartosPage() {
  if (!isSupabaseConfigured()) return <DemoRates />;

  const rooms = await listRoomsForStaff();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <RoomsManager rooms={rooms} />
    </div>
  );
}
