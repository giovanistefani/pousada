import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { RealtimeRefresh } from "@/components/admin/realtime-refresh";
import { DemoAdminChrome } from "@/components/demo/demo-admin";
import { getStaffProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <DemoAdminChrome>{children}</DemoAdminChrome>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await getStaffProfile();
  if (!staff) {
    redirect("/login?error=perfil");
  }

  return (
    <div className="flex-1 bg-stone-100/60 pb-16">
      <RealtimeRefresh enabled />
      <AdminNav fullName={staff.fullName} />
      {children}
    </div>
  );
}
