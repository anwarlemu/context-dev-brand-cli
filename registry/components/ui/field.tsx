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
  const generatedId = React.useId();
  const control = React.Children.toArray(children).find((child) => React.isValidElement<{ id?: string }>(child));
  const id = htmlFor ?? (React.isValidElement<{ id?: string }>(control) ? control.props.id : undefined) ?? generatedId;
  const messageId = `${id}-message`;
  return (
    <div data-slot="field" data-invalid={error ? true : undefined} className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="block">
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
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<React.InputHTMLAttributes<HTMLInputElement>>(child)) return child;
        return React.cloneElement(child, {
          id,
          ...(required ? { required: true } : {}),
          "aria-invalid": error ? true : child.props["aria-invalid"],
          "aria-describedby": [child.props["aria-describedby"], (error || help) && messageId].filter(Boolean).join(" ") || undefined,
        });
      })}
      <p id={messageId} aria-live="polite" className={cn("text-caption empty:hidden", error ? "text-danger" : "text-fg-subtle")}>{error ?? help}</p>
    </div>
  );
}

export { Field };
