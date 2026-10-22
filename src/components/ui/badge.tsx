import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 text-[0.7rem] font-semibold tracking-[0.08em] uppercase",
  {
    variants: {
      tone: {
        neutral: "bg-paper-sunk text-ink-soft",
        success: "bg-moss-tint text-moss",
        warning: "bg-amber-tint text-amber",
        accent: "bg-rosewood-tint text-rosewood-deep",
        danger: "bg-danger-tint text-danger",
        outline: "border border-line-strong text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Badge({ className, tone, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
