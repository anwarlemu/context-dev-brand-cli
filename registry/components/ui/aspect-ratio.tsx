"use client";

import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

// Holds media at a fixed shape (a screenshot, a logo tile, a video). The frame has no look of its own: round and clip
// the media inside with the card's corners and give it the card's hairline, as the brand frames its screenshots.
function AspectRatio(props: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
