import type { ItemStatus, MemberRole, OrderStatus, TableStatus } from "@/types/database";

type Role = MemberRole | "customer" | "system";

const KITCHEN_STAFF: Role[] = [
  "kitchen",
  "manager",
  "restaurant_admin",
  "super_admin",
];
const FLOOR_STAFF: Role[] = [
  "waiter",
  "manager",
  "restaurant_admin",
  "super_admin",
];
const FLOOR_AND_KITCHEN: Role[] = [
  "waiter",
  "kitchen",
  "manager",
  "restaurant_admin",
  "super_admin",
];

export const VALID_ITEM_TRANSITIONS: Record<
  ItemStatus,
  Partial<Record<ItemStatus, Role[]>>
> = {
  queued: {
    accepted: KITCHEN_STAFF,
    // One-tap KDS: Accept can also jump straight into cooking
    preparing: KITCHEN_STAFF,
    cancelled: KITCHEN_STAFF,
  },
  accepted: {
    preparing: KITCHEN_STAFF,
    cancelled: KITCHEN_STAFF,
  },
  preparing: {
    ready: KITCHEN_STAFF,
  },
  ready: {
    served: FLOOR_AND_KITCHEN,
  },
  served: {},
  cancelled: {},
};

export const VALID_TABLE_TRANSITIONS: Record<
  TableStatus,
  Partial<Record<TableStatus, Role[]>>
> = {
  available: {
    occupied: ["customer", ...FLOOR_STAFF],
    reserved: ["manager", "restaurant_admin", "super_admin"],
  },
  reserved: {
    occupied: FLOOR_STAFF,
    available: ["manager", "restaurant_admin", "super_admin"],
  },
  occupied: {
    needs_service: ["customer", ...FLOOR_STAFF],
    bill_requested: ["customer", ...FLOOR_STAFF],
    cleaning: FLOOR_STAFF,
    available: FLOOR_STAFF,
  },
  needs_service: {
    occupied: FLOOR_STAFF,
    bill_requested: ["customer", ...FLOOR_STAFF],
  },
  bill_requested: {
    cleaning: FLOOR_STAFF,
    occupied: FLOOR_STAFF,
    available: FLOOR_STAFF,
  },
  cleaning: {
    available: FLOOR_STAFF,
  },
};

function roleMayAct(allowed: Role[] | undefined, role: Role): boolean {
  if (!allowed?.length) return false;
  if (role === "super_admin" || role === "restaurant_admin") return true;
  return allowed.includes(role);
}

export function canTransitionItem(
  from: ItemStatus,
  to: ItemStatus,
  role: Role
): boolean {
  return roleMayAct(VALID_ITEM_TRANSITIONS[from]?.[to], role);
}

export function canTransitionTable(
  from: TableStatus,
  to: TableStatus,
  role: Role
): boolean {
  return roleMayAct(VALID_TABLE_TRANSITIONS[from]?.[to], role);
}

export function deriveOrderStatus(itemStatuses: ItemStatus[]): OrderStatus {
  const active = itemStatuses.filter((s) => s !== "cancelled");
  if (active.length === 0) return "cancelled";
  if (active.every((s) => s === "served")) return "served";
  if (active.every((s) => s === "ready" || s === "served")) return "ready";
  if (active.some((s) => s === "ready") && active.some((s) => s !== "ready" && s !== "served")) {
    return "partially_ready";
  }
  if (active.some((s) => s === "preparing" || s === "ready" || s === "served")) {
    return "preparing";
  }
  if (active.some((s) => s === "accepted")) return "accepted";
  return "placed";
}
