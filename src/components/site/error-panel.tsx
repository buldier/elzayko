import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: ReactNode;
  actions: ReactNode;
  /** Show the template's broken-record "404" artwork. */
  artwork?: boolean;
};

/** Full-width error/not-found block with the template's orange glow. Pure markup, usable from Client Components. */
export function ErrorPanel({ title, description, actions, artwork = true }: Props) {
  return (
    <div className="relative z-[1] overflow-hidden bg-navy-black pt-[100px] pb-[60px] text-white md:pt-[125px] md:pb-[80px] lg:pt-[125px] lg:pb-[100px] xl:pt-[130px] xl:pb-[120px]">
      <div className="container">
        <div className="text-center">
          {artwork && <Image src="/musfix/error.png" alt="404" width={1096} height={445} priority className="mx-auto h-auto w-full max-w-[1096px]" />}
          <h1 className="mt-[30px] mb-[15px] text-2xl !font-semibold !text-white md:mt-[40px] md:mb-[25px] md:text-4xl lg:mb-[30px] xl:text-5xl">{title}</h1>
          <p className="mx-auto text-[#a0a0a0] md:max-w-[650px]">{description}</p>
          <div className="mt-[10px] flex flex-wrap justify-center gap-[15px] md:mt-[15px] lg:mt-[20px]">{actions}</div>
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 right-0 left-0 -z-[2] mx-auto text-center" aria-hidden="true">
        <Image src="/musfix/shape13.png" alt="" width={1920} height={611} className="w-full" />
      </div>
    </div>
  );
}
