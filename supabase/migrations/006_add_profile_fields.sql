-- 006_add_profile_fields.sql

alter table public.profiles
add column if not exists phone_number text,
add column if not exists address text;
