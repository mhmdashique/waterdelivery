-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  address text,
  phone text,
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table orders (
  id text primary key,
  user_id uuid references auth.users on delete set null,
  user_name text,
  address text,
  landmark text,
  phone text,
  delivery_date date,
  instructions text,
  status text default 'Pending' check (status in ('Pending', 'Confirmed', 'Delivered')),
  payment_status text default 'Unpaid' check (payment_status in ('Paid', 'Unpaid')),
  payment_method text check (payment_method in ('Online', 'Cash on Delivery')),
  total numeric,
  cans_returned integer default 0,
  created_at timestamp with time zone default now()
);

-- Create order_items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id text references orders on delete cascade,
  product_id text,
  name text,
  quantity integer,
  price numeric
);

-- Enable RLS
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Function to check if current user is an admin without recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );
end;
$$ language plpgsql security definer;

-- Policies for profiles
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on profiles
  for select using (public.is_admin());

-- Policies for orders
create policy "Users can view their own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert their own orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Admins can view all orders" on orders
  for select using (public.is_admin());

create policy "Admins can update all orders" on orders
  for update using (public.is_admin());

-- Policies for order_items
create policy "Users can view their own order items" on order_items
  for select using (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

create policy "Users can insert their own order items" on order_items
  for insert with check (
    exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
  );

create policy "Admins can view all order items" on order_items
  for select using (public.is_admin());

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
