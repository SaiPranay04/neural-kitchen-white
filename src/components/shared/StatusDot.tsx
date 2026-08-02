import { cn } from "@/lib/utils";

const colors: Record<string, string> = {
  available: "bg-emerald-400",
  occupied: "bg-cyan-400",
  needs_service: "bg-amber-400",
  bill_requested: "bg-violet-400",
  cleaning: "bg-slate-400",
  reserved: "bg-sky-400",
  queued: "bg-slate-400",
  accepted: "bg-sky-400",
  preparing: "bg-amber-400",
  ready: "bg-emerald-400",
  served: "bg-cyan-400",
  cancelled: "bg-rose-400",
};

export function StatusDot({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full",
        colors[status] ?? "bg-slate-400",
        className
      )}
    />
  );
}
