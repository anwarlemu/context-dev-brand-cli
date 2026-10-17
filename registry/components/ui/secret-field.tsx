"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MASK = "••••••••••••";

export const maskSecret = (secret: string, visibleChars: number) => `${secret.slice(0, visibleChars)}${MASK}`;

/**
 * The secret's text, always as wide as its masked form: revealed, the full value truncates into that same space, so
 * showing it never widens the field or the table column around it.
 */
export function SecretText({ secret, masked, isRevealed, className }: { secret: string; masked: string; isRevealed: boolean; className?: string }) {
  return (
    <code className={cn("relative min-w-0 flex-1", className)}>
      <span className={cn("block truncate", isRevealed && "invisible")} aria-hidden={isRevealed}>
        {masked}
      </span>
      {isRevealed && <span className="absolute inset-0 truncate">{secret}</span>}
    </code>
  );
}

// An API key on a pale inset well: masked to its first characters, with show and copy buttons.
function SecretField({
  secret,
  visibleChars = 8,
  label = "key",
  defaultRevealed = false,
  className,
}: {
  secret: string;
  visibleChars?: number;
  label?: string;
  /** Starts with the full secret showing, for the one moment right after it's created. */
  defaultRevealed?: boolean;
  className?: string;
}) {
  const [revealed, setRevealed] = React.useState(defaultRevealed);
  return (
    <div data-slot="secret-field" className={cn("flex h-9 min-w-0 items-center gap-1 rounded-control bg-neutral-5 pr-1 pl-3 shadow-[inset_0_0_0_1px_var(--ds-color-border-subtle)]", className)}>
      <SecretText secret={secret} masked={maskSecret(secret, visibleChars)} isRevealed={revealed} className="font-mono text-caption text-fg-muted" />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
            className="grid size-7 shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 ease-out hover:bg-wash-control hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring [&_svg]:size-3.5"
          >
            {revealed ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{revealed ? "Hide" : "Show"}</TooltipContent>
      </Tooltip>
      <CopyButton value={secret} label={`Copy ${label}`} />
    </div>
  );
}

export { SecretField };
