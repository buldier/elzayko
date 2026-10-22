import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="page-container grid min-h-dvh place-items-center py-24 text-center">
      <div>
        <Link href="/" className="font-display text-3xl italic">
          Elzayko<span className="text-rosewood not-italic">.</span>
        </Link>
        <p className="mt-16 font-display text-[clamp(6rem,4rem+10vw,12rem)] leading-none text-line-strong">404</p>
        <h1 className="mt-6 text-title">This page has drifted out of frame.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">The link may be old, or the work may have been moved or unpublished.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/gallery">Browse the gallery</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Go home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
