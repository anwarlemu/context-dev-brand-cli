import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-body-sm text-fg transition-[border-color,box-shadow] duration-150 ease-out outline-none placeholder:text-fg-faint hover:border-line-strong focus-visible:border-brand focus-visible:shadow-ring-hover disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
