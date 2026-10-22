import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { SOCIAL_LABELS } from "@/config/site";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return { title: page.title, description: page.content.intro, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const [{ content }, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  return (
    <div className="page-container grid gap-16 pt-10 pb-24 md:grid-cols-12 md:pt-16">
      <div className="md:col-span-5">
        <p className="eyebrow mb-5">Contact</p>
        <h1 className="text-display">{content.heading}</h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">{content.intro}</p>
        {content.responseTime && <p className="mt-4 text-sm text-muted">{content.responseTime}</p>}

        <dl className="mt-12 space-y-6 border-t border-line pt-8 text-sm">
          {settings.contactEmail && (
            <div>
              <dt className="eyebrow mb-2">Email</dt>
              <dd>
                <a href={`mailto:${settings.contactEmail}`} className="link-underline text-ink">
                  {settings.contactEmail}
                </a>
              </dd>
            </div>
          )}
          {settings.location && (
            <div>
              <dt className="eyebrow mb-2">Based in</dt>
              <dd className="text-ink">{settings.location}</dd>
            </div>
          )}
          {settings.socialLinks.length > 0 && (
            <div>
              <dt className="eyebrow mb-2">Elsewhere</dt>
              <dd className="flex flex-wrap gap-x-5 gap-y-1">
                {settings.socialLinks.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer me" className="link-underline text-ink">
                    {SOCIAL_LABELS[link.platform]}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="md:col-span-6 md:col-start-7">
        <div className="border border-line bg-paper-raised p-6 sm:p-10">
          <h2 className="sr-only">Send a message</h2>
          <ContactForm />
        </div>
        {content.privacyNote && <p className="mt-5 text-xs leading-relaxed text-muted">{content.privacyNote}</p>}
      </div>
    </div>
  );
}
