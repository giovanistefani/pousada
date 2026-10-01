import { GuestPortal } from "@/components/portal/guest-portal";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <GuestPortal supabaseConfigured={isSupabaseConfigured()} />;
}
