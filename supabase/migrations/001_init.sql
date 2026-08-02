-- Neural Kitchen — initial schema
create extension if not exists "pgcrypto";

-- Enums
create type member_role as enum ('restaurant_admin', 'manager', 'waiter', 'kitchen');
create type order_status as enum (
  'draft', 'placed', 'accepted', 'preparing', 'partially_ready',
  'ready', 'served', 'billed', 'completed', 'cancelled'
);
create type item_status as enum ('queued', 'accepted', 'preparing', 'ready', 'served', 'cancelled');
create type table_status as enum ('available', 'reserved', 'occupied', 'needs_service', 'bill_requested', 'cleaning');
create type request_status as enum ('open', 'acknowledged', 'resolved');
create type request_type as enum ('call_waiter', 'water', 'cutlery', 'bill', 'other');
create type availability as enum ('available', 'low_stock', 'delayed', 'paused', 'unavailable');
create type txn_type as enum ('purchase', 'consumption', 'adjustment', 'waste');

-- Core tables
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  settings jsonb not null default '{"stations":{"tandoor":4,"wok":6,"fryer":4,"cold":8},"close_hours":4}'::jsonb,
  tax_rate numeric not null default 0.05,
  created_at timestamptz not null default now()
);

create table branches (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table restaurant_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null,
  unique (restaurant_id, user_id)
);

create table tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  number int not null,
  capacity int not null default 4,
  status table_status not null default 'available',
  qr_token text unique not null,
  unique (restaurant_id, number)
);
create index idx_tables_restaurant_status on tables(restaurant_id, status);

create table qr_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references tables(id) on delete cascade,
  token text unique not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create index idx_qr_sessions_token on qr_sessions(token);

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  sort int not null default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric not null,
  veg boolean not null default true,
  spice int not null default 0 check (spice between 0 and 3),
  tags text[] not null default '{}',
  image_url text,
  base_prep_min int not null default 12,
  complexity numeric not null default 1,
  station text not null default 'wok',
  is_paused boolean not null default false,
  availability availability not null default 'available',
  portions_left int not null default 999,
  current_eta_min int not null default 12,
  explanation text not null default '',
  popularity int not null default 0
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  unit text not null default 'g'
);

create table menu_item_ingredients (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  qty_required numeric not null,
  unique (menu_item_id, ingredient_id)
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid unique not null references ingredients(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  qty numeric not null default 0 check (qty >= 0),
  low_threshold numeric not null default 5,
  reorder_qty numeric not null default 20
);

create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  delta numeric not null,
  type txn_type not null,
  created_at timestamptz not null default now()
);
create index idx_inv_txn_item_created on inventory_transactions(inventory_item_id, created_at);

create table orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid not null references tables(id),
  qr_session_id uuid references qr_sessions(id),
  status order_status not null default 'draft',
  subtotal numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  note text,
  placed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_orders_restaurant_status on orders(restaurant_id, status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  qty int not null default 1 check (qty between 1 and 20),
  unit_price numeric not null,
  status item_status not null default 'queued',
  station text not null default 'wok',
  priority numeric not null default 0,
  eta_min int not null default 12,
  note text,
  started_at timestamptz,
  ready_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_order_items_order on order_items(order_id);
create index idx_order_items_status on order_items(status);

create table service_requests (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid not null references tables(id),
  type request_type not null,
  status request_status not null default 'open',
  created_at timestamptz not null default now(),
  acknowledged_by uuid references auth.users(id)
);
create index idx_service_requests_status on service_requests(restaurant_id, status);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references orders(id) on delete cascade,
  method text not null default 'demo',
  amount numeric not null,
  paid_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  audience_role text not null default 'manager',
  title text not null,
  body text not null,
  severity text not null default 'info',
  created_at timestamptz not null default now(),
  read boolean not null default false
);

create table customer_preferences (
  id uuid primary key default gen_random_uuid(),
  qr_session_id uuid unique not null references qr_sessions(id) on delete cascade,
  diet text,
  spice_max int default 3,
  budget numeric,
  allergens text[] not null default '{}'
);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references orders(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text
);

create table demand_forecasts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete cascade,
  hour int not null,
  day_type text not null,
  forecast_qty numeric not null,
  unique (restaurant_id, menu_item_id, hour, day_type)
);

