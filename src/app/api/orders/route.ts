import { NextResponse } from "next/server";

// Global in-memory store (demo fallback)
let globalOrders: any[] = [
  { id: "ORD-1042", table: 7, items: ["Chicken Biryani", "Raita"], time: 2, priority: "high", stage: "Placed" },
  { id: "ORD-1043", table: 12, items: ["Masala Dosa", "Filter Coffee"], time: 1, priority: "normal", stage: "Placed" },
  { id: "ORD-1038", table: 3, items: ["Butter Paneer", "Butter Naan", "Jeera Rice"], time: 8, priority: "high", stage: "Preparing" },
  { id: "ORD-1039", table: 9, items: ["Gulab Jamun x2", "Rasmalai"], time: 6, priority: "normal", stage: "Preparing" },
  { id: "ORD-1040", table: 5, items: ["Chicken 65", "Veg Fried Rice"], time: 12, priority: "urgent", stage: "Preparing" },
  { id: "ORD-1035", table: 2, items: ["Paneer Tikka", "Ghee Roast Dosa"], time: 4, priority: "normal", stage: "Ready" },
  { id: "ORD-1036", table: 11, items: ["Idli Sambar"], time: 2, priority: "normal", stage: "Ready" },
  { id: "ORD-1030", table: 1, items: ["Idli x2", "Filter Coffee"], time: 0, priority: "normal", stage: "Served" },
  { id: "ORD-1031", table: 6, items: ["Chicken Biryani", "Sweet Lassi"], time: 0, priority: "normal", stage: "Served" },
  { id: "ORD-1032", table: 8, items: ["Masala Dosa x2", "Gulab Jamun"], time: 0, priority: "normal", stage: "Served" },
];

export async function GET() {
  return NextResponse.json(globalOrders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    table: body.table || Math.floor(Math.random() * 20) + 1,
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
  const index = globalOrders.findIndex((o) => o.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  globalOrders[index] = { ...globalOrders[index], ...body };
  return NextResponse.json(globalOrders[index]);
}
