"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership, WAITER_ROLES, roleAtLeast } from "@/lib/auth";
import { canTransitionTable } from "@/lib/transitions";
import { markPaidSchema } from "@/lib/schemas/orders";
import type { ActionResult, TableStatus } from "@/types/database";

const updateTableSchema = z.object({
  tableId: z.string().uuid(),
  next: z.enum([
    "available",
    "reserved",
    "occupied",
    "needs_service",
    "bill_requested",
    "cleaning",
  ]),
});

const resolveRequestSchema = z.object({
  requestId: z.string().uuid(),
  next: z.enum(["acknowledged", "resolved"]),
});

export async function updateTableStatus(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = updateTableSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid table update" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, WAITER_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Waiter access required" };
  }

  const admin = createAdminClient();
  const { data: table } = await admin
    .from("tables")
    .select("*")
    .eq("id", parsed.data.tableId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .maybeSingle();

  if (!table) {
    return { ok: false, code: "not_found", message: "Table not found" };
  }

  if (
    !canTransitionTable(
      table.status as TableStatus,
      parsed.data.next,
      membership.membership.role
    )
  ) {
    return {
      ok: false,
      code: "invalid_transition",
      message: `Cannot go ${table.status} → ${parsed.data.next}`,
    };
  }

  await admin.from("tables").update({ status: parsed.data.next }).eq("id", table.id);
  return { ok: true, data: { ok: true } };
}

export async function resolveRequest(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = resolveRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid request" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, WAITER_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Waiter access required" };
  }

  const admin = createAdminClient();
  const patch: Record<string, unknown> = { status: parsed.data.next };
  if (parsed.data.next === "acknowledged") {
    patch.acknowledged_by = membership.user.id;
  }

  const { data: req } = await admin
    .from("service_requests")
    .update(patch)
    .eq("id", parsed.data.requestId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .select("table_id, type")
    .maybeSingle();

  if (req && parsed.data.next === "resolved" && req.type !== "bill") {
    await admin.from("tables").update({ status: "occupied" }).eq("id", req.table_id);
  }

  return { ok: true, data: { ok: true } };
}

export async function markPaid(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = markPaidSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid payment" };
  }
  const membership = await getMembership();
  if (!membership || !roleAtLeast(membership.membership.role, WAITER_ROLES)) {
    return { ok: false, code: "unauthorized", message: "Staff access required" };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", parsed.data.orderId)
    .eq("restaurant_id", membership.membership.restaurant_id)
    .maybeSingle();

  if (!order) {
    return { ok: false, code: "not_found", message: "Order not found" };
  }

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (existing) {
    return { ok: false, code: "already_paid", message: "Already paid" };
  }

  await admin.from("payments").insert({
    order_id: order.id,
    method: "demo",
    amount: order.total,
  });
  // Keep table occupied until customer finishes feedback/skip + session close
  await admin.from("orders").update({ status: "completed" }).eq("id", order.id);

  return { ok: true, data: { ok: true } };
}

/** Customer demo: mark bill paid without staff (hackathon). */
export async function markPaidAsCustomer(
  orderId: string,
  sessionToken: string
): Promise<ActionResult<{ ok: true; displayId: string | null }>> {
  const admin = createAdminClient();
  const { data: session } = await admin
    .from("qr_sessions")
    .select("id")
    .eq("token", sessionToken)
    .is("ended_at", null)
    .maybeSingle();

  if (!session) {
    return { ok: false, code: "invalid_token", message: "Session expired" };
  }

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("qr_session_id", session.id)
    .maybeSingle();

  if (!order) {
    return { ok: false, code: "not_found", message: "Order not found" };
  }

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  if (!existing) {
    await admin.from("payments").insert({
      order_id: order.id,
      method: "demo",
      amount: order.total,
    });
  }

  await admin.from("orders").update({ status: "completed" }).eq("id", order.id);

  return {
    ok: true,
    data: { ok: true, displayId: order.display_id ?? null },
  };
}

/**
 * After feedback or skip: end QR session for this order, free the table (vacant).
 */
export async function closeDiningSession(
  orderId: string,
  sessionToken: string
): Promise<ActionResult<{ ok: true }>> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, table_id, qr_session_id, display_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { ok: false, code: "not_found", message: "Order not found" };
  }

  const { data: session } = await admin
    .from("qr_sessions")
    .select("id, table_id, token")
    .eq("token", sessionToken)
    .maybeSingle();

  if (session) {
    await admin
      .from("qr_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", session.id);
  } else if (order.qr_session_id) {
    await admin
      .from("qr_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", order.qr_session_id);
  }

  // Vacate table
  const { data: tableRow } = await admin
    .from("tables")
    .select("restaurant_id")
    .eq("id", order.table_id)
    .maybeSingle();

  await admin
    .from("tables")
    .update({ status: "available" })
    .eq("id", order.table_id);

  if (tableRow?.restaurant_id) {
    await admin.from("activity_logs").insert({
      restaurant_id: tableRow.restaurant_id,
      actor: "customer",
      action: "session_closed",
      entity: order.id,
      meta: { display_id: order.display_id },
    });
  }

  return { ok: true, data: { ok: true } };
}

export async function requestBillAsCustomer(
  orderId: string,
  sessionToken: string
): Promise<ActionResult<{ total: number }>> {
  const admin = createAdminClient();
  const { data: session } = await admin
    .from("qr_sessions")
    .select("id, table_id")
    .eq("token", sessionToken)
    .is("ended_at", null)
    .maybeSingle();

  if (!session) {
    return { ok: false, code: "invalid_token", message: "Session expired" };
  }

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("qr_session_id", session.id)
    .maybeSingle();

  if (!order) {
    return { ok: false, code: "not_found", message: "Order not found" };
  }

  await admin.from("orders").update({ status: "billed" }).eq("id", order.id);
  await admin
    .from("tables")
    .update({ status: "bill_requested" })
    .eq("id", order.table_id);

  await admin.from("service_requests").insert({
    restaurant_id: order.restaurant_id,
    table_id: order.table_id,
    type: "bill",
    status: "open",
  });

  return { ok: true, data: { total: Number(order.total) } };
}
