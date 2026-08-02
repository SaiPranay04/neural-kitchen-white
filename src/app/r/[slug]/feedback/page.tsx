"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function FeedbackInner() {
  const router = useRouter();
  const search = useSearchParams();
  const orderId = search.get("orderId");
  const token = search.get("token") ?? "";
  const displayId = search.get("displayId");
  const slug = search.get("slug");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  function finish() {
    const parts = window.location.pathname.split("/");
    const rSlug = parts[2] || slug || "spice-garden";
    router.push(
      `/r/${rSlug}/thanks?orderId=${orderId}&token=${token}&displayId=${displayId ?? ""}`
    );
  }

  function submit() {
    if (!orderId) return;
    startTransition(async () => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      if (!res.ok) {
        toast.error("Could not save feedback");
        return;
      }
      toast.success("Thanks for the feedback");
      finish();
    });
  }

  function skip() {
    startTransition(async () => {
      finish();
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center bg-nk-cream px-4">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
        Order #{displayId ?? "—"}
      </p>
      <h1 className="font-display text-2xl text-nk-navy">How was dining?</h1>
      <p className="mt-2 text-sm text-slate-500">
        Optional — skip anytime. After this we close your table session.
      </p>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className={`h-11 w-11 rounded-xl border text-sm ${
              rating === n
                ? "border-nk-orange bg-nk-orange/10 text-nk-orange"
                : "border-slate-200 text-slate-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-nk-navy"
        rows={3}
        placeholder="Optional comment"
      />
      <Button className="mt-4" disabled={pending || !orderId} onClick={submit}>
        Submit feedback
      </Button>
      <Button
        className="mt-2"
        variant="outline"
        disabled={pending || !orderId}
        onClick={skip}
      >
        Skip
      </Button>
    </main>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading…</div>}>
      <FeedbackInner />
    </Suspense>
  );
}
