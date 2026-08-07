-- Inventory upgrade: costing, departments, suppliers, ledger enrichment
-- Safe / additive — existing demo continues to work if columns are unused.

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  code text,
  unique (restaurant_id, name)
);

create table if not exists stock_locations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  department_id uuid references departments(id) on delete set null,
  is_default boolean not null default false,
  unique (restaurant_id, name)
);

create table if not exists ingredient_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  unique (restaurant_id, name)
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  phone text,
  gstin text,
  address text,
  payment_terms_days int not null default 0,
  lead_time_days numeric not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  po_number text not null,
  status text not null default 'draft',
  expected_date date,
  subtotal numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, po_number)
);

create table if not exists purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  qty_ordered numeric not null,
  qty_received numeric not null default 0,
  rate numeric not null,
  tax_pct numeric not null default 0
);

create table if not exists goods_receipts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  supplier_id uuid references suppliers(id),
  purchase_order_id uuid references purchase_orders(id),
  grn_number text not null,
  invoice_number text,
  invoice_date date,
  location_id uuid references stock_locations(id),
  subtotal numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  payment_status text not null default 'unpaid',
  amount_paid numeric not null default 0,
  is_cash_purchase boolean not null default false,
  received_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, grn_number)
);

create table if not exists goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references goods_receipts(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  qty_received numeric not null,
  qty_base numeric not null,
  rate numeric not null,
  tax_pct numeric not null default 0,
  line_total numeric not null,
  batch_code text,
  expiry_date date
);

create table if not exists waste_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  ingredient_id uuid references ingredients(id),
  menu_item_id uuid references menu_items(id),
  qty numeric not null,
  cost numeric not null default 0,
  reason text not null,
  shift text,
  note text,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists stock_counts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  location_id uuid references stock_locations(id),
  count_type text not null default 'cycle',
  status text not null default 'open',
  counted_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists stock_count_items (
  id uuid primary key default gen_random_uuid(),
  stock_count_id uuid not null references stock_counts(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  system_qty numeric not null,
  counted_qty numeric,
  note text
);

-- Enrich ingredients
alter table ingredients add column if not exists category_name text;
alter table ingredients add column if not exists department_name text default 'Kitchen';
alter table ingredients add column if not exists base_unit text;
alter table ingredients add column if not exists purchase_uom text;
alter table ingredients add column if not exists purchase_conversion numeric default 1000;
alter table ingredients add column if not exists yield_pct numeric default 1.0;
alter table ingredients add column if not exists avg_cost numeric default 0;
alter table ingredients add column if not exists last_purchase_rate numeric;
alter table ingredients add column if not exists is_perishable boolean default false;
alter table ingredients add column if not exists shelf_life_days int;

-- Enrich inventory
alter table inventory_items add column if not exists par_level numeric;
alter table inventory_items add column if not exists safety_stock numeric default 0;
alter table inventory_items add column if not exists avg_daily_usage numeric default 0;
alter table inventory_items add column if not exists last_counted_at timestamptz;

-- Enrich recipes + menu costing
alter table menu_item_ingredients add column if not exists wastage_pct numeric default 0;
alter table menu_items add column if not exists plate_cost numeric default 0;
alter table menu_items add column if not exists target_food_cost_pct numeric;

-- Enrich ledger
alter table inventory_transactions add column if not exists note text;
alter table inventory_transactions add column if not exists unit_cost numeric;
alter table inventory_transactions add column if not exists actor_id uuid references auth.users(id);

-- RLS (staff read; managers write via service role in app)
alter table departments enable row level security;
alter table stock_locations enable row level security;
alter table ingredient_categories enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table goods_receipts enable row level security;
alter table goods_receipt_items enable row level security;
alter table waste_logs enable row level security;
alter table stock_counts enable row level security;
alter table stock_count_items enable row level security;

create policy "staff read departments" on departments for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
create policy "staff read suppliers" on suppliers for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
create policy "staff read purchase_orders" on purchase_orders for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
create policy "staff read goods_receipts" on goods_receipts for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
create policy "staff read waste_logs" on waste_logs for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
create policy "staff read stock_counts" on stock_counts for select
  using (restaurant_id in (select restaurant_id from restaurant_members where user_id = auth.uid()));
