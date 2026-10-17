"use client";

import * as React from "react";

import { CodeBlock, CodeWindow, WindowCopyButton } from "@/components/site/code-window";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The home page's use case explorer: one card in the soft blue ring, the use cases down the left (a row that scrolls
// on phones), each with its icon, title and a line of description; the picked one sits on the pale brand tint. The
// right side shows that use case's code in the code window. Every window shares one grid cell, so switching never
// resizes the card.

export type UseCaseItem = {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  code: string;
  /** Extra buttons in the window's chrome bar beside copy (open in an agent, docs). */
  actions?: React.ReactNode;
};

function UseCases({ items, defaultValue, className }: { items: UseCaseItem[]; defaultValue?: string; className?: string }) {
  const [value, setValue] = React.useState(defaultValue ?? items[0]?.id ?? "");
  return (
    <div data-slot="use-cases" className={cn("rounded-card bg-ring-tint p-2", className)}>
      <Tabs value={value} onValueChange={setValue} orientation="vertical" className="gap-0 overflow-hidden rounded-card bg-surface ring-1 ring-hairline md:flex-row">
        <div className="w-full shrink-0 overflow-x-auto border-b border-line-subtle md:w-auto md:max-w-80 md:min-w-80 md:overflow-visible md:border-r md:border-b-0">
          <TabsList aria-label="Use cases" className="w-max snap-x snap-mandatory flex-row items-stretch gap-0.5 p-2.5 md:grid md:w-auto md:auto-rows-fr md:p-2">
            {items.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="h-auto w-70 shrink-0 snap-start flex-col items-start justify-start gap-1 rounded-card px-4 py-3 text-left whitespace-normal text-fg opacity-70 transition-[background-color,opacity] duration-200 hover:bg-tint/60 hover:opacity-100 data-[state=active]:bg-tint data-[state=active]:opacity-100 md:w-auto"
              >
                <span className="flex items-center gap-3">
                  {item.icon && <span className="grid size-7 shrink-0 place-items-center rounded-control bg-brand p-1.5 text-white [&_svg]:size-4">{item.icon}</span>}
                  <span className="text-body whitespace-nowrap text-fg">{item.title}</span>
                </span>
                <span className={cn("text-body-sm text-fg-muted", item.icon && "pl-10")}>{item.description}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="grid min-w-0 flex-1 place-items-center px-4 py-12 md:px-6 md:py-16">
          <div className="grid w-full max-w-3xl grid-cols-[minmax(0,1fr)]">
            {items.map((item) => (
              <TabsContent
                key={item.id}
                value={item.id}
                forceMount
                className="col-start-1 row-start-1 transition-opacity duration-200 ease-out data-[state=inactive]:invisible data-[state=inactive]:opacity-0 motion-reduce:transition-none"
              >
                <CodeWindow
                  label={item.title}
                  actions={
                    <>
                      {item.actions}
                      <WindowCopyButton value={item.code} label={`Copy the ${item.title.toLowerCase()} example`} />
                    </>
                  }
                >
                  <div className="overflow-x-auto">
                    <CodeBlock code={item.code} className="p-4" />
                  </div>
                </CodeWindow>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export { UseCases };
