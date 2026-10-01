import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

export const bookingInputSchema = z.object({
  roomId: z.string().trim().min(1).max(20),
  guestName: z.string().trim().min(3, "Nome completo é obrigatório").max(120),
  guestEmail: z.string().trim().email("E-mail inválido").max(160),
  guestPhone: z.string().trim().min(8, "Telefone inválido").max(30),
  guestsCount: z.number().int().positive().max(20),
  checkIn: isoDate,
  checkOut: isoDate,
  specialRequests: z.string().trim().max(500).optional(),
});

export const lookupInputSchema = z.object({
  code: z.string().trim().min(4, "Informe o código da reserva").max(20),
  email: z.string().trim().email("E-mail inválido"),
});

export const roomInputSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{2,20}$/, "Código do quarto inválido"),
  name: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(40),
  capacity: z.number().int().min(1).max(20),
  basePrice: z.number().min(0).max(100_000),
  size: z.string().trim().max(40).optional(),
  bedType: z.string().trim().max(80).optional(),
  operationalStatus: z.enum([
    "available",
    "occupied",
    "cleaning",
    "maintenance",
  ]),
  image: z.string().trim().url("URL da imagem inválida").max(500),
  description: z.string().trim().max(800).optional(),
  amenities: z.array(z.string().trim().min(1).max(60)).max(20),
  isActive: z.boolean(),
});

export const loginInputSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "Senha inválida"),
  next: z.string().optional(),
});

export const searchInputSchema = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  guests: z.number().int().min(1).max(20),
  category: z.string().trim().max(40),
});