create table operational_insights (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null,
  body text not null,
  metric jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  actor text,
  action text not null,
  entity text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Profile auto-create on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table restaurants enable row level security;
alter table branches enable row level security;
alter table profiles enable row level security;
alter table restaurant_members enable row level security;
alter table tables enable row level security;
alter table qr_sessions enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table ingredients enable row level security;
alter table menu_item_ingredients enable row level security;
alter table inventory_items enable row level security;
alter table inventory_transactions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table service_requests enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table customer_preferences enable row level security;
alter table feedback enable row level security;
alter table demand_forecasts enable row level security;
alter table operational_insights enable row level security;
alter table activity_logs enable row level security;

-- Helper: member of restaurant
create or replace function public.is_restaurant_member(rid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from restaurant_members
    where restaurant_id = rid and user_id = auth.uid()
  );
$$;

create or replace function public.has_role(rid uuid, roles member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from restaurant_members
    where restaurant_id = rid
      and user_id = auth.uid()
      and role = any(roles)
  );
$$;

-- Staff policies (service role bypasses RLS for customer QR flows)
create policy "members read restaurant" on restaurants for select
  using (is_restaurant_member(id));

create policy "members read own memberships" on restaurant_members for select
  using (user_id = auth.uid() or is_restaurant_member(restaurant_id));

create policy "members read profiles" on profiles for select
  using (id = auth.uid());

create policy "members update own profile" on profiles for update
  using (id = auth.uid());

create policy "staff read tables" on tables for select
  using (is_restaurant_member(restaurant_id));
create policy "staff update tables" on tables for update
  using (has_role(restaurant_id, array['restaurant_admin','manager','waiter']::member_role[]));

create policy "staff read menu cats" on menu_categories for select
  using (is_restaurant_member(restaurant_id));
create policy "mgr manage menu cats" on menu_categories for all
  using (has_role(restaurant_id, array['restaurant_admin','manager']::member_role[]));

create policy "staff read menu items" on menu_items for select
  using (is_restaurant_member(restaurant_id));
create policy "mgr manage menu items" on menu_items for all
  using (has_role(restaurant_id, array['restaurant_admin','manager','kitchen']::member_role[]));

create policy "staff read ingredients" on ingredients for select
  using (is_restaurant_member(restaurant_id));
create policy "mgr manage ingredients" on ingredients for all
  using (has_role(restaurant_id, array['restaurant_admin','manager']::member_role[]));

create policy "staff read recipes" on menu_item_ingredients for select
  using (
    exists (
      select 1 from menu_items mi
      where mi.id = menu_item_id and is_restaurant_member(mi.restaurant_id)
    )
  );

create policy "staff read inventory" on inventory_items for select
  using (is_restaurant_member(restaurant_id));
create policy "mgr manage inventory" on inventory_items for all
  using (has_role(restaurant_id, array['restaurant_admin','manager','kitchen']::member_role[]));

create policy "staff read inv txn" on inventory_transactions for select
  using (
    exists (
      select 1 from inventory_items ii
      where ii.id = inventory_item_id and is_restaurant_member(ii.restaurant_id)
    )
  );

create policy "staff read orders" on orders for select
  using (is_restaurant_member(restaurant_id));
create policy "staff update orders" on orders for update
  using (is_restaurant_member(restaurant_id));

create policy "staff read order items" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and is_restaurant_member(o.restaurant_id)
    )
  );
create policy "staff update order items" on order_items for update
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and is_restaurant_member(o.restaurant_id)
    )
  );

create policy "staff read requests" on service_requests for select
  using (is_restaurant_member(restaurant_id));
create policy "staff update requests" on service_requests for update
  using (has_role(restaurant_id, array['restaurant_admin','manager','waiter']::member_role[]));

create policy "staff read payments" on payments for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and is_restaurant_member(o.restaurant_id)
    )
  );

create policy "staff read notifications" on notifications for select
  using (is_restaurant_member(restaurant_id));

create policy "staff read feedback" on feedback for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_id and is_restaurant_member(o.restaurant_id)
    )
  );

create policy "staff read forecasts" on demand_forecasts for select
  using (is_restaurant_member(restaurant_id));

create policy "staff read insights" on operational_insights for select
  using (is_restaurant_member(restaurant_id));

create policy "staff read activity" on activity_logs for select
  using (is_restaurant_member(restaurant_id));

create policy "staff read qr sessions" on qr_sessions for select
  using (
    exists (
      select 1 from tables t
      where t.id = table_id and is_restaurant_member(t.restaurant_id)
    )
  );

create policy "staff read branches" on branches for select
  using (is_restaurant_member(restaurant_id));

-- Realtime
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table tables;
alter publication supabase_realtime add table menu_items;
alter publication supabase_realtime add table service_requests;
alter publication supabase_realtime add table notifications;
