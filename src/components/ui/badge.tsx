import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  low_stock: "bg-amber-50 text-amber-700 border-amber-200",
  delayed: "bg-orange-50 text-orange-700 border-orange-200",
  paused: "bg-slate-100 text-slate-600 border-slate-200",
  unavailable: "bg-rose-50 text-rose-700 border-rose-200",
  default: "bg-slate-100 text-nk-navy border-slate-200",
};

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        styles[tone] ?? styles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
