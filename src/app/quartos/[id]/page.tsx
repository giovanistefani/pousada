import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoRoomPage } from "@/components/demo/demo-room-page";
import { formatBRL, roomImage } from "@/lib/format";
import { getRoomById } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return (
      <Suspense fallback={null}>
        <DemoRoomPage roomId={id} />
      </Suspense>
    );
  }
  const room = await getRoomById(id);

  if (!room) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={roomImage(room)}
        alt={room.name}
        className="h-72 w-full rounded-3xl object-cover"
      />
      <p className="mt-6 text-xs font-semibold tracking-widest text-amber-800 uppercase">
        {room.category}
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-stone-900">{room.name}</h1>
      <p className="mt-4 text-stone-600">{room.description}</p>
      <p className="mt-4 text-sm text-stone-500">
        Até {room.capacity} hóspedes • {room.size} • {room.bed_type}
      </p>
      <p className="mt-2 font-serif text-2xl font-bold text-stone-900">
        {formatBRL(room.base_price)} <span className="text-sm font-sans font-normal text-stone-500">/ noite</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {room.amenities.map((item) => (
          <span key={item} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
            {item}
          </span>
        ))}
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800"
      >
        Verificar datas e reservar
      </Link>
    </main>
  );
}
