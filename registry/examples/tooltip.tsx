"use client";

import { useState } from "react";
import { useCopy } from "@/components/ui/copy-button";
import { Copy, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// A one-line label naming an icon button, and a `wrap` label explaining a value. They wait a beat
// on hover or focus, then the neighbors appear at once.
export function Product() {
  const { copy, hasCopied } = useCopy();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-16 pt-8 pb-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={hasCopied ? "Copied" : "Copy key"} onClick={() => copy("ctx_example_key")}>
            <Copy strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{hasCopied ? "Copied" : "Copy key"}</TooltipContent>
      </Tooltip>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="About credits" onClick={(event) => { event.preventDefault(); setOpen(true); }}>
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
