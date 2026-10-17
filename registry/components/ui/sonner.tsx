"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// The brand's toasts (src/components/ui/sonner.tsx): white with a light border and a soft shadow, the description muted,
// a close button on each, at the bottom center (src/app/providers.tsx). Sonner's own enter and exit motion is kept.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: "bg-surface! text-fg! border! border-line! shadow-[0_0.25rem_0.75rem_rgb(0_0_0/0.08)]! font-sans! text-body-sm!",
          description: "text-fg-muted!",
          actionButton: "rounded-control! bg-primary! text-on-primary!",
          cancelButton: "rounded-control! bg-subtle! text-fg-muted!",
          closeButton: "bg-surface! text-fg! border-line! hover:bg-wash-hover!",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
