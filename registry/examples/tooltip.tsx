import { Copy, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Shown open: a one-line label naming an icon button, and a `wrap` label explaining a value. In use they wait a beat
// on hover or focus, then the neighbors appear at once.
export function Product() {
  return (
    <div className="flex items-center gap-16 pt-8 pb-4">
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copy key">
            <Copy strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Copy key</TooltipContent>
      </Tooltip>
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="About credits">
            <Info strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" wrap>
          Credits reset on the first of each month. Unused credits do not roll over.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
