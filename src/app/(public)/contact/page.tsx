import { RiMailLine, RiMapPinLine, RiSendPlaneLine, RiTimeLine } from "@remixicon/react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionTag } from "@/components/isak/chrome";
import { Fade } from "@/components/isak/motion/reveal";
import { SocialIcon } from "@/components/navigation/social-icons";
import { PageBanner } from "@/components/site/page-banner";
import { SOCIAL_LABELS } from "@/config/site";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return {
    title: page.title,
    description: page.content.intro,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  const { content } = page;
  return (
    <>
      <PageBanner
        title={content.heading || page.title}
        crumbs={[{ label: page.title }]}
        image={null}
        intro={content.intro}
      />

      <section aria-label="Contact details" className="py-8">
        <ul className="grid gap-3 sm:grid-cols-2">
          {settings.contactEmail && (
            <ContactItem icon={<RiMailLine className="size-5" />} label="Email">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="break-all transition-colors hover:text-primary"
              >
                {settings.contactEmail}
              </a>
            </ContactItem>
          )}
          {settings.location && (
            <ContactItem icon={<RiMapPinLine className="size-5" />} label="Based in">
              {settings.location}
            </ContactItem>
          )}
          {content.responseTime && (
            <ContactItem icon={<RiTimeLine className="size-5" />} label="Response time">
              {content.responseTime}
            </ContactItem>
          )}
        </ul>
        {settings.socialLinks.length > 0 && (
          <Fade className="mt-6 flex flex-wrap items-center gap-2">
            {settings.socialLinks.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={SOCIAL_LABELS[link.platform]}
                className="grid size-10 place-items-center rounded-lg bg-white/[0.06] text-white/80 transition-colors hover:bg-primary hover:text-white"
              >
                <SocialIcon platform={link.platform} className="size-4" />
              </a>
            ))}
          </Fade>
        )}
      </section>

      <section aria-labelledby="message-heading" className="py-12 md:py-16">
        <SectionTag icon={<RiSendPlaneLine className="size-4" />}>Write to me</SectionTag>
        <h2 id="message-heading" className="sr-only">
          Write to me
        </h2>
        <Fade>
          <ContactForm />
        </Fade>
        {content.privacyNote && <p className="mt-6 text-sm text-white/45">{content.privacyNote}</p>}
      </section>
    </>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Fade
      as="li"
      className="flex items-center gap-4 rounded-[20px] border border-white/5 bg-graphite p-5"
    >
      <span
        className="grid size-11 flex-none place-items-center rounded-lg bg-white/[0.06] text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-white/45">{label}</span>
        <span className="block text-white/85">{children}</span>
      </span>
    </Fade>
  );
}
