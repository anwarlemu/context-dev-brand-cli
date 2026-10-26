"use client";

import * as React from "react";
import * as DirectionPrimitive from "@radix-ui/react-direction";

// Sets the reading direction (ltr or rtl) for every Radix-based component inside it, so menus, sliders, tabs and
// toggle groups flip for right-to-left text. It draws nothing of its own; set dir on the element you wrap as well.
function DirectionProvider({ dir, direction, children }: React.ComponentProps<typeof DirectionPrimitive.DirectionProvider> & { direction?: React.ComponentProps<typeof DirectionPrimitive.DirectionProvider>["dir"] }) {
  return <DirectionPrimitive.DirectionProvider dir={direction ?? dir}>{children}</DirectionPrimitive.DirectionProvider>;
}

const useDirection = DirectionPrimitive.useDirection;

export { DirectionProvider, useDirection };
