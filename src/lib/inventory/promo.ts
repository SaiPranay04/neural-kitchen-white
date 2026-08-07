import { buildInventoryBundle } from "@/lib/inventory/compute";
import type { InventoryBundle } from "@/lib/inventory/types";

/** Rich showcase inventory for /demo/admin without live DB. */
export function buildPromoInventory(): InventoryBundle {
  const now = Date.now();
  return buildInventoryBundle({
    restaurantName: "Spice Garden",
    stock: [
      { id: "1", ingredientId: "i1", name: "Paneer", unit: "g", qty: 340, lowThreshold: 200, reorderQty: 2000 },
      { id: "2", ingredientId: "i2", name: "Chicken", unit: "g", qty: 4200, lowThreshold: 800, reorderQty: 5000 },
      { id: "3", ingredientId: "i3", name: "Basmati Rice", unit: "g", qty: 720, lowThreshold: 600, reorderQty: 10000 },
      { id: "4", ingredientId: "i4", name: "Butter", unit: "g", qty: 180, lowThreshold: 100, reorderQty: 1000 },
      { id: "5", ingredientId: "i5", name: "Cream", unit: "ml", qty: 960, lowThreshold: 200, reorderQty: 2000 },
      { id: "6", ingredientId: "i6", name: "Yogurt", unit: "g", qty: 450, lowThreshold: 200, reorderQty: 2000 },
      { id: "7", ingredientId: "i7", name: "Tomato", unit: "g", qty: 1930, lowThreshold: 300, reorderQty: 5000 },
      { id: "8", ingredientId: "i8", name: "Capsicum", unit: "g", qty: 1460, lowThreshold: 200, reorderQty: 2000 },
      { id: "9", ingredientId: "i9", name: "Mushroom", unit: "g", qty: 380, lowThreshold: 300, reorderQty: 2000 },
      { id: "10", ingredientId: "i10", name: "Black Lentils", unit: "g", qty: 1520, lowThreshold: 200, reorderQty: 3000 },
      { id: "11", ingredientId: "i11", name: "Soy Sauce", unit: "ml", qty: 120, lowThreshold: 50, reorderQty: 1000 },
      { id: "12", ingredientId: "i12", name: "Flour", unit: "g", qty: 2800, lowThreshold: 400, reorderQty: 5000 },
      { id: "13", ingredientId: "i13", name: "Potato", unit: "g", qty: 2100, lowThreshold: 400, reorderQty: 5000 },
    ],
    recipes: [
      {
        menuItemId: "m1",
        name: "Paneer Tikka",
        price: 249,
        popularity: 88,
        lines: [
          { ingredientName: "Paneer", qtyRequired: 120, unit: "g" },
          { ingredientName: "Yogurt", qtyRequired: 40, unit: "g" },
          { ingredientName: "Capsicum", qtyRequired: 30, unit: "g" },
        ],
      },
      {
        menuItemId: "m2",
        name: "Chicken Biryani",
        price: 299,
        popularity: 120,
        lines: [
          { ingredientName: "Chicken", qtyRequired: 180, unit: "g" },
          { ingredientName: "Basmati Rice", qtyRequired: 150, unit: "g" },
          { ingredientName: "Yogurt", qtyRequired: 50, unit: "g" },
        ],
      },
      {
        menuItemId: "m3",
        name: "Butter Paneer",
        price: 249,
        popularity: 95,
        lines: [
          { ingredientName: "Paneer", qtyRequired: 140, unit: "g" },
          { ingredientName: "Butter", qtyRequired: 30, unit: "g" },
          { ingredientName: "Cream", qtyRequired: 40, unit: "ml" },
          { ingredientName: "Tomato", qtyRequired: 80, unit: "g" },
        ],
      },
      {
        menuItemId: "m4",
        name: "Dal Makhani",
        price: 199,
        popularity: 70,
        lines: [
          { ingredientName: "Black Lentils", qtyRequired: 120, unit: "g" },
          { ingredientName: "Butter", qtyRequired: 25, unit: "g" },
          { ingredientName: "Cream", qtyRequired: 30, unit: "ml" },
        ],
      },
      {
        menuItemId: "m5",
        name: "Chilli Mushroom",
        price: 229,
        popularity: 55,
        lines: [
          { ingredientName: "Mushroom", qtyRequired: 150, unit: "g" },
          { ingredientName: "Capsicum", qtyRequired: 40, unit: "g" },
          { ingredientName: "Soy Sauce", qtyRequired: 15, unit: "ml" },
        ],
      },
      {
        menuItemId: "m6",
        name: "Masala Dosa",
        price: 129,
        popularity: 110,
        lines: [
          { ingredientName: "Potato", qtyRequired: 120, unit: "g" },
          { ingredientName: "Flour", qtyRequired: 80, unit: "g" },
        ],
      },
    ],
    transactions: [
      {
        id: "t1",
        ingredientName: "Paneer",
        unit: "g",
        delta: -120,
        type: "consumption",
        createdAt: new Date(now - 20 * 60000).toISOString(),
      },
      {
        id: "t2",
        ingredientName: "Chicken",
        unit: "g",
        delta: -360,
        type: "consumption",
        createdAt: new Date(now - 45 * 60000).toISOString(),
      },
      {
        id: "t3",
        ingredientName: "Paneer",
        unit: "g",
        delta: 2000,
        type: "purchase",
        createdAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: "t4",
        ingredientName: "Yogurt",
        unit: "g",
        delta: -80,
        type: "waste",
        createdAt: new Date(now - 5 * 3600000).toISOString(),
      },
      {
        id: "t5",
        ingredientName: "Basmati Rice",
        unit: "g",
        delta: -300,
        type: "consumption",
        createdAt: new Date(now - 90 * 60000).toISOString(),
      },
      {
        id: "t6",
        ingredientName: "Butter",
        unit: "g",
        delta: 1000,
        type: "purchase",
        createdAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        id: "t7",
        ingredientName: "Tomato",
        unit: "g",
        delta: 5000,
        type: "purchase",
        createdAt: new Date(now - 86400000).toISOString(),
      },
      {
        id: "t8",
        ingredientName: "Cream",
        unit: "ml",
        delta: -40,
        type: "consumption",
        createdAt: new Date(now - 30 * 60000).toISOString(),
      },
    ],
  });
}
