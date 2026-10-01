import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { messages } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin/dashboard";
  const initialError =
    params.error === "perfil"
      ? "Esta conta autenticou, mas ainda não tem perfil de equipe na tabela profiles."
      : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <p className="text-xs font-semibold tracking-widest text-amber-800 uppercase">Equipe</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900">Acesso da recepção</h1>
      <p className="mt-2 text-sm text-stone-500">
        Entre com o usuário criado no Supabase Auth e vinculado a um perfil staff ou admin.
      </p>
      {!isSupabaseConfigured() ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {messages().demoBanner}. O login real fica desligado sem as variáveis do Supabase.
          </p>
          <Link
            href="/admin/dashboard"
            className="inline-flex rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
          >
            Abrir painel demonstrativo
          </Link>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <LoginForm nextPath={nextPath} initialError={initialError} />
        </div>
      )}
    </main>
  );
}
