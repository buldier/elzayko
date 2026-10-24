import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  action?: { href: string; label: string };
};

/** Empty or not-found message for public pages, in the template's centred panel style. */
export function SiteEmptyState({ title, description, action }: Props) {
  return (
    <div className="container py-[60px] text-center md:py-[80px]">
      <div className="mx-auto bg-navy-black p-[30px] md:max-w-[650px] md:p-[50px]">
        <h2 className="mb-[15px] text-2xl !font-semibold md:text-3xl">{title}</h2>
        {description && <p className="mx-auto text-[#a0a0a0]">{description}</p>}
        {action && (
          <Link href={action.href} className="primary-btn mt-[10px] md:mt-[15px]">
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
