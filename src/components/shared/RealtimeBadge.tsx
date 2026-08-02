"use client";

import type { RealtimeMode } from "@/hooks/useRealtime";

export function RealtimeBadge({ mode }: { mode: RealtimeMode }) {
  const label =
    mode === "realtime"
      ? "Realtime · live"
      : mode === "polling"
        ? "Live · polling fallback"
        : "Connecting…";
  const tone =
    mode === "realtime"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : mode === "polling"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-500";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono-num text-[11px] uppercase tracking-wide ${tone}`}
      title="Supabase Realtime postgres_changes (with polling fallback)"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          mode === "realtime"
            ? "bg-emerald-500"
            : mode === "polling"
              ? "bg-amber-500"
              : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}
