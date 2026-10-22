import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminUserMenu } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/admin/toaster";

/** Every admin view depends on the session, so navigations here may block on the server. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s · Studio" },
  robots: { index: false, follow: false },
};

/**
 * Admin chrome. Every page beneath re-validates the session with requireAdmin()
 * inside the loading.tsx Suspense boundary; nothing here is cached publicly.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Toaster>
      <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="bg-ink text-paper lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
          <div className="flex h-16 items-center justify-between px-5 lg:h-20">
            <Link href="/admin" className="font-display text-[1.6rem] leading-none italic">
              Elzayko<span className="text-sand not-italic">.</span>
              <span className="mt-1 block font-sans text-[0.62rem] font-semibold tracking-[0.24em] text-paper/45 not-italic uppercase">
                Studio
              </span>
            </Link>
          </div>
          <div className="px-3 pb-3 lg:flex-1 lg:overflow-y-auto lg:pb-0">
            <Suspense fallback={null}>
              <AdminSidebar />
            </Suspense>
          </div>
          <div className="hidden border-t border-paper/10 p-3 lg:block">
            <Suspense fallback={<div className="h-14" />}>
              <AdminUserMenu />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="flex items-center justify-end gap-3 border-b border-line bg-surface px-4 py-2 lg:hidden">
            <Suspense fallback={null}>
              <AdminUserMenu compact />
            </Suspense>
          </div>
          <main id="main" className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </Toaster>
  );
}
