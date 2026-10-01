"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Plus, X } from "lucide-react";
import { saveRoomAction } from "@/actions/rooms";
import { RoomStatusBadge } from "@/components/status-badges";
import { formatBRL, roomImage } from "@/lib/format";
import { ROOM_CATEGORIES, type OperationalStatus, type Room } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-stone-800";

const emptyForm = {
  id: "",
  name: "",
  category: "Suíte Master",
  capacity: 2,
  basePrice: 450,
  size: "35 m²",
  bedType: "1 Cama Casal",
  operationalStatus: "available" as OperationalStatus,
  image:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  description: "",
  amenities: "Wi-Fi Fibra, Ar-Condicionado, Smart TV",
  isActive: true,
};

export function RoomsManager({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Room | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      id: `RM-${Math.floor(100 + Math.random() * 900)}`,
    });
    setError(null);
    setOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({
      id: room.id,
      name: room.name,
      category: room.category,
      capacity: room.capacity,
      basePrice: room.base_price,
      size: room.size ?? "",
      bedType: room.bed_type ?? "",
      operationalStatus: room.operational_status,
      image: roomImage(room),
      description: room.description ?? "",
      amenities: room.amenities.join(", "),
      isActive: room.is_active,
    });
    setError(null);
    setOpen(true);
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-900">
            Catálogo de quartos e acomodações
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Tarifas, descrições, fotos e status operacional.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 self-start rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-800"
        >
          <Plus className="h-4 w-4" /> Adicionar quarto
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 font-semibold tracking-wider text-stone-500 uppercase">
              <th className="px-3 py-3">Quarto</th>
              <th className="px-3 py-3">Categoria</th>
              <th className="px-3 py-3">Capacidade</th>
              <th className="px-3 py-3">Diária base</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {rooms.map((room) => (
              <tr key={room.id} className="hover:bg-stone-50">
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={roomImage(room)}
                      alt=""
                      className="h-10 w-12 rounded-lg border border-stone-200 object-cover"
                    />
                    <div>
                      <span className="block font-bold text-stone-900">{room.name}</span>
                      <span className="font-mono text-[11px] text-stone-400">{room.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3.5 font-medium">{room.category}</td>
                <td className="px-3 py-3.5">{room.capacity} pessoas</td>
                <td className="px-3 py-3.5 font-bold text-stone-900">{formatBRL(room.base_price)}</td>
                <td className="px-3 py-3.5">
                  <RoomStatusBadge status={room.operational_status} />
                </td>
                <td className="px-3 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(room)}
                    className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-amber-800"
                    aria-label={`Editar ${room.name}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-stone-400 hover:bg-stone-100"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              {editing ? "Editar acomodação" : "Cadastrar nova acomodação"}
            </h3>
            <form
              className="mt-6 space-y-4 text-xs"
              onSubmit={(event) => {
                event.preventDefault();
                setError(null);
                startTransition(async () => {
                  const result = await saveRoomAction(
                    {
                      ...form,
                      amenities: form.amenities
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                    editing ? "edit" : "create",
                  );
                  if (!result.success) {
                    setError(result.error);
                    return;
                  }
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome do quarto">
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Código">
                  <input
                    required
                    disabled={Boolean(editing)}
                    value={form.id}
                    onChange={(event) => setForm({ ...form, id: event.target.value })}
                    className={`${inputClass} bg-stone-50`}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Categoria">
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className={`${inputClass} bg-white`}
                  >
                    {ROOM_CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Capacidade">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={form.capacity}
                    onChange={(event) =>
                      setForm({ ...form, capacity: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Diária (R$)">
                  <input
                    type="number"
                    min={0}
                    value={form.basePrice}
                    onChange={(event) =>
                      setForm({ ...form, basePrice: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Metragem">
                  <input
                    value={form.size}
                    onChange={(event) => setForm({ ...form, size: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Camas">
                  <input
                    value={form.bedType}
                    onChange={(event) => setForm({ ...form, bedType: event.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status operacional">
                  <select
                    value={form.operationalStatus}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        operationalStatus: event.target.value as OperationalStatus,
                      })
                    }
                    className={`${inputClass} bg-white`}
                  >
                    <option value="available">Disponível</option>
                    <option value="occupied">Ocupado</option>
                    <option value="cleaning">Limpeza pendente</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </Field>
                <Field label="URL da imagem">
                  <input
                    type="url"
                    required
                    value={form.image}
                    onChange={(event) => setForm({ ...form, image: event.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Comodidades (separadas por vírgula)">
                <input
                  value={form.amenities}
                  onChange={(event) => setForm({ ...form, amenities: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Descrição">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <label className="flex items-center gap-2 text-stone-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                Visível no portal do hóspede
              </label>
              {error && <p className="text-red-700">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 font-semibold text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl bg-amber-700 px-5 py-2 font-bold text-white disabled:opacity-60"
                >
                  {pending ? "Salvando..." : "Salvar acomodação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block font-semibold text-stone-700">
      {label}
      {children}
    </label>
  );
}
