import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

// The browser's own select dressed as the dashboard's select field (SelectTrigger `field`): 40px, control corners, the
// light border that darkens on hover and turns brand blue on focus, body-sm ink, and the up-down chevron in the subtle
// gray at the right. `size="sm"` is the 28px compact field. Use it where the platform picker is better (phones, long
// lists, forms that must work without script).
type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" };

function NativeSelect({ className, size = "default", ...props }: NativeSelectProps) {
  return (
    <div data-slot="native-select-wrapper" data-size={size} className={cn("group/native-select relative w-fit has-[select:disabled]:opacity-50", className)}>
      <select
        data-slot="native-select"
        data-size={size}
        className="h-10 w-full min-w-0 cursor-pointer appearance-none rounded-control border border-line bg-surface py-0 pr-9 pl-3.5 text-body-sm text-fg outline-none transition-[border-color] duration-150 ease-out hover:border-line-strong focus:border-brand disabled:cursor-not-allowed aria-invalid:border-danger data-[size=sm]:h-7 data-[size=sm]:pr-8 data-[size=sm]:pl-2.5 data-[size=sm]:text-caption motion-reduce:transition-none"
        {...props}
      />
      <ChevronsUpDown aria-hidden data-slot="native-select-icon" strokeWidth={1.5} className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-fg-subtle group-data-[size=sm]/native-select:right-2.5" />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" className={cn("bg-surface text-fg", className)} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" className={cn("bg-surface text-fg", className)} {...props} />;
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
