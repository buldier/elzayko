import { RiArrowRightUpLine, RiSendPlaneLine } from "@remixicon/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SectionTag } from "@/components/isak/chrome";
import { BlurText, Fade } from "@/components/isak/motion/reveal";

type Props = {
  title: string;
  text: ReactNode;
  action: { href: string; label: string };
};

/** Closing call to action before the footer. */
export function CtaBand({ title, text, action }: Props) {
  return (
    <section className="border-t border-white/[0.06] py-16 md:py-24">
      <SectionTag icon={<RiSendPlaneLine className="size-4" />}>Get in touch</SectionTag>
      <BlurText className="!mb-5 max-w-[600px] text-[clamp(1.9rem,3.6vw,2.6rem)]">{title}</BlurText>
      <Fade as="p" className="max-w-[560px] text-white/55">
        {text}
      </Fade>
      <Fade className="mt-8">
        <Link href={action.href} className="isak-pill">
          <span className="isak-pill-icon">
            <RiArrowRightUpLine className="size-4" aria-hidden="true" />
          </span>
          {action.label}
        </Link>
      </Fade>
    </section>
  );
}
