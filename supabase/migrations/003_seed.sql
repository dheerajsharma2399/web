-- 003_seed.sql
-- Create an admin profile for your account after signup (update the UUID accordingly)
-- insert into public.profiles (id, name, role) values ('<your-auth-user-uuid>','Admin','admin');

insert into public.sweets(name, category, price_cents, quantity, description)
values
 ('Dark Chocolate Bar','chocolate',299,1000,'70% cocoa'),
 ('Gummy Bears','candy',199,1000,'Assorted fruit'),
 ('Choco Chip Cookie','cookie',149,1000,'Crispy edges'),
 ('Red Velvet Cake','cake',1999,1000,'1 kg whole cake')
on conflict (name) do update set
  category = excluded.category,
  price_cents = excluded.price_cents,
  quantity = excluded.quantity,
  description = excluded.description;