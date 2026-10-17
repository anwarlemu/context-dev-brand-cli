import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// The dashboard's form field: the label above in body-sm (not muted), a red asterisk when required, help or an error
// below in caption.
function Field({
  label,
  htmlFor,
  help,
  error,
  required = false,
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  help?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-slot="field" data-invalid={error ? true : undefined} className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className="block">
        {label}
        {required && (
          <>
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </Label>
      {children}
      {(error || help) && <p className={cn("text-caption", error ? "text-danger" : "text-fg-subtle")}>{error ?? help}</p>}
    </div>
  );
}

export { Field };
