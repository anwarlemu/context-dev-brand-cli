import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// A message bubble, as the dashboard's support chat draws one (support-chat.tsx): body-sm text, 14px by 10px of
// padding, card corners all round (the dashboard cuts no tail), at most 85 percent of the thread's width. The person's
// own message (`default`) is brand blue with white text; the team's (`secondary`) sits on the subtle gray. `outline` is
// the typing bubble's white with a light edge, `muted` a quiet system line, `tinted` the blue 10 of a news banner,
// `destructive` the banner's soft red for a message that failed. Bubbles never animate in: a conversation is read
// line by line.
function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-group" className={cn("flex min-w-0 flex-col gap-1", className)} {...props} />;
}

const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[85%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default: "*:data-[slot=bubble-content]:bg-brand *:data-[slot=bubble-content]:text-on-brand [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blue-90",
        secondary: "*:data-[slot=bubble-content]:bg-subtle *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:bg-wash-selected",
        muted: "*:data-[slot=bubble-content]:bg-wash-hover *:data-[slot=bubble-content]:text-fg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-wash-selected",
        tinted: "*:data-[slot=bubble-content]:bg-blue-10 *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blue-20",
        outline: "*:data-[slot=bubble-content]:border-line *:data-[slot=bubble-content]:bg-surface *:data-[slot=bubble-content]:text-fg [&>[data-slot=bubble-content]:is(button,a):hover]:border-line-strong",
        ghost: "*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-fg",
        destructive: "*:data-[slot=bubble-content]:border-alert/30 *:data-[slot=bubble-content]:bg-alert/6 *:data-[slot=bubble-content]:text-danger-strong [&>[data-slot=bubble-content]:is(button,a):hover]:bg-alert/12",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Bubble({ variant = "default", align = "start", className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof bubbleVariants> & { align?: "start" | "end" }) {
  return <div data-slot="bubble" data-variant={variant} data-align={align} className={cn(bubbleVariants({ variant }), className)} {...props} />;
}

function BubbleContent({ asChild = false, className, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="bubble-content"
      className={cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-card border border-transparent px-3.5 py-2.5 text-body-sm leading-relaxed [overflow-wrap:anywhere] group-data-[align=end]/bubble:self-end [button]:cursor-pointer [button]:text-left [button,a]:outline-none [button,a]:transition-[background-color,border-color] [button,a]:duration-150 [button,a]:ease-out [button,a]:focus-visible:outline-2 [button,a]:focus-visible:outline-offset-2 [button,a]:focus-visible:outline-solid [button,a]:focus-visible:outline-focus-ring motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

const bubbleReactionsVariants = cva("absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-pill bg-surface px-1.5 py-0.5 text-caption leading-snug text-fg shadow-raised has-[button]:p-0", {
  variants: {
    side: { top: "top-0 -translate-y-3/4", bottom: "bottom-0 translate-y-3/4" },
    align: { start: "left-3", end: "right-3" },
  },
  defaultVariants: { side: "bottom", align: "end" },
});

/** Reactions pinned to a bubble's edge: a small white pill lifted off the bubble. */
function BubbleReactions({ side = "bottom", align = "end", className, ...props }: React.ComponentProps<"div"> & { align?: "start" | "end"; side?: "top" | "bottom" }) {
  return <div data-slot="bubble-reactions" data-align={align} data-side={side} className={cn(bubbleReactionsVariants({ side, align }), className)} {...props} />;
}

export { Bubble, BubbleContent, BubbleGroup, BubbleReactions, bubbleVariants };
