import { ArrowUpRight } from "lucide-react";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { legalNavigation, publicNavigation } from "@/config/navigation";
import { SOCIAL_LABELS } from "@/config/site";
import { getSiteSettings } from "@/features/settings/service";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="page-container border-b border-paper/10 py-20 md:py-28">
        <p className="eyebrow text-paper/55">Commissions &amp; collaborations</p>
        <Link href="/contact" className="group mt-6 inline-flex items-end gap-4">
          <span className="font-display text-[clamp(2.75rem,1.5rem+6vw,7rem)] leading-[0.95] tracking-[-0.02em]">
            Let&rsquo;s make something <em className="text-sand">quiet</em>.
          </span>
          <span className="mb-2 inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-paper/30 transition-colors duration-(--duration-base) group-hover:bg-paper group-hover:text-ink md:mb-4 md:size-16">
            <ArrowUpRight className="size-5 md:size-6" aria-hidden="true" />
          </span>
        </Link>
      </div>

      <div className="page-container grid gap-12 py-14 sm:grid-cols-2 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="font-display text-3xl italic">
            {settings.siteName}
            <span className="text-sand not-italic">.</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/60">{settings.tagline}</p>
          {settings.location && <p className="mt-1 text-sm text-paper/40">{settings.location}</p>}
        </div>

        <FooterColumn title="Explore" className="md:col-span-2">
          {publicNavigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="link-underline text-paper/75 hover:text-paper">
                {item.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Elsewhere" className="md:col-span-2">
          {settings.socialLinks.length > 0 ? (
            settings.socialLinks.map((link) => (
              <li key={`${link.platform}-${link.url}`}>
                <a href={link.url} target="_blank" rel="noopener noreferrer me" className="group inline-flex items-center gap-1 text-paper/75 hover:text-paper">
                  <span className="link-underline">{SOCIAL_LABELS[link.platform]}</span>
                  <ArrowUpRight className="size-3.5 opacity-60" aria-hidden="true" />
                </a>
              </li>
            ))
          ) : (
            <li className="text-paper/40">Links coming soon</li>
          )}
        </FooterColumn>

        <FooterColumn title="Contact" className="md:col-span-3">
          <li>
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="link-underline break-all text-paper/75 hover:text-paper">
                {settings.contactEmail}
              </a>
            ) : (
              <Link href="/contact" className="link-underline text-paper/75 hover:text-paper">
                Send a message
              </Link>
            )}
          </li>
        </FooterColumn>
      </div>

      <div className="page-container flex flex-col gap-3 border-t border-paper/10 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © <CopyrightYear /> {settings.siteName}. All rights reserved.
        </p>
        <ul className="flex gap-6">
          {legalNavigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-paper">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="mb-4 text-[0.68rem] font-semibold tracking-[0.18em] text-paper/45 uppercase">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

/** Cached so the year is part of the static shell (refreshed at least daily). */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
