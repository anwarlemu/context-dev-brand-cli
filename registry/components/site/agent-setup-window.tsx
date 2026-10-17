"use client";

import * as React from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The home page's agent setup window: the code window's chrome with the setup methods (Prompt, MCP, CLI) as small tabs,
// a row of agent logos that copy the prompt for that agent, and one copy button for what is showing. Panels crossfade
// in one grid cell, so the window keeps the tallest panel's height and never jumps; the prompt's words fade in one by
// one each time its tab is picked. While the window is on screen it moves to the next method every six seconds,
// pausing while the pointer or focus is inside it; reduced motion turns both the cycling and the reveal off.

export type AgentSetupMethod = { value: string; label: string; copyText: string; content: React.ReactNode };
export type SetupAgent = { name: string; icon?: React.ReactNode };
export type AgentSetupCopy = { method?: string; agent?: string; text: string };

const CYCLE_MS = 6000;
const WORD_STAGGER_MS = 30;
const LINE_STAGGER_MS = 120;

// Opacity only: a transform would need inline-block words, which stops a long URL wrapping at its hyphen. The site
// plays this at 400ms with a 4px blur; it is held to 300ms here. `backwards` holds each word hidden through its delay,
// and a paused animation keeps it hidden until the window is first seen.
const revealClass = "animate-fade-in [animation-duration:var(--ds-duration-slow)] motion-reduce:animate-none";
const RevealContext = React.createContext(true);
function useRevealStyle(order: number, staggerMs: number): React.CSSProperties {
  const playing = React.useContext(RevealContext);
  return { animationDelay: `${order * staggerMs}ms`, animationFillMode: "backwards", animationPlayState: playing ? "running" : "paused" };
}

const chromeButtonClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-card outline-none transition-colors duration-150 ease-out hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 motion-reduce:transition-none";

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
    <span style={useRevealStyle(order, LINE_STAGGER_MS)} className={cn("block text-white/35", revealClass)}>
      {children}
    </span>
  );
}

/** A command on its own line, revealed after the lines before it. */
function SetupLine({ children, order = 0 }: { children: React.ReactNode; order?: number }) {
  return (
    <span style={useRevealStyle(order, LINE_STAGGER_MS)} className={cn("block", revealClass)}>
      {children}
    </span>
  );
}

/** The prompt, word by word; segments marked `url` arrive whole so their highlight never shows half drawn. */
function SetupPrompt({ segments }: { segments: { text: string; url?: boolean }[] }) {
  const tokens = segments.flatMap((segment, s) => (segment.url ? [{ key: `${s}`, text: segment.text, url: true }] : segment.text.split(/(?<=\s)/).map((word, w) => ({ key: `${s}-${w}`, text: word, url: false }))));
  return (
    <p>
      {tokens.map((token, order) => (
        <PromptToken key={token.key} text={token.text} url={token.url} order={order} />
      ))}
    </p>
  );
}

function PromptToken({ text, url, order }: { text: string; url: boolean; order: number }) {
  const style = useRevealStyle(order, WORD_STAGGER_MS);
  return url ? (
    <SetupUrl style={style} className={revealClass}>
      {text}
    </SetupUrl>
  ) : (
    <span style={style} className={revealClass}>
      {text}
    </span>
  );
}

function AgentSetupWindow({
  methods,
  agents = [],
  agentPrompt,
  defaultValue,
  cycle = true,
  onCopy,
  className,
}: {
  methods: AgentSetupMethod[];
  /** Agents offered in the chrome bar; picking one copies `agentPrompt` (or the first method's text). */
  agents?: SetupAgent[];
  agentPrompt?: string;
  defaultValue?: string;
  /** Moves to the next method every six seconds while the window is on screen. */
  cycle?: boolean;
  /** Called after a copy, so the app can show its own toast. */
  onCopy?: (copied: AgentSetupCopy) => void;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? methods[0]?.value ?? "");
  // Bumped on every pick, even of the tab already showing, so its timer and reveal start over.
  const [pick, setPick] = React.useState(0);
  const { hasCopied, copy } = useCopy();
  const active = methods.find((m) => m.value === value) ?? methods[0];

  const ref = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [seen, setSeen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focusWithin, setFocusWithin] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", onChange);
    };
  }, []);

  // The time a method has already been on screen, so a pause (hover, focus, scrolling away) resumes rather than restarts.
  const shown = React.useRef({ value, pick, ms: 0 });
  const running = cycle && methods.length > 1 && inView && !hovered && !focusWithin && !reducedMotion;
  React.useEffect(() => {
    if (!running) return;
    if (shown.current.value !== value || shown.current.pick !== pick) shown.current = { value, pick, ms: 0 };
    const current = shown.current;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => {
      const index = methods.findIndex((m) => m.value === value);
      setValue(methods[(index + 1) % methods.length].value);
    }, CYCLE_MS - current.ms);
    return () => {
      window.clearTimeout(timer);
      current.ms += performance.now() - startedAt;
    };
  }, [running, value, pick, methods]);

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
      ref={ref}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        setPick((count) => count + 1);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
      data-slot="agent-setup-window"
      className={cn(
        "gap-0 overflow-hidden rounded-card bg-code text-left text-white shadow-[0_var(--ds-space-2)_var(--ds-space-10)_color-mix(in_srgb,var(--ds-color-black)_18%,transparent)] ring-1 ring-white/10",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-close" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-minimize" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-zoom" />
        <TabsList glide={false} aria-label="Agent setup method" className="ml-2 h-auto gap-0.5 bg-transparent p-0">
          {methods.map((method) => (
            <TabsTrigger
              key={method.value}
              value={method.value}
              className="flex h-auto items-center gap-1.5 rounded-card px-2.5 py-1 text-caption font-medium text-white/45 shadow-none transition-colors duration-200 ease-out hover:text-white/80 focus-visible:ring-white/60 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none"
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
                className={cn(chromeButtonClass, "group/agent")}
              >
                {/* The logo presses in a step when picked. */}
                <span className="flex text-white/60 transition-transform duration-200 ease-out group-active/agent:scale-90 motion-reduce:transition-none [&_img]:size-4.5 [&_svg]:size-4.5">
                  {agent.icon ?? <Terminal aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={copyActive}
          aria-label={hasCopied ? "Copied" : `Copy the ${active?.label} setup`}
          className={cn(chromeButtonClass, "ml-auto text-white/45 hover:text-white [&_svg]:size-3.5", agents.length > 0 && "sm:ml-1")}
        >
          {hasCopied ? <Check aria-hidden="true" strokeWidth={1.75} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
        </button>
      </div>
      <RevealContext.Provider value={seen}>
        {/* Every panel shares one grid cell, so the window keeps the tallest panel's height and never jumps between tabs. */}
        <div className="grid p-5 font-mono text-caption leading-code break-words text-white/85 sm:text-body-sm">
          {methods.map((method) => (
            <TabsContent
              key={method.value}
              value={method.value}
              forceMount
              className="col-start-1 row-start-1 mt-0 transition-[opacity,filter,visibility] duration-200 ease-out data-[state=inactive]:invisible data-[state=inactive]:opacity-0 data-[state=inactive]:blur-[2px] motion-reduce:transition-none"
            >
              {/* Keyed on the pick, so the panel that is showing replays its reveal. */}
              <div key={method.value === value ? `on-${pick}` : "off"}>{method.content}</div>
            </TabsContent>
          ))}
        </div>
      </RevealContext.Provider>
    </Tabs>
  );
}

export { AgentSetupWindow, SetupPrompt, SetupUrl, SetupComment, SetupLine };
