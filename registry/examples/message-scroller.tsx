"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent } from "@/components/ui/message";
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport, useMessageScroller } from "@/components/ui/message-scroller";

type Entry = { id: number; from: "team" | "you"; text: string };

const START: Entry[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  from: i % 2 === 0 ? "you" : "team",
  text: i % 2 === 0 ? `Batch ${4100 + i} finished with ${i % 4} failed URLs. Can you check them?` : "Those pages returned 403 from the site. Retrying them with a residential proxy usually works.",
}));

function Thread({ entries }: { entries: Entry[] }) {
  return (
    <MessageScroller className="min-h-0 flex-1">
      <MessageScrollerViewport>
        <MessageScrollerContent>
          <Marker variant="separator">
            <MarkerContent>Yesterday</MarkerContent>
          </Marker>
          {entries.map((entry, i) => (
            <MessageScrollerItem key={entry.id} scrollAnchor={entry.from === "you" && i === entries.length - 1 && entry.id >= START.length}>
              <Message align={entry.from === "you" ? "end" : "start"}>
                <MessageContent>
                  <Bubble variant={entry.from === "you" ? "default" : "secondary"} align={entry.from === "you" ? "end" : "start"}>
                    <BubbleContent>{entry.text}</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            </MessageScrollerItem>
          ))}
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  );
}

// The support chat's composer: a field with the window's corners, Enter sends and Shift Enter adds a line.
function Composer({ onSend }: { onSend: (text: string) => void }) {
  const { scrollToEnd } = useMessageScroller();
  const [draft, setDraft] = React.useState("");
  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
    scrollToEnd({ behavior: "auto" });
  };
  return (
    <form
      className="flex items-center border-t border-line px-3 py-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <div className="flex flex-1 items-end gap-2 rounded-card border border-line p-1 pl-3 transition-colors duration-150 ease-out focus-within:border-brand motion-reduce:transition-none">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Write a message"
          aria-label="Message"
          className="max-h-32 min-h-8 flex-1 resize-none bg-transparent py-1.5 text-body-sm outline-none placeholder:text-fg-subtle"
        />
        <button type="submit" disabled={!draft.trim()} aria-label="Send" className="grid size-8 shrink-0 place-items-center rounded-control bg-fg text-surface transition-colors duration-150 ease-out hover:bg-neutral-90 disabled:bg-neutral-10 disabled:text-fg-subtle motion-reduce:transition-none">
          <ArrowUp className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
}

export function Site() {
  return (
    <div className="mx-auto flex h-96 w-full max-w-lg flex-col overflow-hidden rounded-card bg-surface shadow-[0_0_0_1px_var(--ds-color-border-hairline),0_0_0_var(--ds-space-2)_var(--ds-color-ring-tint)]">
      <MessageScrollerProvider>
        <Thread entries={START} />
      </MessageScrollerProvider>
    </div>
  );
}

export function Product() {
  const [entries, setEntries] = React.useState(START);
  return (
    <aside className="mx-auto flex h-110 w-full max-w-90 flex-col overflow-hidden rounded-shell bg-surface shadow-floating">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        <h2 className="min-w-0 flex-1 truncate text-body-sm">Context.dev Support</h2>
        <p className="flex h-6 items-center gap-1.5 rounded-control border border-line px-2.5 text-caption text-fg-muted">
          <span className="size-1.5 rounded-pill bg-success" aria-hidden />
          Active
        </p>
      </div>
      <MessageScrollerProvider>
        <Thread entries={entries} />
        <Composer onSend={(text) => setEntries((all) => [...all, { id: all.length, from: "you", text }])} />
      </MessageScrollerProvider>
    </aside>
  );
}
