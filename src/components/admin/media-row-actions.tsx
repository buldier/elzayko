"use client";

import { Pencil, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { deleteMediaAction, setMediaFeaturedAction, setMediaStatusAction } from "@/features/media/actions";
import type { MediaStatus } from "@/features/media/types";
import { cn } from "@/lib/utils/cn";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useToast } from "./toaster";

type Props = { id: string; title: string; status: MediaStatus; featured: boolean };

export function MediaRowActions({ id, title, status, featured }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; message?: string; error?: string }>) {
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        toast(result.message ?? "Saved");
        router.refresh();
      } else {
        toast(result.error ?? "Something went wrong", "error");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1" aria-busy={pending}>
      <label className="sr-only" htmlFor={`status-${id}`}>
        Status for {title}
      </label>
      <select
        id={`status-${id}`}
        value={status}
        disabled={pending}
        onChange={(event) => run(() => setMediaStatusAction(id, event.target.value))}
        className="h-8 rounded-xs border border-line-strong bg-paper-raised px-2 text-xs"
      >
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
        <option value="ARCHIVED">Archived</option>
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setMediaFeaturedAction(id, !featured))}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        aria-pressed={featured}
        aria-label={featured ? `Remove “${title}” from featured` : `Feature “${title}”`}
        title={featured ? "Featured" : "Not featured"}
      >
        <Star className={featured ? "fill-rosewood text-rosewood" : "text-faint"} />
      </button>
      <Link href={`/admin/media/${id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))} aria-label={`Edit “${title}”`}>
        <Pencil />
      </Link>
      <DeleteConfirmationDialog
        id={id}
        title={`Delete “${title}”`}
        description="The item and its stored files will be removed permanently. This cannot be undone."
        action={deleteMediaAction}
        onDeleted={() => router.refresh()}
      />
    </div>
  );
}
