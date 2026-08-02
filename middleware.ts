import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessDashboard, canViewUsersTab, homePathForRole } from "@/lib/rbac";
import type { MemberRole } from "@/types/database";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: request.headers } });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/staff/login");
  const isSetPassword = path.startsWith("/staff/set-password");
  const isStaff = path.startsWith("/staff") && !isLogin && !isSetPassword;
  const isDashboard = path.startsWith("/dashboard");
  const isAuthCallback = path.startsWith("/auth/callback");

  if (isAuthCallback) return response;

  // Invite accept page needs a logged-in session from the email link
  if (isSetPassword && !user) {
    return NextResponse.redirect(new URL("/staff/login?error=auth_failed", request.url));
  }

  if ((isStaff || isDashboard) && !user) {
    return NextResponse.redirect(new URL("/staff/login", request.url));
  }

  if (user && (isStaff || isDashboard || isLogin)) {
    const { data: membership } = await supabase
      .from("restaurant_members")
      .select("role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const role = membership?.role as MemberRole | undefined;

    // Authenticated but not provisioned → kick out (session cleared on login page)
    if (!role && !isLogin) {
      return NextResponse.redirect(
        new URL("/staff/login?error=not_invited", request.url)
      );
    }

    if (role && isLogin) {
      return NextResponse.redirect(new URL(homePathForRole(role), request.url));
    }

    if (role && isDashboard && !canAccessDashboard(role)) {
      return NextResponse.redirect(new URL(homePathForRole(role), request.url));
    }

    if (role && path.startsWith("/dashboard/staff") && !canViewUsersTab(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (path.startsWith("/staff/kitchen") && role === "waiter") {
      return NextResponse.redirect(new URL("/staff/waiter", request.url));
    }
    if (path.startsWith("/staff/waiter") && role === "kitchen") {
      return NextResponse.redirect(new URL("/staff/kitchen", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*", "/auth/callback"],
};
