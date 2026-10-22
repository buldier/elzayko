import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { logoutAction } from "@/features/auth/actions";
import { getAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Signed-in user and sign-out. Rendered inside a Suspense boundary (reads the session). */
export async function AdminUserMenu({ compact = false }: { compact?: boolean }) {
  const admin = await getAdmin();
  if (!admin) return null;
  return (
    <div className={cn("flex items-center gap-3", !compact && "rounded-sm p-2")}>
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          compact ? "bg-ink text-paper" : "bg-sand text-ink",
        )}
        aria-hidden="true"
      >
        {initials(admin.name)}
      </span>
      <div className={cn("min-w-0 flex-1 leading-tight", compact && "hidden sm:block")}>
        <p className={cn("truncate text-sm font-medium", compact ? "text-ink" : "text-paper")}>{admin.name}</p>
        <p className={cn("truncate text-xs", compact ? "text-muted" : "text-paper/50")}>{admin.email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-sm transition-colors",
            compact ? "text-muted hover:bg-paper-sunk hover:text-ink" : "text-paper/60 hover:bg-paper/10 hover:text-paper",
          )}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function AdminPageHeader({ title, description, action, eyebrow }: { title: string; description?: string; action?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="font-display text-[2.4rem] leading-tight tracking-[-0.01em]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
