import { z } from "zod";

export const placeOrderSchema = z.object({
  sessionToken: z.string().min(1).optional(),
  restaurantSlug: z.string().min(1).optional(),
  tableNumber: z.coerce.number().int().min(1).max(200).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        qty: z.number().int().min(1).max(20),
        note: z.string().max(200).optional(),
      })
    )
    .min(1)
    .max(30),
  note: z.string().max(300).optional(),
});

export const updateItemStatusSchema = z.object({
  itemId: z.string().uuid(),
  next: z.enum(["accepted", "preparing", "ready", "served", "cancelled"]),
  reason: z.string().max(200).optional(),
});

export const serviceRequestSchema = z.object({
  sessionToken: z.string().min(8),
  type: z.enum(["call_waiter", "water", "cutlery", "bill", "other"]),
});

export const markPaidSchema = z.object({
  orderId: z.string().uuid(),
});

export const pauseItemSchema = z.object({
  menuItemId: z.string().uuid(),
  paused: z.boolean(),
});

export const set86Schema = z.object({
  ingredientId: z.string().uuid(),
});

export const adjustInventorySchema = z.object({
  inventoryItemId: z.string().uuid(),
  delta: z.number(),
  type: z.enum(["purchase", "adjustment", "waste"]),
});

export const aiMenuSchema = z.object({
  sessionToken: z.string().min(8).optional(),
  restaurantSlug: z.string().min(1),
  query: z.string().min(1).max(300),
  diet: z.string().optional(),
  spiceMax: z.number().int().min(0).max(3).optional(),
  budget: z.number().optional(),
  allergens: z.array(z.string()).optional(),
  etaLimit: z.number().optional(),
});

export const aiMenuResponseSchema = z.object({
  recommendations: z
    .array(
      z.object({
        item_id: z.string(),
        reason: z.string().max(120),
      })
    )
    .max(3),
  message: z.string().max(200),
});
