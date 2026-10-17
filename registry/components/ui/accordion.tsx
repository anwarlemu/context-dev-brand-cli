"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

// The site's FAQ: questions at body-lg on hairline rules, a plus that turns to a cross when open (or your own icon),
// the answer opening in a short ease-out.
function Accordion(props: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b border-line-subtle last:border-b-0", className)} {...props} />;
}

function AccordionTrigger({ className, children, icon, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { icon?: React.ReactNode | null }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-4 py-5 text-left text-body-lg text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-45",
          className,
        )}
        {...props}
      >
        {children}
        {icon === undefined ? <Plus className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out motion-reduce:transition-none" strokeWidth={1.5} /> : icon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-body text-fg-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
