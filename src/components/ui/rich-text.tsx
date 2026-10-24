import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Block = { type: "h2"; text: string } | { type: "p"; text: string } | { type: "ul"; items: string[] };

const LIST_ITEM = /^\s*[-*]\s+/;

/**
 * Parses the admin-editable light markup: blank-line paragraphs, `## ` headings and `- ` lists.
 * Headings and list items are recognised line by line, so a heading may sit directly above its list.
 */
export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((line) => line.trimEnd()).filter((line) => line.trim() !== "");
    let paragraph: string[] = [];
    let list: string[] | null = null;
    const flush = () => {
      if (paragraph.length > 0) blocks.push({ type: "p", text: paragraph.join("\n") });
      paragraph = [];
    };
    for (const line of lines) {
      if (LIST_ITEM.test(line)) {
        flush();
        if (!list) {
          list = [];
          blocks.push({ type: "ul", items: list });
        }
        list.push(line.replace(LIST_ITEM, ""));
        continue;
      }
      list = null;
      if (line.startsWith("## ")) {
        flush();
        blocks.push({ type: "h2", text: line.slice(3).trim() });
      } else {
        paragraph.push(line);
      }
    }
    flush();
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
export function RichText({ source, className, variant = "editorial" }: { source: string; className?: string; variant?: "editorial" | "musfix" }) {
  return (
    <div className={cn(variant === "musfix" ? "prose-musfix" : "prose-editorial", className)}>
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
