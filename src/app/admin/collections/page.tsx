import { AdminPageHeader } from "@/components/admin/admin-header";
import { CollectionManager } from "@/features/collections/components/collection-manager";
import { listCollectionsForAdmin } from "@/features/collections/service";
import { getImageOptions } from "@/features/media/admin-options";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  await requireAdmin();
  const [collections, imageOptions] = await Promise.all([listCollectionsForAdmin(), getImageOptions()]);
  return (
    <>
      <AdminPageHeader title="Collections" description="Series that group work across categories. Add media to a collection from its edit page." />
      <CollectionManager
        imageOptions={imageOptions}
        collections={collections.map((collection) => ({
          id: collection.id,
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          featured: collection.featured,
          isPublic: collection.isPublic,
          sortOrder: collection.sortOrder,
          coverId: collection.coverId,
          coverTitle: collection.cover?.title ?? null,
          count: collection._count.items,
        }))}
      />
    </>
  );
}
