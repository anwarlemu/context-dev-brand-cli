import * as React from "react";
import { AlertCircle, Check, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

// The site's comparison table: inside a white card in the soft blue ring, rows divided by a hairline, column heads at
// h5 with a small caption under each, and the brand's own column tinted blue at 4 percent with its head in blue. A
// yes is a check (blue in the brand's column), a no is a quiet dash, a partial answer says what it costs. Rows can be
// grouped under category bands.

export type ComparisonCellValue = boolean | string | { partial: string };
export type ComparisonColumn = { key: string; header: string; caption?: string; highlight?: boolean };
export type ComparisonRow = { feature: string; category?: string; [key: string]: ComparisonCellValue | undefined };

function ComparisonCell({ value, highlight }: { value: ComparisonCellValue | undefined; highlight?: boolean }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden="true" className={cn("size-5", highlight ? "text-fg-brand" : "text-fg-subtle")} strokeWidth={1.75} />
        <span className="sr-only">Yes</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus aria-hidden="true" className="size-4 text-fg-faint" strokeWidth={1.75} />
        <span className="sr-only">No</span>
      </>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-warning" strokeWidth={1.75} />
        <span className="sr-only">Partial: </span>
        {value.partial}
      </span>
    );
  }
  return <>{value ?? ""}</>;
}

function ComparisonTable({
  columns,
  rows,
  caption,
  firstColumnHeader,
  footnote,
  className,
}: {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  /** Read by screen readers; the visible title belongs to the section around the table. */
  caption?: string;
  firstColumnHeader?: string;
  /** A line under the card, such as when prices were last checked. */
  footnote?: React.ReactNode;
  className?: string;
}) {
  const categories = [...new Set(rows.flatMap((row) => (row.category ? [row.category] : [])))];
  const groups = categories.length > 0 ? categories.map((category) => ({ category, rows: rows.filter((row) => row.category === category) })) : [{ category: undefined, rows }];

  return (
    <div data-slot="comparison-table" className={cn("flex flex-col gap-3", className)}>
      <div className="rounded-card bg-ring-tint p-2">
        <div tabIndex={0} role="region" aria-label={caption} className="overflow-x-auto rounded-card bg-surface ring-1 ring-hairline outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
          <table className="w-full min-w-160 border-collapse text-left text-body text-fg">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr className="align-bottom">
                {firstColumnHeader ? (
                  <th scope="col" className="w-[28%] px-5 py-5 text-body-sm font-normal text-fg-subtle md:px-8">
                    {firstColumnHeader}
                  </th>
                ) : (
                  <td className="w-[28%] px-5 py-5 md:px-8" />
                )}
                {columns.map((col) => (
                  <th key={col.key} scope="col" className={cn("px-5 py-5 font-normal md:px-8", col.highlight && "bg-brand/4")}>
                    <span className={cn("block text-h5 leading-snug", col.highlight ? "text-fg-brand" : "text-fg")}>{col.header}</span>
                    {col.caption && <span className="block text-body-sm text-fg-subtle">{col.caption}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.category ?? "rows"}>
                {group.category && (
                  <tr className="border-t border-hairline">
                    <th scope="rowgroup" colSpan={columns.length + 1} className="bg-subtle px-5 py-2.5 text-body-sm font-normal text-fg-muted md:px-8">
                      {group.category}
                    </th>
                  </tr>
                )}
                {group.rows.map((row, index) => (
                  <tr key={`${row.feature}-${index}`} className="border-t border-hairline">
                    <th scope="row" className="px-5 py-4 font-normal text-fg md:px-8">
                      {row.feature}
                    </th>
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-5 py-4 md:px-8", col.highlight ? "bg-brand/4 text-fg" : "text-fg-subtle")}>
                        <ComparisonCell value={row[col.key]} highlight={col.highlight} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
      {footnote && <p className="text-body-sm leading-relaxed text-fg-subtle">{footnote}</p>}
    </div>
  );
}

export { ComparisonTable };
