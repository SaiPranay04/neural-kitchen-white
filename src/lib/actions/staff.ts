"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembership } from "@/lib/auth";
import {
  canAssignRole,
  canCreateUsers,
  canDeleteUsers,
  canEditUsers,
} from "@/lib/rbac";
import type { ActionResult, MemberRole, StaffMember } from "@/types/database";

const roleEnum = z.enum([
  "super_admin",
  "restaurant_admin",
  "manager",
  "waiter",
  "kitchen",
]);

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(80),
  role: roleEnum,
});

const createSchema = inviteSchema.extend({
  password: z.string().min(8).max(72),
});

const updateSchema = z.object({
  membershipId: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(80),
  role: roleEnum,
  password: z.string().min(8).max(72).optional().or(z.literal("")),
});

const deleteSchema = z.object({
  membershipId: z.string().uuid(),
  userId: z.string().uuid(),
});

const resendSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(80).optional(),
  role: roleEnum.optional(),
});

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

async function requireStaffAdmin() {
  const actor = await getMembership();
  if (!actor || !canCreateUsers(actor.membership.role)) {
    return null;
  }
  return actor;
}

export async function listStaff(): Promise<ActionResult<StaffMember[]>> {
  const actor = await requireStaffAdmin();
  if (!actor) {
    return { ok: false, code: "unauthorized", message: "Admin access required" };
  }

  const admin = createAdminClient();
  const restaurantId = actor.membership.restaurant_id;

  const { data: members, error } = await admin
    .from("restaurant_members")
    .select("id, user_id, role, restaurant_id")
    .eq("restaurant_id", restaurantId)
    .order("role");

  if (error) {
    return { ok: false, code: "db_error", message: error.message };
  }

  const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
  const byId = new Map((listed?.users ?? []).map((u) => [u.id, u]));

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      (members ?? []).map((m) => m.user_id)
    );

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const filtered = (members ?? []).filter((m) => {
    if (actor.membership.role !== "super_admin" && m.role === "super_admin") {
      return false;
    }
    return true;
  });

  const staff: StaffMember[] = filtered.map((m) => {
    const u = byId.get(m.user_id);
    const confirmed = !!u?.email_confirmed_at || !!u?.last_sign_in_at;
    return {
      membershipId: m.id,
      userId: m.user_id,
      email: u?.email ?? "unknown",
      fullName:
        (nameById.get(m.user_id) as string) ||
        (u?.user_metadata?.full_name as string) ||
        u?.email ||
        "Staff",
      role: m.role as MemberRole,
      restaurantId: m.restaurant_id,
      status: confirmed ? "active" : "invited",
    };
  });

  return { ok: true, data: staff };
}

/** GMeet-style: email invite link. Person accepts via mail → sets access. */
export async function inviteStaffByEmail(
  input: unknown
): Promise<ActionResult<{ userId: string; emailSent: boolean }>> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid invite payload" };
  }

  const actor = await requireStaffAdmin();
  if (!actor) {
    return { ok: false, code: "unauthorized", message: "Cannot invite users" };
  }

  if (!canAssignRole(actor.membership.role, parsed.data.role)) {
    return {
      ok: false,
      code: "forbidden_role",
      message: "You cannot assign that role",
    };
  }

  const admin = createAdminClient();
  const restaurantId = actor.membership.restaurant_id;
  const email = parsed.data.email.toLowerCase().trim();
  const redirectTo = `${appUrl()}/auth/callback?next=${encodeURIComponent("/staff/set-password")}`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name: parsed.data.fullName,
      invited_role: parsed.data.role,
      restaurant_id: restaurantId,
      invited_by: actor.user.email,
    },
  });

  if (error || !data.user) {
    // User may already exist — re-send invite / attach membership
    const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
    const existing = listed?.users?.find((u) => u.email?.toLowerCase() === email);
    if (!existing) {
      return {
        ok: false,
        code: "invite_fail",
        message:
          error?.message ??
          "Could not send invite. Check Supabase Auth email settings.",
      };
    }

    await admin.from("restaurant_members").upsert(
      {
        restaurant_id: restaurantId,
        user_id: existing.id,
        role: parsed.data.role,
      },
      { onConflict: "restaurant_id,user_id" }
    );
    await admin
      .from("profiles")
      .upsert({ id: existing.id, full_name: parsed.data.fullName });

    // Generate a fresh invite/magic link email
    const { error: linkErr } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        full_name: parsed.data.fullName,
        invited_role: parsed.data.role,
        restaurant_id: restaurantId,
      },
    });

    return {
      ok: true,
      data: {
        userId: existing.id,
        emailSent: !linkErr,
      },
    };
  }

  await admin
    .from("profiles")
    .upsert({ id: data.user.id, full_name: parsed.data.fullName });

  const { error: memErr } = await admin.from("restaurant_members").upsert(
    {
      restaurant_id: restaurantId,
      user_id: data.user.id,
      role: parsed.data.role,
    },
    { onConflict: "restaurant_id,user_id" }
  );

  if (memErr) {
    return { ok: false, code: "membership_fail", message: memErr.message };
  }

  await admin.from("activity_logs").insert({
    restaurant_id: restaurantId,
    actor: actor.user.email,
    action: "staff_invite",
    entity: email,
    meta: { role: parsed.data.role },
  });

  return { ok: true, data: { userId: data.user.id, emailSent: true } };
}

