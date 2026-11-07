import { RiArrowRightUpLine, RiGalleryLine } from "@remixicon/react";
import Link from "next/link";
import { TypedWords } from "@/components/isak/motion/widgets";
import { MediaImage } from "@/components/media/media-image";
import { SocialIcon } from "@/components/navigation/social-icons";
import { SOCIAL_LABELS, siteConfig } from "@/config/site";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import type { SocialLink } from "@/features/settings/schemas";

type Props = {
  siteName: string;
  intro: string;
  portrait: (MediaImageData & { alt: string }) | null;
  socialLinks: SocialLink[];
};

/**
 * The profile card. Fixed to the left edge on desktop (it steps aside while the
 * work highlights are pinned — see `html[data-work]` in globals.css); in normal
 * flow at the top of the page on smaller screens.
 */
export function ProfileCard({ siteName, intro, portrait, socialLinks }: Props) {
  const initial = siteName.trim().charAt(0).toUpperCase() || "E";
  return (
    <aside
      aria-label={`About ${siteName}`}
      data-profile-card
      className="relative z-30 flex px-3 pt-[76px] transition-all duration-300 ease-out min-[1440px]:max-w-[480px] min-[1600px]:left-12 lg:fixed lg:top-8 lg:bottom-8 lg:left-4 lg:w-full lg:max-w-[400px] lg:items-center lg:p-0"
    >
      <div className="relative flex w-full rounded-[24px] bg-graphite p-1.5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] lg:h-full lg:max-h-[calc(100vh-48px)]">
        <div className="relative isolate min-h-[560px] w-full overflow-hidden rounded-[18px] bg-void lg:min-h-0">
          {portrait && (
            <MediaImage
              image={portrait}
              alt={portrait.alt}
              sizes="(min-width: 1440px) 480px, (min-width: 1024px) 400px, 100vw"
              mode="fill"
              priority
              className="-z-10 grayscale"
            />
          )}
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/10 to-black/90"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 rounded-[18px] ring-1 ring-white/5 ring-inset"
            aria-hidden="true"
          />

          <Link
            href="/"
            aria-label={`${siteName} — home`}
            className="absolute top-8 left-8 grid size-10 place-items-center rounded-lg bg-white/90 font-display text-2xl leading-none font-semibold text-black xl:top-10 xl:left-10"
          >
            {initial}
          </Link>

          {socialLinks.length > 0 && (
            <ul className="absolute top-8 right-8 flex flex-col gap-2 xl:top-10 xl:right-10">
              {socialLinks.slice(0, 4).map((link) => (
                <li key={`${link.platform}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={SOCIAL_LABELS[link.platform]}
                    className="grid size-10 place-items-center rounded-lg bg-black/40 text-white backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-black"
                  >
                    <SocialIcon platform={link.platform} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="absolute right-8 bottom-8 left-8 xl:right-10 xl:bottom-10 xl:left-10">
            <p className="!mb-5 flex items-center gap-2 text-sm font-medium text-white/75">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-signal-yellow opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-signal-yellow" />
              </span>
              {siteConfig.availability}
            </p>
            <p className="!mb-4 text-[clamp(1.75rem,2.4vw,2.25rem)] leading-tight font-medium tracking-[-0.03em] text-white/90">
              Hey, I&rsquo;m <TypedWords words={[siteName, ...siteConfig.heroRoles]} />
            </p>
            {intro && (
              <p className="line-clamp-3 max-w-[340px] text-[15px] leading-relaxed text-white/60">
                {intro}
              </p>
            )}
            <div className="my-6 h-px bg-white/10 xl:my-8" aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/contact" className="isak-pill">
                <span className="isak-pill-icon">
                  <RiArrowRightUpLine className="size-4" aria-hidden="true" />
                </span>
                Let&rsquo;s talk
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-[15px] text-white/70 transition-colors hover:text-primary"
              >
                <RiGalleryLine className="size-4" aria-hidden="true" />
                View gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
