import { Download, Plus, Search, Star } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { MediaRowActions } from "@/components/admin/media-row-actions";
import { MediaThumb } from "@/components/admin/media-thumb";
import { PublishStatusBadge } from "@/components/admin/publish-status-badge";
import { EmptyState } from "@/components/feedback/states";
import { Pagination } from "@/components/gallery/pagination";
import { Button, ButtonLink } from "@/components/ui/button";
import { ADMIN_PAGE_SIZE } from "@/config/media";
import { mediaRepository } from "@/features/media/repository";
import { adminMediaFiltersSchema, type AdminMediaFilters } from "@/features/media/schemas";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "@/lib/utils/format";

export const metadata = { title: "Media" };

type Row = Awaited<ReturnType<typeof mediaRepository.adminList>>["items"][number];

function hrefFor(filters: AdminMediaFilters, overrides: Partial<AdminMediaFilters> = {}) {
  const next = { ...filters, page: 1, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status !== "all") params.set("status", next.status);
  if (next.type !== "all") params.set("type", next.type);
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/admin/media?${query}` : "/admin/media";
}

const columns: Column<Row>[] = [
  {
    header: "Media",
    cell: (row) => (
      <div className="flex items-center gap-4">
        <MediaThumb thumbnailKey={row.thumbnailKey} thumbnailUrl={row.thumbnailUrl} mediaType={row.mediaType} size={52} />
        <div className="min-w-0">
          <Link href={`/admin/media/${row.id}/edit`} className="flex items-center gap-1.5 font-medium hover:underline">
            <span className="truncate">{row.title}</span>
            {row.featured && <Star className="size-3.5 shrink-0 fill-rosewood text-rosewood" aria-label="Featured" />}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <span className="capitalize">{row.sourceType === "EXTERNAL" ? (row.provider ?? "link") : row.mediaType.toLowerCase()}</span>
            {row.category && <>· {row.category.name}</>}
            {row.allowDownload && (
              <span className="inline-flex items-center gap-0.5 text-moss">
                · <Download className="size-3" aria-hidden="true" /> download
              </span>
            )}
          </p>
        </div>
      </div>
    ),
  },
  { header: "Status", cell: (row) => <PublishStatusBadge status={row.status} /> },
  { header: "Updated", className: "whitespace-nowrap text-muted", cell: (row) => formatShortDate(row.updatedAt) },
  {
    header: "Actions",
    srOnlyHeader: true,
    className: "text-right",
    cell: (row) => <MediaRowActions id={row.id} title={row.title} status={row.status} featured={row.featured} />,
  },
];

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export default async function AdminMediaPage({ searchParams }: PageProps<"/admin/media">) {
  await requireAdmin();
  const raw = await searchParams;
  const filters = adminMediaFiltersSchema.parse({ q: raw.q, status: raw.status, type: raw.type, sort: raw.sort, page: raw.page });
  const [{ items, total }, counts] = await Promise.all([mediaRepository.adminList(filters, ADMIN_PAGE_SIZE), mediaRepository.counts()]);
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const tabCounts: Record<(typeof STATUS_TABS)[number]["value"], number> = {
    all: counts.published + counts.drafts + counts.archived,
    PUBLISHED: counts.published,
    DRAFT: counts.drafts,
    ARCHIVED: counts.archived,
  };

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Upload, organise and publish your photographs, films and links."
        action={
          <ButtonLink href="/admin/media/new">
            <Plus /> Add media
          </ButtonLink>
        }
      />

      <nav aria-label="Filter by status" className="mb-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none]">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <Link
              key={tab.value}
              href={hrefFor(filters, { status: tab.value })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
                active ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {tab.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[0.68rem] tabular-nums", active ? "bg-ink text-paper" : "bg-paper-sunk text-muted")}>
                {tabCounts[tab.value]}
              </span>
            </Link>
          );
        })}
      </nav>

      <form method="get" action="/admin/media" role="search" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        {filters.status !== "all" && <input type="hidden" name="status" value={filters.status} />}
        <div className="relative flex-1">
          <label className="sr-only" htmlFor="media-q">
            Search media
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            id="media-q"
            name="q"
            type="search"
            placeholder="Search title, caption, tags…"
            defaultValue={filters.q}
            className="h-10 w-full rounded-sm border border-line-strong bg-surface pr-3 pl-9 text-sm placeholder:text-faint focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-rosewood/20 focus-visible:outline-none"
          />
        </div>
        <ToolbarSelect name="type" label="Type" value={filters.type} options={[["all", "All types"], ["image", "Images"], ["video", "Videos"], ["link", "Links"]]} />
        <ToolbarSelect name="sort" label="Sort" value={filters.sort} options={[["newest", "Newest first"], ["oldest", "Oldest first"], ["updated", "Recently updated"], ["title", "Title A–Z"]]} />
        <Button type="submit" variant="secondary" size="sm" className="h-10 bg-surface">
          Apply
        </Button>
      </form>

      <DataTable
        caption="Media items"
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        empty={
          <EmptyState
            title="No media found"
            description="Adjust the filters or add your first piece of work."
            action={<ButtonLink href="/admin/media/new">Add media</ButtonLink>}
            className="rounded-md border border-line bg-surface shadow-card"
          />
        }
      />
      <div className="mt-6 flex items-center justify-between text-xs text-muted">
        <span>
          {total} {total === 1 ? "item" : "items"}
          {pageCount > 1 && ` · page ${filters.page} of ${pageCount}`}
        </span>
      </div>
      <div className="mt-4">
        <Pagination page={filters.page} pageCount={pageCount} hrefFor={(page) => hrefFor(filters, { page })} />
      </div>
    </>
  );
}

function ToolbarSelect({ name, label, value, options }: { name: string; label: string; value: string; options: [string, string][] }) {
  return (
    <div>
      <label className="sr-only" htmlFor={`media-${name}`}>
        {label}
      </label>
      <select
        id={`media-${name}`}
        name={name}
        defaultValue={value}
        className="h-10 w-full rounded-sm border border-line-strong bg-surface px-3 text-sm sm:w-44"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
