"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ActionResult } from "@/lib/types";
import { loginInputSchema } from "@/lib/validators";

export async function loginAction(input: unknown): Promise<ActionResult<null>> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase ainda não está configurado." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não foi possível abrir a sessão." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Esta conta não faz parte da equipe. Peça um perfil de staff no Supabase.",
    };
  }

  const next = parsed.data.next;
  const destination = next?.startsWith("/admin") ? next : "/admin/dashboard";
  redirect(destination);
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
