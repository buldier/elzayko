"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/states";
import { Button, ButtonLink } from "@/components/ui/button";

export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <div className="page-container py-16">
      <ErrorState
        title="Something went wrong"
        description={
          <>
            This page couldn&rsquo;t be loaded. Please try again in a moment.
            {digest && <span className="mt-2 block text-xs text-faint">Reference: {digest}</span>}
          </>
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => retry()}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Go home
            </ButtonLink>
          </div>
        }
      />
    </div>
  );
}
