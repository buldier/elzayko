"use client";

import { RiCheckLine, RiDownload2Line, RiShareLine } from "@remixicon/react";
import { useState } from "react";

const outlineClass = "primary-btn with-border !border-white hover:!bg-white hover:!text-primary";

/** Rendered only for downloadable images; the endpoint re-checks eligibility server-side. */
export function DownloadButton({ href, title }: { href: string; title: string }) {
  return (
    <a href={href} download className="primary-btn" aria-label={`Download “${title}”`}>
      <RiDownload2Line className="size-4" aria-hidden="true" />
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
    <button type="button" onClick={share} className={outlineClass}>
      {copied ? <RiCheckLine className="size-4" aria-hidden="true" /> : <RiShareLine className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
