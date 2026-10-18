import * as React from "react";

import { cn } from "@/lib/utils";

// The dashboard's multi-line field (TEXTAREA_CLASS): the input's border and states, fixed in size.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full resize-none rounded-control border border-line bg-surface px-3.5 py-2.5 text-body-sm leading-field text-fg transition-[border-color,box-shadow] duration-150 ease-out outline-none placeholder:text-fg-subtle hover:border-line-strong focus:border-brand disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
