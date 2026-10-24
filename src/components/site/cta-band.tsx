import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  text: ReactNode;
  action: { href: string; label: string };
};

/** Centered call to action over the template's soundwave line, used before the footer. */
export function CtaBand({ title, text, action }: Props) {
  return (
    <section className="relative z-[1] py-[60px] text-center md:py-[80px] lg:py-[100px] xl:py-[120px]">
      <div className="container">
        <h2 className="mb-[15px] text-3xl leading-[1.1] !font-semibold md:mb-[20px] md:text-5xl lg:mb-[25px] lg:text-6xl xl:text-[64px]">{title}</h2>
        <p className="mx-auto md:text-base lg:max-w-[880px] lg:text-lg">{text}</p>
        <Link href={action.href} className="primary-btn mt-[10px] md:mt-[15px] lg:mt-[20px]">
          {action.label}
        </Link>
      </div>
      <div className="pointer-events-none absolute top-1/2 right-0 left-0 -z-[1] mx-auto -translate-y-1/2 text-center" aria-hidden="true">
        <Image src="/musfix/shape3.png" alt="" width={1920} height={370} className="w-full" />
      </div>
    </section>
  );
}
