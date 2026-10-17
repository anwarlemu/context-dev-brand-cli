"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ArrowUp, Minus, Plus } from "lucide-react";

import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The site's FAQ: the heading, a line and a call to action on the left; category pills and a stack of question cards
// on the right. Each question is its own white card in the soft blue ring, its answer hanging off a small corner rule,
// and the last card is an "Ask anything" field. Opening a card closes the others; the answer grows open and fades in.
// Every category is stacked in one grid cell, so switching tabs never moves the page.

type FaqItem = { id?: string; question: string; answer: React.ReactNode };
type FaqCategory = { value: string; label: string; items: FaqItem[] };
type FaqToggle = "plus" | "dots";

// The card's surface: white with the raised hairline shadow, inside the 8px blue ring (a spread shadow, so it adds no size).
const CARD = "rounded-card bg-surface shadow-[var(--ds-shadow-raised),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]";

/** The answer's corner rule: a short line down and across, tying the answer to its question. */
function FaqAnswerRule() {
  return <span aria-hidden="true" className="h-6 w-3 shrink-0 rounded-bl-card border-b border-l border-line-strong" />;
}

const DOTS = 5;
const PITCH = 4;
const cells = Array.from({ length: DOTS * DOTS }, (_, i) => ({ x: i % DOTS, y: Math.floor(i / DOTS) }));
const MIDDLE = Math.floor(DOTS / 2);

/**
 * The open and close mark in the brand's dot grid: a plus of solid dots on a field of rings that becomes a cross while
 * its card is open. Needs the card to be the Tailwind `group` with Radix's data-state.
 */
