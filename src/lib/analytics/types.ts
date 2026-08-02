export type DashboardOps = {
  liveOrders: {
    id: string;
    status: string;
    total: number;
    tableNumber: number | null;
    displayId: string | null;
  }[];
  tables: { id: string; number: number; status: string }[];
  activeOrderCount: number;
  occupiedTables: number;
};
