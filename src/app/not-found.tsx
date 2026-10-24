import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ErrorPanel } from "@/components/site/error-panel";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="theme-musfix flex min-h-dvh flex-1 flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <ErrorPanel
          title="OOPS... Page Not Found"
          description="The page you are looking for might have been moved, unpublished or never existed."
          actions={
            <>
              <Link href="/" className="primary-btn">
                Back To Home
              </Link>
              <Link href="/gallery" className="primary-btn with-border">
                Browse the gallery
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter />
    </div>
  );
}
