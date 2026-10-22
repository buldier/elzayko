import { AdminPageHeader } from "@/components/admin/admin-header";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { getTaxonomyOptions } from "@/features/media/admin-options";
import { MediaCreator } from "@/features/media/components/media-creator";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Add media" };

export default async function NewMediaPage({ searchParams }: PageProps<"/admin/media/new">) {
  await requireAdmin();
  const { source } = await searchParams;
  const { categories, collections } = await getTaxonomyOptions();
  return (
    <>
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Media", href: "/admin/media" }, { label: "Add media" }]} />
      </div>
      <AdminPageHeader title="Add media" description="Upload a photograph or video, or add a YouTube video or external link." />
      <MediaCreator categories={categories} collections={collections} initialSource={source === "external" ? "external" : "upload"} />
    </>
  );
}
