import type { MenuItem } from "@/types/database";

export function deterministicMenuPicks(
  items: MenuItem[],
  opts: {
    diet?: string;
    spiceMax?: number;
    budget?: number;
    allergens?: string[];
    etaLimit?: number;
  }
) {
  const allergens = new Set((opts.allergens ?? []).map((a) => a.toLowerCase()));
  return items
    .filter((item) => {
      if (item.availability === "unavailable" || item.availability === "paused") {
        return false;
      }
      if (opts.diet === "veg" && !item.veg) return false;
      if (opts.spiceMax != null && item.spice > opts.spiceMax) return false;
      if (opts.budget != null && Number(item.price) > opts.budget) return false;
      if (opts.etaLimit != null && item.current_eta_min > opts.etaLimit) return false;
      if (item.tags?.some((t) => allergens.has(t.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3)
    .map((item) => ({
      item_id: item.id,
      reason: "Matched your filters from live menu",
    }));
}
