import type { MenuItem } from "@/types/database";

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "with",
  "under",
  "below",
  "less",
  "than",
  "ready",
  "in",
  "min",
  "mins",
  "minutes",
  "item",
  "items",
  "dish",
  "dishes",
  "food",
  "something",
  "please",
  "want",
  "need",
  "veg",
  "vegetarian",
  "vegetarians",
  "non",
  "nonveg",
  "spicy",
  "mild",
  "suggest",
  "suggests",
  "suggestion",
  "suggestions",
  "recommend",
  "recommends",
  "recommendation",
  "recommendations",
  "some",
  "any",
  "me",
  "my",
  "give",
  "show",
  "find",
  "get",
  "looking",
  "like",
  "would",
  "could",
  "can",
  "you",
  "your",
  "also",
  "just",
  "only",
  "about",
  "around",
]);

/** Expand / normalize dish spellings so "biriyanis" hits "biryani". */
const SYNONYMS: Record<string, string[]> = {
  desserts: ["dessert", "sweet", "mithai", "kulfi", "gulab", "jamun", "falooda"],
  dessert: ["desserts", "sweet", "mithai", "kulfi", "gulab", "jamun"],
  sweets: ["dessert", "desserts", "sweet", "mithai"],
  sweet: ["dessert", "desserts", "mithai"],
  drinks: ["beverage", "lassi", "drink"],
  drink: ["beverage", "lassi", "drinks"],
  beverages: ["beverage", "drink", "lassi"],
  biryani: ["biriyani", "briyani", "biryanis", "biriyanis"],
  biriyani: ["biryani", "briyani", "biryanis", "biriyanis"],
  biriyanis: ["biryani", "biriyani", "briyani", "biryanis"],
  biryanis: ["biryani", "biriyani", "briyani", "biriyanis"],
  briyani: ["biryani", "biriyani"],
  paneer: ["cottage"],
  chicken: ["murgh"],
  rice: ["biryani", "biriyani"],
};

export type ParsedPrefs = {
  diet?: "veg" | "nonveg";
  budget?: number;
  etaLimit?: number;
  spiceMax?: number;
  keywords: string[];
};

/** Normalize common Indian dish misspellings + simple plurals. */
export function normalizeToken(w: string): string {
  let t = w.toLowerCase().trim();
  if (t.endsWith("ies") && t.length > 4) t = t.slice(0, -3) + "y";
  else if (t.endsWith("s") && t.length > 3 && !t.endsWith("ss")) t = t.slice(0, -1);

  const spelling: Record<string, string> = {
    biriyani: "biryani",
    briyani: "biryani",
    biryani: "biryani",
    vegetarian: "veg",
    vegeterian: "veg",
  };
  return spelling[t] ?? t;
}

export function parseMenuQuery(query: string): ParsedPrefs {
  const q = query.toLowerCase();
  const prefs: ParsedPrefs = { keywords: [] };

  if (/\b(veg|vegetarian|vegeterian)\b/.test(q) && !/\bnon[\s-]?veg/.test(q)) {
    prefs.diet = "veg";
  } else if (/\bnon[\s-]?veg|chicken|mutton|nonvegetarian\b/.test(q)) {
    // only force nonveg if they didn't also ask vegetarian
    if (!/\b(veg|vegetarian)\b/.test(q)) prefs.diet = "nonveg";
  }

  const budgetMatch = q.match(
    /(?:under|below|less than|upto|up to|<=?|₹|rs\.?\s*)\s*(\d{2,5})/
  );
  if (budgetMatch) prefs.budget = Number(budgetMatch[1]);

  const etaStrict = q.match(/ready\s*(?:in\s*)?(\d{1,2})\s*(?:min|mins|minutes)/);
  if (etaStrict) prefs.etaLimit = Number(etaStrict[1]);
  else if (/\bmin(ute)?s?\b/.test(q)) {
    const etaMatch = q.match(
      /(?:ready|eta|within|under)\s*(?:in\s*)?(\d{1,2})\s*(?:min|mins|minutes)/
    );
    if (etaMatch) prefs.etaLimit = Number(etaMatch[1]);
  }

  if (/\bmild\b/.test(q)) prefs.spiceMax = 1;
  else if (/\bspicy|chilli|chili\b/.test(q)) prefs.spiceMax = 3;

  const raw = q
    .split(/[^a-z0-9]+/)
    .map(normalizeToken)
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));

  // Don't keep diet words as required keywords — they become prefs.diet
  const dietWords = new Set(["veg", "vegetarian", "nonveg", "chicken", "mutton"]);

  const expanded = new Set<string>();
  for (const w of raw) {
    if (dietWords.has(w) && prefs.diet) continue;
    expanded.add(w);
    for (const syn of SYNONYMS[w] ?? []) expanded.add(normalizeToken(syn));
  }
  prefs.keywords = [...expanded];

  return prefs;
}

function itemTokens(item: MenuItem): Set<string> {
  const hay = `${item.name} ${item.description} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  return new Set(
    hay
      .split(/[^a-z0-9]+/)
      .map(normalizeToken)
      .filter(Boolean)
  );
}

export function itemMatchesKeywords(item: MenuItem, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const tokens = itemTokens(item);
  const hay = `${item.name} ${item.description} ${(item.tags ?? []).join(" ")}`.toLowerCase();

  return keywords.some((k) => {
    const n = normalizeToken(k);
    if (tokens.has(n)) return true;
    // Soft contains for multi-word names e.g. keyword "biryani" in "Veg Biryani"
    if (n.length >= 4 && hay.includes(n)) return true;
    return false;
  });
}

export function keywordMenuPicks(
  items: MenuItem[],
  opts: {
    diet?: string;
    spiceMax?: number;
    budget?: number;
    allergens?: string[];
    etaLimit?: number;
    keywords?: string[];
  }
) {
  const allergens = new Set((opts.allergens ?? []).map((a) => a.toLowerCase()));
  const keywords = (opts.keywords ?? []).map(normalizeToken);

  const base = items.filter((item) => {
    if (item.availability === "unavailable" || item.availability === "paused") {
      return false;
    }
    if (opts.diet === "veg" && !item.veg) return false;
    if (opts.diet === "nonveg" && item.veg) return false;
    if (opts.spiceMax != null && item.spice > opts.spiceMax) return false;
    if (opts.budget != null && Number(item.price) > opts.budget) return false;
    if (opts.etaLimit != null && item.current_eta_min > opts.etaLimit) return false;
    if (item.tags?.some((t) => allergens.has(t.toLowerCase()))) return false;
    return true;
  });

  if (keywords.length) {
    const matched = base.filter((item) => itemMatchesKeywords(item, keywords));
    return matched
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3)
      .map((item) => ({
        item_id: item.id,
        reason: `Matches “${keywords.join(", ")}” · live menu`,
      }));
  }

  return base
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3)
    .map((item) => ({
      item_id: item.id,
      reason: "Matched your filters from live menu",
    }));
}
