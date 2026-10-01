import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isDemoOnly, isSupabaseConfigured } from "@/lib/supabase/env";

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_DEMO_ONLY",
] as const;

const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const value = saved[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("seleção do modo", () => {
  it("sem variáveis permanece na demonstração", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_DEMO_ONLY;
    assert.equal(isDemoOnly(), false);
    assert.equal(isSupabaseConfigured(), false);
  });

  it("com URL e chave segue o fluxo real", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-de-teste";
    delete process.env.NEXT_PUBLIC_DEMO_ONLY;
    assert.equal(isSupabaseConfigured(), true);
  });

  it("NEXT_PUBLIC_DEMO_ONLY=true ignora as chaves do Supabase", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-de-teste";
    process.env.NEXT_PUBLIC_DEMO_ONLY = "true";
    assert.equal(isSupabaseConfigured(), false);
  });
});
