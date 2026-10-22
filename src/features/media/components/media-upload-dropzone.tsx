"use client";

import { FileUp, Loader2, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { InlineAlert } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";
import { MEDIA_LIMITS, type UploadKind } from "@/config/media";
import { cn } from "@/lib/utils/cn";
import { formatBytes } from "@/lib/utils/format";

export type UploadedFile = {
  key: string;
  kind: UploadKind;
  file: File;
  previewUrl: string;
  videoMeta?: { width?: number; height?: number; duration?: number };
};

type Props = {
  accept: UploadKind[];
  label: string;
  description?: string;
  onUploaded: (upload: UploadedFile) => void;
  compact?: boolean;
};

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number; fileName: string }
  | { phase: "error"; message: string };

function kindFor(file: File, accept: UploadKind[]): UploadKind | null {
  for (const kind of accept) {
    if ((MEDIA_LIMITS[kind].mimeTypes as readonly string[]).includes(file.type)) return kind;
  }
  return null;
}

function readVideoMeta(url: string): Promise<UploadedFile["videoMeta"]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      resolve({
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        duration: Number.isFinite(video.duration) ? video.duration : undefined,
      });
    video.onerror = () => resolve(undefined);
    video.src = url;
  });
}

/**
 * Two-step direct upload: ask the server for an upload target (authorization, limits, key),
 * then PUT the file straight to storage with progress. Content is verified server-side on save.
 */
export function MediaUploadDropzone({ accept, label, description, onUploaded, compact }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [state, setState] = useState<UploadState>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);

  const mimeList = accept.flatMap((kind) => [...MEDIA_LIMITS[kind].mimeTypes]);

  async function upload(file: File) {
    const kind = kindFor(file, accept);
    if (!kind) {
      setState({ phase: "error", message: `${file.name}: unsupported format. Allowed: ${mimeList.map((m) => m.split("/")[1]).join(", ")}.` });
      return;
    }
    if (file.size > MEDIA_LIMITS[kind].maxBytes) {
      setState({ phase: "error", message: `${file.name} is ${formatBytes(file.size)}; the limit is ${formatBytes(MEDIA_LIMITS[kind].maxBytes)}.` });
      return;
    }

    setState({ phase: "uploading", progress: 0, fileName: file.name });
    try {
      const ticketResponse = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, filename: file.name, contentType: file.type, size: file.size }),
      });
      const ticket = await ticketResponse.json();
      if (!ticketResponse.ok) throw new Error(ticket.error ?? "Upload could not be started");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open(ticket.upload.method, ticket.upload.url);
        for (const [header, value] of Object.entries(ticket.upload.headers as Record<string, string>)) {
          xhr.setRequestHeader(header, value);
        }
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setState({ phase: "uploading", progress: Math.round((event.loaded / event.total) * 100), fileName: file.name });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) return resolve();
          let message = `Upload failed (${xhr.status})`;
          try {
            message = JSON.parse(xhr.responseText).error ?? message;
          } catch {}
          reject(new Error(message));
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload cancelled"));
        xhr.send(file);
      });

      const previewUrl = URL.createObjectURL(file);
      const videoMeta = kind === "video" ? await readVideoMeta(previewUrl) : undefined;
      setState({ phase: "idle" });
      onUploaded({ key: ticket.key, kind, file, previewUrl, videoMeta });
    } catch (error) {
      setState({ phase: "error", message: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      xhrRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const uploading = state.phase === "uploading";

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          if (file && !uploading) void upload(file);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-line-strong bg-surface px-6 text-center transition-colors hover:border-ink",
          compact ? "py-6" : "py-14",
          dragging && "border-rosewood bg-rosewood-tint/40",
          uploading && "pointer-events-none opacity-80",
        )}
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-paper-sunk text-ink-soft">
          {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <FileUp className="size-5" strokeWidth={1.5} aria-hidden="true" />}
        </span>
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted">{description ?? "Drag a file here, or click to browse."}</span>
        <span className="text-xs text-faint">
          {accept
            .map((kind) => `${MEDIA_LIMITS[kind].mimeTypes.map((mime) => mime.split("/")[1]!.replace("quicktime", "mov").toUpperCase()).join(", ")} up to ${formatBytes(MEDIA_LIMITS[kind].maxBytes)}`)
            .join(" · ")}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={mimeList.join(",")}
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>

      {uploading && (
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunk" role="progressbar" aria-valuenow={state.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${state.fileName}`}>
            <div className="h-full bg-ink transition-[width] duration-200" style={{ width: `${state.progress}%` }} />
          </div>
          <span className="w-12 text-right text-xs text-muted tabular-nums">{state.progress}%</span>
          <Button variant="ghost" size="icon-sm" onClick={() => xhrRef.current?.abort()} aria-label="Cancel upload">
            <X />
          </Button>
        </div>
      )}
      {state.phase === "error" && <InlineAlert tone="error">{state.message}</InlineAlert>}
    </div>
  );
}
