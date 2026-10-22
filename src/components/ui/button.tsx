import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[background-color,color,border-color,opacity] duration-(--duration-fast) ease-editorial disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-ink-soft",
        accent: "bg-rosewood text-paper hover:bg-rosewood-deep",
        secondary: "border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-paper-raised",
        ghost: "text-ink hover:bg-paper-sunk",
        link: "h-auto px-0 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink",
        danger: "bg-danger text-paper hover:bg-danger/90",
        "danger-outline": "border border-danger/40 text-danger hover:bg-danger-tint",
      },
      size: {
        sm: "h-9 rounded-sm px-3 text-sm",
        md: "h-11 rounded-sm px-5 text-sm tracking-wide",
        lg: "h-13 rounded-sm px-7 text-[0.95rem] tracking-wide",
        icon: "size-10 rounded-sm",
        "icon-sm": "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
