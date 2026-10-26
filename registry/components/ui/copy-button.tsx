"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COPIED_MS = 1500;

/** Copies by selecting the text in a hidden field, for where the Clipboard API is refused; restores focus and selection. */
function copyBySelection(text: string) {
  const previous = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)) : [];
  const field = document.createElement("textarea");
  field.value = text;
  field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.append(field);
  try {
    field.focus({ preventScroll: true });
    field.select();
    if (!document.execCommand("copy")) throw new Error("Copy unavailable");
  } finally {
    field.remove();
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    selection?.removeAllRanges();
    for (const range of ranges) selection?.addRange(range);
  }
}

/** Copies text and reports it for a moment, so the button can say so. */
export function useCopy() {
  const [hasCopied, setHasCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timeout.current), []);
  const copy = React.useCallback(async (text: string) => {
    try {
      const policy = document as Document & { permissionsPolicy?: { allowsFeature: (name: string) => boolean }; featurePolicy?: { allowsFeature: (name: string) => boolean } };
      if (navigator.clipboard && (policy.permissionsPolicy ?? policy.featurePolicy)?.allowsFeature("clipboard-write") !== false) await navigator.clipboard.writeText(text);
      else copyBySelection(text);
    } catch {
      // A sandboxed frame or an older browser may refuse the Clipboard API; copying a selected string still works there.
      try {
        copyBySelection(text);
      } catch {
        return;
      }
    }
    setHasCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setHasCopied(false), COPIED_MS);
  }, []);
  return { hasCopied, copy };
}

// A small icon button that turns into a green check for a moment once copied.
function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const { hasCopied, copy } = useCopy();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="copy-button"
          onClick={() => copy(value)}
          aria-label={hasCopied ? "Copied" : label}
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-control outline-none transition-colors duration-150 ease-out hover:bg-wash-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring [&_svg]:size-3.5",
            hasCopied ? "text-success" : "text-fg-subtle hover:text-fg",
            className,
          )}
        >
          {hasCopied ? <Check strokeWidth={1.75} /> : <Copy strokeWidth={1.5} />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">{hasCopied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}

export { CopyButton };
