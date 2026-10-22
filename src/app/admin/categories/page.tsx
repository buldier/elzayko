import { AdminPageHeader } from "@/components/admin/admin-header";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { listCategoriesForAdmin } from "@/features/categories/service";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategoriesForAdmin();
  return (
    <>
      <AdminPageHeader title="Categories" description="Broad groupings used for gallery filters." />
      <CategoryManager
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          count: category._count.media,
        }))}
      />
    </>
  );
}
