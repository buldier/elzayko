import { RichText } from "@/components/ui/rich-text";
import type { LegalContent } from "@/features/pages/schemas";

export function LegalPage({ title, content }: { title: string; content: LegalContent }) {
  return (
    <article className="page-container grid gap-12 pt-10 pb-24 md:grid-cols-12 md:pt-16">
      <header className="md:col-span-4">
        <p className="eyebrow mb-5">Legal</p>
        <h1 className="text-headline">{title}</h1>
        {content.lastUpdated && <p className="mt-6 text-sm text-muted">Last updated: {content.lastUpdated}</p>}
      </header>
      <RichText source={content.body} className="max-w-2xl md:col-span-7 md:col-start-6" />
    </article>
  );
}
