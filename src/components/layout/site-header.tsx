import { Suspense } from "react";
import { getSiteSettings } from "@/features/settings/service";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import { NavLinks, NavLinksFallback } from "@/components/navigation/nav-links";
import { HeaderShell, HeaderShellFallback } from "./header-shell";
import { Wordmark } from "./wordmark";

const desktopListClass = "flex items-center gap-10 text-[0.82rem] font-medium tracking-[0.14em] uppercase";

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const inner = (
    <div className="page-container flex h-(--header-height) items-center justify-between">
      <Wordmark name={settings.siteName} className="text-current" />
      <nav aria-label="Primary" className="hidden md:block">
        <Suspense fallback={<NavLinksFallback className={desktopListClass} />}>
          <NavLinks className={desktopListClass} />
        </Suspense>
      </nav>
      <Suspense fallback={null}>
        <MobileNavigation siteName={settings.siteName} />
      </Suspense>
    </div>
  );
  return (
    <Suspense fallback={<HeaderShellFallback>{inner}</HeaderShellFallback>}>
      <HeaderShell>{inner}</HeaderShell>
    </Suspense>
  );
}
