"use client";

import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { createContext, use, useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Toast = { id: number; message: string; tone: "success" | "error" };
type ToastContextValue = { toast: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const toast = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex animate-fade-up items-start gap-3 rounded-sm border px-4 py-3 text-sm shadow-lg",
              item.tone === "success" ? "border-line bg-ink text-paper" : "border-danger/30 bg-danger-tint text-danger",
            )}
          >
            {item.tone === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
            <p className="flex-1">{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const context = use(ToastContext);
  if (!context) throw new Error("useToast must be used inside <Toaster>");
  return context;
}
