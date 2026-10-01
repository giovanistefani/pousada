"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { nightsBetween } from "@/lib/dates";
import { formatBRL, roomImage } from "@/lib/format";
import { messages } from "@/i18n";
import { useDemoStore } from "@/hooks/demo-store";
import { RoomStatusBadge } from "@/components/status-badges";

export function DemoRoomPage({ roomId }: { roomId: string }) {
  const store = useDemoStore();
  const copy = messages();
  const params = useSearchParams();
  const room = store.state.rooms.find((item) => item.id === roomId);
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  if (!room) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-stone-600">Quarto não encontrado nesta demonstração.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {copy.demoBanner}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={roomImage(room)} alt={room.name} className="h-72 w-full rounded-3xl object-cover" />
      <p className="mt-6 text-xs font-semibold tracking-widest text-amber-800 uppercase">{room.category}</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-stone-900">{room.name}</h1>
      <p className="mt-4 text-stone-600">{room.description}</p>
      <div className="mt-4">
        <RoomStatusBadge status={room.operational_status} />
      </div>
      <p className="mt-4 text-sm text-stone-500">
        Até {room.capacity} hóspedes • {room.size} • {room.bed_type}
      </p>
      <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
        {formatBRL(room.base_price)} <span className="font-sans text-sm font-normal text-stone-500">/ noite</span>
      </p>
      {nights > 0 && (
        <p className="mt-2 text-sm text-stone-700">
          {nights} {nights === 1 ? "noite" : "noites"} • estimado {formatBRL(room.base_price * nights)}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {room.amenities.map((item) => (
          <span key={item} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
            {item}
          </span>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-flex rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800">
        Verificar datas e solicitar
      </Link>
    </main>
  );
}
