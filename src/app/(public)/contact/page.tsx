import { RiMailLine, RiMapPinLine, RiTimeLine } from "@remixicon/react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/forms/contact-form";
import { SocialIcon } from "@/components/navigation/social-icons";
import { PageBanner } from "@/components/site/page-banner";
import { SOCIAL_LABELS } from "@/config/site";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact");
  return { title: page.title, description: page.content.intro, alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage("contact"), getSiteSettings()]);
  const { content } = page;
  return (
    <>
      <PageBanner title={page.title} crumbs={[{ label: page.title }]} featuredIndex={5} />
      <div className="relative z-[1] py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]">
        <div className="container">
          <div className="grid grid-cols-1 gap-[25px] lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="mb-[20px] text-lg !font-semibold md:mb-[25px] md:text-xl">{content.heading}</h2>
              {content.intro && <p className="mb-[25px] text-[#a0a0a0]">{content.intro}</p>}
              <ul className="mb-[30px] md:mb-[40px]">
                {settings.contactEmail && (
                  <ContactItem icon={<RiMailLine className="size-6" />} label="Email Us">
                    <a href={`mailto:${settings.contactEmail}`} className="break-all text-[#a0a0a0] transition-all duration-300 ease-in-out hover:text-primary">
                      {settings.contactEmail}
                    </a>
                  </ContactItem>
                )}
                {settings.location && (
                  <ContactItem icon={<RiMapPinLine className="size-6" />} label="Based In">
                    <span className="block text-[#a0a0a0]">{settings.location}</span>
                  </ContactItem>
                )}
                {content.responseTime && (
                  <ContactItem icon={<RiTimeLine className="size-6" />} label="Response Time">
                    <span className="block text-[#a0a0a0]">{content.responseTime}</span>
                  </ContactItem>
                )}
              </ul>
              {settings.socialLinks.length > 0 && (
                <>
                  <h2 className="mb-[20px] text-lg !font-semibold md:mb-[25px] md:text-xl">Follow Us</h2>
                  <div className="flex flex-wrap items-center gap-[10px]">
                    {settings.socialLinks.map((link) => (
                      <a
                        key={`${link.platform}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={SOCIAL_LABELS[link.platform]}
                        className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-navy-black text-white transition-all duration-300 ease-in-out hover:bg-primary hover:text-white"
                      >
                        <SocialIcon platform={link.platform} className="size-4" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="lg:col-span-2">
              <div className="bg-navy-black p-[20px] md:p-[30px] lg:p-[40px] xl:p-[50px]">
                <h2 className="mb-[20px] text-lg !font-semibold md:mb-[25px] md:text-xl">Send Us a Message</h2>
                <ContactForm />
              </div>
              {content.privacyNote && <p className="mt-[15px] text-sm text-[#a0a0a0]">{content.privacyNote}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="group mb-[20px] flex items-center gap-[15px] last:mb-0 md:mb-[25px]">
      <div
        className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full bg-navy-black text-primary transition-all duration-300 ease-in-out group-hover:bg-primary group-hover:text-white"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <span className="mb-[4px] block font-semibold">{label}</span>
        {children}
      </div>
    </li>
  );
}
