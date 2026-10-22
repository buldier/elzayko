import { ImageOff } from "lucide-react";
import { EmptyState } from "@/components/feedback/states";
import { ButtonLink } from "@/components/ui/button";

export default function MediaNotFound() {
  return (
    <div className="page-container">
      <EmptyState
        icon={ImageOff}
        title="This work isn’t available"
        description="It may have been moved, unpublished or never existed."
        action={<ButtonLink href="/gallery">Back to the gallery</ButtonLink>}
      />
    </div>
  );
}
