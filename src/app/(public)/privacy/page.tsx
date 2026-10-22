import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getPage } from "@/features/pages/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("privacy");
  return { title: page.title, alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  const page = await getPage("privacy");
  return <LegalPage title={page.title} content={page.content} />;
}