function FaqToggleDots({ className }: { className?: string }) {
  const dot = (picked: (c: { x: number; y: number }) => boolean, r: number) =>
    cells.filter(picked).map(({ x, y }) => <circle key={`${x}:${y}`} cx={(x + 0.5) * PITCH} cy={(y + 0.5) * PITCH} r={r} />);
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${DOTS * PITCH} ${DOTS * PITCH}`} data-slot="faq-toggle-dots" className={cn("text-fg-brand", className)}>
      <g fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.3}>
        {dot(() => true, 1)}
      </g>
      <g fill="currentColor" className="transition-opacity duration-200 ease-out group-data-[state=open]:opacity-0 motion-reduce:transition-none">
        {dot(({ x, y }) => x === MIDDLE || y === MIDDLE, 1.35)}
      </g>
      <g fill="currentColor" className="opacity-0 transition-opacity duration-200 ease-out group-data-[state=open]:opacity-100 motion-reduce:transition-none">
        {dot(({ x, y }) => x === y || x === DOTS - 1 - y, 1.35)}
      </g>
    </svg>
  );
}

/** One question card. Use inside FaqList (or any single Accordion). */
function FaqCard({ item, value, toggle = "plus", className }: { item: FaqItem; value: string; toggle?: FaqToggle; className?: string }) {
  return (
    <AccordionItem value={value} data-slot="faq-card" className={cn("group border-b-0 transition-[background-color] duration-200 ease-out hover:bg-subtle motion-reduce:transition-none", CARD, className)}>
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger className="flex flex-1 items-center gap-5 rounded-card px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex-1 text-body-lg leading-snug font-medium tracking-tight text-fg">{item.question}</span>
          {toggle === "dots" ? (
            <FaqToggleDots className="size-6 shrink-0" />
          ) : (
            <span aria-hidden="true" className="shrink-0 rounded-pill bg-subtle p-2.5 text-fg group-hover:bg-surface">
              <Plus className="block size-4 group-data-[state=open]:hidden" strokeWidth={2} />
              <Minus className="hidden size-4 group-data-[state=open]:block" strokeWidth={2} />
            </span>
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      {/* Always mounted so the row track can animate from 0fr to 1fr (the answer's real height) and back; closed answers
          are invisible, which also takes them out of the accessibility tree. Reduced motion keeps only the fade. */}
      <AccordionPrimitive.Content
        forceMount
        className="grid transition-[grid-template-rows,opacity,visibility] duration-250 ease-out data-[state=closed]:invisible data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr] motion-reduce:transition-[opacity,visibility]"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex gap-2.5 pt-1 pr-16 pb-5 pl-5 text-body-sm leading-relaxed text-fg-muted">
            <FaqAnswerRule />
            <div className="flex-1 pt-3">{item.answer}</div>
          </div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionItem>
  );
}

/**
 * The closing "Ask anything" card. Static by default: a field and the brand-blue send button. Pass `onAsk` to receive
 * the question and `answer` to show a reply under it, or `children` to put your own content in the card.
 */
function FaqAskCard({
  placeholder = "Ask anything",
  onAsk,
  answer,
  children,
  className,
}: {
  placeholder?: string;
  onAsk?: (question: string) => void;
  answer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div data-slot="faq-ask-card" className={cn("relative isolate overflow-hidden", CARD, className)}>
      {children ?? (
        <form
          className="flex items-center gap-5 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            const question = String(new FormData(event.currentTarget).get("question") ?? "").trim();
            if (question) onAsk?.(question);
          }}
        >
          <label htmlFor={id} className="sr-only">
            {placeholder}
          </label>
          {/* At least 16px, or iOS Safari zooms the page into the field. */}
          <input
            id={id}
            name="question"
            type="text"
            maxLength={500}
            autoComplete="off"
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-body-lg leading-snug font-medium tracking-tight text-fg outline-none placeholder:text-fg-faint"
          />
          <button
            type="submit"
            aria-label="Ask"
            className="shrink-0 rounded-control bg-brand p-2.5 text-on-brand transition-[background-color,scale] duration-150 ease-out outline-none hover:bg-blue-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <ArrowUp className="block size-4" strokeWidth={2} />
          </button>
        </form>
      )}
      {answer && (
        <div aria-live="polite" className="-mt-3 flex animate-content-in gap-2.5 pr-16 pb-5 pl-5 text-body-sm leading-relaxed text-fg-muted">
          <FaqAnswerRule />
          <div className="flex-1 pt-3">{answer}</div>
        </div>
      )}
    </div>
  );
}

/** A stack of question cards where opening one closes the rest, optionally ending with the ask card. */
function FaqList({ items, toggle, ask, idPrefix = "faq", className }: { items: FaqItem[]; toggle?: FaqToggle; ask?: React.ReactNode; idPrefix?: string; className?: string }) {
  return (
    <div data-slot="faq-list" className={cn("flex flex-col gap-5", className)}>
      <Accordion type="single" collapsible className="flex flex-col gap-5">
        {items.map((item, i) => (
          <FaqCard key={item.id ?? i} value={item.id ?? `${idPrefix}-${i}`} item={item} toggle={toggle} />
        ))}
      </Accordion>
      {ask}
    </div>
  );
}

/** The left column: the heading with its brand-blue accent, a line and a call to action, centered on phones. */
function FaqHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div data-slot="faq-header" className={cn("mb-8 flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left", className)}>
      <h2 className="text-h1 leading-none tracking-tight text-fg">{title}</h2>
      {description && <p className="text-body-lg leading-relaxed text-fg-nav">{description}</p>}
      {action}
    </div>
  );
}

/**
 * The whole section: header on the left (with an optional `aside` under it, where the brand puts an illustration),
 * category tabs and the question stack on the right. `ask` ends every category's stack; pass false to leave it out.
 */
function FaqSection({
  title = (
    <>
      Frequently asked <span className="text-fg-brand">questions</span>
    </>
  ),
  description,
  action,
  aside,
  categories,
  defaultCategory,
  ask = <FaqAskCard />,
  toggle,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  aside?: React.ReactNode;
  categories: FaqCategory[];
  defaultCategory?: string;
  ask?: React.ReactNode | false;
  toggle?: FaqToggle;
  className?: string;
}) {
  return (
    <Tabs data-slot="faq-section" defaultValue={defaultCategory ?? categories[0]?.value} className={cn("flex flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-16", className)}>
      {/* Below lg the column dissolves, so the aside can follow the questions instead of sitting above them. */}
      <div className="contents lg:flex lg:flex-col lg:self-stretch">
        <FaqHeader title={title} description={description} action={action} />
        {aside && <div className="order-last mt-8 lg:order-none lg:mt-auto">{aside}</div>}
      </div>
      <div className="min-w-0">
        {categories.length > 1 && (
          <div className="mb-5 overflow-x-auto px-1 pt-1 pb-3 md:mb-7">
            <TabsList variant="pill" aria-label="FAQ categories" className="mx-auto w-max gap-0.5 sm:gap-2">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value} className="px-2.5 py-1.5 text-caption sm:px-5 sm:py-2.5 sm:text-body">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}
        <div className="grid">
          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} forceMount className="[grid-area:1/1] data-[state=inactive]:invisible">
              <FaqList items={category.items} toggle={toggle} ask={ask || undefined} idPrefix={`faq-${category.value}`} />
            </TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
}

export { FaqSection, FaqHeader, FaqList, FaqCard, FaqAskCard, FaqToggleDots, type FaqItem, type FaqCategory, type FaqToggle };
