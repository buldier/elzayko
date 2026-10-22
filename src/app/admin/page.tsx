import {
  ArrowRight,
  Download,
  FileText,
  FolderOpen,
  Images,
  Link2,
  Mail,
  PenLine,
  Plus,
  Settings,
  Star,
  Tags,
  Upload,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { MediaThumb } from "@/components/admin/media-thumb";
import { PublishStatusBadge } from "@/components/admin/publish-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { mediaRepository } from "@/features/media/repository";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatShortDate } from "@/lib/utils/format";

export const metadata = { title: "Overview" };

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [counts, recent, messages] = await Promise.all([
    mediaRepository.counts(),
    mediaRepository.recent(6),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, subject: true, message: true, createdAt: true, status: true, emailDelivered: true },
    }),
  ]);
  const total = counts.published + counts.drafts + counts.archived;
  const publishedShare = total ? Math.round((counts.published / total) * 100) : 0;

  const stats: { label: string; value: number; hint: string; href: string; icon: LucideIcon; tone: string }[] = [
    { label: "Published", value: counts.published, hint: `${publishedShare}% of the library`, href: "/admin/media?status=PUBLISHED", icon: Images, tone: "bg-moss-tint text-moss" },
    { label: "Drafts", value: counts.drafts, hint: counts.drafts ? "Waiting to be published" : "Nothing pending", href: "/admin/media?status=DRAFT", icon: PenLine, tone: "bg-amber-tint text-amber" },
    { label: "Featured", value: counts.featured, hint: "Shown on the homepage", href: "/admin/media?status=PUBLISHED", icon: Star, tone: "bg-rosewood-tint text-rosewood" },
    { label: "Messages", value: counts.unreadMessages, hint: "New since last review", href: "#messages", icon: Mail, tone: "bg-paper-sunk text-ink-soft" },
  ];

  const quickActions: { label: string; description: string; href: string; icon: LucideIcon }[] = [
    { label: "Upload media", description: "Images or video files", href: "/admin/media/new", icon: Upload },
    { label: "Add a link", description: "YouTube or social post", href: "/admin/media/new?source=external", icon: Link2 },
    { label: "Edit About page", description: "Biography and highlights", href: "/admin/pages?page=about", icon: FileText },
    { label: "Site settings", description: "Hero copy and social links", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow={<p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{formatShortDate(new Date())}</p>}
        title={`${greeting()}, ${admin.name.split(" ")[0]}.`}
        description="Here’s what’s happening across your gallery."
        action={
          <>
            <ButtonLink href="/" target="_blank" variant="secondary" className="bg-surface">
              View site
            </ButtonLink>
            <ButtonLink href="/admin/media/new">
              <Plus /> Add media
            </ButtonLink>
          </>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className="group flex h-full flex-col rounded-md border border-line bg-surface p-5 shadow-card transition-shadow duration-(--duration-base) hover:shadow-raised"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-soft">{stat.label}</span>
                  <span className={`inline-flex size-9 items-center justify-center rounded-sm ${stat.tone}`}>
                    <Icon className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 font-display text-5xl leading-none tabular-nums">{stat.value}</p>
                <p className="mt-3 flex items-center justify-between text-xs text-muted">
                  {stat.hint}
                  <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <AdminCard
          title="Recently edited"
          description="Your latest changes across the library"
          action={
            <Link href="/admin/media" className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink">
              All media <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
          className="xl:col-span-2"
          flush
        >
          <ul className="divide-y divide-line">
            {recent.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/media/${item.id}/edit`} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-paper-raised">
                  <MediaThumb thumbnailKey={item.thumbnailKey} thumbnailUrl={item.thumbnailUrl} mediaType={item.mediaType} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted">
                      {item.sourceType === "EXTERNAL" ? (item.provider ?? "link") : item.mediaType.toLowerCase()}
                      {item.category && ` · ${item.category.name}`}
                    </p>
                  </div>
                  <span className="hidden text-xs text-muted sm:block">{formatShortDate(item.updatedAt)}</span>
                  <PublishStatusBadge status={item.status} />
                </Link>
              </li>
            ))}
            {recent.length === 0 && <li className="px-5 py-10 text-center text-sm text-muted">No media yet — upload your first piece.</li>}
          </ul>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard title="Quick actions" flush>
            <ul className="grid grid-cols-2 gap-px bg-line">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.label} className="bg-surface">
                    <Link href={action.href} className="group flex h-full flex-col gap-3 p-4 transition-colors hover:bg-paper-raised">
                      <span className="inline-flex size-8 items-center justify-center rounded-sm bg-ink text-paper transition-transform group-hover:-translate-y-0.5">
                        <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{action.label}</span>
                        <span className="block text-xs text-muted">{action.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AdminCard>

          <AdminCard title="Library">
            <dl className="space-y-3 text-sm">
              <LibraryRow icon={Tags} label="Categories" value={counts.categories} href="/admin/categories" />
              <LibraryRow icon={FolderOpen} label="Collections" value={counts.collections} href="/admin/collections" />
              <LibraryRow icon={Download} label="Downloadable images" value={counts.downloadable} href="/admin/media?type=image" />
              <LibraryRow icon={Images} label="Archived" value={counts.archived} href="/admin/media?status=ARCHIVED" />
            </dl>
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-xs text-muted">
                <span>Published</span>
                <span className="tabular-nums">
                  {counts.published} / {total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-paper-sunk" role="img" aria-label={`${publishedShare}% of media published`}>
                <div className="h-full rounded-full bg-moss" style={{ width: `${publishedShare}%` }} />
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <div id="messages" className="mt-6 scroll-mt-6">
        <AdminCard title="Latest messages" description="Submissions from the contact form" flush>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-paper-sunk text-muted">
                <Mail className="size-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium">No messages yet</p>
              <p className="text-xs text-muted">New enquiries from the contact page will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((message) => (
                <li key={message.id} className="flex gap-4 px-5 py-4">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-paper-sunk text-xs font-semibold text-ink-soft" aria-hidden="true">
                    {message.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-medium">{message.name}</p>
                      <a href={`mailto:${message.email}`} className="text-xs text-muted hover:text-ink hover:underline">
                        {message.email}
                      </a>
                      {message.status === "NEW" && <Badge tone="accent">New</Badge>}
                      {!message.emailDelivered && <Badge tone="outline">Stored only</Badge>}
                      <span className="ml-auto text-xs text-muted">{formatShortDate(message.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink-soft">{message.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted">{message.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}

function LibraryRow({ icon: Icon, label, value, href }: { icon: LucideIcon; label: string; value: number; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt>
        <Link href={href} className="inline-flex items-center gap-2.5 text-ink-soft hover:text-ink">
          <Icon className="size-4 text-muted" strokeWidth={1.5} aria-hidden="true" />
          {label}
        </Link>
      </dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}
