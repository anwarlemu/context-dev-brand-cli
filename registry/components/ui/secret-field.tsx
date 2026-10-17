"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

const MASK = "••••••••••••";

export const maskSecret = (secret: string, visibleChars: number) => `${secret.slice(0, visibleChars)}${MASK}`;

// An API key: masked to its first characters, revealed in the same width (so showing it never widens the field),
// with show and copy buttons.
function SecretField({ secret, visibleChars = 8, label = "key", className }: { secret: string; visibleChars?: number; label?: string; className?: string }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div data-slot="secret-field" className={cn("flex h-9 min-w-0 items-center gap-1 rounded-control bg-neutral-5 pr-1 pl-3 shadow-[inset_0_0_0_1px_var(--ds-color-border-subtle)]", className)}>
      <code className="relative min-w-0 flex-1 font-mono text-caption text-fg-muted">
        <span className={cn("block truncate", revealed && "invisible")} aria-hidden={revealed}>
          {maskSecret(secret, visibleChars)}
        </span>
        {revealed && <span className="absolute inset-0 truncate">{secret}</span>}
      </code>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
        className="grid size-7 shrink-0 place-items-center rounded-control text-fg-subtle outline-none transition-colors duration-150 hover:bg-wash-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
      >
        {revealed ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
      </button>
      <CopyButton value={secret} label={`Copy ${label}`} />
    </div>
  );
}

export { SecretField };
