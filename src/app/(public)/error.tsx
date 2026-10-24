"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ErrorPanel } from "@/components/site/error-panel";

export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <div role="alert">
      <ErrorPanel
        artwork={false}
        title="Something went wrong"
        description={
          <>
            This page couldn&rsquo;t be loaded. Please try again in a moment.
            {digest && <span className="mt-2 block text-xs">Reference: {digest}</span>}
          </>
        }
        actions={
          <>
            <button type="button" onClick={() => retry()} className="primary-btn">
              Try again
            </button>
            <Link href="/" className="primary-btn with-border">
              Go home
            </Link>
          </>
        }
      />
    </div>
  );
}
