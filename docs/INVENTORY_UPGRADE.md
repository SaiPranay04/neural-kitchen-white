# Inventory & Cost Control — Production Upgrade Plan

Neural Kitchen · Vezora Digital
Target: Indian hotels / restaurants (Kakinada and similar), multi-tenant SaaS.

> **Implementation status (v1 UI shipped)**  
> Dashboard → **Inventory** now opens a 6-tab module (Stock · Purchases · Recipes · Variance · Waste · Analytics).  
> Works on the current schema with cost enrichment (`src/lib/inventory/catalog.ts`).  
> Apply `supabase/migrations/004_inventory_upgrade.sql` then re-seed for persisted avg_cost / suppliers tables.

---

## 1. Why this document

The current inventory module is a **single-level stock counter**: one row per ingredient, a quantity, a low threshold, and two buttons (`-5`, `+20 restock`). It proves the concept — stock drops when an order is placed, and a dish gets 86'd when it hits zero — but it answers none of the questions a General Manager actually asks:

- Where exactly did my money go this month, and to whom?
- What did this plate cost me, and what margin did it earn?
- I bought 40 kg of paneer, sold dishes that should use 31 kg — where did the other 9 kg go?
- Which items are about to run out during Sunday lunch, and what do I need to order today?
- What is my closing stock value on the last day of the month?

This document specifies the upgrade from **basic CRUD stock** to a **production food-cost control system**, mapped to the existing Next.js 16 + Supabase codebase.

---

## 2. What exists today

| Capability | Status | Where |
|---|---|---|
| Ingredient master | Exists | `ingredients` (`id`, `restaurant_id`, `name`, `unit`) |
| Recipe / BOM mapping | Exists | `menu_item_ingredients` (`menu_item_id`, `ingredient_id`, `qty_required`) |
| Stock on hand | Exists | `inventory_items` (`qty`, `low_threshold`, `reorder_qty`) |
| Movement ledger | Partial | `inventory_transactions` (`delta`, `type`, `created_at`) |
| Auto-decrement on order | Exists | `src/lib/actions/orders.ts` → `placeOrder` |
| Availability / 86 engine | Exists | `src/lib/engine/availability.ts`, `recompute.ts` |
| Depletion forecast | Basic | `src/lib/engine/depletion.ts` |
| Manual adjust | Exists | `src/lib/actions/inventory.ts` → `adjustInventory` |
| Dashboard UI | Basic list | `ExecutiveDashboard.tsx` → `InventoryTab` |

### Concrete gaps

1. **No cost anywhere.** No purchase price, no unit cost, no COGS. The "Est. margin" KPI in `compute.ts` is a heuristic based on how many items are low on stock — it is not a real number and must not be shown to a paying client.
2. **No suppliers, no purchase orders, no payables.** There is no answer to "where is the money going".
3. **No units of measure conversion.** Purchase is in kg/litre/bag; recipes are in grams/ml. Today both are a single free-text `unit` string.
4. **No yield / wastage factor.** 1 kg raw chicken is not 1 kg usable chicken.
5. **No departments or store locations.** Everything is one flat list, so spend cannot be attributed to Kitchen vs Bar vs Housekeeping.
6. **No physical stock count.** System stock drifts from real stock with nothing to reconcile it.
7. **No variance analysis.** Theoretical usage vs actual usage — the single most valuable report for a GM — is impossible without counts and costs.
8. **Ledger is too thin.** `inventory_transactions` has no `restaurant_id`, no actor, no reference to the source order/PO, no cost, no note. It cannot be audited.
9. **Cancellations don't restore stock**, and seeded historical orders bypass inventory entirely.
10. **Decrement is not a real DB transaction.** It is a sequence of per-line updates guarded by a `gte("qty", need)` check. Under concurrency it can partially apply.
11. **No expiry / batch tracking**, which matters for dairy, cut vegetables, and prepped gravies.
12. **Inventory is not on Supabase Realtime**, so the dashboard shows stale stock until a manual refresh.

---

