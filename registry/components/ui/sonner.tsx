"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Toasts on the brand's floating surface: white, shell corners, a hairline in the shadow, body-sm text.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "rounded-shell! bg-surface! text-fg! shadow-floating! border-0! font-sans! text-body-sm!",
          description: "text-fg-muted!",
          actionButton: "rounded-control! bg-brand! text-on-brand!",
          cancelButton: "rounded-control! bg-subtle! text-fg!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
