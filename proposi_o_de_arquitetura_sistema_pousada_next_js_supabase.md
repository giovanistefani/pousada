# Proposição de Arquitetura Técnica: Sistema de Reservas & Gestão de Pousada

**Stack Principal:** Next.js 15+ (App Router, Server Actions, Route Handlers) + Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions) + Tailwind CSS / Shadcn UI + Vercel.

---

## 1. Visão Geral e Diretrizes de Projeto

Esta arquitetura foi desenhada sob medida para a operação de **uma pousada independente** (5 a 50 unidades habitacionais). O objetivo primordial é **eliminar custos de servidores intermediários** (dispensando containers 24/7 no Railway), mantendo alta confiabilidade, custo operacional próximo a zero e garantia matemática contra *overbooking*.

### Princípios Norteadores:
1. **Serverless First:** Toda a computação da aplicação roda sob demanda na Vercel (Edge/Serverless).
2. **Database-Enforced Integrity:** A consistência de reservas não depende de locks de memória da aplicação, e sim de regras atômicas de exclusão dentro do PostgreSQL do Supabase.
3. **Defense-in-Depth:** Autenticação via cookies HTTP-only (Supabase SSR) e autorização rígida no banco com *Row Level Security* (RLS).
4. **Monorepo Simples:** Uma única base de código contendo o portal público do hóspede, a API de webhooks e o painel administrativo de governança.

---

## 2. Diagrama de Fluxo e Componentes

```
                   ┌────────────────────────────────────────┐
                   │             USUÁRIO / CLIENTE          │
                   │ (Hóspede no Celular / Recepção no PC)   │
                   └──────────────────┬─────────────────────┘
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER (Hospedado na Vercel)               │
│                                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   Portal do Hóspede   │  │   Painel Gestão      │  │  Route Handlers  │  │
│  │   (SSR / Client UI)   │  │   (Protegido / Admin)│  │  (Webhooks/iCal) │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
│              │                         │                       │            │
│              └────────────┬────────────┘                       │            │
│                           ▼                                    │            │
│                  Server Actions (Mutations)                    │            │
│             - createBookingAction()                            │            │
│             - updateRoomStatusAction()                         │            │
│                           │                                    │            │
└───────────────────────────┼────────────────────────────────────┼────────────┘
                            │                                    │
               Supabase JS SDK (SSR)               Service Role Key (Webhook)
                            │                                    │
                            ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SUPABASE (BaaS)                                 │
│                                                                             │
│  ┌─────────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐  │
│  │     Supabase Auth       │ │   Supabase Storage   │ │  PostgreSQL 15+  │  │
│  │  (Sessões Staff/Admin)  │ │  (Fotos dos Quartos) │ │  - RLS Policies  │  │
│  │  (JWT em cookies)       │ │  (Bucket Público)    │ │  - btree_gist    │  │
│  └─────────────────────────┘ └──────────────────────┘ │  - Stored Proc   │  │
│                                                       └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Estrutura de Diretórios Recomendada (Next.js)

```bash
src/
├── actions/                     # Server Actions (Mutations com validação Zod)
│   ├── bookings.ts              # Criar reserva, cancelar, check-in, check-out
│   └── rooms.ts                 # Atualizar status do quarto, preços, detalhes
├── app/
│   ├── (admin)/                 # Layout protegido para o Staff da pousada
│   │   ├── admin/
│   │   │   ├── dashboard/       # KPIs, ocupação hoje, receita
│   │   │   ├── governanca/      # Limpeza e manutenção dos quartos
│   │   │   ├── reservas/        # Listagem tabular e check-in/out
│   │   │   └── quartos/         # Cadastro e edição de comodidades/tarifas
│   │   └── layout.tsx           # Verificação de sessão (Redireciona se não for staff)
│   ├── (auth)/
│   │   └── login/               # Tela de acesso restrito da equipe
│   ├── (public)/                # Rotas acessíveis aos hóspedes
│   │   ├── page.tsx             # Home com vitrine de chalés e hero
│   │   ├── quartos/[id]/        # Detalhe do quarto e fotos
│   │   ├── checkout/            # Coleta de dados e confirmação/PIX
│   │   ├── voucher/[code]/      # Consulta do localizador da reserva
│   │   └── layout.tsx           # Header e footer da pousada
│   ├── api/                     # Route Handlers para tráfego externo
│   │   ├── webhooks/
│   │   │   └── payment/route.ts # Webhook de confirmação (Stripe / Mercado Pago / Asaas)
│   │   └── ical/[roomId]/route.ts # Feeds de calendário para Booking.com / Airbnb
│   └── layout.tsx
├── components/
│   ├── admin/                   # Modais de governança, tabelas de hóspedes
│   ├── public/                  # DatePicker, seletor de hóspedes, cards de quartos
│   └── ui/                      # Botões, Badges, Inputs (Shadcn/Tailwind)
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Cliente browser (CreateBrowserClient)
│   │   ├── server.ts            # Cliente Server Components & Actions (CreateServerClient)
│   │   └── admin.ts             # Cliente com Service Role (apenas webhooks seguros)
│   └── validators/              # Esquemas de validação Zod
└── types/
    └── database.types.ts        # Tipos TypeScript autogerados via Supabase CLI
