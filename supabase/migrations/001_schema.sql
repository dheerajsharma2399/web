-- 001_schema.sql
-- Enable UUIDs
create extension if not exists "uuid-ossp";

-- Profiles: attaches role to Supabase auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated
before update on public.profiles
for each row execute procedure public.set_current_timestamp_on_update();

-- Utility trigger fn
create or replace function public.set_current_timestamp_on_update()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- Sweets catalog
create table public.sweets (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  category text not null check (category in ('chocolate','candy','cookie','cake','pastry','other')),
  price_cents int not null check (price_cents >= 0),
  quantity int not null check (quantity >= 0),
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_sweets_category on public.sweets(category);
create index idx_sweets_price on public.sweets(price_cents);
create trigger trg_sweets_updated
before update on public.sweets
for each row execute procedure public.set_current_timestamp_on_update();

-- Purchases (append-only)
create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sweet_id uuid not null references public.sweets(id) on delete restrict,
  quantity int not null check (quantity >= 1),
  unit_price_cents int not null check (unit_price_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);
create index idx_purchases_user_time on public.purchases(user_id, created_at desc);
create index idx_purchases_sweet on public.purchases(sweet_id);

-- Atomic purchase function (single-statement guarantee)
create or replace function public.perform_purchase(p_user uuid, p_sweet uuid, p_qty int)
returns public.purchases
language plpgsql
as $$
declare v_price int; v_row public.purchases; v_updated sweets;
begin
  if p_qty < 1 then raise exception 'quantity must be >= 1'; end if;
  -- read current price
  select price_cents into v_price from public.sweets where id = p_sweet;
  if not found then raise exception 'sweet not found'; end if;
  -- atomic stock decrement if enough inventory
  update public.sweets
    set quantity = quantity - p_qty
  where id = p_sweet and quantity >= p_qty
  returning * into v_updated;
  if not found then raise exception 'insufficient_stock'; end if;
  insert into public.purchases(user_id, sweet_id, quantity, unit_price_cents, total_cents)
  values (p_user, p_sweet, p_qty, v_price, v_price * p_qty)
  returning * into v_row;
  return v_row;
end; $$;