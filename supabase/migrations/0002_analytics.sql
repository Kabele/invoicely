-- Function to get total users
create or replace function get_total_users()
returns integer
language plpgsql
as $$
begin
  return (select count(*) from public.users where email != 'kabelecliff@gmail.com');
end;
$$;

-- Function to get total invoices
create or replace function get_total_invoices()
returns integer
language plpgsql
as $$
begin
  return (select count(*) from public.invoices);
end;
$$;

-- Function to get total receipts
create or replace function get_total_receipts()
returns integer
language plpgsql
as $$
begin
  return (select count(*) from public.receipts);
end;
$$;