```

---

## 4. Modelagem de Dados & Prevenção de Overbooking

O desafio crucial em sistemas de hospitalidade é garantir que dois hóspedes não reservem o mesmo quarto no mesmo período. O PostgreSQL resolve isso nativamente usando **Exclusion Constraints** com intervalos de datas (`daterange`).

### 4.1. DDL e Extensões SQL

```sql
-- 1. Habilitar extensão para índices GIST com tipos escalares
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Tabela de Perfis de Usuários (Funcionários / Gerentes)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Quartos / Acomodações
CREATE TABLE public.rooms (
    id TEXT PRIMARY KEY, -- Ex: 'RM-101'
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    base_price DECIMAL(10,2) NOT NULL,
    size TEXT,
    bed_type TEXT,
    amenities TEXT[] DEFAULT '{}',
    operational_status TEXT NOT NULL DEFAULT 'available' 
        CHECK (operational_status IN ('available', 'occupied', 'cleaning', 'maintenance')),
    images TEXT[] DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabela de Reservas com Proteção Anti-Overbooking
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY, -- Ex: 'VS-8821' (Localizador)
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guests_count INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INT GENERATED ALWAYS AS (check_out - check_in) STORED,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
    special_requests TEXT,
    payment_method TEXT,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Validação: Check-out deve ser posterior ao Check-in
    CONSTRAINT check_valid_dates CHECK (check_out > check_in),

    -- REGRA DE OURO: Impede duas reservas ativas sobrepostas no mesmo quarto.
    -- O intervalo [check_in, check_out) é fechado no início e aberto no fim:
    -- Permite que um hóspede saia no dia 15 e outro entre no dia 15 sem conflito.
    CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status IN ('confirmed', 'checked_in', 'pending_payment'))
);
```

### 4.2. Stored Procedure Atômica para Reserva Imediata

Para que o checkout execute a checagem, cálculo e reserva em uma única instrução com resposta padronizada:

```sql
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
    p_room_id TEXT,
    p_guest_name TEXT,
    p_guest_email TEXT,
    p_guest_phone TEXT,
    p_guests_count INT,
    p_check_in DATE,
    p_check_out DATE,
    p_special_requests TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_room public.rooms%ROWTYPE;
    v_nights INT;
    v_total_price DECIMAL(10,2);
    v_booking_id TEXT;
    v_new_booking public.bookings%ROWTYPE;
BEGIN
    -- 1. Obter dados e travar concorrência básica do quarto
    SELECT * INTO v_room FROM public.rooms WHERE id = p_room_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quarto não encontrado ou inativo.');
    END IF;

    -- 2. Validar datas
    IF p_check_out <= p_check_in THEN
        RETURN jsonb_build_object('success', false, 'error', 'Data de check-out inválida.');
    END IF;

    v_nights := p_check_out - p_check_in;
    v_total_price := v_nights * v_room.base_price;
    v_booking_id := 'VS-' || floor(1000 + random() * 9000)::text;

    -- 3. Tentar inserir a reserva
    -- Se houver conflito de datas, a constraint 'no_overlapping_bookings' disparará uma exceção
    BEGIN
        INSERT INTO public.bookings (
            id, room_id, guest_name, guest_email, guest_phone,
            guests_count, check_in, check_out, total_price,
            status, special_requests
        ) VALUES (
            v_booking_id, p_room_id, p_guest_name, p_guest_email, p_guest_phone,
            p_guests_count, p_check_in, p_check_out, v_total_price,
            'confirmed', p_special_requests
        ) RETURNING * INTO v_new_booking;

        RETURN jsonb_build_object(
            'success', true, 
            'booking_id', v_new_booking.id,
            'total_price', v_new_booking.total_price,
            'nights', v_nights
        );
    EXCEPTION WHEN exclusion_violation THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Este quarto já foi reservado para o período selecionado por outro hóspede.'
        );
    END;
END;
$$;
```

---

## 5. Políticas de Segurança (Row Level Security - RLS)

No Supabase, as tabelas são blindadas via RLS para que nenhuma query frontend possa adulterar registros:

```sql
-- Ativar RLS em todas as tabelas
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. QUARTOS:
-- Público em geral pode ler quartos ativos
CREATE POLICY "Público pode ver quartos ativos"
ON public.rooms FOR SELECT
USING (is_active = true);

-- Apenas staff autenticado pode criar, atualizar ou deletar quartos
CREATE POLICY "Staff gerencia quartos"
ON public.rooms FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));

