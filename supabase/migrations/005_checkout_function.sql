-- 005_checkout_function.sql

create or replace function public.perform_checkout(
  p_user_id uuid,
  p_customer_name text,
  p_address text,
  p_contact_number text,
  p_items jsonb,
  p_total_price_cents int
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
  v_item record;
begin
  -- Insert the new order
  insert into public.orders (user_id, customer_name, address, contact_number, items, total_price_cents)
  values (p_user_id, p_customer_name, p_address, p_contact_number, p_items, p_total_price_cents)
  returning * into v_order;

  -- Decrement stock for each item in the order
  for v_item in select * from jsonb_to_recordset(p_items) as x(sweet_id uuid, quantity int)
  loop
    update public.sweets
    set quantity = quantity - v_item.quantity
    where id = v_item.sweet_id and quantity >= v_item.quantity;

    if not found then
      raise exception 'insufficient_stock for sweet %', v_item.sweet_id;
    end if;
  end loop;

  return v_order;
end;
$$;
