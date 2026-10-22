"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DeleteConfirmationDialog } from "@/components/admin/delete-confirmation-dialog";
import { useToast } from "@/components/admin/toaster";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { deleteCategoryAction, saveCategoryAction } from "../actions";

export type CategoryRow = { id: string; name: string; slug: string; description: string | null; sortOrder: number; count: number };

const BLANK = { id: undefined as string | undefined, name: "", slug: "", description: "", sortOrder: 0 };

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState(BLANK);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCategoryAction(draft);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? { form: [result.error] });
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
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-muted">
                /{category.slug} · {category.count} {category.count === 1 ? "item" : "items"} · order {category.sortOrder}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Edit ${category.name}`}
                onClick={() => setDraft({ id: category.id, name: category.name, slug: category.slug, description: category.description ?? "", sortOrder: category.sortOrder })}
              >
                <Pencil />
              </Button>
              <DeleteConfirmationDialog
                id={category.id}
                title={`Delete “${category.name}”`}
                description={`${category.count} item(s) will keep existing without a category.`}
                action={deleteCategoryAction}
                onDeleted={() => router.refresh()}
              />
            </div>
          </li>
        ))}
        {categories.length === 0 && <li className="py-8 text-sm text-muted">No categories yet.</li>}
      </ul>

      <form onSubmit={save} className="space-y-5 rounded-md border border-line bg-surface shadow-card p-5 xl:sticky xl:top-24 xl:self-start" noValidate>
        <h2 className="font-display text-2xl">{draft.id ? "Edit category" : "New category"}</h2>
        <Field id="category-name" label="Name" required error={errors.name}>
          <Input id="category-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field id="category-slug" label="Slug" error={errors.slug} hint="Generated from the name if blank">
          <Input id="category-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
        </Field>
        <Field id="category-description" label="Description" error={errors.description}>
          <Textarea id="category-description" rows={3} className="min-h-0" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
        <Field id="category-order" label="Sort order" error={errors.sortOrder}>
          <Input id="category-order" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
        </Field>
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {draft.id ? "Save changes" : "Add category"}
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
