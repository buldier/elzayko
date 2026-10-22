"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import type { MediaImage as MediaImageData } from "@/features/media/types";
import { MediaImage } from "./media-image";

type Props =
  | { kind: "upload"; src: string; mimeType: string | null; poster: MediaImageData | null; title: string; width: number | null; height: number | null }
  | { kind: "embed"; embedUrl: string; poster: MediaImageData | null; title: string; providerLabel: string };

/**
 * Video player. Uploaded files use the native <video> element (streamed via an authorized route).
 * Provider embeds load only after the visitor presses play (no third-party requests before consent).
 */
export function MediaPlayer(props: Props) {
  const [activated, setActivated] = useState(false);

  if (props.kind === "upload") {
    const ratio = props.width && props.height ? `${props.width} / ${props.height}` : "16 / 9";
    return (
      <video
        controls
        preload="metadata"
        playsInline
        poster={props.poster?.src}
        className="max-h-[80vh] w-full bg-ink"
        style={{ aspectRatio: ratio }}
        aria-label={props.title}
      >
        <source src={props.src} type={props.mimeType ?? undefined} />
        Your browser cannot play this video.
      </video>
    );
  }

  if (activated) {
    return (
      <div className="relative aspect-video w-full bg-ink">
        <iframe
          src={`${props.embedUrl}&autoplay=1`}
          title={props.title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-ink text-left"
      aria-label={`Play “${props.title}” (loads ${props.providerLabel})`}
    >
      {props.poster && (
        <MediaImage image={props.poster} alt="" sizes="(min-width: 1024px) 70vw, 100vw" mode="fill" priority className="opacity-85 transition-opacity duration-(--duration-base) group-hover:opacity-100" />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="inline-flex size-20 items-center justify-center rounded-full bg-paper/90 text-ink shadow-lg transition-transform duration-(--duration-base) ease-out-soft group-hover:scale-105">
          <Play className="ml-1 size-7 fill-current" aria-hidden="true" />
        </span>
      </span>
      <span className="absolute bottom-3 left-3 rounded-xs bg-ink/70 px-2 py-1 text-xs text-paper/90">
        Plays from {props.providerLabel} · privacy-enhanced mode
      </span>
    </button>
  );
}
