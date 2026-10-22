"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";
import { useToast } from "@/components/admin/toaster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/form-controls";
import { deleteCollectionAction, saveCollectionAction } from "../actions";

export type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  featured: boolean;
  isPublic: boolean;
  sortOrder: number;
  coverId: string | null;
  coverTitle: string | null;
  count: number;
};

type Option = { id: string; label: string };

const BLANK = { id: undefined as string | undefined, title: "", slug: "", description: "", featured: false, isPublic: true, sortOrder: 0, coverId: "" };

export function CollectionManager({ collections, imageOptions }: { collections: CollectionRow[]; imageOptions: Option[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCollectionAction(draft);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast(result.error, "error");
        return;
      }
      toast(result.message ?? "Saved");
      setDraft(BLANK);
      setErrors({});
      router.refresh();
    });
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_24rem]">
      <ul className="divide-y divide-line self-start rounded-md border border-line bg-surface shadow-card px-5">
        {collections.map((collection) => (
          <li key={collection.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {collection.title}
                {collection.featured && <Badge tone="accent">Featured</Badge>}
                {!collection.isPublic && <Badge tone="outline">Hidden</Badge>}
              </p>
              <p className="text-xs text-muted">
                /{collection.slug} · {collection.count} {collection.count === 1 ? "item" : "items"}
                {collection.coverTitle && ` · cover: ${collection.coverTitle}`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${collection.title}`}
                onClick={() =>
                  setDraft({
                    id: collection.id,
                    title: collection.title,
                    slug: collection.slug,
                    description: collection.description ?? "",
                    featured: collection.featured,
                    isPublic: collection.isPublic,
                    sortOrder: collection.sortOrder,
                    coverId: collection.coverId ?? "",
                  })
                }
              >
                <Pencil />
              </Button>
              <DeleteConfirmationDialog
                id={collection.id}
                title={`Delete “${collection.title}”`}
                description="The collection is removed; its media are kept."
                action={deleteCollectionAction}
                onDeleted={() => router.refresh()}
              />
            </div>
          </li>
        ))}
        {collections.length === 0 && <li className="py-8 text-sm text-muted">No collections yet.</li>}
      </ul>

      <form onSubmit={save} className="space-y-5 rounded-md border border-line bg-surface shadow-card p-5 xl:sticky xl:top-24 xl:self-start" noValidate>
        <h2 className="font-display text-2xl">{draft.id ? "Edit collection" : "New collection"}</h2>
        <Field id="collection-title" label="Title" required error={errors.title}>
          <Input id="collection-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-invalid={Boolean(errors.title)} />
        </Field>
        <Field id="collection-slug" label="Slug" error={errors.slug} hint="Generated from the title if blank">
          <Input id="collection-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        </Field>
        <Field id="collection-description" label="Description" error={errors.description}>
          <Textarea id="collection-description" rows={3} className="min-h-0" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
        <Field id="collection-cover" label="Cover image" hint="Defaults to the newest published item">
          <Select id="collection-cover" value={draft.coverId} onChange={(e) => setDraft({ ...draft, coverId: e.target.value })}>
            <option value="">Automatic</option>
            {imageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="collection-order" label="Sort order">
          <Input id="collection-order" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
        </Field>
        <Toggle id="collection-featured" label="Featured" description="Highlight on the homepage" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
        <Toggle id="collection-public" label="Public" description="Visible in gallery filters" checked={draft.isPublic} onChange={(e) => setDraft({ ...draft, isPublic: e.target.checked })} />
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {draft.id ? "Save changes" : "Add collection"}
          </Button>
          {draft.id && (
            <Button variant="ghost" onClick={() => { setDraft(BLANK); setErrors({}); }}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
