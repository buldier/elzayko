import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { getImageOptions } from "@/features/media/admin-options";
import { AboutEditor, ContactEditor, LegalEditor } from "@/features/pages/components/page-editors";
import { isPageSlug, PAGE_SLUGS, type PageSlug } from "@/features/pages/schemas";
import { getPage } from "@/features/pages/service";
import { requireAdmin } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Pages" };

const LABELS: Record<PageSlug, string> = { about: "About", contact: "Contact", privacy: "Privacy", terms: "Terms" };

export default async function AdminPagesPage({ searchParams }: PageProps<"/admin/pages">) {
  await requireAdmin();
  const { page: requested } = await searchParams;
  const slug: PageSlug = typeof requested === "string" && isPageSlug(requested) ? requested : "about";

  return (
    <>
      <AdminPageHeader title="Pages" description="Edit the copy on your static pages. Changes go live when saved." />
      <nav aria-label="Pages" className="mb-8 flex gap-6 border-b border-line">
        {PAGE_SLUGS.map((candidate) => (
          <Link
            key={candidate}
            href={`/admin/pages?page=${candidate}`}
            aria-current={candidate === slug ? "page" : undefined}
            className={cn("-mb-px border-b-2 pb-3 text-sm", candidate === slug ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            {LABELS[candidate]}
          </Link>
        ))}
      </nav>
      <Editor slug={slug} />
    </>
  );
}

async function Editor({ slug }: { slug: PageSlug }) {
  if (slug === "about") {
    const [page, imageOptions] = await Promise.all([getPage("about"), getImageOptions()]);
    return <AboutEditor key="about" title={page.title} content={page.content} imageOptions={imageOptions} />;
  }
  if (slug === "contact") {
    const page = await getPage("contact");
    return <ContactEditor key="contact" title={page.title} content={page.content} />;
  }
  const page = await getPage(slug);
  return <LegalEditor key={slug} slug={slug} title={page.title} content={page.content} />;
}
