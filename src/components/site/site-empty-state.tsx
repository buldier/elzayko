import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string };
};

/** Empty or not-found message for public pages: a soft rounded panel. */
export function SiteEmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-[24px] border border-white/5 bg-[#161616] px-6 py-14 text-center md:px-12">
      <h2 className="!mb-3 text-2xl md:text-3xl">{title}</h2>
      {description && <p className="mx-auto max-w-[460px] text-white/55">{description}</p>}
      {action && (
        <Link href={action.href} className="primary-btn mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}
