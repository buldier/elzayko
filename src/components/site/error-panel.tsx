import type { ReactNode } from "react";

type Props = {
  title: string;
  description: ReactNode;
  actions: ReactNode;
  /** Show the oversized outlined "404". */
  artwork?: boolean;
};

/** Error / not-found block in the public theme. Pure markup, usable from Client Components. */
export function ErrorPanel({ title, description, actions, artwork = true }: Props) {
  return (
    <div className="py-24 text-center md:py-32">
      {artwork && (
        <p
          aria-hidden="true"
          className="!mb-6 text-[clamp(6rem,22vw,12rem)] leading-none font-light tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.35)]"
        >
          404
        </p>
      )}
      <h1 className="!mb-4 text-[clamp(1.75rem,4vw,2.75rem)]">{title}</h1>
      <p className="mx-auto max-w-[520px] text-white/55">{description}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
