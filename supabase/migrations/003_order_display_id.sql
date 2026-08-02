-- Customer-facing 3-digit order code (analytics still use orders.id uuid)
alter table orders
  add column if not exists display_id text;

create index if not exists idx_orders_restaurant_display
  on orders (restaurant_id, display_id);

comment on column orders.display_id is '3-digit customer tracking code; orders.id remains the unique analytics UUID';
