import { PageBanner } from "@/components/site/page-banner";
import { RichText } from "@/components/ui/rich-text";
import type { LegalContent } from "@/features/pages/schemas";

export function LegalPage({ title, content }: { title: string; content: LegalContent }) {
  return (
    <article>
      <PageBanner title={title} crumbs={[{ label: title }]} image={null} />
      <div className="pt-6 pb-16 md:pb-24">
        <div>
          <div>
            {content.lastUpdated && (
              <span className="mb-[15px] block font-medium text-white">
                Last updated: {content.lastUpdated}
              </span>
            )}
            <RichText source={content.body} variant="musfix" />
          </div>
        </div>
      </div>
    </article>
  );
}