## 3. Target architecture

### 3.1 Core principle — one immutable ledger

Every change in stock, without exception, becomes a row in `stock_movements`. Current stock is a **derived, cached** value, never the source of truth. This is what makes audit, variance, and period-close possible.

```
opening stock
  + purchases (GRN)
  + production (prep batches)
  − consumption (orders)
  − waste
  ± transfers between stores
  ± count adjustments
  = closing stock
```

If that equation does not balance, there is a bug or a theft — and both are worth knowing.

### 3.2 Units of measure

Three levels, always converted to a **base unit** per ingredient:

| Level | Example | Stored as |
|---|---|---|
| Purchase unit | 1 bag = 25 kg | `purchase_uom`, `purchase_conversion` |
| Stock/base unit | gram | `base_unit` |
| Recipe unit | 120 g | `qty_required` in base unit |

All stock, costing, and variance math happens in the base unit. UI converts for display only.

### 3.3 Costing method

**Weighted Average Cost (WAC)** as the primary method — it is robust, easy to explain to an owner, and does not need batch layers for every item.

```
new_wac = (qty_on_hand × current_wac + received_qty × received_rate) / (qty_on_hand + received_qty)
```

Optional **batch tracking (FEFO)** on top, enabled per-ingredient, for perishables that need expiry dates (paneer, curd, cut vegetables, prepped gravies). Batch layers drive expiry alerts; WAC still drives P&L.

### 3.4 Yield factor

```
usable_qty = purchased_qty × yield_pct
effective_cost_per_usable_unit = rate / yield_pct
```

Example: chicken bought at ₹220/kg with 72% yield actually costs ₹305/kg of usable meat. Recipe costing must use the effective cost, otherwise every plate cost is understated.

---

## 4. Data model changes

### 4.1 New tables

```sql
-- Departments / cost centres (Kitchen, Bar, Housekeeping, Bakery)
create table departments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  code text,
  unique (restaurant_id, name)
);

-- Physical stores / locations (Main Store, Dry Store, Cold Room, Bar Counter)
create table stock_locations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  department_id uuid references departments(id) on delete set null,
  is_default boolean not null default false,
  unique (restaurant_id, name)
);

-- Ingredient groups for spend analysis (Vegetables, Dairy, Meat, Groceries,
-- Spices, Packaging, Beverages, Cleaning)
create table ingredient_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  unique (restaurant_id, name)
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  phone text,
  gstin text,
  address text,
  payment_terms_days int not null default 0,   -- 0 = cash
  lead_time_days numeric not null default 1,
  is_active boolean not null default true
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  po_number text not null,
  status text not null default 'draft',          -- draft|sent|partial|received|cancelled
  expected_date date,
  subtotal numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, po_number)
);

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  qty_ordered numeric not null,           -- in purchase uom
  qty_received numeric not null default 0,
  rate numeric not null,                  -- per purchase uom, pre-tax
  tax_pct numeric not null default 0
);

-- Goods Received Note — the event that actually adds stock and sets cost
create table goods_receipts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  purchase_order_id uuid references purchase_orders(id),
  grn_number text not null,
  invoice_number text,
  invoice_date date,
  location_id uuid references stock_locations(id),
  subtotal numeric not null default 0,
  tax_total numeric not null default 0,
  total numeric not null default 0,
  payment_status text not null default 'unpaid',  -- unpaid|partial|paid
  amount_paid numeric not null default 0,
  is_cash_purchase boolean not null default false, -- mandi / daily veg run
  received_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (restaurant_id, grn_number)
);

create table goods_receipt_items (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid not null references goods_receipts(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  qty_received numeric not null,         -- purchase uom
  qty_base numeric not null,             -- converted to base unit
  rate numeric not null,
  tax_pct numeric not null default 0,
  line_total numeric not null,
  batch_code text,
  expiry_date date
);

-- The canonical ledger. Replaces inventory_transactions.
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  location_id uuid references stock_locations(id),
  qty_delta numeric not null,            -- + in, − out, in BASE unit
  unit_cost numeric,                     -- WAC at time of movement
  value_delta numeric,                   -- qty_delta × unit_cost
  reason text not null,                  -- purchase|consumption|waste|transfer_in|
                                         -- transfer_out|count_adjust|production_in|
                                         -- production_out|return|opening
  ref_table text,                        -- 'orders' | 'goods_receipts' | 'stock_counts'
  ref_id uuid,
  note text,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on stock_movements (restaurant_id, ingredient_id, created_at desc);
create index on stock_movements (restaurant_id, reason, created_at desc);

-- Waste with reason codes
create table waste_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  ingredient_id uuid references ingredients(id),
  menu_item_id uuid references menu_items(id),      -- plate waste
  qty numeric not null,
  cost numeric not null default 0,
  reason text not null,     -- spoilage|expiry|overcook|spillage|customer_return|staff_meal|trial
  shift text,               -- breakfast|lunch|dinner
  note text,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Physical counts / audits
create table stock_counts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  location_id uuid references stock_locations(id),
  count_type text not null default 'cycle',      -- cycle|full|spot
  status text not null default 'open',           -- open|submitted|approved|cancelled
  period_start timestamptz,
  period_end timestamptz,
  counted_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table stock_count_items (
  id uuid primary key default gen_random_uuid(),
  stock_count_id uuid not null references stock_counts(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  system_qty numeric not null,
  counted_qty numeric,
  variance_qty numeric generated always as (counted_qty - system_qty) stored,
  variance_value numeric,
  note text
);

-- Prep / sub-recipes: bulk gravy, marinade, batter produced from raw items
create table prep_batches (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  output_ingredient_id uuid not null references ingredients(id),
  qty_produced numeric not null,
  cost_total numeric not null default 0,
  produced_by uuid references auth.users(id),
  expiry_at timestamptz,
  created_at timestamptz not null default now()
);
```

