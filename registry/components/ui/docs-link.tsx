import * as React from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

// The dashboard's link to the docs: a book, the label in muted caption that underlines on hover, and an arrow that
// darkens with it (150ms ease-out). Opens in a new tab.
function DocsLink({ className, children = "Read the docs", ...props }: React.ComponentProps<"a">) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      data-slot="docs-link"
      className={cn(
        "group flex h-6 w-fit shrink-0 items-center gap-1 text-caption whitespace-nowrap text-fg-muted decoration-fg/25 underline-offset-4 transition-colors duration-150 ease-out outline-none hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring",
        className,
      )}
      {...props}
    >
      <BookOpen className="size-3.5" strokeWidth={1.5} />
      {children}
      <ArrowUpRight
        className="size-3.5 shrink-0 transition-colors duration-150 ease-out motion-reduce:transition-none"
        strokeWidth={1.5}
        aria-hidden
      />
    </a>
  );
}

export { DocsLink };
