import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding (for tables and edge-to-edge lists). */
  flush?: boolean;
};

/** Surface used for every dashboard panel. */
export function AdminCard({ title, description, action, children, className, flush }: Props) {
  return (
    <section className={cn("overflow-hidden rounded-md border border-line bg-surface shadow-card", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-sans text-[0.95rem] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? undefined : "p-5"}>{children}</div>
    </section>
  );
}
