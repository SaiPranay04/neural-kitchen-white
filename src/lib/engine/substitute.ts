export type SubCandidate = {
  id: string;
  name: string;
  category_id: string | null;
  price: number;
  availability: string;
  current_eta_min: number;
  popularity: number;
};

export function rankSubstitutes(
  source: SubCandidate,
  candidates: SubCandidate[],
  limit = 3
): SubCandidate[] {
  return candidates
    .filter(
      (c) =>
        c.id !== source.id &&
        c.availability !== "unavailable" &&
        c.availability !== "paused" &&
        c.category_id === source.category_id &&
        c.price >= source.price * 0.7 &&
        c.price <= source.price * 1.3
    )
    .sort((a, b) => {
      if (a.current_eta_min !== b.current_eta_min) {
        return a.current_eta_min - b.current_eta_min;
      }
      return b.popularity - a.popularity;
    })
    .slice(0, limit);
}