export async function resendStaffInvite(
  input: unknown
): Promise<ActionResult<{ emailSent: boolean }>> {
  const parsed = resendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid resend" };
  }
  const actor = await requireStaffAdmin();
  if (!actor) {
    return { ok: false, code: "unauthorized", message: "Cannot resend invite" };
  }

  const result = await inviteStaffByEmail({
    email: parsed.data.email,
    fullName: parsed.data.fullName || parsed.data.email.split("@")[0],
    role: parsed.data.role || "waiter",
  });

  if (!result.ok) return result;
  return { ok: true, data: { emailSent: result.data.emailSent } };
}

/** Immediate access without email (demo / offline). */
export async function createStaffUser(
  input: unknown
): Promise<ActionResult<{ userId: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid staff payload" };
  }

  const actor = await requireStaffAdmin();
  if (!actor) {
    return { ok: false, code: "unauthorized", message: "Cannot add users" };
  }

  if (!canAssignRole(actor.membership.role, parsed.data.role)) {
    return {
      ok: false,
      code: "forbidden_role",
      message: "You cannot assign that role",
    };
  }

  const admin = createAdminClient();
  const restaurantId = actor.membership.restaurant_id;
  const email = parsed.data.email.toLowerCase().trim();

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      invited_role: parsed.data.role,
      restaurant_id: restaurantId,
    },
  });

  if (error || !created.user) {
    const { data: listed } = await admin.auth.admin.listUsers({ perPage: 200 });
    const existing = listed?.users?.find((u) => u.email?.toLowerCase() === email);
    if (!existing) {
      return {
        ok: false,
        code: "create_fail",
        message: error?.message ?? "Could not create user",
      };
    }
    await admin.from("restaurant_members").upsert(
      {
        restaurant_id: restaurantId,
        user_id: existing.id,
        role: parsed.data.role,
      },
      { onConflict: "restaurant_id,user_id" }
    );
    await admin
      .from("profiles")
      .upsert({ id: existing.id, full_name: parsed.data.fullName });
    return { ok: true, data: { userId: existing.id } };
  }

  await admin
    .from("profiles")
    .upsert({ id: created.user.id, full_name: parsed.data.fullName });

  const { error: memErr } = await admin.from("restaurant_members").insert({
    restaurant_id: restaurantId,
    user_id: created.user.id,
    role: parsed.data.role,
  });

  if (memErr) {
    return { ok: false, code: "membership_fail", message: memErr.message };
  }

  return { ok: true, data: { userId: created.user.id } };
}

export async function updateStaffUser(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid update" };
  }

  const actor = await getMembership();
  if (!actor || !canEditUsers(actor.membership.role)) {
    return { ok: false, code: "unauthorized", message: "Cannot edit users" };
  }

  if (!canAssignRole(actor.membership.role, parsed.data.role)) {
    return {
      ok: false,
      code: "forbidden_role",
      message: "You cannot assign that role",
    };
  }

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("restaurant_members")
    .select("*")
    .eq("id", parsed.data.membershipId)
    .eq("restaurant_id", actor.membership.restaurant_id)
    .maybeSingle();

  if (!membership) {
    return { ok: false, code: "not_found", message: "User not found" };
  }

  if (
    actor.membership.role !== "super_admin" &&
    membership.role === "super_admin"
  ) {
    return { ok: false, code: "forbidden", message: "Cannot edit Super Admin" };
  }

  const authPatch: {
    password?: string;
    user_metadata?: Record<string, unknown>;
  } = {
    user_metadata: {
      full_name: parsed.data.fullName,
      invited_role: parsed.data.role,
    },
  };
  if (parsed.data.password) authPatch.password = parsed.data.password;

  const { error: authErr } = await admin.auth.admin.updateUserById(
    parsed.data.userId,
    authPatch
  );
  if (authErr) {
    return { ok: false, code: "update_fail", message: authErr.message };
  }

  await admin
    .from("profiles")
    .upsert({ id: parsed.data.userId, full_name: parsed.data.fullName });

  await admin
    .from("restaurant_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.membershipId);

  return { ok: true, data: { ok: true } };
}

export async function deleteStaffUser(
  input: unknown
): Promise<ActionResult<{ ok: true }>> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "invalid_input", message: "Invalid delete" };
  }

  const actor = await getMembership();
  if (!actor || !canDeleteUsers(actor.membership.role)) {
    return {
      ok: false,
      code: "unauthorized",
      message: "Only Super Admin can delete users",
    };
  }

  if (parsed.data.userId === actor.user.id) {
    return { ok: false, code: "self_delete", message: "Cannot delete yourself" };
  }

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("restaurant_members")
    .select("*")
    .eq("id", parsed.data.membershipId)
    .eq("restaurant_id", actor.membership.restaurant_id)
    .maybeSingle();

  if (!membership) {
    return { ok: false, code: "not_found", message: "User not found" };
  }

  await admin
    .from("restaurant_members")
    .delete()
    .eq("id", parsed.data.membershipId);

  await admin.auth.admin.deleteUser(parsed.data.userId);

  await admin.from("activity_logs").insert({
    restaurant_id: actor.membership.restaurant_id,
    actor: actor.user.email,
    action: "staff_delete",
    entity: parsed.data.userId,
    meta: {},
  });

  return { ok: true, data: { ok: true } };
}
