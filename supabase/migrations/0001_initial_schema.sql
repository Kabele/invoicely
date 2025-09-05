-- Create the users table
create table public.users (
  id uuid not null references auth.users on delete cascade,
  email text,
  primary key (id)
);

-- Enable Row Level Security for users table
alter table public.users enable row level security;

-- Create policy for users table
create policy "Users can view their own data" on public.users for select
using (auth.uid() = id);

create policy "Users can insert their own data" on public.users for insert
with check (auth.uid() = id);

create policy "Users can update their own data" on public.users for update
using (auth.uid() = id);


-- Create the invoices table
create table public.invoices (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  client_name text not null,
  client_email text not null,
  due_date date not null,
  line_items jsonb not null,
  tax_rate numeric not null,
  total numeric not null,
  is_paid boolean not null default false,
  status text not null,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security for invoices table
alter table public.invoices enable row level security;

-- Create policy for invoices table
create policy "Users can manage their own invoices" on public.invoices for all
using (auth.uid() = user_id);


-- Create the receipts table
create table public.receipts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.users on delete cascade,
  receipt_data jsonb not null,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security for receipts table
alter table public.receipts enable row level security;

-- Create policy for receipts table
create policy "Users can manage their own receipts" on public.receipts for all
using (auth.uid() = user_id);
