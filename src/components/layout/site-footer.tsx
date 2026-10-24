import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SocialIcon } from "@/components/navigation/social-icons";
import { SiteLogo } from "@/components/site/site-logo";
import { legalNavigation, publicNavigation } from "@/config/navigation";
import { SOCIAL_LABELS } from "@/config/site";
import { getPublicCollections } from "@/features/collections/service";
import { galleryHref } from "@/features/media/gallery-url";
import { getSiteSettings } from "@/features/settings/service";

const LEGAL_LABELS: Record<(typeof legalNavigation)[number]["label"], string> = { Privacy: "Privacy Policy", Terms: "Terms of Service" };

const columnLinkClass = "inline-block text-[#a0a0a0] transition-all duration-300 ease-in-out hover:text-primary";

export async function SiteFooter() {
  const [settings, collections] = await Promise.all([getSiteSettings(), getPublicCollections()]);
  return (
    <footer className="relative z-[1] overflow-hidden pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[120px]">
      <div className="container">
        <div className="grid grid-cols-1 gap-[25px] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <SiteLogo name={settings.siteName} className="mb-[25px] md:mb-[30px] lg:mb-[35px]" />
            <ul className="mb-[20px] md:mb-[25px] lg:mb-[30px]">
              {settings.contactEmail && (
                <li className="mb-[12px] last:mb-0">
                  Email:{" "}
                  <a href={`mailto:${settings.contactEmail}`} className="break-all text-[#a0a0a0] underline transition-all duration-300 ease-in-out hover:text-primary">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              <li className="mb-[12px] last:mb-0">
                Write:{" "}
                <Link href="/contact" className="text-primary transition-all duration-300 ease-in-out hover:underline">
                  Send a message
                </Link>
              </li>
            </ul>
            <h3 className="mb-[15px] text-lg !font-semibold md:text-xl">{settings.location ? "Based in" : "About"}</h3>
            <p className="text-[#a0a0a0]">{settings.location ?? settings.tagline}</p>
          </div>

          <FooterColumn title="Explore" className="xl:pl-[125px]">
            {publicNavigation.map((item) => (
              <li key={item.href} className="mb-[12px] last:mb-0">
                <Link href={item.href} className={columnLinkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Collections" className="xl:pl-[80px]">
            {collections.length > 0 ? (
              collections.slice(0, 5).map((collection) => (
                <li key={collection.id} className="mb-[12px] last:mb-0">
                  <Link href={galleryHref({ collection: collection.slug })} className={columnLinkClass}>
                    {collection.title}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-[#a0a0a0]">Coming soon</li>
            )}
          </FooterColumn>

          <FooterColumn title="Connect" className="xl:pl-[45px]">
            {settings.socialLinks.length > 0 ? (
              settings.socialLinks.map((link) => (
                <li key={`${link.platform}-${link.url}`} className="mb-[12px] last:mb-0">
                  <a href={link.url} target="_blank" rel="noopener noreferrer me" className={`flex items-center gap-[5px] ${columnLinkClass}`}>
                    <SocialIcon platform={link.platform} className="relative -top-px size-4 text-white" />
                    {SOCIAL_LABELS[link.platform]}
                  </a>
                </li>
              ))
            ) : (
              <li className="text-[#a0a0a0]">Links coming soon</li>
            )}
          </FooterColumn>
        </div>

        <div className="pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[120px]" />
        <div className="grid grid-cols-1 items-center gap-[15px] border-t border-white/10 py-[20px] text-center md:grid-cols-2 md:gap-[25px] md:py-[30px] md:text-left lg:py-[40px]">
          <p className="!mb-0 text-[#a0a0a0]">
            © <CopyrightYear /> <span className="text-white">{settings.siteName}</span>. All Rights Reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-[10px] md:justify-end md:gap-[15px] lg:gap-[20px]">
            {legalNavigation.map((item, index) => (
              <li key={item.href} className="flex items-center gap-[10px] md:gap-[15px] lg:gap-[20px]">
                {index > 0 && <span className="h-[14px] w-px bg-[#a0a0a0] opacity-60" aria-hidden="true" />}
                <Link href={item.href} className="text-[#a0a0a0] transition-all duration-300 ease-in-out hover:text-primary">
                  {LEGAL_LABELS[item.label]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 -z-[1] mx-auto -scale-100 text-center opacity-5 invert" aria-hidden="true">
        <Image src="/musfix/shape6.png" alt="" width={1084} height={108} className="inline-block" />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 -z-[1] mx-auto text-center opacity-5 invert" aria-hidden="true">
        <Image src="/musfix/shape6.png" alt="" width={1084} height={108} className="inline-block" />
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <h3 className="mb-[15px] text-lg !font-semibold md:mb-[20px] md:text-xl">{title}</h3>
      <ul>{children}</ul>
    </div>
  );
}

/** Cached so the year is part of the static shell (refreshed at least daily). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
