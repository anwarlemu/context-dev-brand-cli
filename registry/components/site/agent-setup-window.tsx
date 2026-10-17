"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { windowButtonClass } from "@/components/site/code-window";
import { useCopy } from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The home page's agent setup window: the code window's chrome with the setup methods (Prompt, MCP, CLI) as small tabs,
// a row of agent logos that copy the prompt for that agent, and one copy button for what is showing. Panels crossfade
// in one grid cell, so the window keeps the tallest panel's height and never jumps; the prompt's words fade in one by
// one each time its tab is picked.

export type AgentSetupMethod = { value: string; label: string; copyText: string; content: React.ReactNode };
export type SetupAgent = { name: string; icon?: React.ReactNode };
export type AgentSetupCopy = { method?: string; agent?: string; text: string };

const WORD_STAGGER_MS = 30;
const LINE_STAGGER_MS = 120;

// Opacity only: a transform would need inline-block words, which stops a long URL wrapping at its hyphen. `backwards`
// holds each word hidden through its delay; reduced motion drops the animation and shows the text at once.
const revealClass = "animate-fade-in motion-reduce:animate-none";
const revealStyle = (order: number, staggerMs: number): React.CSSProperties => ({ animationDelay: `${order * staggerMs}ms`, animationFillMode: "backwards" });

/** A link-like run inside the window: the one accent color, faintly underlined. */
function SetupUrl({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span style={style} className={cn("text-blue-60 underline decoration-white/20 underline-offset-2", className)}>
      {children}
    </span>
  );
}

/** A faded shell comment on its own line. */
function SetupComment({ children, order = 0 }: { children: React.ReactNode; order?: number }) {
  return (
    <span style={revealStyle(order, LINE_STAGGER_MS)} className={cn("block text-white/35", revealClass)}>
      {children}
    </span>
  );
}

/** A command on its own line, revealed after the lines before it. */
function SetupLine({ children, order = 0 }: { children: React.ReactNode; order?: number }) {
  return (
    <span style={revealStyle(order, LINE_STAGGER_MS)} className={cn("block", revealClass)}>
      {children}
    </span>
  );
}

/** The prompt, word by word; segments marked `url` arrive whole so their highlight never shows half drawn. */
function SetupPrompt({ segments }: { segments: { text: string; url?: boolean }[] }) {
  const tokens = segments.flatMap((segment, s) => (segment.url ? [{ key: `${s}`, text: segment.text, url: true }] : segment.text.split(/(?<=\s)/).map((word, w) => ({ key: `${s}-${w}`, text: word, url: false }))));
  return (
    <p>
      {tokens.map((token, order) =>
        token.url ? (
          <SetupUrl key={token.key} style={revealStyle(order, WORD_STAGGER_MS)} className={revealClass}>
            {token.text}
          </SetupUrl>
        ) : (
          <span key={token.key} style={revealStyle(order, WORD_STAGGER_MS)} className={revealClass}>
            {token.text}
          </span>
        ),
      )}
    </p>
  );
}

function AgentSetupWindow({
  methods,
  agents = [],
  agentPrompt,
  defaultValue,
  onCopy,
  className,
}: {
  methods: AgentSetupMethod[];
  /** Agents offered in the chrome bar; picking one copies `agentPrompt` (or the first method's text). */
  agents?: SetupAgent[];
  agentPrompt?: string;
  defaultValue?: string;
  /** Called after a copy, so the app can show its own toast. */
  onCopy?: (copied: AgentSetupCopy) => void;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? methods[0]?.value ?? "");
  // Bumped on every pick, even of the tab already showing, so its reveal plays again.
  const [pick, setPick] = React.useState(0);
  const { hasCopied, copy } = useCopy();
  const active = methods.find((m) => m.value === value) ?? methods[0];

  const copyActive = async () => {
    if (!active) return;
    await copy(active.copyText);
    onCopy?.({ method: active.value, text: active.copyText });
  };

  const copyForAgent = async (agent: SetupAgent) => {
    const text = agentPrompt ?? methods[0]?.copyText ?? "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    onCopy?.({ agent: agent.name, text });
  };

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        setValue(next);
        setPick((count) => count + 1);
      }}
      data-slot="agent-setup-window"
      className={cn("gap-0 overflow-hidden rounded-card bg-code text-left text-white", className)}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-danger" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-series-3" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-success" />
        <TabsList aria-label="Agent setup method" className="ml-2 gap-0.5">
          {methods.map((method) => (
            <TabsTrigger
              key={method.value}
              value={method.value}
              className="h-auto rounded-card px-2.5 py-1 text-caption font-medium text-white/45 hover:text-white/80 focus-visible:ring-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              {method.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {agents.length > 0 && (
          <div className="ml-auto hidden items-center gap-0.5 border-r border-white/10 pr-1.5 sm:flex">
            {agents.map((agent) => (
              <button
                key={agent.name}
                type="button"
                onClick={() => copyForAgent(agent)}
                aria-label={`Copy the setup prompt for ${agent.name}`}
                title={agent.name}
                className={cn(windowButtonClass, "text-white/60 [&_img]:size-4.5 [&_svg]:size-4.5")}
              >
                {agent.icon ?? <Terminal aria-hidden="true" />}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={copyActive} aria-label={hasCopied ? "Copied" : `Copy the ${active?.label} setup`} className={cn(windowButtonClass, "ml-auto", agents.length > 0 && "sm:ml-1")}>
          {hasCopied ? <Check aria-hidden="true" strokeWidth={1.75} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
        </button>
      </div>
      <div className="grid p-5 font-mono text-caption leading-relaxed break-words text-white/85 sm:text-body-sm">
        {methods.map((method) => (
          <TabsContent
            key={method.value}
            value={method.value}
            forceMount
            className="col-start-1 row-start-1 transition-[opacity,filter,visibility] duration-200 ease-out data-[state=inactive]:invisible data-[state=inactive]:opacity-0 data-[state=inactive]:blur-[2px] motion-reduce:transition-none"
          >
            {/* Keyed on the pick, so the panel that is showing replays its reveal. */}
            <div key={method.value === value ? `on-${pick}` : "off"}>{method.content}</div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

export { AgentSetupWindow, SetupPrompt, SetupUrl, SetupComment, SetupLine };
