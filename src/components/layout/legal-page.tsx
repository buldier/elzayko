import { PageBanner } from "@/components/site/page-banner";
import { RichText } from "@/components/ui/rich-text";
import type { LegalContent } from "@/features/pages/schemas";

export function LegalPage({ title, content }: { title: string; content: LegalContent }) {
  return (
    <article>
      <PageBanner title={title} crumbs={[{ label: title }]} featuredIndex={4} />
      <div className="relative z-[1] py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]">
        <div className="container">
          <div className="mx-auto xl:max-w-[960px]">
            {content.lastUpdated && <span className="mb-[15px] block font-medium text-white">Last updated: {content.lastUpdated}</span>}
            <RichText source={content.body} variant="musfix" />
          </div>
        </div>
      </div>
    </article>
  );
}
