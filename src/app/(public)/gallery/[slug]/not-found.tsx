import Link from "next/link";
import { ErrorPanel } from "@/components/site/error-panel";

export default function MediaNotFound() {
  return (
    <ErrorPanel
      artwork={false}
      title="This work isn’t available"
      description="It may have been moved, unpublished or never existed."
      actions={
        <Link href="/gallery" className="primary-btn">
          Back to the gallery
        </Link>
      }
    />
  );
}
