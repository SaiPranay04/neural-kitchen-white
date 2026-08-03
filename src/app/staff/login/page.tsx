"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabasePublicEnv } from "@/lib/supabase/client";
import { C } from "@/lib/constants";

const ERRORS: Record<string, string> = {
  not_invited:
    "This account is not invited. Ask Super Admin / Admin to add your email first.",
  auth_failed: "Sign-in failed. Try again or use email + password.",
  missing_code: "Auth callback missing code.",
  no_user: "Could not complete login.",
};

type Mode = "password" | "otp";

export default function StaffLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("superadmin@neuralkitchen.demo");
  const [password, setPassword] = useState("SuperAdmin@123");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      toast.error(
        "Supabase is not configured on this deploy. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env, then redeploy."
      );
    }
    const err = search.get("error");
    if (err && ERRORS[err]) {
      toast.error(ERRORS[err]);
      if (err === "not_invited" && hasSupabasePublicEnv()) {
        try {
          createClient().auth.signOut();
        } catch {
          /* ignore */
        }
      }
    }
  }, [search]);

  function signInPassword() {
    startTransition(async () => {
      if (!hasSupabasePublicEnv()) {
        toast.error(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY and redeploy."
        );
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        await routeAfterSession(data.user!.id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Login failed");
      }
    });
  }

  async function routeAfterSession(userId: string) {
    const supabase = createClient();
    const { data: membership } = await supabase
      .from("restaurant_members")
      .select("role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      await supabase.auth.signOut();
      toast.error(ERRORS.not_invited);
      return;
    }

    toast.success("Signed in");
    if (membership.role === "kitchen") router.push("/staff/kitchen");
    else if (membership.role === "waiter") router.push("/staff/waiter");
    else router.push("/dashboard");
    router.refresh();
  }

  function sendOtp() {
    startTransition(async () => {
      if (!hasSupabasePublicEnv()) {
        toast.error(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY and redeploy."
        );
        return;
      }
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            shouldCreateUser: false,
          },
        });
        if (error) {
          toast.error(
            `OTP: ${error.message}. Use Email + Password if mail is not configured.`
          );
          return;
        }
        setOtpSent(true);
        toast.success("OTP sent — enter the code from your email, or use the magic link");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "OTP failed");
      }
    });
  }

  function verifyOtp() {
    startTransition(async () => {
      if (!otpCode.trim()) {
        toast.error("Enter the OTP code from your email");
        return;
      }
      if (!hasSupabasePublicEnv()) {
        toast.error(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY and redeploy."
        );
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode.trim(),
          type: "email",
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (!data.user) {
          toast.error(ERRORS.no_user);
          return;
        }
        await routeAfterSession(data.user.id);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "OTP verify failed");
      }
    });
  }

  const inputStyle: CSSProperties = {
    marginTop: 4,
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${C.slate200}`,
    background: C.white,
    padding: "12px 14px",
    color: C.navy,
    outline: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.cream,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
      className="mx-auto flex max-w-md flex-col justify-center px-4 py-10"
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <span style={{ color: "white", fontWeight: 800, fontSize: 16 }}>NK</span>
      </div>
      <h1 className="font-display text-3xl" style={{ color: C.navy }}>
        Staff login
      </h1>
      <p className="mt-2 text-sm" style={{ color: C.slate600 }}>
        Email + password or OTP · invite-only RBAC
      </p>

      <div
        className="surface mt-4 space-y-2 p-4 text-xs leading-relaxed"
        style={{ color: C.slate600 }}
      >
        <p className="font-medium" style={{ color: C.navy }}>
          Auth options
        </p>
        <p>
          <span style={{ color: C.emerald, fontWeight: 600 }}>Primary:</span> Email +
          Password (fully functional — demo credentials below)
        </p>
        <p>
          <span style={{ color: C.amber, fontWeight: 600 }}>Also available:</span> OTP /
          magic-link via Supabase email
        </p>
        <p style={{ color: C.slate400 }}>
          Admins add staff via email invite or direct email + password in the Users tab.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("password")}
          style={{
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            background: mode === "password" ? C.navy : C.white,
            color: mode === "password" ? "white" : C.slate600,
            borderWidth: mode === "password" ? 0 : 1,
            borderStyle: "solid",
            borderColor: C.slate200,
          }}
        >
          Email + Password
        </button>
        <button
          type="button"
          onClick={() => setMode("otp")}
          style={{
            borderRadius: 12,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 600,
            border: `1px solid ${C.slate200}`,
            cursor: "pointer",
            background: mode === "otp" ? C.orange : C.white,
            color: mode === "otp" ? "white" : C.slate600,
          }}
        >
          OTP / Magic link
        </button>
      </div>

      <label className="mt-6 text-xs uppercase tracking-wide" style={{ color: C.slate400 }}>
        Email
      </label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        autoComplete="username"
      />

      {mode === "password" ? (
        <>
          <label className="mt-4 text-xs uppercase tracking-wide" style={{ color: C.slate400 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
          />
          <Button className="mt-4 w-full" disabled={pending} onClick={signInPassword}>
            Sign in with password
          </Button>
        </>
      ) : (
        <>
          <p className="mt-3 text-xs" style={{ color: C.amber }}>
            Sends a one-time code (and magic link) via Supabase email. If SMTP is not
            configured, use Email + Password instead.
          </p>
          <Button className="mt-4 w-full" disabled={pending} onClick={sendOtp}>
            {otpSent ? "Resend OTP" : "Send OTP"}
          </Button>
          {otpSent && (
            <>
              <label
                className="mt-4 text-xs uppercase tracking-wide"
                style={{ color: C.slate400 }}
              >
                OTP code
              </label>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={inputStyle}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
              />
              <Button className="mt-4 w-full" disabled={pending} onClick={verifyOtp}>
                Verify OTP and sign in
              </Button>
            </>
          )}
        </>
      )}

      <div className="surface mt-8 space-y-1 p-4 text-xs" style={{ color: C.slate400 }}>
        <p style={{ color: C.navy, fontWeight: 600 }}>Demo credentials</p>
        <p>superadmin@neuralkitchen.demo / SuperAdmin@123</p>
        <p className="pt-2" style={{ color: C.navy, fontWeight: 600 }}>
          Role demos (password: demo123456)
        </p>
        <p>kitchen@spicegarden.demo → KDS</p>
        <p>waiter@spicegarden.demo → Waiter panel</p>
        <p>manager@spicegarden.demo → Dashboard</p>
        <p>admin@spicegarden.demo → Users tab</p>
      </div>
    </main>
  );
}
