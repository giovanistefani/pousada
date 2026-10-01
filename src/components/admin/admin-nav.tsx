"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/dashboard", label: "Visão Geral" },
  { href: "/admin/governanca", label: "Quartos & Governança" },
  { href: "/admin/quartos", label: "Cadastro" },
  { href: "/admin/reservas", label: "Todas as Reservas" },
];

export function AdminNav({ fullName }: { fullName: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800 uppercase">
              Backoffice
            </span>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Painel Operacional da Pousada
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            {fullName} • ocupação, hóspedes e governança
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 self-start rounded-xl border border-stone-200 bg-stone-100 p-1 sm:self-auto">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
