export type DashboardOps = {
  restaurantId: string;
  liveOrders: {
    id: string;
    status: string;
    total: number;
    tableNumber: number | null;
    displayId: string | null;
  }[];
  tables: {
    id: string;
    number: number;
    status: string;
    qrToken?: string | null;
  }[];
  inventory: {
    id: string;
    name: string;
    unit: string;
    qty: number;
    lowThreshold: number;
  }[];
  restaurantSlug: string;
  appUrl: string;
  activeOrderCount: number;
  occupiedTables: number;
};
