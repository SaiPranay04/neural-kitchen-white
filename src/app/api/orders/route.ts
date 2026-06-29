import { NextResponse } from "next/server";

// Global in-memory store
let globalOrders: any[] = [
  { id: "ORD-1042", table: 7, items: ["Wagyu Burger", "Truffle Fries"], time: 2, priority: "high", stage: "Placed" },
  { id: "ORD-1043", table: 12, items: ["Margherita", "Caesar"], time: 1, priority: "normal", stage: "Placed" },
  { id: "ORD-1038", table: 3, items: ["Salmon", "Burrata", "Pasta"], time: 8, priority: "high", stage: "Preparing" },
  { id: "ORD-1039", table: 9, items: ["Lava Cake x2", "Panna Cotta"], time: 6, priority: "normal", stage: "Preparing" },
  { id: "ORD-1040", table: 5, items: ["Smash Burger", "Onion Rings"], time: 12, priority: "urgent", stage: "Preparing" },
  { id: "ORD-1035", table: 2, items: ["Arancini", "Spicy Tuna Pizza"], time: 4, priority: "normal", stage: "Ready" },
  { id: "ORD-1036", table: 11, items: ["Berry Panna Cotta"], time: 2, priority: "normal", stage: "Ready" },
  { id: "ORD-1030", table: 1, items: ["Caesar x2", "Salmon"], time: 0, priority: "normal", stage: "Served" },
  { id: "ORD-1031", table: 6, items: ["Wagyu Burger", "Mango Cooler"], time: 0, priority: "normal", stage: "Served" },
  { id: "ORD-1032", table: 8, items: ["Pizza x2", "Lava Cake"], time: 0, priority: "normal", stage: "Served" },
];

export async function GET() {
  return NextResponse.json(globalOrders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    table: body.table || Math.floor(Math.random() * 20) + 1, // Random table if none provided
    items: body.items || [],
    time: 0,
    priority: "normal",
    stage: "Placed",
  };
  globalOrders.push(newOrder);
  return NextResponse.json(newOrder);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const index = globalOrders.findIndex(o => o.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  globalOrders[index] = { ...globalOrders[index], ...body };
  return NextResponse.json(globalOrders[index]);
}
