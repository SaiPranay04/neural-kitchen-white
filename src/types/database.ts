export type MemberRole =
  | "super_admin"
  | "restaurant_admin"
  | "manager"
  | "waiter"
  | "kitchen";
export type OrderStatus =
  | "draft"
  | "placed"
  | "accepted"
  | "preparing"
  | "partially_ready"
  | "ready"
  | "served"
  | "billed"
  | "completed"
  | "cancelled";
export type ItemStatus =
  | "queued"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled";
export type TableStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "needs_service"
  | "bill_requested"
  | "cleaning";
export type RequestStatus = "open" | "acknowledged" | "resolved";
export type RequestType = "call_waiter" | "water" | "cutlery" | "bill" | "other";
export type Availability =
  | "available"
  | "low_stock"
  | "delayed"
  | "paused"
  | "unavailable";
export type TxnType = "purchase" | "consumption" | "adjustment" | "waste";

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  settings: {
    stations: Record<string, number>;
    close_hours: number;
  };
  tax_rate: number;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  spice: number;
  tags: string[];
  image_url: string | null;
  base_prep_min: number;
  complexity: number;
  station: string;
  is_paused: boolean;
  availability: Availability;
  portions_left: number;
  current_eta_min: number;
  explanation: string;
  popularity: number;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  qty: number;
  unit_price: number;
  status: ItemStatus;
  station: string;
  priority: number;
  eta_min: number;
  note: string | null;
  started_at: string | null;
  ready_at: string | null;
  created_at: string;
  menu_items?: Pick<MenuItem, "name" | "veg" | "station"> | null;
};

export type Order = {
  id: string;
  restaurant_id: string;
  table_id: string;
  qr_session_id: string | null;
  /** UUID — unique analytics / system id */
  /** 3-digit customer-facing code */
  display_id?: string | null;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  note: string | null;
  placed_at: string | null;
  created_at: string;
  tables?: { number: number } | null;
  order_items?: OrderItem[];
};

export type TableRow = {
  id: string;
  restaurant_id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  qr_token: string;
};

export type ServiceRequest = {
  id: string;
  restaurant_id: string;
  table_id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  tables?: { number: number } | null;
};

export type InventoryItem = {
  id: string;
  ingredient_id: string;
  restaurant_id: string;
  qty: number;
  low_threshold: number;
  reorder_qty: number;
  ingredients?: { name: string; unit: string } | null;
};

export type StaffMember = {
  membershipId: string;
  userId: string;
  email: string;
  fullName: string;
  role: MemberRole;
  restaurantId: string;
  /** invited = email sent, awaiting accept; active = confirmed login */
  status: "invited" | "active";
};

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string };
