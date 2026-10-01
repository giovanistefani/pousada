import { redirect } from "next/navigation";
import { DemoCalendar } from "@/components/demo/demo-calendar";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function CalendarioPage() {
  if (isSupabaseConfigured()) redirect("/admin/dashboard");
  return <DemoCalendar />;
}
