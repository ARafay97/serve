-- MyBagh POS — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
-- `items` is jsonb holding the MenuItem[] exactly as the menu defines it
-- ({ name, price, category }). Prices are snapshotted onto the order so that a
-- later menu price change never rewrites the history of past orders.
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  table_number        integer     not null default 0,
  order_number        integer,
  items               jsonb       not null default '[]'::jsonb,
  is_kitchen_order    boolean     not null default false,
  starters_done       boolean     not null default false,
  mains_done          boolean     not null default false,
  drinks_done         boolean     not null default false,
  mocktail_done_items text[]      not null default '{}',
  completed           boolean     not null default false,
  created_at          timestamptz not null default now()
);

-- The two access patterns are "active orders, oldest first" and "completed
-- orders, newest first"; both filter on completed and sort on created_at.
create index if not exists orders_completed_created_at_idx
  on public.orders (completed, created_at);

-- ---------------------------------------------------------------------------
-- Takeout ticket numbers
-- ---------------------------------------------------------------------------
-- Takeout ("kitchen") orders get a short human-readable number that staff call
-- out. A sequence hands these out atomically; the previous implementation read
-- MAX(order_number) + 1, which could hand the same number to two tills that
-- ordered at the same moment.
create sequence if not exists public.kitchen_order_number_seq as integer start 1;

create or replace function public.set_kitchen_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.is_kitchen_order and new.order_number is null then
    new.order_number := nextval('public.kitchen_order_number_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_kitchen_order_number on public.orders;
create trigger orders_set_kitchen_order_number
  before insert on public.orders
  for each row
  execute function public.set_kitchen_order_number();

-- Run this on a quiet night to restart takeout numbering from 1:
--   alter sequence public.kitchen_order_number_seq restart with 1;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is enabled with NO policies, which denies everything to the anon and
-- authenticated roles. That is deliberate: the app talks to Postgres only from
-- Next.js route handlers using the service-role key, and the service role
-- bypasses RLS. So the browser cannot reach this table directly even if someone
-- discovers the project URL.
--
-- If you later add a client-side Supabase call, it will fail until you add an
-- explicit policy here — that failure is the safety net working, not a bug.
alter table public.orders enable row level security;
