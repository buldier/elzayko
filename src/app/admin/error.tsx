"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/states";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <ErrorState
      className="rounded-md border border-line bg-surface shadow-card"
      title="This view failed to load"
      description={`Your data is safe. Try again, or check the server logs${digest ? ` for reference ${digest}` : ""}.`}
      action={<Button onClick={() => retry()}>Try again</Button>}
    />
  );
}
