export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
}

export function roomImage(room: { images: string[] }) {
  return (
    room.images[0] ??
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
  );
}
