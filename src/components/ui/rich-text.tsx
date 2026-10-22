import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Block = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

/** Parses the admin-editable light markup: blank-line paragraphs, `## ` headings and `- ` lists. */
export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((line) => line.trimEnd()).filter((line) => line.trim() !== "");
    if (lines.length === 0) continue;
    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      blocks.push({ type: "ul", items: lines.map((line) => line.replace(/^\s*[-*]\s+/, "")) });
    } else if (lines.length === 1 && lines[0]!.startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0]!.slice(3).trim() });
    } else {
      blocks.push({ type: "p", text: lines.join("\n") });
    }
  }
  return blocks;
}

function withLineBreaks(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </Fragment>
  ));
}

/** Renders text as React elements only (never HTML), so stored content cannot inject markup. */
export function RichText({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn("prose-editorial", className)}>
      {parseRichText(source).map((block, index) => {
        if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "ul")
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        return <p key={index}>{withLineBreaks(block.text)}</p>;
      })}
    </div>
  );
}
