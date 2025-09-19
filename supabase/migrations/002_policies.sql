-- 002_policies.sql
alter table public.profiles enable row level security;
alter table public.sweets enable row level security;
alter table public.purchases enable row level security;

-- Profiles: each user can see/update their own profile only
create policy "read own profile" on public.profiles for select
  using (auth.uid() = id);
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id);

-- Sweets: anyone authed can read; only admins can write
create policy "read sweets" on public.sweets for select using (true);
create policy "admin manage sweets" on public.sweets for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Purchases: users read/insert their own rows
create policy "insert own purchase" on public.purchases for insert
  with check (auth.uid() = user_id);
create policy "read own purchases" on public.purchases for select
  using (auth.uid() = user_id);