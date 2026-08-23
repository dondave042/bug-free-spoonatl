-- ============================================================================
-- ATL TRAVELS — Supabase backend blueprint
-- Run this in the Supabase SQL editor of a fresh project, then create the
-- storage bucket and set the env vars from backend/.env.example in Vercel.
-- ============================================================================

-- ---------- extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- profiles (linked to Supabase Auth) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text not null default 'user' check (role in ('user','admin')),
  created_at  timestamptz not null default now()
);

-- auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the current JWT an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- ---------- destinations (vacation packages) ----------
create table if not exists public.destinations (
  id          bigint generated always as identity primary key,
  name        text not null,
  location    text not null,
  description text,
  price       numeric(12,2) not null default 0,          -- 0 = "On Request"
  rating      text default '5.0',
  reviews     text default '',
  image       text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- ---------- flights (admin-managed) ----------
create table if not exists public.flights (
  id              bigint generated always as identity primary key,
  airline         text,
  departure_city  text default 'ATL',
  arrival_city    text,
  departure_date  timestamptz,                            -- optional
  arrival_date    timestamptz,                            -- optional
  price           numeric(12,2) not null default 0,       -- 0 = "On Request"
  available_seats integer not null default 100,
  duration        text,
  stops           text default 'Non-stop',
  created_at      timestamptz not null default now()
);

-- ---------- media (files live in the "media" storage bucket) ----------
create table if not exists public.media (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete set null,
  file_name  text,
  file_url   text not null,
  file_type  text not null,                               -- image/jpeg | video/mp4 | ...
  bucket     text not null default 'media',
  created_at timestamptz not null default now()
);

-- ---------- bookings + traveler details + payment ----------
create table if not exists public.bookings (
  id                  uuid primary key default uuid_generate_v4(),
  reference           text not null unique default ('ATL-' || lpad(floor(random()*9000+1000)::text, 4, '0')),
  user_id             uuid not null references auth.users(id) on delete cascade,
  item_type           text not null check (item_type in ('flight','destination')),
  destination_id      bigint references public.destinations(id) on delete set null,
  flight_id           bigint references public.flights(id) on delete set null,
  item_name           text not null,
  unit_price          numeric(12,2) not null default 0,
  passengers          integer not null default 1,
  total_price         numeric(12,2) not null default 0,
  status              text not null default 'pending' check (status in ('pending','approved','rejected')),
  payment_method      text not null check (payment_method in
                        ('cashapp','venmo','zelle','cryptocurrency','bank_transfer','paypal')),
  payment_instructions text,
  -- traveler details collected at checkout
  full_name           text not null,
  dob                 date,
  phone               text,
  passport            text,
  country             text,
  state               text,
  address             text,
  reason              text,
  emergency_name      text,
  emergency_phone     text,
  special_requests    text,
  created_at          timestamptz not null default now(),
  reviewed_at         timestamptz,
  reviewed_by         uuid references auth.users(id)
);

-- ---------- chat (thread is auto-created when a booking is approved) ----------
create table if not exists public.chat_threads (
  id          uuid primary key default uuid_generate_v4(),
  booking_id  uuid not null unique references public.bookings(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id         uuid primary key default uuid_generate_v4(),
  thread_id  uuid not null references public.chat_threads(id) on delete cascade,
  sender_id  uuid references auth.users(id),
  is_admin   boolean not null default false,
  body       text not null,
  created_at timestamptz not null default now()
);

-- auto-open a support thread (seeded with the payment instructions) on approval
create or replace function public.open_thread_on_approval()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t_id uuid;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.chat_threads (booking_id, user_id)
    values (new.id, new.user_id)
    on conflict (booking_id) do nothing
    returning id into t_id;

    if t_id is not null then
      insert into public.chat_messages (thread_id, is_admin, body)
      values (
        t_id,
        true,
        'Your booking ' || new.reference || ' for "' || new.item_name ||
        '" has been approved. Payment method: ' || new.payment_method ||
        E'.\n\nPayment instructions:\n' || coalesce(new.payment_instructions, '') ||
        E'\n\nReply here once payment is sent and we will confirm your reservation.'
      );
    end if;
  end if;
  return new;
end $$;

drop trigger if exists on_booking_approved on public.bookings;
create trigger on_booking_approved
  after update of status on public.bookings
  for each row execute function public.open_thread_on_approval();

-- ---------- storage bucket for gallery / destination media ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.destinations   enable row level security;
alter table public.flights        enable row level security;
alter table public.media          enable row level security;
alter table public.bookings       enable row level security;
alter table public.chat_threads   enable row level security;
alter table public.chat_messages  enable row level security;

create policy "profiles: owner read"        on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles: owner update"      on public.profiles for update using (auth.uid() = id or public.is_admin());

create policy "destinations: public read"   on public.destinations for select using (true);
create policy "destinations: admin write"   on public.destinations for all using (public.is_admin()) with check (public.is_admin());

create policy "flights: public read"        on public.flights for select using (true);
create policy "flights: admin write"        on public.flights for all using (public.is_admin()) with check (public.is_admin());

create policy "media: public read"          on public.media for select using (true);
create policy "media: admin write"          on public.media for insert with check (public.is_admin());
create policy "media: admin delete"         on public.media for delete using (public.is_admin());

create policy "bookings: create own"        on public.bookings for insert with check (auth.uid() = user_id);
create policy "bookings: read own or admin" on public.bookings for select using (auth.uid() = user_id or public.is_admin());
create policy "bookings: admin review"      on public.bookings for update using (public.is_admin()) with check (public.is_admin());

create policy "threads: read own or admin"  on public.chat_threads for select using (user_id = auth.uid() or public.is_admin());
create policy "messages: read own thread or admin" on public.chat_messages for select using (
  exists (select 1 from public.chat_threads t where t.id = thread_id and (t.user_id = auth.uid() or public.is_admin()))
);
create policy "messages: write own thread or admin" on public.chat_messages for insert with check (
  exists (select 1 from public.chat_threads t where t.id = thread_id and (t.user_id = auth.uid() or public.is_admin()))
);

-- storage policies: public read, admin-only upload/delete
create policy "media bucket: public read"  on storage.objects for select using (bucket_id = 'media');
create policy "media bucket: admin write"  on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "media bucket: admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
