import { RiMailLine } from "@remixicon/react";
import { Suspense } from "react";
import { getPublicCollections } from "@/features/collections/service";
import { getSiteSettings } from "@/features/settings/service";
import { NavLinks, NavLinksFallback } from "@/components/navigation/nav-links";
import { SitePanel } from "@/components/navigation/site-panel";
import { SocialIcons } from "@/components/navigation/social-icons";
import { SiteLogo } from "@/components/site/site-logo";
import { HeaderShell, HeaderShellFallback } from "./header-shell";

const desktopListClass = "flex items-center gap-[25px] xl:gap-[35px]";

export async function SiteHeader() {
  const [settings, allCollections] = await Promise.all([getSiteSettings(), getPublicCollections()]);
  const collections = allCollections.map(({ title, slug }) => ({ title, slug }));
  const inner = (
    <div className="container lg:!max-w-full xl:!max-w-[1650px]">
      <div className="relative flex items-center justify-between lg:justify-start">
        <SiteLogo name={settings.siteName} />
        <nav aria-label="Primary" className="hidden lg:ml-auto lg:block">
          <Suspense fallback={<NavLinksFallback className={desktopListClass} collections={collections} />}>
            <NavLinks className={desktopListClass} collections={collections} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-[20px] lg:ml-[25px] xl:ml-[35px] xl:gap-[25px]">
          <SocialIcons links={settings.socialLinks} className="hidden gap-[8px] text-lg lg:flex xl:gap-[10px]" />
          {settings.contactEmail && (
            <a
              href={`mailto:${settings.contactEmail}`}
              aria-label={`Email ${settings.contactEmail}`}
              className="group/mail hidden items-center gap-[10px] lg:inline-flex"
            >
              <span className="flex size-[42px] flex-none items-center justify-center rounded-full bg-primary text-white transition-all duration-300 ease-in-out group-hover/mail:bg-white group-hover/mail:text-primary">
                <RiMailLine className="size-5" aria-hidden="true" />
              </span>
              <span className="hidden leading-tight xl:block">
                <span className="block text-sm text-[#a0a0a0]">Email Us</span>
                <span className="block font-medium text-white transition-all duration-300 ease-in-out group-hover/mail:text-primary">{settings.contactEmail}</span>
              </span>
            </a>
          )}
          {/* Phones and tablets: burger opening the panel with the menu and contact details. */}
          <Suspense fallback={null}>
            <SitePanel
              collections={collections}
              siteName={settings.siteName}
              description={settings.description}
              contactEmail={settings.contactEmail}
              location={settings.location}
              socialLinks={settings.socialLinks}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
  return (
    <Suspense fallback={<HeaderShellFallback>{inner}</HeaderShellFallback>}>
      <HeaderShell>{inner}</HeaderShell>
    </Suspense>
  );
}
