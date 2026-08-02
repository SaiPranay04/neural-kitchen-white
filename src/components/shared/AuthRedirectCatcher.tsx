"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Invites sometimes land on Site URL (/) with ?code= or #access_token=
 * instead of /auth/callback. Finish the session and send them to set-password.
 */
export function AuthRedirectCatcher() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code && !url.pathname.startsWith("/auth/callback")) {
      const next = encodeURIComponent("/staff/set-password");
      window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}&next=${next}`);
      return;
    }

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          router.replace("/staff/login?error=auth_failed");
          return;
        }
        window.history.replaceState({}, "", url.pathname);
        router.replace("/staff/set-password");
      });
  }, [router]);

  return null;
}
