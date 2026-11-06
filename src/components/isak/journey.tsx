import { Fade } from "@/components/isak/motion/reveal";
import { TimelineTrack } from "@/components/isak/motion/widgets";

type Highlight = { year: string; title: string; detail?: string | null };

/** Dated milestones on a vertical line that fills as it scrolls past; each entry lights up in turn. */
export function Journey({ highlights }: { highlights: Highlight[] }) {
  return (
    <TimelineTrack className="mt-6">
      <span
        aria-hidden="true"
        className="absolute top-0 bottom-0 left-[6px] w-[2px] bg-white/[0.06] sm:left-[126px]"
      >
        <span data-progress-line className="absolute inset-x-0 top-0 h-full bg-primary" />
      </span>
      <ol>
        {highlights.map((highlight, i) => (
          <Fade
            as="li"
            key={`${highlight.year}-${highlight.title}`}
            className="group relative flex flex-wrap gap-x-3 gap-y-4 pl-8 not-last:pb-20 sm:flex-nowrap sm:pl-0 [&:nth-child(2)]:pt-10"
          >
            <span className="font-mono text-sm text-white/55 sm:min-w-[120px] sm:pt-1">
              {highlight.year}
            </span>
            <span
              aria-hidden="true"
              className="absolute top-1.5 left-0 size-[14px] rounded-full bg-primary shadow-[0_0_0_4px_rgb(0_222_81/0.12)] sm:static sm:mt-1.5 sm:mr-12 sm:flex-none"
            />
            <span className="block w-full sm:w-auto">
              <span className="mb-5 grid size-9 place-items-center rounded-full bg-white/[0.06] font-display text-lg text-white/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mb-2 block text-lg font-medium text-white/60 transition-colors duration-300 group-data-[active]:text-white/90">
                {highlight.title}
              </span>
              {highlight.detail && (
                <span className="block max-w-[420px] text-sm text-white/50">
                  {highlight.detail}
                </span>
              )}
            </span>
          </Fade>
        ))}
      </ol>
    </TimelineTrack>
  );
}
