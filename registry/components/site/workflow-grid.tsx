import * as React from "react";

import { cn } from "@/lib/utils";

// The home page's workflow cards: three across on wide screens, each a white card in the soft blue ring with an h4
// title, a short description and a picture panel pinned to the bottom. The panels keep one shape (459 by 317 in three
// columns, a fixed height below), so each picture scales down rather than reflowing and cards in a row line up.

export type WorkflowItem = { title: string; description: string; media?: React.ReactNode };

/** The picture panel: white, in the ring, its radius repeated so the corners match. */
function WorkflowMedia({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="workflow-media" className={cn("h-92 rounded-card bg-ring-tint p-2 xl:aspect-[459/317] xl:h-auto", className)}>
      <div className="flex h-full items-center justify-center overflow-hidden rounded-card bg-surface select-none">{children}</div>
    </div>
  );
}

function WorkflowCard({ title, description, media, className }: WorkflowItem & { className?: string }) {
  return (
    <div data-slot="workflow-card" className={cn("rounded-card bg-ring-tint p-2", className)}>
      <div className="flex h-full min-w-0 flex-col gap-6 rounded-card bg-surface p-6 ring-1 ring-hairline md:p-8 xl:p-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-h4 leading-snug font-normal text-fg">{title}</h3>
          <p className="text-body leading-relaxed text-fg-secondary">{description}</p>
        </div>
        {media !== undefined && <WorkflowMedia className="mt-auto">{media}</WorkflowMedia>}
      </div>
    </div>
  );
}

function WorkflowGrid({ items, className }: { items: WorkflowItem[]; className?: string }) {
  return (
    <ul data-slot="workflow-grid" className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:gap-5", className)}>
      {items.map((item) => (
        <li key={item.title} className="-m-2 flex">
          <WorkflowCard className="flex-1" {...item} />
        </li>
      ))}
    </ul>
  );
}

export { WorkflowGrid, WorkflowCard, WorkflowMedia };
