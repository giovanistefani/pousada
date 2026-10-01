"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Sparkles,
  Sun,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { createBookingAction, searchRoomsAction } from "@/actions/bookings";
import { messages } from "@/i18n";
import { useDemoStoreOptional } from "@/hooks/demo-store";
import { nightsBetween, todayISO, addDaysISO, formatDateBR } from "@/lib/dates";
import { DEMO_ROOMS } from "@/mocks/rooms";
import { formatBRL, roomImage } from "@/lib/format";
import type { ConfirmedBooking, Room } from "@/lib/types";
import { ROOM_CATEGORIES } from "@/lib/types";

type Receipt = ConfirmedBooking & { demo?: boolean };

type Props = {
  supabaseConfigured: boolean;
};

export function GuestPortal({ supabaseConfigured }: Props) {
  const copy = messages();
  const demoStore = useDemoStoreOptional();
  const demoMode = !supabaseConfigured && demoStore !== null;
  const [checkIn, setCheckIn] = useState(() => todayISO());
  const [checkOut, setCheckOut] = useState(() => addDaysISO(todayISO(), 1));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [category, setCategory] = useState("all");
  const [liveRooms, setLiveRooms] = useState<Room[]>([]);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!supabaseConfigured);
  const [pendingSearch, startSearch] = useTransition();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmed, setConfirmed] = useState<Receipt | null>(null);
  const guestCount = adults + children;
  const demoOffer = demoStore
    ? demoStore.search({ checkIn, checkOut, adults, children, category })
    : null;
  const rooms = demoMode ? (demoOffer?.ok ? demoOffer.data : []) : liveRooms;
  const searchError = demoMode ? (demoOffer && !demoOffer.ok ? demoOffer.error : null) : liveError;

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut],
  );

  function runSearch(next?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    category?: string;
  }) {
    const query = {
      checkIn: next?.checkIn ?? checkIn,
      checkOut: next?.checkOut ?? checkOut,
      guests: next?.guests ?? guestCount,
      category: next?.category ?? category,
    };

    if (demoMode) {
      setHasSearched(true);
      return;
    }

    startSearch(async () => {
      const result = await searchRoomsAction(query);
      setHasSearched(true);
      if (!result.success) {
        setLiveRooms([]);
        setLiveError(result.error);
        return;
      }
      setLiveError(null);
      setLiveRooms(result.data);
    });
  }

  return (
    <main className="flex-1 pb-16">
      <section className="relative overflow-hidden bg-stone-900 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 brightness-90"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-600/30 px-3 py-1 text-xs tracking-wider text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Refúgio na Serra & Gastronomia
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-amber-50 sm:text-5xl md:text-6xl">
            Viva dias inesquecíveis em meio à natureza
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light text-stone-300 sm:text-lg">
            Chalés acolhedores, banheiras de hidromassagem aquecidas e café da
            manhã artesanal servido com vista para o vale.
          </p>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-10 max-w-6xl px-4">
        {demoMode && (
          <p className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {copy.demoBanner}. A busca usa o cenário fictício deste navegador.
          </p>
        )}
        <form
          className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xl sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            runSearch();
          }}
        >
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-600 uppercase">
                Data de Check-in
              </span>
              <span className="relative block">
                <Calendar className="absolute top-3.5 left-3 h-4 w-4 text-amber-700" />
                <input
                  type="date"
                  required
                  min={todayISO()}
                  value={checkIn}
                  onChange={(event) => setCheckIn(event.target.value)}
                  className="w-full rounded-xl border border-stone-300 py-2.5 pr-3 pl-9 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-600 uppercase">
                Data de Check-out
              </span>
              <span className="relative block">
                <Calendar className="absolute top-3.5 left-3 h-4 w-4 text-amber-700" />
                <input
                  type="date"
                  required
                  min={checkIn}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="w-full rounded-xl border border-stone-300 py-2.5 pr-3 pl-9 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-600 uppercase">
                  Adultos
                </span>
                <select
                  value={adults}
                  onChange={(event) => setAdults(Number(event.target.value))}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-600 uppercase">
                  Crianças
                </span>
                <select
                  value={children}
                  onChange={(event) => setChildren(Number(event.target.value))}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 px-3 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {[0, 1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wider text-stone-600 uppercase">
                Estilo de Quarto
              </span>
              <span className="relative block">
                <BedDouble className="absolute top-3.5 left-3 h-4 w-4 text-amber-700" />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pr-3 pl-9 text-sm text-stone-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="all">Todas as categorias</option>
                  {ROOM_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-stone-700">Período selecionado:</span>
              <span>
                {nights > 0 ? `${nights} ${nights === 1 ? "diária" : "diárias"}` : "datas inválidas"}
              </span>
              <span>•</span>
              <span>
                Capacidade mínima: {guestCount} {guestCount === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
            <button
              type="submit"
              disabled={pendingSearch}
              className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
            >
              {pendingSearch ? "Buscando..." : "Ver disponibilidade"}
            </button>
          </div>
        </form>
      </div>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
            Nossas Acomodações
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {hasSearched
              ? `${rooms.length} ${rooms.length === 1 ? "opção" : "opções"} para a sua busca`
              : "Escolha as datas e veja o que está livre"}
          </p>
          {searchError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {searchError}
            </p>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
            <BedDouble className="mx-auto mb-3 h-12 w-12 text-stone-300" />
            <h3 className="text-lg font-semibold text-stone-700">
              {hasSearched ? "Nenhum quarto encontrado" : "Busque um período"}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">
              Ajuste as datas, a categoria ou a quantidade de hóspedes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const bookable = room.bookable !== false && nights > 0;
              return (
                <article
                  key={room.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:shadow-lg"
                >
                  <div className="relative h-60 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={roomImage(room)}
                      alt={room.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full border border-amber-400/20 bg-stone-900/80 px-3 py-1 text-xs font-semibold text-amber-200 backdrop-blur">
                        {room.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur ${
                          bookable
                            ? "bg-emerald-600/90 text-white"
                            : "bg-stone-900/80 text-stone-300"
                        }`}
                      >
                        {bookable ? "Disponível no período" : "Indisponível nestas datas"}
                      </span>
                    </div>
                    <div className="absolute right-3 bottom-3 rounded-xl bg-stone-900/90 px-3 py-1.5 text-white backdrop-blur">
                      <span className="text-xs text-stone-300">diária a partir de</span>
                      <div className="text-lg font-bold text-amber-300">
                        {formatBRL(room.base_price)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-serif text-xl leading-snug font-bold text-stone-900">
                        <Link
                          href={`/quartos/${room.id}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
                          className="hover:text-amber-800"
                        >
                          {room.name}
                        </Link>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                        {room.description}
                      </p>
                      <div className="my-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-amber-700" />
                          <span>Até {room.capacity} hóspedes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-3.5 w-3.5 text-amber-700" />
                          <span>{room.bed_type}</span>
                        </div>
                      </div>
                      <div className="mb-6 flex flex-wrap gap-1.5">
                        {room.amenities.map((item) => (
                          <span
                            key={item}
                            className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                      <div>
                        <span className="block text-xs text-stone-500">
                          Total ({nights > 0 ? nights : "—"} noites)
                        </span>
                        <span className="font-serif text-xl font-bold text-stone-900">
                          {nights > 0 ? formatBRL(room.base_price * nights) : "—"}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!bookable || (!demoMode && !supabaseConfigured)}
                        onClick={() => setSelectedRoom(room)}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                      >
                        {demoMode ? "Solicitar" : "Reservar agora"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {demoMode && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-stone-900">{copy.gallery}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DEMO_ROOMS.map((room) => (
              <Link key={room.id} href={`/quartos/${room.id}`} className="group overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={roomImage(room)} alt={room.name} className="h-36 w-full object-cover transition group-hover:scale-105" />
                <p className="mt-2 text-sm font-medium text-stone-700">{room.name}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone-500">
            {copy.contactTitle}: {copy.contactPhone} • {copy.contactEmail}. {copy.demoNote}
          </p>
        </section>
      )}

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-900/20 bg-amber-900/10 p-8 sm:p-12">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h3 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
              A Experiência Villa Serena
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Cada detalhe é preparado para desconectar da rotina e reconectar com o bem-estar.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 text-stone-800 md:grid-cols-3">
            <Experience
              icon={<Coffee className="h-6 w-6" />}
              title="Café Colonial Artesanal"
              text="Pães de fermentação natural, geleias da propriedade, bolos quentes e queijos da região."
            />
            <Experience
              icon={<Sun className="h-6 w-6" />}
              title="Trilhas e Mirantes"
              text="Acesso privativo a nascentes, trilhas arborizadas e mirante do pôr do sol."
            />
            <Experience
              icon={<Wifi className="h-6 w-6" />}
              title="Conexão & Conforto"
              text="Internet fibra em todos os chalés, caso precise trabalhar antes de relaxar."
            />
          </div>
        </div>
      </section>

      {selectedRoom && (
        <BookingDialog
          room={selectedRoom}
          demoMode={demoMode}
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          childGuests={children}
          nights={nights}
          onClose={() => setSelectedRoom(null)}
          onConfirmed={(booking) => {
            setSelectedRoom(null);
            setConfirmed(booking);
            runSearch();
          }}
        />
      )}

      {confirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {confirmed.demo ? copy.requestTitle : "Reserva confirmada"}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              {confirmed.demo ? copy.requestReceived : "Aguardamos sua visita na Pousada Villa Serena."}
            </p>
            {confirmed.demo && (
              <p className="mt-2 text-xs text-stone-500">{copy.demoNote}</p>
            )}
            <div className="my-6 space-y-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left text-xs">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-stone-500">Código localizador</span>
                <span className="font-mono text-base font-bold text-amber-900">
                  {confirmed.bookingId}
                </span>
              </div>
              <Row label="Hóspede" value={confirmed.guestName} />
              <Row label="Quarto" value={confirmed.roomName} />
              <Row
                label="Entrada / saída"
                value={`${formatDateBR(confirmed.checkIn)} → ${formatDateBR(confirmed.checkOut)}`}
              />
              <div className="flex justify-between pt-1 font-bold text-stone-900">
                <span>Total</span>
                <span>{formatBRL(confirmed.totalPrice)}</span>
              </div>
            </div>
            <p className="mb-6 text-[11px] text-stone-400">
              {confirmed.demo
                ? "Guarde o código para acompanhar a solicitação fictícia em Consultar."
                : "Guarde o código e o e-mail usados na reserva para consultar o voucher."}
            </p>
            <button
              type="button"
              onClick={() => setConfirmed(null)}
              className="w-full rounded-xl bg-stone-900 py-3 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-stone-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Experience({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-bold text-stone-900">{title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-stone-600">{text}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-semibold text-stone-800">{value}</span>
    </div>
  );
}

function BookingDialog({
  room,
  demoMode,
  checkIn,
  checkOut,
  adults,
  childGuests,
  nights,
  onClose,
  onConfirmed,
}: {
  room: Room;
  demoMode: boolean;
  checkIn: string;
  checkOut: string;
  adults: number;
  childGuests: number;
  nights: number;
  onClose: () => void;
  onConfirmed: (booking: Receipt) => void;
}) {
  const copy = messages();
  const demoStore = useDemoStoreOptional();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const guests = adults + childGuests;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          {demoMode ? "Solicitação" : "Reserva imediata"}
        </span>
        <h3 className="mt-2 font-serif text-2xl font-bold text-stone-900">
          {demoMode ? "Solicitar hospedagem" : "Confirmar reserva"}
        </h3>
        <p className="mt-1 text-xs text-stone-500">
          {room.name} • {nights} {nights === 1 ? "diária" : "diárias"}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs">
          <div>
            <span className="block text-stone-500">Período selecionado</span>
            <span className="font-semibold text-stone-800">
              {formatDateBR(checkIn)} até {formatDateBR(checkOut)}
            </span>
            <span className="mt-0.5 block text-stone-400">{guests} hóspedes</span>
          </div>
          <div className="text-right">
            <span className="block text-stone-500">Total estimado</span>
            <span className="font-serif text-xl font-bold text-amber-800">
              {formatBRL(room.base_price * nights)}
            </span>
          </div>
        </div>
        <form
          className="mt-6 space-y-4 text-sm"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setError(null);
            if (demoMode && demoStore) {
              const result = demoStore.requestStay({
                roomId: room.id,
                guestName: String(form.get("name") ?? ""),
                guestEmail: String(form.get("email") ?? ""),
                guestPhone: String(form.get("phone") ?? ""),
                adults,
                children: childGuests,
                checkIn,
                checkOut,
                notes: String(form.get("notes") ?? ""),
              });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              onConfirmed({
                bookingId: result.data.booking.id,
                roomName: room.name,
                guestName: result.data.booking.guestName,
                checkIn: result.data.booking.checkIn,
                checkOut: result.data.booking.checkOut,
                nights: result.data.booking.nights,
                totalPrice: result.data.booking.totalPrice,
                demo: true,
              });
              return;
            }
            startTransition(async () => {
              const result = await createBookingAction({
                roomId: room.id,
                guestName: String(form.get("name") ?? ""),
                guestEmail: String(form.get("email") ?? ""),
                guestPhone: String(form.get("phone") ?? ""),
                guestsCount: guests,
                checkIn,
                checkOut,
                specialRequests: String(form.get("notes") ?? ""),
              });
              if (!result.success) {
                setError(result.error);
                return;
              }
              onConfirmed(result.data);
            });
          }}
        >
          <label className="block text-xs font-semibold text-stone-700">
            Nome completo do titular
            <input
              required
              name="name"
              minLength={3}
              className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-stone-700">
              E-mail para confirmação
              <input
                required
                type="email"
                name="email"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-semibold text-stone-700">
              WhatsApp / telefone
              <input
                required
                type="tel"
                name="phone"
                minLength={8}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </label>
          </div>
          <label className="block text-xs font-semibold text-stone-700">
            Pedidos especiais (opcional)
            <textarea
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <div className="flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-xs text-amber-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <span>
              {demoMode
                ? copy.demoNote
                : "O valor é calculado no banco. O pagamento pode ser feito no check-in via PIX ou cartão."}
            </span>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 px-4 py-2.5 font-semibold text-stone-600 hover:bg-stone-50"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-amber-700 px-6 py-2.5 font-bold text-white shadow-md transition hover:bg-amber-800 disabled:opacity-60"
            >
              {pending ? "Enviando..." : demoMode ? "Enviar solicitação" : "Concluir reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
