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
security definer
as $$
declare
  v_order public.orders;
  v_item record;
  v_out_of_stock_items text[] := array[]::text[];
  v_sweet_id uuid;
  v_quantity int;
  v_available_quantity int;
begin
  -- Check stock for all items first
  for v_item in select * from jsonb_to_recordset(p_items) as x(sweet_id uuid, quantity int)
  loop
    select quantity into v_available_quantity from public.sweets where id = v_item.sweet_id;
    if v_available_quantity is null or v_available_quantity < v_item.quantity then
      v_out_of_stock_items := array_append(v_out_of_stock_items, v_item.sweet_id::text);
    end if;
  end loop;

  -- If any items are out of stock, raise an exception
  if array_length(v_out_of_stock_items, 1) > 0 then
    raise exception 'insufficient_stock for sweets: %', array_to_string(v_out_of_stock_items, ', ');
  end if;

  -- Insert the new order
  insert into public.orders (user_id, customer_name, address, contact_number, items, total_price_cents)
  values (p_user_id, p_customer_name, p_address, p_contact_number, p_items, p_total_price_cents)
  returning * into v_order;

  -- Decrement stock for each item in the order
  for v_item in select * from jsonb_to_recordset(p_items) as x(sweet_id uuid, quantity int)
  loop
    update public.sweets
    set quantity = quantity - v_item.quantity
    where id = v_item.sweet_id;
  end loop;

  return v_order;
end;
$$;