### 4.2 Columns added to existing tables

```sql
alter table ingredients
  add column category_id uuid references ingredient_categories(id),
  add column department_id uuid references departments(id),
  add column base_unit text not null default 'g',      -- g | ml | each
  add column purchase_uom text default 'kg',
  add column purchase_conversion numeric not null default 1000, -- 1 kg = 1000 g
  add column yield_pct numeric not null default 1.0,   -- 0.72 for chicken
  add column avg_cost numeric not null default 0,      -- WAC in base unit
  add column last_purchase_rate numeric,
  add column is_perishable boolean not null default false,
  add column shelf_life_days int,
  add column is_prep_item boolean not null default false,
  add column hsn_code text,
  add column default_tax_pct numeric not null default 0;

alter table inventory_items
  add column location_id uuid references stock_locations(id),
  add column par_level numeric,            -- ideal stock for a normal service day
  add column safety_stock numeric not null default 0,
  add column reorder_point numeric,        -- computed, cached
  add column avg_daily_usage numeric not null default 0,
  add column last_counted_at timestamptz;

alter table menu_item_ingredients
  add column is_optional boolean not null default false,
  add column wastage_pct numeric not null default 0;   -- prep loss on this line

alter table menu_items
  add column plate_cost numeric not null default 0,    -- cached, recomputed on cost change
  add column target_food_cost_pct numeric;
```

### 4.3 Migration path from `inventory_transactions`

Keep the old table for one release. Backfill:

```sql
insert into stock_movements (restaurant_id, ingredient_id, qty_delta, reason, created_at)
select ii.restaurant_id, ii.ingredient_id, it.delta,
       case it.type
         when 'purchase' then 'purchase'
         when 'consumption' then 'consumption'
         when 'waste' then 'waste'
         else 'count_adjust'
       end,
       it.created_at
from inventory_transactions it
join inventory_items ii on ii.id = it.inventory_item_id;
```

Then point `src/lib/actions/inventory.ts` and `orders.ts` at the new table and drop the old one in the following release.

---

## 5. Engine changes

### 5.1 Atomic decrement via Postgres RPC

