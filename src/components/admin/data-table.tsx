import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Visually hide the header (keeps it for screen readers). */
  srOnlyHeader?: boolean;
};

type Props<T> = {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
};

/** Accessible, horizontally scrollable table with a visually hidden caption. */
export function DataTable<T>({ caption, columns, rows, rowKey, empty }: Props<T>) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface shadow-card">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-paper-raised text-[0.68rem] tracking-[0.12em] text-muted uppercase">
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col" className={cn("px-4 py-3 font-semibold", column.className)}>
                <span className={column.srOnlyHeader ? "sr-only" : undefined}>{column.header}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors hover:bg-paper-raised">
              {columns.map((column) => (
                <td key={column.header} className={cn("px-4 py-3.5 align-middle", column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
