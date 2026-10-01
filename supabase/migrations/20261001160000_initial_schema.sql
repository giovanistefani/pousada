-- Pousada Villa Serena
-- Quartos, reservas com exclusão de sobreposição e funções privadas.
-- O schema `private` não deve entrar em "Exposed schemas" do Supabase.

create extension if not exists btree_gist;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('staff', 'admin')),
  created_at timestamptz not null default now()
);

create table public.rooms (
  id text primary key,
  name text not null,
  category text not null,
  capacity int not null default 2 check (capacity between 1 and 20),
  base_price numeric(10, 2) not null check (base_price >= 0),
  size text,
  bed_type text,
  amenities text[] not null default '{}',
  operational_status text not null default 'available'
    check (operational_status in ('available', 'occupied', 'cleaning', 'maintenance')),
  images text[] not null default '{}',
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id text primary key,
  room_id text not null references public.rooms (id) on delete restrict,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  guests_count int not null check (guests_count > 0),
  check_in date not null,
  check_out date not null,
  nights int generated always as (check_out - check_in) stored,
  total_price numeric(10, 2) not null check (total_price >= 0),
  status text not null default 'confirmed'
    check (status in ('pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  special_requests text,
  payment_method text,
  payment_id text,
  created_at timestamptz not null default now(),
  constraint check_valid_dates check (check_out > check_in),
  constraint no_overlapping_bookings exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('confirmed', 'checked_in', 'pending_payment'))
);

create index bookings_room_id_idx on public.bookings (room_id);
create index bookings_check_in_idx on public.bookings (check_in);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;

-- ---------------------------------------------------------------------------
-- Funções privadas (security definer). Não ficam no schema exposto.
-- ---------------------------------------------------------------------------

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('staff', 'admin')
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function private.today_local()
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select (now() at time zone 'America/Sao_Paulo')::date;
$$;

create or replace function private.create_booking_atomic(
  p_room_id text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guests_count int,
  p_check_in date,
  p_check_out date,
  p_special_requests text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.rooms%rowtype;
  v_nights int;
  v_total_price numeric(10, 2);
  v_booking_id text;
  v_attempt int;
begin
  if p_guest_name is null or char_length(trim(p_guest_name)) < 3 then
    return jsonb_build_object('success', false, 'error', 'Nome completo é obrigatório.');
  end if;

  if p_guest_email is null or p_guest_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('success', false, 'error', 'E-mail inválido.');
  end if;

  if p_guest_phone is null or char_length(trim(p_guest_phone)) < 8 then
    return jsonb_build_object('success', false, 'error', 'Telefone inválido.');
  end if;

  if p_guests_count is null or p_guests_count < 1 then
    return jsonb_build_object('success', false, 'error', 'Informe a quantidade de hóspedes.');
  end if;

  if p_check_out <= p_check_in then
    return jsonb_build_object('success', false, 'error', 'A data de check-out precisa ser posterior ao check-in.');
  end if;

  if p_check_in < private.today_local() then
    return jsonb_build_object('success', false, 'error', 'A data de check-in não pode estar no passado.');
  end if;

  select * into v_room
  from public.rooms
  where id = p_room_id
    and is_active = true;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Quarto não encontrado ou inativo.');
  end if;

  if v_room.operational_status = 'maintenance' then
    return jsonb_build_object('success', false, 'error', 'Este quarto está em manutenção e não aceita reservas.');
  end if;

  if p_guests_count > v_room.capacity then
    return jsonb_build_object('success', false, 'error', 'A acomodação não comporta essa quantidade de hóspedes.');
  end if;

  v_nights := p_check_out - p_check_in;

  if v_nights > 60 then
    return jsonb_build_object('success', false, 'error', 'Estadias acima de 60 diárias devem ser feitas pela recepção.');
  end if;

  v_total_price := v_nights * v_room.base_price;

  for v_attempt in 1..8 loop
    v_booking_id := 'VS-' || (1000 + floor(random() * 9000))::int::text;

    begin
      insert into public.bookings (
        id, room_id, guest_name, guest_email, guest_phone,
        guests_count, check_in, check_out, total_price,
        status, special_requests
      ) values (
        v_booking_id,
        p_room_id,
        trim(p_guest_name),
        lower(trim(p_guest_email)),
        trim(p_guest_phone),
        p_guests_count,
        p_check_in,
        p_check_out,
        v_total_price,
        'confirmed',
        nullif(trim(coalesce(p_special_requests, '')), '')
      );

      return jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'room_name', v_room.name,
        'guest_name', trim(p_guest_name),
        'check_in', p_check_in,
        'check_out', p_check_out,
        'nights', v_nights,
        'total_price', v_total_price
      );
    exception
      when unique_violation then
        if v_attempt = 8 then
          return jsonb_build_object('success', false, 'error', 'Não foi possível gerar o localizador. Tente novamente.');
        end if;
      when exclusion_violation then
        return jsonb_build_object(
          'success', false,
          'error', 'Este quarto já foi reservado para o período selecionado.'
        );
    end;
  end loop;

  return jsonb_build_object('success', false, 'error', 'Não foi possível concluir a reserva.');
end;
$$;

create or replace function private.list_available_rooms(
  p_check_in date,
  p_check_out date,
  p_guests int,
  p_category text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_rooms jsonb;
begin
  if p_check_out <= p_check_in then
    return jsonb_build_object('success', false, 'error', 'A data de check-out precisa ser posterior ao check-in.');
  end if;

  if p_check_in < private.today_local() then
    return jsonb_build_object('success', false, 'error', 'A data de check-in não pode estar no passado.');
  end if;

  select coalesce(jsonb_agg(to_jsonb(t) order by t.base_price, t.name), '[]'::jsonb)
  into v_rooms
  from (
    select
      r.id,
      r.name,
      r.category,
      r.capacity,
      r.base_price::float8 as base_price,
      r.size,
      r.bed_type,
      r.amenities,
      r.operational_status,
      r.images,
      r.description,
      r.is_active,
      (
        r.operational_status <> 'maintenance'
        and not exists (
          select 1
          from public.bookings b
          where b.room_id = r.id
            and b.status in ('confirmed', 'checked_in', 'pending_payment')
            and daterange(b.check_in, b.check_out, '[)') && daterange(p_check_in, p_check_out, '[)')
        )
      ) as bookable
    from public.rooms r
    where r.is_active = true
      and r.capacity >= greatest(coalesce(p_guests, 1), 1)
      and (
        p_category is null
        or p_category = ''
        or p_category = 'all'
        or r.category = p_category
      )
  ) t;

  return jsonb_build_object('success', true, 'rooms', v_rooms);
end;
$$;

create or replace function private.lookup_booking(
  p_id text,
  p_email text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_booking jsonb;
begin
  if p_id is null or p_email is null or trim(p_id) = '' or trim(p_email) = '' then
    return jsonb_build_object('success', false, 'error', 'Informe o código e o e-mail da reserva.');
  end if;

  select jsonb_build_object(
    'id', b.id,
    'room_id', b.room_id,
    'room_name', r.name,
    'guest_name', b.guest_name,
    'guests_count', b.guests_count,
    'check_in', b.check_in,
    'check_out', b.check_out,
    'nights', b.nights,
    'total_price', b.total_price::float8,
    'status', b.status,
    'special_requests', b.special_requests
  )
  into v_booking
  from public.bookings b
  join public.rooms r on r.id = b.room_id
  where upper(b.id) = upper(trim(p_id))
    and lower(b.guest_email) = lower(trim(p_email));

  if v_booking is null then
    return jsonb_build_object('success', false, 'error', 'Nenhuma reserva encontrada com esses dados.');
  end if;

  return jsonb_build_object('success', true, 'booking', v_booking);
end;
$$;

create or replace function private.transition_booking(
  p_id text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.bookings%rowtype;
begin
  if not private.is_staff() then
    return jsonb_build_object('success', false, 'error', 'Acesso restrito à equipe.');
  end if;

  if p_status not in ('confirmed', 'checked_in', 'checked_out', 'cancelled') then
    return jsonb_build_object('success', false, 'error', 'Status inválido.');
  end if;

  select * into v_booking
  from public.bookings
  where id = p_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reserva não encontrada.');
  end if;

  if p_status = 'checked_in' and v_booking.status <> 'confirmed' then
    return jsonb_build_object('success', false, 'error', 'Só é possível fazer check-in de uma reserva confirmada.');
  end if;

  if p_status = 'checked_out' and v_booking.status <> 'checked_in' then
    return jsonb_build_object('success', false, 'error', 'Só é possível fazer check-out de um hóspede hospedado.');
  end if;

  if p_status = 'cancelled' and v_booking.status in ('checked_out', 'cancelled') then
    return jsonb_build_object('success', false, 'error', 'Esta reserva não pode ser cancelada.');
  end if;

  update public.bookings
  set status = p_status
  where id = p_id;

  if p_status = 'checked_in' then
    update public.rooms
    set operational_status = 'occupied'
    where id = v_booking.room_id;
  elsif p_status = 'checked_out' then
    update public.rooms
    set operational_status = 'cleaning'
    where id = v_booking.room_id;
  elsif p_status = 'cancelled' and v_booking.status = 'checked_in' then
    update public.rooms
    set operational_status = 'cleaning'
    where id = v_booking.room_id;
  end if;

  return jsonb_build_object('success', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Wrappers públicos (security invoker). A API só enxerga o schema public.
-- ---------------------------------------------------------------------------

create or replace function public.create_booking_atomic(
  p_room_id text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guests_count int,
  p_check_in date,
  p_check_out date,
  p_special_requests text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.create_booking_atomic(
    p_room_id,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_guests_count,
    p_check_in,
    p_check_out,
    p_special_requests
  );
end;
$$;

create or replace function public.list_available_rooms(
  p_check_in date,
  p_check_out date,
  p_guests int,
  p_category text default 'all'
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  return private.list_available_rooms(p_check_in, p_check_out, p_guests, p_category);
end;
$$;

create or replace function public.lookup_booking(
  p_id text,
  p_email text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  return private.lookup_booking(p_id, p_email);
end;
$$;

create or replace function public.transition_booking(
  p_id text,
  p_status text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return private.transition_booking(p_id, p_status);
end;
$$;

revoke all on function private.is_staff() from public;
revoke all on function private.is_admin() from public;
revoke all on function private.today_local() from public;
revoke all on function private.create_booking_atomic(text, text, text, text, int, date, date, text) from public;
revoke all on function private.list_available_rooms(date, date, int, text) from public;
revoke all on function private.lookup_booking(text, text) from public;
revoke all on function private.transition_booking(text, text) from public;

grant execute on function private.is_staff() to authenticated, service_role;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.today_local() to anon, authenticated, service_role;
grant execute on function private.create_booking_atomic(text, text, text, text, int, date, date, text) to anon, authenticated, service_role;
grant execute on function private.list_available_rooms(date, date, int, text) to anon, authenticated, service_role;
grant execute on function private.lookup_booking(text, text) to anon, authenticated, service_role;
grant execute on function private.transition_booking(text, text) to authenticated, service_role;

revoke all on function public.create_booking_atomic(text, text, text, text, int, date, date, text) from public;
revoke all on function public.list_available_rooms(date, date, int, text) from public;
revoke all on function public.lookup_booking(text, text) from public;
revoke all on function public.transition_booking(text, text) from public;

grant execute on function public.create_booking_atomic(text, text, text, text, int, date, date, text) to anon, authenticated, service_role;
grant execute on function public.list_available_rooms(date, date, int, text) to anon, authenticated, service_role;
grant execute on function public.lookup_booking(text, text) to anon, authenticated, service_role;
grant execute on function public.transition_booking(text, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

create policy "public reads active rooms"
on public.rooms
for select
to anon, authenticated
using (is_active = true);

create policy "staff manages rooms"
on public.rooms
for all
to authenticated
using (private.is_staff())
with check (private.is_staff());

create policy "staff reads own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()) or private.is_admin());

create policy "admin manages profiles"
on public.profiles
for all
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy "staff manages bookings"
on public.bookings
for all
to authenticated
using (private.is_staff())
with check (private.is_staff());

revoke all on public.bookings from anon;
revoke all on public.profiles from anon;
revoke all on public.rooms from anon;
grant select on public.rooms to anon;
grant select, insert, update, delete on public.rooms to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Storage de fotos e realtime da recepção
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('room-images', 'room-images', true)
on conflict (id) do nothing;

create policy "public reads room images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'room-images');

create policy "staff inserts room images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'room-images' and private.is_staff());

create policy "staff updates room images"
on storage.objects
for update
to authenticated
using (bucket_id = 'room-images' and private.is_staff())
with check (bucket_id = 'room-images' and private.is_staff());

create policy "staff deletes room images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'room-images' and private.is_staff());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'rooms'
    ) then
      alter publication supabase_realtime add table public.rooms;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'bookings'
    ) then
      alter publication supabase_realtime add table public.bookings;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Catálogo inicial
-- ---------------------------------------------------------------------------

insert into public.rooms (
  id, name, category, capacity, base_price, size, bed_type, amenities,
  operational_status, images, description
) values
(
  'RM-101',
  'Suíte Master com Hidro',
  'Suíte Master',
  2,
  680,
  '45 m²',
  '1 Cama King Size',
  array['Hidromassagem', 'Varanda com Vista', 'Ar-Condicionado', 'Wi-Fi Fibra', 'Café Gourmet', 'Smart TV 55"'],
  'occupied',
  array['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
  'Nossa acomodação mais nobre com banheira de imersão dupla, cama com dossel e varanda privativa voltada para a serra.'
),
(
  'RM-102',
  'Chalé Jardim das Hortênsias',
  'Chalé Jardim',
  4,
  520,
  '52 m²',
  '1 Cama Queen + 2 Camas Solteiro',
  array['Lareira Ecológica', 'Deck Privativo', 'Rede de Descanso', 'Wi-Fi Fibra', 'Frigobar Retrô', 'Cafeteira Nespresso'],
  'available',
  array['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
  'Ambiente rústico e aconchegante cercado por flores, lareira a lenha e deque privativo com rede para contemplação.'
),
(
  'RM-103',
  'Suíte Romântica Serena',
  'Suíte Romântica',
  2,
  490,
  '38 m²',
  '1 Cama Queen Size',
  array['Ar-Condicionado', 'Frigobar', 'Wi-Fi Fibra', 'Vista Bosque', 'Chuveiro Duplo'],
  'cleaning',
  array['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
  'Projetada para casais que buscam tranquilidade, com iluminação acolhedora e enxoval 400 fios de puro algodão egípcio.'
),
(
  'RM-104',
  'Apartamento Standard Confort',
  'Standard',
  3,
  340,
  '32 m²',
  '1 Cama Casal + 1 Solteiro',
  array['Wi-Fi Fibra', 'Ar-Condicionado', 'Smart TV', 'Cofre Digital', 'Mesa de Trabalho'],
  'available',
  array['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
  'Conforto prático e elegante, perfeito para estadias de descanso e pequenas famílias que priorizam excelente custo-benefício.'
),
(
  'RM-105',
  'Chalé Mirante da Serra',
  'Chalé Jardim',
  2,
  590,
  '44 m²',
  '1 Cama King Size',
  array['Ofurô Externo', 'Vista Panorâmica', 'Ar Quente/Frio', 'Adega de Vinhos', 'Wi-Fi Fibra'],
  'maintenance',
  array['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
  'No ponto mais alto da pousada, possui ofurô aquecido ao ar livre sob um pergolado de madeira nobre.'
),
(
  'RM-106',
  'Suíte Família Raízes',
  'Família',
  5,
  610,
  '60 m²',
  '1 Cama Queen + 3 Camas Solteiro',
  array['2 Ambientes', 'Cozinha de Apoio', 'Varanda Térrea', 'Wi-Fi Fibra', 'Smart TV 50"'],
  'available',
  array['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'],
  'Espaço amplo com dois ambientes integrados, ideal para viajar com crianças ou grupos de amigos mantendo a privacidade.'
);

insert into public.bookings (
  id, room_id, guest_name, guest_email, guest_phone, guests_count,
  check_in, check_out, total_price, status, special_requests, created_at
)
select
  seed.id,
  seed.room_id,
  seed.guest_name,
  seed.guest_email,
  seed.guest_phone,
  seed.guests_count,
  seed.check_in,
  seed.check_out,
  seed.total_price,
  seed.status,
  seed.special_requests,
  seed.created_at
from (
  select
    (now() at time zone 'America/Sao_Paulo')::date as today
) day
cross join lateral (
  values
    (
      'VS-8821',
      'RM-101',
      'Dra. Mariana Albuquerque',
      'mariana.albuquerque@email.com',
      '(11) 98721-4321',
      2,
      day.today - 1,
      day.today + 1,
      1360.00,
      'checked_in',
      'Espumante de boas-vindas e almofadas antialérgicas.',
      timestamptz '2026-09-20'
    ),
    (
      'VS-9042',
      'RM-102',
      'Roberto & Camila Mendonça',
      'roberto.mendonca@gmail.com',
      '(21) 99120-7788',
      4,
      day.today,
      day.today + 3,
      1560.00,
      'confirmed',
      'Lenha extra para a lareira e check-in tardio (19h).',
      timestamptz '2026-09-24'
    ),
    (
      'VS-7763',
      'RM-104',
      'Felipe Silveira Santos',
      'felipe.santos@tecnologia.com.br',
      '(48) 98833-2190',
      1,
      day.today,
      day.today + 1,
      340.00,
      'confirmed',
      'Silêncio para reuniões matinais online.',
      timestamptz '2026-09-28'
    ),
    (
      'VS-6519',
      'RM-106',
      'Beatriz Nogueira Lima',
      'beatriz.lima@yahoo.com',
      '(31) 97755-1200',
      4,
      day.today - 3,
      day.today,
      1830.00,
      'checked_out',
      'Berço infantil no quarto adicional.',
      timestamptz '2026-09-15'
    )
) as seed (
  id, room_id, guest_name, guest_email, guest_phone, guests_count,
  check_in, check_out, total_price, status, special_requests, created_at
);
