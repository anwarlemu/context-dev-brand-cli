import { Copy, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Product() {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Copy key">
            <Copy strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Copy key</TooltipContent>
      </Tooltip>
      <Tooltip>
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