Replace the per-line loop in `placeOrder` with a single `plpgsql` function so the whole order either reserves all stock or none:

```sql
create or replace function consume_for_order(
  p_restaurant_id uuid,
  p_order_id uuid,
  p_lines jsonb          -- [{menu_item_id, qty}]
) returns jsonb
language plpgsql security definer as $$
declare v_short jsonb := '[]'::jsonb;
begin
  -- lock all affected inventory rows in a stable order to avoid deadlocks
  -- expand recipes, apply wastage_pct, check availability, decrement,
  -- insert stock_movements rows with unit_cost = ingredients.avg_cost
  -- return shortages if any; caller rolls back
end $$;
```

Benefits: no partial decrements, correct concurrent behaviour during a rush, and one place that writes the ledger.

### 5.2 Cost-aware consumption

Every consumption movement stores `unit_cost = ingredients.avg_cost` at that moment. This makes **COGS a summable column** instead of a nightly recomputation, and it survives later price changes.

### 5.3 Restore on cancel / void

`cancelOrder` and item-level voids must write compensating `stock_movements` with `reason = 'return'`. Currently missing entirely.

### 5.4 Reorder point calculation

Run nightly (or on each GRN):

```
avg_daily_usage = consumption over last 28 days / 28
reorder_point   = avg_daily_usage × supplier.lead_time_days + safety_stock
safety_stock    = (peak_daily_usage − avg_daily_usage) × lead_time_days
days_of_cover   = qty_on_hand / avg_daily_usage
```

Replace the static `low_threshold` with `reorder_point`, keeping `low_threshold` as a manual override.

### 5.5 Alert tiers

| Tier | Condition | Action |
|---|---|---|
| Info | `days_of_cover < 5` | Show on dashboard |
| Warning | `qty <= reorder_point` | Notification + add to draft PO |
| Critical | `days_of_cover < 1` or portions ≤ 2 | Push to KDS + manager, flag 86 risk |
| Expiry | batch `expiry_date <= today + 2` | Use-first list on KDS |
| Price | received rate > 15% above 90-day average | Purchase price alert |

Alerts write to the existing `notifications` table, so the current bell icon and activity feed pick them up with no UI work.

### 5.6 Realtime

Add `inventory_items` and `stock_movements` to the Supabase realtime publication so the dashboard stock list and the KDS 86-risk board update live. The existing `useRealtime` hook already handles subscribe + polling fallback.

---

## 6. Analytics integration

These metrics replace the current fake `Est. margin` and extend `AnalyticsBundle` in `src/lib/analytics/compute.ts`.

### 6.1 New core metrics

| Metric | Formula | Why the GM cares |
|---|---|---|
| **COGS** | Σ `−value_delta` where `reason = 'consumption'` | Actual cost of what was sold |
| **Food cost %** | COGS ÷ net revenue | The single headline number in F&B |
| **Theoretical usage** | Σ (recipe qty × dishes sold) | What *should* have been used |
| **Actual usage** | opening + purchases − closing | What was really used |
| **Variance** | actual − theoretical, in qty and ₹ | Pilferage, over-portioning, unlogged waste |
| **Gross margin per dish** | price − plate cost | Menu pricing decisions |
| **Waste %** | waste value ÷ COGS | Kitchen discipline |
| **Inventory value** | Σ qty × avg_cost | Working capital locked in stock |
| **Stock turnover** | COGS ÷ average inventory value | How fast money recycles |
| **Days of inventory** | 365 ÷ turnover | Overstocking detector |
| **Spend by supplier** | Σ GRN totals | Negotiation leverage |
| **Payables outstanding** | Σ (total − amount_paid) | Cash flow |

### 6.2 Menu engineering

Cross popularity (order qty) with contribution margin (price − plate cost):

| | High margin | Low margin |
|---|---|---|
| **High popularity** | **Star** — protect, never discount | **Plowhorse** — re-cost or shrink portion |
| **Low popularity** | **Puzzle** — promote, reposition on menu | **Dog** — remove from menu |

