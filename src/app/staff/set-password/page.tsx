"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/constants";

/** After email invite accept — person sets their own password. */
export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  const inputStyle: React.CSSProperties = {
    marginTop: 4,
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${C.slate200}`,
    background: C.white,
    padding: "12px 14px",
    color: C.navy,
    outline: "none",
  };

  function save() {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Session expired — open the invite link again");
        router.push("/staff/login");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }

      const { data: membership } = await supabase
        .from("restaurant_members")
        .select("role")
        .eq("user_id", userData.user.id)
        .limit(1)
        .maybeSingle();

      toast.success("Password saved — welcome aboard");
      if (membership?.role === "kitchen") router.push("/staff/kitchen");
      else if (membership?.role === "waiter") router.push("/staff/waiter");
      else router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <main
      style={{ minHeight: "100vh", background: C.cream }}
      className="mx-auto flex max-w-md flex-col justify-center px-4"
    >
      <h1 className="font-display text-3xl" style={{ color: C.navy }}>
        Accept invite
      </h1>
      <p className="mt-2 text-sm" style={{ color: C.slate600 }}>
        You were invited by email. Set a password to finish access.
      </p>

      <label className="mt-6 text-xs uppercase tracking-wide" style={{ color: C.slate400 }}>
        New password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <label className="mt-4 text-xs uppercase tracking-wide" style={{ color: C.slate400 }}>
        Confirm password
      </label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        style={inputStyle}
      />

      <Button className="mt-4 w-full" disabled={pending} onClick={save}>
        {pending ? "Saving…" : "Activate access"}
      </Button>
    </main>
  );
}
