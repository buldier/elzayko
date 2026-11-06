import { Suspense } from "react";
import { Backdrop, IsakFooter } from "@/components/isak/chrome";
import { Preloader, SmoothScroll } from "@/components/isak/motion/page-motion";
import { DateClock } from "@/components/isak/motion/widgets";
import { ProfileCard } from "@/components/isak/profile-card";
import { MobileBar, SideDock } from "@/components/isak/side-dock";
import { getFeaturedMedia, getLatestMedia } from "@/features/media/queries";
import { getPortrait } from "@/features/pages/portrait";
import { getPage } from "@/features/pages/service";
import { getSiteSettings } from "@/features/settings/service";

/**
 * Public shell: profile card fixed on the left, scrolling content column,
 * icon dock and clock on the right, ambient backdrop behind everything.
 */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [settings, about, featured, latest] = await Promise.all([
    getSiteSettings(),
    getPage("about"),
    getFeaturedMedia(8),
    getLatestMedia(24),
  ]);
  const portrait =
    (await getPortrait(about.content.portraitMediaId)) ??
    (await getPortrait(settings.heroMediaId)) ??
    firstPreview(featured);
  const film = [...featured, ...latest].find(
    (item) => item.mediaType === "VIDEO" && item.sourceType === "UPLOAD",
  );

  return (
    <div className="theme-isak relative isolate flex min-h-dvh flex-1 flex-col">
      <Preloader />
      <Suspense fallback={null}>
        <SmoothScroll />
      </Suspense>
      <Backdrop
        videoSrc={film ? `/api/media/${film.id}/stream` : null}
        poster={film?.preview?.src ?? film?.image?.src ?? null}
      />

      <div className="fixed top-6 right-5 z-40 hidden min-[1600px]:right-12 lg:block">
        <DateClock />
      </div>
      <Suspense fallback={null}>
        <SideDock />
      </Suspense>
      <Suspense fallback={null}>
        <MobileBar siteName={settings.siteName} />
      </Suspense>

      <ProfileCard
        siteName={settings.siteName}
        intro={settings.heroIntro || about.content.intro}
        portrait={portrait}
        socialLinks={settings.socialLinks}
      />

      <div className="flex-1 min-[1440px]:ml-[496px] min-[1600px]:mr-[104px] min-[1600px]:ml-[528px] lg:mr-[72px] lg:ml-[416px]">
        <div className="mx-auto w-full max-w-[760px] px-5 sm:px-8">
          <main id="main">{children}</main>
          <IsakFooter
            siteName={settings.siteName}
            quote={about.content.philosophy || null}
            contactEmail={settings.contactEmail}
          />
        </div>
      </div>
    </div>
  );
}

function firstPreview(items: Awaited<ReturnType<typeof getFeaturedMedia>>) {
  const item = items.find((entry) => entry.preview ?? entry.image);
  const image = item?.preview ?? item?.image;
  return item && image ? { ...image, alt: item.altText } : null;
}