This is only possible once `plate_cost` exists, and it is the most persuasive screen in a sales demo to a hotel owner.

### 6.3 ABC classification

Rank ingredients by annual spend value: A = top 80% of value (count them weekly), B = next 15% (fortnightly), C = last 5% (monthly). Drives the cycle-count schedule so staff do not count 200 items every day.

---

## 7. Sub-pages to build

Six core screens plus two extensions. All live inside the existing Executive Console shell as tabs or nested routes under `/dashboard/inventory/*`, keeping the navy sidebar + top bar layout.

---

### Page 1 — Stock on Hand (the live register)

**Route:** `/dashboard?tab=inventory` (upgrade of the current list)

**Purpose:** what do I have, where is it, and what is it worth.

| Element | Detail |
|---|---|
| Filters | Department, category, location, status (OK / low / critical / expired), search |
| Columns | Item, category, location, qty (base + purchase unit), par, reorder point, days of cover, WAC, stock value, last movement |
| Row states | Green OK, amber at/below reorder point, red out of stock, purple expiring |
| Row actions | Quick adjust, log waste, transfer to another store, view full movement history |
| Header cards | Total stock value, items below reorder, items expiring in 48 h, dead stock count |
| Export | CSV / PDF for the owner |

**Key upgrade over today:** value in ₹, department grouping, days-of-cover instead of a raw threshold, and a drill-down into the ledger.

---

### Page 2 — Purchases & Suppliers (where the money goes)

**Route:** `/dashboard/inventory/purchases`

**Purpose:** the GM's core request — a complete record of money out.

**Tabs inside the page:**

1. **Purchase Orders** — draft → sent → partially received → received. Auto-draft POs generated from reorder points, grouped by supplier.
2. **Goods Receipt (GRN)** — receive against a PO or record a direct/cash purchase. Entering a GRN is the *only* way stock and cost enter the system. Supports partial receipt, rate change on receipt, batch code and expiry.
3. **Cash / Mandi purchases** — a deliberately fast form for the daily vegetable run: supplier, item, qty, amount paid, photo of the slip. No PO required. This matters in India where a large share of purchases are cash with no invoice.
4. **Suppliers** — contact, GSTIN, payment terms, lead time, on-time %, price reliability.
5. **Payables** — outstanding per supplier, ageing buckets (0–15 / 16–30 / 30+ days), record payment.

**Analytics on this page:** spend by supplier, spend by category, month-on-month spend trend, price trend per ingredient with a 90-day average line, and a **price increase alert** when a received rate jumps more than 15%.

---

### Page 3 — Recipes & Plate Costing (BOM)

**Route:** `/dashboard/inventory/recipes`

**Purpose:** the mapping layer the GM described — every menu item tied to its raw materials.

| Element | Detail |
|---|---|
| Recipe builder | Add ingredients with qty in base unit, mark optional add-ons, set line wastage % |
| Sub-recipes | A prep item (biryani gravy, ginger-garlic paste, dosa batter) is itself an ingredient produced by `prep_batches`, and can be nested inside dish recipes |
| Live cost card | Plate cost, food cost %, contribution margin, all recalculated as you type |
| Price advisor | "At a 30% target food cost, this dish should be priced ₹X" |
| Bulk view | All dishes sorted by food cost % — instantly shows which dishes are bleeding |
| Menu engineering quadrant | Scatter plot: popularity vs margin, four labelled zones |
| Impact preview | "Paneer rate went up 12% → 6 dishes cross the 35% food-cost line" |

**Why this sells:** an owner can watch their biryani margin change live when basmati rate changes. No POS in this price band shows that.

---

### Page 4 — Consumption & Variance (theoretical vs actual)

**Route:** `/dashboard/inventory/variance`

**Purpose:** the report that finds leakage. This is the single most valuable screen for a GM.

