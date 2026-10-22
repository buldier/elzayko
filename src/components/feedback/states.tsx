import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({ title, description, action, icon: Icon, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      {Icon && <Icon className="mb-5 size-7 text-stone" strokeWidth={1.25} aria-hidden="true" />}
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      {description && <p className="mt-3 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, action, className }: StateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center px-6 py-20 text-center", className)}>
      <AlertTriangle className="mb-5 size-7 text-rosewood" strokeWidth={1.25} aria-hidden="true" />
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      {description && <p className="mt-3 max-w-md text-muted">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

const alertTones = {
  info: { icon: Info, className: "border-line-strong bg-paper-raised text-ink-soft" },
  success: { icon: CheckCircle2, className: "border-moss/30 bg-moss-tint text-moss" },
  error: { icon: AlertTriangle, className: "border-danger/30 bg-danger-tint text-danger" },
} as const;

/** Inline feedback banner. Use role="status" for success, role="alert" for errors. */
export function InlineAlert({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof alertTones;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: toneClass } = alertTones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-sm border px-4 py-3 text-sm", toneClass, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xs", className)} />;
}

/** Placeholder grid that mirrors the gallery's masonry columns. */
export function MediaGridSkeleton({ count = 9 }: { count?: number }) {
  const heights = ["h-72", "h-96", "h-64", "h-[28rem]", "h-80", "h-60"];
  return (
    <div role="status" aria-label="Loading gallery" className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="mb-5 break-inside-avoid">
          <Skeleton className={cn("w-full", heights[index % heights.length])} />
          <Skeleton className="mt-3 h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
