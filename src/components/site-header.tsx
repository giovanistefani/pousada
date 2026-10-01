"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, SlidersHorizontal } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import type { StaffProfile } from "@/lib/types";

export function SiteHeader({
  staff,
  demo = false,
}: {
  staff: StaffProfile | null;
  demo?: boolean;
}) {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/95 text-stone-100 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-xl font-bold text-white shadow-md">
            VS
          </div>
          <div>
            <div className="font-serif text-xl font-bold tracking-wide text-amber-100">
              Pousada Villa Serena
            </div>
            <p className="hidden text-xs tracking-widest text-stone-400 uppercase sm:block">
              Charme, Natureza & Tranquilidade
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-stone-700 bg-stone-800 p-1 text-xs sm:text-sm">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition sm:px-4 ${
                !onAdmin && pathname !== "/login"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Portal do</span> Hóspede
            </Link>
            <Link
              href={staff || demo ? "/admin/dashboard" : "/login"}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium transition sm:px-4 ${
                onAdmin || pathname === "/login"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Painel</span> Gestão
            </Link>
          </div>

          {pathname === "/" && (
            <Link
              href="/consultar"
              className="hidden items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-medium text-stone-200 transition hover:bg-stone-700 md:flex"
            >
              <Search className="h-3.5 w-3.5 text-amber-400" />
              Consultar Reserva
            </Link>
          )}

          {staff && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-stone-700 px-3 py-2 text-xs font-medium text-stone-300 transition hover:bg-stone-800 hover:text-white"
              >
                Sair
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