| Element | Detail |
|---|---|
| Period selector | Shift / day / week / month, tied to stock counts |
| Table | Ingredient, opening, purchased, theoretical usage, actual usage, variance qty, variance ₹, variance % |
| Colour scale | Within ±2% green, ±5% amber, beyond red |
| Drill-down | Per ingredient → which dishes consumed it, which shifts, which staff logged waste |
| Ranking | Top 10 loss drivers by rupee value |
| Explanations | Auto-attribute variance to logged waste, staff meals, and unexplained remainder |
| Trend | Variance % over the last 12 periods per ingredient |

**Rule of thumb baked into the UI:** unexplained variance above 3% of theoretical usage on an A-class item triggers an investigation flag.

---

### Page 5 — Waste & Wastage Log

**Route:** `/dashboard/inventory/waste`

**Purpose:** turn "wastage" from a vague complaint into a rupee figure with a cause.

| Element | Detail |
|---|---|
| Quick entry | Available on KDS too — item, qty, reason code, shift, optional photo |
| Reason codes | Spoilage, expiry, overcooked, spillage, customer return, staff meal, trial/tasting |
| Costing | Auto-valued at current WAC |
| Analytics | Waste ₹ by reason, by shift, by station, by day of week; waste as % of COGS |
| Expiry board | Batches expiring in 48 h with a "use first" list pushed to the kitchen |
| Insight line | "Curd waste is ₹4,200 this month, 68% from expiry — reduce order qty from 12 kg to 8 kg per cycle" |

---

### Page 6 — Stock Count & Audit

**Route:** `/dashboard/inventory/counts`

**Purpose:** keep system stock honest, and produce a defensible closing stock value.

| Element | Detail |
|---|---|
| Count types | Cycle count (ABC schedule), full month-end count, spot check |
| Count sheet | Mobile-friendly, location by location, system qty hidden by default to prevent copying |
| Blind mode | Counter cannot see expected qty — a real audit control |
| Submit → review | Manager sees variance qty and value per line before approving |
| Approval | On approval, writes `count_adjust` movements; before approval, nothing changes |
| Period close | Locks the period, snapshots closing stock value, feeds the variance page |
| History | Who counted, who approved, when, with full variance trail |

---

### Page 7 (extension) — Alerts & Auto-Reorder

**Route:** `/dashboard/inventory/alerts`

| Element | Detail |
|---|---|
| Live alert board | Grouped by tier (critical / warning / expiry / price) |
| 86 risk panel | Dishes about to become unavailable, with portions left and the blocking ingredient |
| Suggested order | Auto-computed qty = par − on hand + forecast demand for the lead time window, grouped by supplier, one click to a draft PO |
| Forecast input | Day of week, festival/wedding season flag, last 4 same-weekdays |
| Escalation rules | Configurable: notify manager after X hours unactioned |
| Snooze / acknowledge | With reason, logged for audit |

---

### Page 8 (extension) — Inventory Analytics / P&L Bridge

**Route:** `/dashboard?tab=analytics` (new section) or `/dashboard/inventory/analytics`

| Widget | Content |
|---|---|
| Food cost % gauge | Actual vs target, trend line |
| COGS waterfall | Opening stock → purchases → closing stock → COGS |
| Spend by category | Vegetables / dairy / meat / groceries / packaging, month on month |
| Top 20 spend items | With price trend sparkline |
| ABC/XYZ matrix | Value class vs demand-variability class, drives count and order policy |
| Dead stock | No movement in 30/60/90 days, with locked-up rupee value |
| Turnover & days of inventory | Per category |
| Margin bridge | How much of the revenue change came from volume, price, or cost |
| Forecast vs actual consumption | Accuracy of the prediction engine, improving over time |

---

## 8. Permissions

Extends the existing `src/lib/rbac.ts` model.

