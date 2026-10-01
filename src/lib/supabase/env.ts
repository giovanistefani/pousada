export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

/**
 * Trava o site publicado na demonstração mesmo se alguém cadastrar
 * as chaves do Supabase no build. Sem esta variável, o comportamento
 * local permanece: sem URL e chave, demonstração; com as duas, fluxo real.
 */
export function isDemoOnly() {
  return process.env.NEXT_PUBLIC_DEMO_ONLY === "true";
}

export function isSupabaseConfigured() {
  if (isDemoOnly()) return false;
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
