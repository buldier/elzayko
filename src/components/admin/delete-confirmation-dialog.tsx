"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/utils/result";
import { useToast } from "./toaster";

type Props = {
  title: string;
  description: string;
  /** Server Action receiving the id. Authorization is enforced inside the action. */
  action: (id: string) => Promise<ActionResult>;
  id: string;
  onDeleted?: () => void;
  trigger?: "icon" | "button";
};

export function DeleteConfirmationDialog({ title, description, action, id, onDeleted, trigger = "icon" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function confirm() {
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        dialogRef.current?.close();
        toast(result.message ?? "Deleted");
        onDeleted?.();
      } else {
        toast(result.error, "error");
      }
    });
  }

  return (
    <>
      {trigger === "icon" ? (
        <Button variant="ghost" size="icon-sm" onClick={() => dialogRef.current?.showModal()} aria-label={title} title={title}>
          <Trash2 className="text-danger" />
        </Button>
      ) : (
        <Button variant="danger-outline" onClick={() => dialogRef.current?.showModal()}>
          <Trash2 /> {title}
        </Button>
      )}
      <dialog
        ref={dialogRef}
        aria-labelledby={`delete-${id}-title`}
        aria-describedby={`delete-${id}-desc`}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-md border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50"
      >
        <div className="p-6">
          <h2 id={`delete-${id}-title`} className="font-display text-2xl">
            {title}
          </h2>
          <p id={`delete-${id}-desc`} className="mt-2 text-sm text-ink-soft">
            {description}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => dialogRef.current?.close()} disabled={pending} autoFocus>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} disabled={pending}>
              {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Delete permanently
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
