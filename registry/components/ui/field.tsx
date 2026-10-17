import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// A form field: the label above in body-sm (not muted), help or an error below in caption.
function Field({ label, htmlFor, help, error, className, children }: { label: React.ReactNode; htmlFor?: string; help?: React.ReactNode; error?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="field" data-invalid={error ? true : undefined} className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-caption text-danger">{error}</p> : help ? <p className="text-caption text-fg-subtle">{help}</p> : null}
    </div>
  );
}

export { Field };
