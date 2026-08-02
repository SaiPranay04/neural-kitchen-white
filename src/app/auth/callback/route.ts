import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { homePathForRole } from "@/lib/rbac";
import type { MemberRole } from "@/types/database";

/**
 * Handles email invite accept links and OTP / magic-link callbacks.
 * Invite-only: users must have restaurant_members row or invite metadata.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/staff/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/staff/login?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/staff/login?error=no_user`);
  }

  const admin = createAdminClient();
  const meta = user.user_metadata ?? {};
  const invitedRole = meta.invited_role as MemberRole | undefined;
  const restaurantId = meta.restaurant_id as string | undefined;

  let { data: membership } = await admin
    .from("restaurant_members")
    .select("role, restaurant_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership && invitedRole && restaurantId) {
    await admin.from("restaurant_members").upsert(
      {
        restaurant_id: restaurantId,
        user_id: user.id,
        role: invitedRole,
      },
      { onConflict: "restaurant_id,user_id" }
    );
    await admin.from("profiles").upsert({
      id: user.id,
      full_name:
        (meta.full_name as string) ||
        user.email?.split("@")[0] ||
        "Staff",
    });
    membership = { role: invitedRole, restaurant_id: restaurantId };
  }

  if (!membership) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/staff/login?error=not_invited`);
  }

  const dest =
    next?.includes("set-password") || next === "/staff/login"
      ? `/staff/set-password`
      : next || homePathForRole(membership.role as MemberRole);

  return NextResponse.redirect(`${origin}${dest}`);
}
