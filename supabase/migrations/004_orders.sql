-- 004_orders.sql

-- Create the orders table
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  address text not null,
  contact_number text not null,
  items jsonb not null,
  total_price_cents int not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Add RLS policies for the orders table
alter table public.orders enable row level security;

create policy "users can create their own orders" on public.orders for insert
  with check (auth.uid() = user_id);

create policy "users can view their own orders" on public.orders for select
  using (auth.uid() = user_id);

create policy "admins can manage all orders" on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
