/**
 * Idempotent demo seed for Neural Kitchen.
 * Usage: npx tsx --env-file=.env.local scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 22);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_PASSWORD = "demo123456";
const SUPER_ADMIN_EMAIL = "superadmin@neuralkitchen.demo";
const SUPER_ADMIN_PASSWORD = "SuperAdmin@123";

const STAFF = [
  {
    email: SUPER_ADMIN_EMAIL,
    role: "super_admin",
    name: "Super Admin",
    password: SUPER_ADMIN_PASSWORD,
  },
  {
    email: "admin@spicegarden.demo",
    role: "restaurant_admin",
    name: "Admin",
    password: DEMO_PASSWORD,
  },
  {
    email: "manager@spicegarden.demo",
    role: "manager",
    name: "Meera",
    password: DEMO_PASSWORD,
  },
  {
    email: "waiter@spicegarden.demo",
    role: "waiter",
    name: "Arjun",
    password: DEMO_PASSWORD,
  },
  {
    email: "kitchen@spicegarden.demo",
    role: "kitchen",
    name: "Chef Kumar",
    password: DEMO_PASSWORD,
  },
] as const;

const CATEGORIES = [
  "Starters",
  "Tandoor",
  "Curries",
  "Rice & Biryani",
  "Breads",
  "Beverages",
  "Desserts",
];

type Dish = {
  name: string;
  category: string;
  price: number;
  veg: boolean;
  spice: number;
  tags: string[];
  station: string;
  prep: number;
  complexity: number;
  popularity: number;
  description: string;
  recipe: Record<string, number>;
};

const DISHES: Dish[] = [
  {
    name: "Paneer Tikka",
    category: "Tandoor",
    price: 280,
    veg: true,
    spice: 2,
    tags: ["paneer", "high-protein"],
    station: "tandoor",
    prep: 14,
    complexity: 1.2,
    popularity: 95,
    description: "Charred cottage cheese with peppers and tikka masala.",
    recipe: { Paneer: 120, Capsicum: 40, Yogurt: 30 },
  },
  {
    name: "Chilli Mushroom",
    category: "Starters",
    price: 240,
    veg: true,
    spice: 3,
    tags: ["mushroom", "spicy"],
    station: "wok",
    prep: 12,
    complexity: 1,
    popularity: 88,
    description: "Crispy mushrooms tossed in chilli garlic sauce.",
    recipe: { Mushroom: 150, Capsicum: 30, "Soy Sauce": 10 },
  },
  {
    name: "Chicken Tikka",
    category: "Tandoor",
    price: 320,
    veg: false,
    spice: 2,
    tags: ["chicken", "high-protein"],
    station: "tandoor",
    prep: 16,
    complexity: 1.25,
    popularity: 92,
    description: "Boneless chicken marinated overnight, flame-grilled.",
    recipe: { Chicken: 180, Yogurt: 40 },
  },
  {
    name: "Dal Makhani",
    category: "Curries",
    price: 260,
    veg: true,
    spice: 1,
    tags: ["comfort"],
    station: "wok",
    prep: 10,
    complexity: 1,
    popularity: 80,
    description: "Slow-cooked black lentils finished with butter.",
    recipe: { "Black Lentils": 100, Cream: 40, Butter: 20 },
  },
  {
    name: "Butter Chicken",
    category: "Curries",
    price: 360,
    veg: false,
    spice: 1,
    tags: ["chicken", "creamy"],
    station: "wok",
    prep: 14,
    complexity: 1.2,
    popularity: 98,
    description: "Classic tomato-butter gravy with tender chicken.",
    recipe: { Chicken: 160, Cream: 50, Butter: 25, Tomato: 80 },
  },
  {
    name: "Veg Biryani",
    category: "Rice & Biryani",
    price: 290,
    veg: true,
    spice: 2,
    tags: ["rice"],
    station: "fryer",
    prep: 22,
    complexity: 1.4,
    popularity: 85,
    description: "Fragrant basmati layered with seasonal vegetables.",
    recipe: { "Basmati Rice": 180, Paneer: 40, Capsicum: 30 },
  },
  {
    name: "Chicken Biryani",
    category: "Rice & Biryani",
    price: 380,
    veg: false,
    spice: 2,
    tags: ["rice", "chicken"],
    station: "fryer",
    prep: 24,
    complexity: 1.5,
    popularity: 99,
    description: "Hyderabadi-style dum biryani with raita.",
    recipe: { "Basmati Rice": 200, Chicken: 180 },
  },
  {
    name: "Garlic Naan",
    category: "Breads",
    price: 80,
    veg: true,
    spice: 0,
    tags: ["bread"],
    station: "tandoor",
    prep: 6,
    complexity: 0.8,
    popularity: 90,
    description: "Soft naan brushed with garlic butter.",
    recipe: { Flour: 80, Butter: 10 },
  },
  {
    name: "Masala Fries",
    category: "Starters",
    price: 160,
    veg: true,
    spice: 2,
    tags: ["snack"],
    station: "fryer",
    prep: 8,
    complexity: 0.9,
    popularity: 70,
    description: "Crispy fries with chaat masala.",
    recipe: { Potato: 200 },
  },
  {
    name: "Mango Lassi",
    category: "Beverages",
    price: 140,
    veg: true,
    spice: 0,
    tags: ["drink"],
    station: "cold",
    prep: 4,
    complexity: 0.6,
    popularity: 75,
    description: "Chilled yogurt mango smoothie.",
    recipe: {},
  },
  {
    name: "Paneer Butter Masala",
    category: "Curries",
    price: 300,
    veg: true,
    spice: 1,
    tags: ["paneer", "creamy"],
    station: "wok",
    prep: 13,
    complexity: 1.1,
    popularity: 87,
    description: "Cottage cheese in rich tomato-butter gravy.",
    recipe: { Paneer: 140, Cream: 40, Tomato: 70, Butter: 20 },
  },
  {
    name: "Hara Bhara Kebab",
    category: "Starters",
    price: 220,
    veg: true,
    spice: 1,
    tags: ["veg", "high-protein"],
    station: "fryer",
    prep: 11,
    complexity: 1,
    popularity: 72,
    description: "Spinach and pea kebabs with mint chutney.",
    recipe: { Potato: 80, Flour: 20 },
  },
  {
    name: "Gulab Jamun",
    category: "Desserts",
    price: 140,
    veg: true,
    spice: 0,
    tags: ["dessert", "sweet", "mithai"],
    station: "cold",
    prep: 5,
    complexity: 0.6,
    popularity: 91,
    description: "Warm milk dumplings soaked in rose syrup.",
    recipe: {},
  },
  {
    name: "Kulfi Falooda",
    category: "Desserts",
    price: 180,
    veg: true,
    spice: 0,
    tags: ["dessert", "sweet", "ice"],
    station: "cold",
    prep: 6,
    complexity: 0.7,
    popularity: 84,
    description: "Saffron kulfi with falooda and rose syrup.",
    recipe: {},
  },
];

const INGREDIENTS: { name: string; unit: string; qty: number; low: number }[] = [
  { name: "Paneer", unit: "g", qty: 600, low: 200 }, // ~5 portions at 120g
  { name: "Chicken", unit: "g", qty: 5000, low: 800 },
  { name: "Basmati Rice", unit: "g", qty: 900, low: 600 },
  { name: "Mushroom", unit: "g", qty: 2000, low: 300 },
  { name: "Capsicum", unit: "g", qty: 1500, low: 200 },
  { name: "Yogurt", unit: "g", qty: 1200, low: 200 },
  { name: "Cream", unit: "ml", qty: 1000, low: 200 },
  { name: "Butter", unit: "g", qty: 800, low: 100 },
  { name: "Tomato", unit: "g", qty: 2000, low: 300 },
  { name: "Black Lentils", unit: "g", qty: 1500, low: 200 },
  { name: "Soy Sauce", unit: "ml", qty: 500, low: 50 },
  { name: "Flour", unit: "g", qty: 3000, low: 400 },
  { name: "Potato", unit: "g", qty: 2500, low: 400 },
];

async function upsertUser(email: string, name: string, password = DEMO_PASSWORD) {
  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = listed?.users?.find((u) => u.email === email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error || !data.user) throw error ?? new Error("user create failed");
  return data.user.id;
}

async function wipeRestaurant(slug: string) {
  const { data: existing } = await admin
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!existing) return;

  // Explicit child cleanup in case CASCADE policies block a bare delete
  const rid = existing.id;
  const { data: orders } = await admin.from("orders").select("id").eq("restaurant_id", rid);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length) {
    await admin.from("order_items").delete().in("order_id", orderIds);
    await admin.from("payments").delete().in("order_id", orderIds);
    await admin.from("feedback").delete().in("order_id", orderIds);
  }
  await admin.from("orders").delete().eq("restaurant_id", rid);
  await admin.from("service_requests").delete().eq("restaurant_id", rid);
  await admin.from("notifications").delete().eq("restaurant_id", rid);
  await admin.from("operational_insights").delete().eq("restaurant_id", rid);
  await admin.from("activity_logs").delete().eq("restaurant_id", rid);
  await admin.from("demand_forecasts").delete().eq("restaurant_id", rid);
  await admin.from("restaurant_members").delete().eq("restaurant_id", rid);

  const { data: tables } = await admin.from("tables").select("id").eq("restaurant_id", rid);
  const tableIds = (tables ?? []).map((t) => t.id);
  if (tableIds.length) {
    await admin.from("qr_sessions").delete().in("table_id", tableIds);
  }
  await admin.from("tables").delete().eq("restaurant_id", rid);

  const { data: menu } = await admin.from("menu_items").select("id").eq("restaurant_id", rid);
  const menuIds = (menu ?? []).map((m) => m.id);
  if (menuIds.length) {
    await admin.from("menu_item_ingredients").delete().in("menu_item_id", menuIds);
  }
  await admin.from("menu_items").delete().eq("restaurant_id", rid);
  await admin.from("menu_categories").delete().eq("restaurant_id", rid);

  const { data: ings } = await admin.from("ingredients").select("id").eq("restaurant_id", rid);
  const ingIds = (ings ?? []).map((i) => i.id);
  if (ingIds.length) {
    const { data: inv } = await admin
      .from("inventory_items")
      .select("id")
      .eq("restaurant_id", rid);
    const invIds = (inv ?? []).map((i) => i.id);
    if (invIds.length) {
      await admin.from("inventory_transactions").delete().in("inventory_item_id", invIds);
    }
    await admin.from("inventory_items").delete().eq("restaurant_id", rid);
    await admin.from("ingredients").delete().eq("restaurant_id", rid);
  }

  await admin.from("branches").delete().eq("restaurant_id", rid);
  const { error } = await admin.from("restaurants").delete().eq("id", rid);
  if (error) throw error;
}

async function seedRestaurant(opts: {
  name: string;
  slug: string;
  full?: boolean;
}) {
  await wipeRestaurant(opts.slug);

  const { data: restaurant, error } = await admin
    .from("restaurants")
    .insert({
      name: opts.name,
      slug: opts.slug,
      tax_rate: 0.05,
      settings: {
        stations: { tandoor: 4, wok: 6, fryer: 4, cold: 8 },
        close_hours: 4,
      },
    })
    .select("*")
    .single();
  if (error || !restaurant) throw error;

  await admin.from("branches").insert({
    restaurant_id: restaurant.id,
    name: "Main",
  });

  if (!opts.full) {
    // Cafe Nova isolation proof — tiny menu
    const { data: cat } = await admin
      .from("menu_categories")
      .insert({ restaurant_id: restaurant.id, name: "Specials", sort: 1 })
      .select("id")
      .single();
    await admin.from("menu_items").insert([
      {
        restaurant_id: restaurant.id,
        category_id: cat!.id,
        name: "Nova Latte",
        description: "House espresso with oat milk",
        price: 180,
        veg: true,
        station: "cold",
        base_prep_min: 4,
      },
      {
        restaurant_id: restaurant.id,
        category_id: cat!.id,
        name: "Avocado Toast",
        description: "Sourdough, chilli flakes",
        price: 240,
        veg: true,
        station: "cold",
        base_prep_min: 8,
      },
      {
        restaurant_id: restaurant.id,
        category_id: cat!.id,
        name: "Berry Bowl",
        description: "Yogurt, granola, berries",
        price: 220,
        veg: true,
        station: "cold",
        base_prep_min: 6,
      },
    ]);
    return restaurant;
  }

  // Staff memberships (person-based; each email is a unique login)
  for (const s of STAFF) {
    const userId = await upsertUser(s.email, s.name, s.password);
    const { error: memErr } = await admin.from("restaurant_members").upsert(
      {
        restaurant_id: restaurant.id,
        user_id: userId,
        role: s.role,
      },
      { onConflict: "restaurant_id,user_id" }
    );
    if (memErr) {
      console.warn(`Membership warn for ${s.email}:`, memErr.message);
      // enum may need migration 002 — try restaurant_admin fallback for super_admin
      if (s.role === "super_admin") {
        await admin.from("restaurant_members").upsert(
          {
            restaurant_id: restaurant.id,
            user_id: userId,
            role: "restaurant_admin",
          },
          { onConflict: "restaurant_id,user_id" }
        );
        console.warn(
          "super_admin enum missing — ran 002_super_admin.sql? Temporarily mapped Super Admin as restaurant_admin."
        );
      } else {
        throw memErr;
      }
    }
  }

  // Tables
  const tableRows = Array.from({ length: 12 }, (_, i) => ({
    restaurant_id: restaurant.id,
    number: i + 1,
    capacity: i % 3 === 0 ? 6 : 4,
    status: [3, 5, 9].includes(i + 1) ? "occupied" : "available",
    qr_token: nanoid(),
  }));
  const { data: tables } = await admin.from("tables").insert(tableRows).select("*");

  // Categories
  const { data: cats } = await admin
    .from("menu_categories")
    .insert(
      CATEGORIES.map((name, idx) => ({
        restaurant_id: restaurant.id,
        name,
        sort: idx + 1,
      }))
    )
    .select("*");
  const catByName = new Map((cats ?? []).map((c) => [c.name, c.id]));

  // Ingredients + inventory
  const { data: ings } = await admin
    .from("ingredients")
    .insert(
      INGREDIENTS.map((i) => ({
        restaurant_id: restaurant.id,
        name: i.name,
        unit: i.unit,
      }))
    )
    .select("*");
  const ingByName = new Map((ings ?? []).map((i) => [i.name, i]));

  for (const ing of INGREDIENTS) {
    const row = ingByName.get(ing.name)!;
    const { data: inv } = await admin
      .from("inventory_items")
      .insert({
        ingredient_id: row.id,
        restaurant_id: restaurant.id,
        qty: ing.qty,
        low_threshold: ing.low,
        reorder_qty: Math.round(ing.qty * 0.5),
      })
      .select("id")
      .single();

    // backdated consumption for depletion rates
    const now = Date.now();
    await admin.from("inventory_transactions").insert([
      {
        inventory_item_id: inv!.id,
        delta: -Math.round(ing.qty * 0.08),
        type: "consumption",
        created_at: new Date(now - 2.5 * 3600_000).toISOString(),
      },
      {
        inventory_item_id: inv!.id,
        delta: -Math.round(ing.qty * 0.05),
        type: "consumption",
        created_at: new Date(now - 1.2 * 3600_000).toISOString(),
      },
    ]);
  }

  // Menu items + recipes
  const menuIdByName = new Map<string, string>();
  for (const dish of DISHES) {
    const { data: item } = await admin
      .from("menu_items")
      .insert({
        restaurant_id: restaurant.id,
        category_id: catByName.get(dish.category),
        name: dish.name,
        description: dish.description,
        price: dish.price,
        veg: dish.veg,
        spice: dish.spice,
        tags: dish.tags,
        station: dish.station,
        base_prep_min: dish.prep,
        complexity: dish.complexity,
        popularity: dish.popularity,
        availability: "available",
        portions_left: 999,
        current_eta_min: dish.prep,
        explanation: "Available",
        image_url: null,
      })
      .select("id")
      .single();
    menuIdByName.set(dish.name, item!.id);

    const recipeRows = Object.entries(dish.recipe)
      .map(([name, qty]) => {
        const ing = ingByName.get(name);
        if (!ing) return null;
        return {
          menu_item_id: item!.id,
          ingredient_id: ing.id,
          qty_required: qty,
        };
      })
      .filter(Boolean);
    if (recipeRows.length) {
      await admin.from("menu_item_ingredients").insert(recipeRows as never);
    }
  }

  // Recompute availability roughly for paneer
  const paneerPortions = Math.floor(600 / 120);
  for (const dish of DISHES) {
    if (!dish.recipe.Paneer) continue;
    const id = menuIdByName.get(dish.name)!;
    const portions = Math.floor(600 / dish.recipe.Paneer);
    await admin
      .from("menu_items")
      .update({
        portions_left: portions,
        availability: portions <= 3 ? "low_stock" : "available",
        explanation:
          portions <= 3
            ? `Low stock — paneer covers ${portions} portions`
            : "Available",
      })
      .eq("id", id);
  }
  console.log(`Paneer portions demo target ~${paneerPortions}`);

  // Seed historical orders (lightweight — ~120 instead of 900 for speed)
  const tableIds = (tables ?? []).map((t) => t.id);
  for (let day = 0; day < 14; day++) {
    const ordersToday = day % 6 === 0 ? 12 : 8;
    for (let o = 0; o < ordersToday; o++) {
      const dish = DISHES[Math.floor(Math.random() * DISHES.length)];
      const menuId = menuIdByName.get(dish.name)!;
      const placed = new Date();
      placed.setDate(placed.getDate() - day);
      placed.setHours(12 + (o % 8), Math.floor(Math.random() * 50), 0, 0);
      const subtotal = dish.price;
      const tax = Number((subtotal * 0.05).toFixed(2));
      const { data: order } = await admin
        .from("orders")
        .insert({
          restaurant_id: restaurant.id,
          table_id: tableIds[o % tableIds.length],
          status: "completed",
          subtotal,
          tax,
          total: subtotal + tax,
          placed_at: placed.toISOString(),
        })
        .select("id")
        .single();
      await admin.from("order_items").insert({
        order_id: order!.id,
        menu_item_id: menuId,
        qty: 1,
        unit_price: dish.price,
        status: "served",
        station: dish.station,
        priority: 1,
        eta_min: dish.prep,
      });
    }
  }

  // Live demo orders on occupied tables
  const liveTables = (tables ?? []).filter((t) => [3, 5, 9].includes(t.number));
  for (const table of liveTables) {
    const dish = DISHES[table.number % DISHES.length];
    const { data: order } = await admin
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        table_id: table.id,
        status: "preparing",
        subtotal: dish.price,
        tax: Number((dish.price * 0.05).toFixed(2)),
        total: Number((dish.price * 1.05).toFixed(2)),
        placed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    await admin.from("order_items").insert({
      order_id: order!.id,
      menu_item_id: menuIdByName.get(dish.name)!,
      qty: 1,
      unit_price: dish.price,
      status: table.number === 5 ? "ready" : "preparing",
      station: dish.station,
      priority: 4,
      eta_min: dish.prep,
      started_at: new Date().toISOString(),
    });
  }

  await admin.from("service_requests").insert({
    restaurant_id: restaurant.id,
    table_id: liveTables[0].id,
    type: "water",
    status: "open",
  });

  await admin.from("notifications").insert([
    {
      restaurant_id: restaurant.id,
      audience_role: "manager",
      title: "Paneer running low",
      body: "Estimated depletion in ~40 minutes at current rate.",
      severity: "warning",
    },
    {
      restaurant_id: restaurant.id,
      audience_role: "manager",
      title: "Basmati below comfort threshold",
      body: "Consider prepping a reorder before dinner rush.",
      severity: "info",
    },
  ]);

  await admin.from("operational_insights").insert([
    {
      restaurant_id: restaurant.id,
      title: "Tandoor congestion at lunch",
      body: "Lunch delays were driven by simultaneous tandoor tickets. Pre-prep kebabs before 12:30.",
      metric: { station: "tandoor", peak: "13:10" },
    },
    {
      restaurant_id: restaurant.id,
      title: "Paneer at risk tonight",
      body: "At current consumption, paneer covers ~5 more portions.",
      metric: { ingredient: "Paneer", portions: 5 },
    },
  ]);

  console.log("\nQR deep-links (Table 7):");
  const t7 = (tables ?? []).find((t) => t.number === 7);
  if (t7) {
    const app = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    console.log(`${app}/r/spice-garden/t/${t7.qr_token}`);
  }

  return restaurant;
}

async function main() {
  console.log("Seeding Neural Kitchen…");
  await seedRestaurant({ name: "Spice Garden", slug: "spice-garden", full: true });
  await seedRestaurant({ name: "Cafe Nova", slug: "cafe-nova", full: false });
  console.log("\nDone.");
  console.log("Super Admin:", SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
  console.log("Other demo staff password:", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
