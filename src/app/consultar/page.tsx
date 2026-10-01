import { LookupForm } from "@/components/portal/lookup-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default function ConsultarPage() {
  return <LookupForm supabaseConfigured={isSupabaseConfigured()} />;
}
