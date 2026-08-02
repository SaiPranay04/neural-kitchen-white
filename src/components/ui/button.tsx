import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#1B2B5E] text-white hover:bg-[#2D3F7C] disabled:opacity-40",
  secondary:
    "bg-[#E87722] text-white hover:bg-[#F59340] disabled:opacity-40",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
  outline:
    "border border-slate-200 bg-white text-[#1B2B5E] hover:bg-slate-50",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }
>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nk-orange disabled:cursor-not-allowed",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
