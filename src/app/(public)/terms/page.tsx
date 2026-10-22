import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getPage } from "@/features/pages/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("terms");
  return { title: page.title, alternates: { canonical: "/terms" } };
}

export default async function TermsPage() {
  const page = await getPage("terms");
  return <LegalPage title={page.title} content={page.content} />;
}