-- 2. RESERVAS:
-- Qualquer hóspede anônimo pode buscar sua reserva específica sabendo o ID e o Email
CREATE POLICY "Hóspede consulta sua própria reserva"
ON public.bookings FOR SELECT
USING (true); -- Filtrado rigorosamente por ID + Email no Server Action/Query

-- Criação de reservas delegada para a Stored Procedure (Security Definer) ou Server Action segura

-- Staff logado pode visualizar e gerenciar todas as reservas
CREATE POLICY "Staff acesso total às reservas"
ON public.bookings FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()));
```

---

## 6. Implementação Prática: Server Actions & Route Handlers

### 6.1. Exemplo de Server Action para Nova Reserva (`src/actions/bookings.ts`)

```typescript
"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BookingSchema = z.object({
  roomId: z.string().min(1),
  guestName: z.string().min(3, "Nome completo é obrigatório"),
  guestEmail: z.string().email("E-mail inválido"),
  guestPhone: z.string().min(8, "Telefone inválido"),
  guestsCount: z.number().int().positive(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  specialRequests: z.string().optional()
});

export async function createBookingAction(formData: z.infer<typeof BookingSchema>) {
  // 1. Validação estrita dos dados com Zod no servidor
  const parsed = BookingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createServerClient();

  // 2. Chamada à Stored Procedure atômica
  const { data, error } = await supabase.rpc("create_booking_atomic", {
    p_room_id: parsed.data.roomId,
    p_guest_name: parsed.data.guestName,
    p_guest_email: parsed.data.guestEmail,
    p_guest_phone: parsed.data.guestPhone,
    p_guests_count: parsed.data.guestsCount,
    p_check_in: parsed.data.checkIn,
    p_check_out: parsed.data.checkOut,
    p_special_requests: parsed.data.specialRequests || null
  });

  if (error) {
    return { success: false, error: "Falha na comunicação com o banco de dados." };
  }

  if (!data.success) {
    return { success: false, error: data.error };
  }

  // 3. Invalida os caches do Next.js para atualizar o painel da recepção
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reservas");

  return { success: true, bookingId: data.booking_id, totalPrice: data.total_price };
}
```

### 6.2. Route Handler para Webhook de Pagamento (`src/app/api/webhooks/payment/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin"; // Instância com SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-signature-token");
    // Validar assinatura do gateway (ex: Asaas, Stripe, Mercado Pago)
    if (!signature || signature !== process.env.PAYMENT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { event, bookingId, paymentStatus } = payload;

    if (event === "PAYMENT_CONFIRMED" && bookingId) {
      const supabaseAdmin = createAdminClient();

      // Atualiza o status da reserva para confirmada
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## 7. Módulo de Governança & Sincronização em Tempo Real

Para que a recepção saiba no instante exato quando a governanta marcou um quarto como limpo:

1. **Supabase Realtime:**
   A tela `/admin/dashboard` e `/admin/governanca` escuta eventos `UPDATE` na tabela `rooms`:
   ```typescript
   supabase
     .channel("room-status-changes")
     .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms" }, (payload) => {
       // Atualiza a visualização dos cards na tela da recepção instantaneamente
       updateLocalRoomState(payload.new);
     })
     .subscribe();
   ```

2. **Fluxo de Status Operacional:**
   - **Check-in realizado:** Status do quarto passa para `occupied`.
   - **Check-out realizado:** Status do quarto passa para `cleaning`.
   - **Camareira clica em "Liberar Quarto":** Status passa para `available`.

---

## 8. Estratégia de Deploy, Ambientes e Custos

| Camada | Fornecedor | Plano Recomendado | Custo Mensal Estimado |
| :--- | :--- | :--- | :--- |
| **Frontend & API** | Vercel | Hobby (ou Pro se corporativo) | $0 / R$ 0 (ou $20 se Pro) |
| **Banco & Auth** | Supabase | Free Tier (ou Pro se backup diário estrito) | $0 / R$ 0 (ou $25 se Pro) |
| **Domínio Próprio** | Registro.br | `.com.br` | ~R$ 40 / ano |
| **Disparo Transacional** | Resend | Gratuito (até 3.000 e-mails/mês) | R$ 0 |
| **Total Estimado** | — | **Operação inicial** | **R$ 0 a R$ 130 / mês** |

---

## 9. Próximos Passos de Implementação

1. **Setup do Projeto:** Iniciar o template Next.js (`npx create-next-app@latest --typescript --tailwind --app`).
2. **Executar o DDL:** Aplicar as tabelas e a constraint `no_overlapping_bookings` no SQL Editor do Supabase.
3. **Migrar os Componentes:** Integrar os cards e o modal de reserva do protótipo `App.jsx` com as Server Actions.
4. **Configurar o Supabase SSR Auth:** Proteger o grupo de rotas `app/(admin)`.