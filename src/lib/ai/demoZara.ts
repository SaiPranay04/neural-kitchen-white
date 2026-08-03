import { MENU_ITEMS, type DemoMenuItem } from "@/lib/constants";
import { normalizeToken, parseMenuQuery } from "@/lib/ai/parseQuery";

function haystack(item: DemoMenuItem) {
  return `${item.name} ${item.category} ${item.desc} ${item.tags.join(" ")} ${item.tag}`.toLowerCase();
}

function matchesKeywords(item: DemoMenuItem, keywords: string[]) {
  if (!keywords.length) return true;
  const hay = haystack(item);
  return keywords.some((k) => {
    const n = normalizeToken(k);
    if (n.length >= 3 && hay.includes(n)) return true;
    return item.tags.some((t) => normalizeToken(t) === n);
  });
}

function pick(query: string): DemoMenuItem[] {
  const prefs = parseMenuQuery(query);
  const q = query.toLowerCase();

  let pool = MENU_ITEMS.filter((item) => {
    if (prefs.diet === "veg" && !item.veg) return false;
    if (prefs.diet === "nonveg" && item.veg) return false;
    if (prefs.budget != null && item.price > prefs.budget) return false;
    if (prefs.spiceMax === 1 && item.spicy > 1) return false;
    if (/\bspicy|chilli|chili\b/.test(q) && item.spicy < 1) return false;
    return matchesKeywords(item, prefs.keywords);
  });

  // Category shortcuts when keywords alone are thin
  if (!pool.length) {
    const catMap: [RegExp, string][] = [
      [/biryani|biriyani/, "Biryani"],
      [/dosa/, "Dosa"],
      [/dessert|sweet|mithai/, "Desserts"],
      [/drink|coffee|lassi|beverage/, "Drinks"],
      [/tandoor|tikka|kebab/, "Tandoor"],
      [/curry|curries/, "Curries"],
      [/starter|appetizer/, "Starters"],
    ];
    for (const [re, cat] of catMap) {
      if (re.test(q)) {
        pool = MENU_ITEMS.filter((i) => i.category === cat);
        if (prefs.diet === "veg") pool = pool.filter((i) => i.veg);
        if (prefs.diet === "nonveg") pool = pool.filter((i) => !i.veg);
        break;
      }
    }
  }

  if (!pool.length && !prefs.keywords.length) {
    pool = [...MENU_ITEMS].sort((a, b) => b.rating - a.rating);
  }

  return pool.sort((a, b) => b.rating - a.rating).slice(0, 3);
}

function allergenReply(query: string): string | null {
  const q = query.toLowerCase();
  const allergen =
    (/\bdairy|milk|lactose\b/.test(q) && "dairy") ||
    (/\bnut|nuts|cashew|almond\b/.test(q) && "nuts") ||
    (/\bgluten|wheat\b/.test(q) && "gluten") ||
    (/\bsoy|soya\b/.test(q) && "soy") ||
    null;
  if (!allergen && !/\ballergen|allergic|allergy\b/.test(q)) return null;

  if (!allergen) {
    return "I can flag dairy, nuts, gluten, and soy. Ask e.g. “anything without dairy?” or “safe for nut allergy?”";
  }

  const safe = MENU_ITEMS.filter((i) => !i.allergens.includes(allergen)).slice(0, 4);
  const risky = MENU_ITEMS.filter((i) => i.allergens.includes(allergen)).slice(0, 3);
  const safeLine = safe.map((i) => `${i.name} (₹${i.price})`).join(", ");
  const riskLine = risky.map((i) => i.name).join(", ");
  return `For ${allergen}-sensitive guests, safer picks: ${safeLine}. Avoid / ask kitchen about: ${riskLine}. Always confirm with staff before ordering.`;
}

/** Demo-only Zara reply grounded in MENU_ITEMS (no LLM). */
export function demoZaraReply(query: string): string {
  const q = query.trim();
  if (!q) return "Tell me what you’re craving — veg, biryani, dosa, mild, or under ₹200.";

  const allergen = allergenReply(q);
  if (allergen) return allergen;

  const picks = pick(q);
  if (!picks.length) {
    return "Nothing on tonight’s menu matches that. Try paneer, biryani, dosa, veg, spicy, or desserts.";
  }

  const list = picks
    .map((i) => `${i.name} (₹${i.price}${i.veg ? ", veg" : ""}${i.spicy >= 2 ? ", spicy" : ""})`)
    .join(" · ");

  const top = picks[0];
  const tip =
    top.category === "Biryani"
      ? "Pairs well with raita or a sweet lassi."
      : top.category === "Dosa"
        ? "Add filter coffee for the classic South Indian combo."
        : top.category === "Desserts"
          ? "Great way to finish the meal."
          : top.veg
            ? "Solid veg pick from the live board."
            : "Popular with the dinner rush tonight.";

  return `From our menu: ${list}. ${tip}`;
}
