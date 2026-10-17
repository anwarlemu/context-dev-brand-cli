import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Product() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Copy key">
          <Copy />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy key</TooltipContent>
    </Tooltip>
  );
}