| Action | super_admin | restaurant_admin | manager | kitchen | waiter |
|---|:--:|:--:|:--:|:--:|:--:|
| View stock | ✅ | ✅ | ✅ | ✅ | — |
| View costs / margins | ✅ | ✅ | ✅ | — | — |
| Adjust stock | ✅ | ✅ | ✅ | ✅ | — |
| Log waste | ✅ | ✅ | ✅ | ✅ | — |
| 86 an item | ✅ | ✅ | ✅ | ✅ | — |
| Create PO | ✅ | ✅ | ✅ | — | — |
| Receive GRN | ✅ | ✅ | ✅ | — | — |
| Edit supplier / rates | ✅ | ✅ | — | — | — |
| Perform count | ✅ | ✅ | ✅ | ✅ | — |
| Approve count | ✅ | ✅ | — | — | — |
| Close period | ✅ | ✅ | — | — | — |
| Edit recipes | ✅ | ✅ | ✅ | — | — |

Add `canViewCosts`, `canManagePurchasing`, `canApproveCount`, `canClosePeriod` helpers alongside the existing `canViewUsersTab` pattern.

---

## 9. Phased rollout

### Phase 1 — Foundation (1–2 weeks)
Ledger and costing skeleton. New `stock_movements` table, ingredient cost/UOM/yield/category/department columns, backfill from `inventory_transactions`, atomic `consume_for_order` RPC, restore-on-cancel. No new UI beyond upgrading the existing stock list with value and department.

*Outcome:* every movement is auditable and carries a cost.

### Phase 2 — Money in (1–2 weeks)
Suppliers, purchase orders, GRN, cash purchase form, payables. WAC updates on receipt. Purchases page ships.

*Outcome:* the GM's "where is my money going" question is answered.

### Phase 3 — Recipes & plate cost (1 week)
Recipe builder UI on the existing `menu_item_ingredients` table, sub-recipes via `prep_batches`, cached `plate_cost`, real food cost % replacing the heuristic margin KPI, menu engineering quadrant.

*Outcome:* the demo becomes genuinely differentiated from a POS.

### Phase 4 — Counts & variance (1–2 weeks)
Stock counts with blind mode and approval, period close, theoretical vs actual variance report.

*Outcome:* leakage becomes visible and quantified.

### Phase 5 — Waste & alerts (1 week)
Waste log with reason codes on dashboard and KDS, tiered alerts, reorder points, auto-draft POs, expiry board.

*Outcome:* the system becomes proactive rather than a record book.

### Phase 6 — Analytics & forecasting (1–2 weeks)
Inventory analytics page, ABC/XYZ, dead stock, turnover, demand forecast feeding suggested order quantities, Zara insights grounded in real cost data.

*Outcome:* the AI copilot story becomes real instead of scripted.

---

## 10. Risks and decisions to confirm

1. **Data entry burden is the number one failure mode** for restaurant inventory systems. Every screen must have a fast path: barcode/voice/photo capture where possible, sensible defaults, and bulk entry. If the storekeeper needs more than 60 seconds per GRN, the system will be abandoned within a month.
2. **Cash purchases without invoices** are normal in this market. The GRN flow must not require a PO or a GSTIN.
3. **Regional units** — many suppliers quote in local units. The UOM conversion table needs per-ingredient overrides, not a global list.
4. **Who owns the count?** Blind counts and manager approval only work if the roles are actually separated at the client. Confirm staffing before promising audit controls.
5. **Costing method lock-in.** WAC is recommended; switching to FIFO later requires a full ledger replay. Decide before Phase 2 ships.
6. **Multi-tenant scoping.** Every new table needs `restaurant_id` plus RLS matching the existing pattern, and every query must filter on it.
7. **Historical seed data** currently bypasses inventory. Either backfill synthetic movements or exclude the seeded window from variance reports, otherwise the first variance report will look catastrophic.

---

## 11. Questions for the GM

Before Phase 2, confirm:

- How many stores/locations do you physically hold stock in?
- Which departments should spend be split across?
- What share of purchases are cash vs credit, and what are typical payment terms?
- Do you count stock today? How often, and who does it?
- What is your target food cost %, and do you track it now?
- Which 10–15 ingredients make up most of your spend? (These become the A-class pilot set.)
- Do you need GST-compliant purchase records for filing, or is this internal only?
