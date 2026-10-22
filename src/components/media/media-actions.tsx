"use client";

import { Check, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/** Rendered only for downloadable images; the endpoint re-checks eligibility server-side. */
export function DownloadButton({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} download className={cn(buttonVariants({ variant: "primary" }))} aria-label={`Download “${title}”`}>
      <Download aria-hidden="true" />
      Download image
    </a>
  );
}

/** Uses the Web Share API where available, otherwise copies the canonical URL. */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed or unsupported target: fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button type="button" onClick={share} className={cn(buttonVariants({ variant: "secondary" }))}>
      {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
