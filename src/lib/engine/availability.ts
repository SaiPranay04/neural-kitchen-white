import type { Availability } from "@/types/database";

export type RecipeNeed = { ingredientId: string; qtyRequired: number; stock: number };
export type AvailabilityResult = {
  availability: Availability;
  portionsLeft: number;
  explanation: string;
};

export function computePortions(recipe: RecipeNeed[]): number {
  if (recipe.length === 0) return 999;
  return Math.min(
    ...recipe.map((r) => Math.floor(Number(r.stock) / Number(r.qtyRequired)))
  );
}

export function computeAvailability(input: {
  isPaused: boolean;
  portions: number;
  congestion: number;
  lowThreshold?: number;
}): AvailabilityResult {
  const low = input.lowThreshold ?? 3;

  if (input.isPaused) {
    return {
      availability: "paused",
      portionsLeft: input.portions,
      explanation: "Temporarily paused by kitchen",
    };
  }
  if (input.portions <= 0) {
    return {
      availability: "unavailable",
      portionsLeft: 0,
      explanation: "Out of stock — key ingredients depleted",
    };
  }
  if (input.portions <= low) {
    return {
      availability: "low_stock",
      portionsLeft: input.portions,
      explanation: `Low stock — ${input.portions} portion${input.portions === 1 ? "" : "s"} left`,
    };
  }
  if (input.congestion > 1.8) {
    return {
      availability: "delayed",
      portionsLeft: input.portions,
      explanation: "Kitchen station congested — expect longer wait",
    };
  }
  return {
    availability: "available",
    portionsLeft: input.portions,
    explanation: "Available",
  };
}
