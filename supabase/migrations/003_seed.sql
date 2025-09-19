-- 003_seed.sql
-- Create an admin profile for your account after signup (update the UUID accordingly)
-- insert into public.profiles (id, name, role) values ('<your-auth-user-uuid>','Admin','admin');

insert into public.sweets(name, category, price_cents, quantity, description)
values
 ('Dark Chocolate Bar','chocolate',299,50,'70% cocoa'),
 ('Gummy Bears','candy',199,200,'Assorted fruit'),
 ('Choco Chip Cookie','cookie',149,120,'Crispy edges'),
 ('Red Velvet Cake','cake',1999,5,'1 kg whole cake');