import { AdminPageHeader } from "@/components/admin/admin-header";
import { getImageOptions } from "@/features/media/admin-options";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getSiteSettings } from "@/features/settings/service";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, imageOptions] = await Promise.all([getSiteSettings(), getImageOptions()]);
  return (
    <>
      <AdminPageHeader title="Settings" description="Site identity, homepage copy, contact details and social links." />
      <SettingsForm settings={settings} imageOptions={imageOptions} />
    </>
  );
}
