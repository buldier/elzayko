import { Badge } from "@/components/ui/badge";
import type { MediaStatus } from "@/features/media/types";

const TONES = { PUBLISHED: "success", DRAFT: "warning", ARCHIVED: "outline" } as const;
const LABELS = { PUBLISHED: "Published", DRAFT: "Draft", ARCHIVED: "Archived" } as const;

export function PublishStatusBadge({ status }: { status: MediaStatus }) {
  return <Badge tone={TONES[status]}>{LABELS[status]}</Badge>;
}
