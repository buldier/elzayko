import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  id?: string;
  /** Optional section number, e.g. "01". */
  index?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  tone?: "default" | "inverse";
  className?: string;
};

export function SectionHeading({ id, index, eyebrow, title, description, action, as: Heading = "h2", tone = "default", className }: Props) {
  const inverse = tone === "inverse";
  return (
    <div className={cn("grid gap-6 border-t pt-8 md:grid-cols-12 md:items-end", inverse ? "border-paper/15" : "border-line", className)}>
      <div className="md:col-span-8">
        {eyebrow && (
          <p className={cn("eyebrow mb-5", inverse && "text-paper/60")}>
            {index && <span className={cn("mr-3 tabular-nums", inverse ? "text-paper" : "text-ink")}>{index}</span>}
            {eyebrow}
          </p>
        )}
        <Heading id={id} className={Heading === "h1" ? "text-headline" : "text-title md:text-[3rem] md:leading-[1.04]"}>
          {title}
        </Heading>
        {description && <div className={cn("mt-4 max-w-xl", inverse ? "text-paper/70" : "text-ink-soft")}>{description}</div>}
      </div>
      {action && <div className="md:col-span-4 md:justify-self-end">{action}</div>}
    </div>
  );
}
