import * as React from "react";

import { cn } from "@/lib/utils";

// One message in a conversation, as the dashboard's support chat and team table set people: a 28px round avatar (the
// initial in white on brand blue, at 11px, or a picture), the sender in body-sm ink with the time in the subtle gray,
// the bubbles, and a caption footer (Delivered, Seen) in the subtle gray. The person's own messages (align end) mirror
// to the right.
function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-group" className={cn("flex min-w-0 flex-col gap-3", className)} {...props} />;
}

function Message({ className, align = "start", ...props }: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return <div data-slot="message" data-align={align} className={cn("group/message relative flex w-full min-w-0 gap-2.5 data-[align=end]:flex-row-reverse", className)} {...props} />;
}

function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center self-end overflow-hidden rounded-pill bg-brand text-axis text-on-brand group-has-data-[slot=message-footer]/message:-translate-y-5 *:[img]:size-full *:[img]:object-cover",
        className,
      )}
      {...props}
    />
  );
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("flex w-full min-w-0 flex-col gap-1.5 [overflow-wrap:anywhere] group-data-[align=end]/message:items-end", className)} {...props} />;
}

function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn("flex max-w-full min-w-0 items-baseline gap-2 px-1 text-body-sm leading-snug text-fg group-data-[align=end]/message:flex-row-reverse [&_time]:text-caption [&_time]:text-fg-subtle group-has-data-[variant=ghost]/message:px-0", className)}
      {...props}
    />
  );
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn("flex max-w-full min-w-0 items-center gap-1 px-1 text-caption leading-snug text-fg-subtle group-data-[align=end]/message:justify-end group-has-data-[variant=ghost]/message:px-0 [&_svg:not([class*='size-'])]:size-3", className)}
      {...props}
    />
  );
}

export { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader };
