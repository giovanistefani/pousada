"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";

export function LoginForm({
  nextPath,
  initialError,
}: {
  nextPath?: string;
  initialError?: string | null;
}) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await loginAction({
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
            next: nextPath,
          });
          if (result && !result.success) setError(result.error);
        });
      }}
    >
      <label className="block text-xs font-semibold text-stone-700">
        E-mail
        <input
          required
          type="email"
          name="email"
          autoComplete="username"
          className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </label>
      <label className="block text-xs font-semibold text-stone-700">
        Senha
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={6}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
        />
      </label>
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-amber-700 py-3 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
