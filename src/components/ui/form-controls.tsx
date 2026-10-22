import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const controlBase =
  "w-full rounded-sm border border-line-strong bg-paper-raised px-3.5 text-[0.95rem] text-ink placeholder:text-faint transition-colors duration-(--duration-fast) hover:border-stone focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rosewood/25 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-danger/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlBase, "min-h-32 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <span className={cn("relative block", className)}>
      <select className={cn(controlBase, "h-11 appearance-none pr-9")} {...props} />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
    </span>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-ink", className)} {...props} />;
}

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | string[];
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint + error, wired with ids for aria-describedby. */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-rosewood" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !message && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {message && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {message}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: unknown, hint?: unknown): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type ToggleProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode };

/** Accessible switch built on a native checkbox. */
export function Toggle({ id, label, description, className, ...props }: ToggleProps) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" {...props} />
        <span className="h-5 w-9 rounded-full bg-line-strong transition-colors duration-(--duration-fast) peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rosewood peer-disabled:opacity-50" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-paper-raised shadow-sm transition-transform duration-(--duration-fast) ease-editorial peer-checked:translate-x-4" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}
