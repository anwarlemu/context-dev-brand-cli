"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The home page's benchmark card, airy in the manner of parallel.ai: small mono folder tabs (Success rate, Latency,
// Cost vs success) over one chart drawn in the brand's dots, every axis named. The highlighted provider (the brand)
// is the brand blue; everyone else a quiet neutral, each named by its own logo and label, never by color alone. The
// tabs cycle while the card is on screen, a small ring filling as each one runs, and the open tab's white folder glides
// to whichever is picked; hovering or focusing a mark pauses the cycle so its tooltip can be read. Marks fill in once
// the chart is seen, over the brand's faint ring pattern. None of it moves under reduced motion.

export type BenchmarkProvider = { key: string; name: string; logo?: React.ReactNode; highlight?: boolean };
export type BenchmarkData = {
  /** Share of pages returned with usable content, by kind of page (percent), one value per group. */
  successRate: { groups: string[]; values: Record<string, number[]> };
  /** Median time to content, in seconds. */
  latency: Record<string, number>;
  /** Overall success rate (percent) against cost per 1,000 pages (USD). */
  costVsSuccess: Record<string, { cost: number; success: number }>;
};

const MONO = "font-mono uppercase tracking-wide";
const AXIS = cn(MONO, "text-axis tabular-nums text-fg-faint");
const AXIS_TITLE = cn(MONO, "text-axis text-fg-subtle");
const DOT_STAGGER_MS = 14;

/**
 * The brand's hollow rings behind a plot, faint enough that the dots and labels stay on top. Parts of the plot that
 * should sit clear of it (dot columns, values, labels) carry a white background.
 */
function ChartRings({ className }: { className?: string }) {
  const id = React.useId();
  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 size-full text-brand opacity-14", className)}>
      <defs>
        <pattern id={id} width={12} height={12} patternUnits="userSpaceOnUse">
          <circle cx={6} cy={6} r={3} fill="none" stroke="currentColor" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useInView<T extends Element>(ref: React.RefObject<T | null>, { amount = 0.35, once = false } = {}) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold: amount },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, amount, once]);
  return inView;
}

// Marks fill in once the chart is on screen, and again each time a tab mounts a new chart (the frame after, so the
// transition has a start to run from).
function useGrowIn() {
  const ref = React.useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [grown, setGrown] = React.useState(false);
  React.useEffect(() => {
    if (!seen || grown) return;
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, [seen, grown]);
  return { ref, shown: grown || reduced };
}

const toneFor = (provider: BenchmarkProvider) =>
  provider.highlight ? { solid: "border-brand bg-brand", label: "text-fg-brand" } : { solid: "border-neutral-40 bg-neutral-40", label: "text-fg-secondary" };

/** One step of a meter: solid up to the value, hollow for the rest of the scale. */
function MeterDot({ solid, tone, delay }: { solid: boolean; tone: ReturnType<typeof toneFor>; delay: number }) {
  return (
    <span className="flex items-center justify-center">
      <span
        className={cn("aspect-square w-full max-w-2.5 rounded-pill border transition-[background-color,border-color] duration-300 ease-out motion-reduce:transition-none", solid ? tone.solid : "border-neutral-20 bg-transparent")}
        style={{ transitionDelay: `${delay}ms` }}
      />
    </span>
  );
}

/** Shown on hover or keyboard focus of the mark it sits in. */
function MarkTip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-20 w-max max-w-[min(--spacing(56),calc(100vw-var(--ds-space-20)))] rounded-card bg-inverse px-2 py-1 text-left font-mono text-axis leading-snug text-fg-inverse opacity-0 transition-opacity duration-150 ease-out group-hover/mark:opacity-100 group-focus-visible/mark:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Logo({ provider, className = "size-3.5" }: { provider: BenchmarkProvider; className?: string }) {
  if (!provider.logo) return null;
  return <span className={cn("inline-flex shrink-0 items-center justify-center [&_img]:size-full [&_svg]:size-full", provider.highlight ? "text-fg-brand" : "text-fg-subtle", className)}>{provider.logo}</span>;
}

// Names both axes: the y title runs up the left side, the x title sits under the tick labels, centered on the plot.
function AxisFrame({ y, x, xInset, children }: { y: string; x: string; xInset: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-0 sm:gap-3">
      <span className={cn("hidden shrink-0 rotate-180 self-center whitespace-nowrap [writing-mode:vertical-rl] sm:block", AXIS_TITLE)}>{y}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {children}
        <p className={cn("text-center", AXIS_TITLE, xInset)}>{x}</p>
      </div>
    </div>
  );
}

const SUCCESS_STEPS = 20;

/** Grouped dot columns, one step per 5 percent, each topped with its provider's logo and score. */
function SuccessChart({ providers, data }: { providers: BenchmarkProvider[]; data: BenchmarkData["successRate"] }) {
  const { ref, shown } = useGrowIn();
  return (
    <AxisFrame y="Success rate (%)" x="Page type" xInset="ml-9">
      <div ref={ref} className="flex flex-col gap-3">
        <div className="relative mt-10 ml-9 h-60 sm:mt-12 sm:h-72">
          {/* On a phone the meters are narrower than a ring, so the rings would only show as halves between them. */}
          <ChartRings className="hidden sm:block" />
          {[0, 25, 50, 75, 100].map((tick) => (
            <span key={tick} className={cn("absolute -left-9 translate-y-1/2", AXIS)} style={{ bottom: `${tick}%` }}>
              {tick}%
            </span>
          ))}
          <div className="absolute inset-x-0 -bottom-px z-10 border-t border-node" />
          <div className="absolute inset-0 flex items-end justify-around gap-3 px-3 sm:gap-10">
            {data.groups.map((group, g) => (
              <div key={group} className="flex h-full w-full max-w-48 items-end justify-center gap-1.5 sm:gap-3">
                {providers.map((provider, p) => {
                  const value = data.values[provider.key]?.[g] ?? 0;
                  const filled = Math.round((value / 100) * SUCCESS_STEPS);
                  const tone = toneFor(provider);
                  const baseDelay = g * 120 + p * 60;
                  return (
                    <div key={provider.key} tabIndex={0} aria-label={`${provider.name}, ${group}: ${value}%`} data-chart-mark className="group/mark relative h-full w-full max-w-7 outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                      <div className="absolute bottom-full left-1/2 mb-1.5 flex -translate-x-1/2 flex-col items-center gap-1">
                        {/* A phone's columns are barely wider than a logo, so it is drawn a size down there. */}
                        <Logo provider={provider} className="size-3 sm:size-3.5" />
                        {/* Four values side by side run together on a phone, so there only the highlighted one is written. */}
                        <span className={cn("bg-surface px-0.5 font-data text-body-sm leading-none font-medium tabular-nums sm:text-body", tone.label, !provider.highlight && "hidden sm:inline")}>{value}</span>
                      </div>
                      <div className="grid h-full grid-cols-2 gap-x-0.5 bg-surface px-0.5" style={{ gridTemplateRows: `repeat(${SUCCESS_STEPS}, minmax(0, 1fr))` }}>
                        {Array.from({ length: SUCCESS_STEPS * 2 }, (_, cell) => {
                          const step = SUCCESS_STEPS - 1 - Math.floor(cell / 2);
                          return <MeterDot key={cell} solid={shown && step < filled} tone={tone} delay={baseDelay + step * DOT_STAGGER_MS} />;
                        })}
                      </div>
                      <MarkTip className="bottom-1/2 left-1/2 -translate-x-1/2">
                        {provider.name} · {group}: {value}%
                      </MarkTip>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="ml-9 flex justify-around gap-3 px-3 sm:gap-10">
          {data.groups.map((group) => (
            <span key={group} className={cn("w-full max-w-48 text-center text-axis text-fg-subtle sm:text-caption", MONO)}>
              {group}
            </span>
          ))}
        </div>
      </div>
    </AxisFrame>
  );
}

const LATENCY_DOT_ROWS = 2;
// A full-size dot plus its gap, so the meters are packed as tightly as the success chart's dot pairs at any width.
const LATENCY_STEP_PITCH_PX = 12;
const LATENCY_FALLBACK_STEPS = 30;
// Below 1, so each dot follows the last a little sooner and the long bars don't trail on.
const latencyFillDelay = (step: number) => Math.round(DOT_STAGGER_MS * step ** 0.7);

/** As many meter steps as fit the plot's width at the dot pitch. */
function useStepsThatFit<T extends HTMLElement>(pitch: number) {
  const ref = React.useRef<T>(null);
  const [steps, setSteps] = React.useState(LATENCY_FALLBACK_STEPS);
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSteps(Math.max(1, Math.floor(entry.contentRect.width / pitch))));
    observer.observe(element);
    return () => observer.disconnect();
  }, [pitch]);
  return { ref, steps };
}

/** Dot meters, fastest first. Provider labels get their own column, so they never run into the axis. */
function LatencyChart({ providers, data }: { providers: BenchmarkProvider[]; data: BenchmarkData["latency"] }) {
  const { ref, shown } = useGrowIn();
  const { ref: plotRef, steps } = useStepsThatFit<HTMLDivElement>(LATENCY_STEP_PITCH_PX);
  const rows = providers.map((p) => ({ provider: p, seconds: data[p.key] ?? 0 })).sort((a, b) => a.seconds - b.seconds);
  const max = Math.max(1, Math.ceil(Math.max(...rows.map((row) => row.seconds))));
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <AxisFrame y="Provider" x="Median time to content (seconds)" xInset="ml-26 mr-14 sm:ml-34">
      <div ref={ref} className="flex flex-col gap-2">
        {/* Same plot height as the other charts, so switching tabs never moves anything around it. */}
        <div className="mt-4 grid h-64 grid-cols-[6.5rem_minmax(0,1fr)] sm:h-80 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
          <div className="flex flex-col justify-around pr-3 sm:pr-4">
            {rows.map(({ provider }) => (
              <span key={provider.key} className={cn("flex h-9 items-center justify-end gap-2 text-axis sm:text-caption", MONO, provider.highlight ? "text-fg-brand" : "text-fg")}>
                <Logo provider={provider} className="size-4" />
                {provider.name}
              </span>
            ))}
          </div>
          <div ref={plotRef} className="relative flex flex-col justify-around border-l border-node pr-14">
            <ChartRings />
            {rows.map(({ provider, seconds }, index) => {
              const tone = toneFor(provider);
              const filled = Math.round((seconds / max) * steps);
              return (
                <div key={provider.key} tabIndex={0} aria-label={`${provider.name}: ${seconds} seconds`} data-chart-mark className="group/mark relative flex h-9 items-center outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                  <div
                    className="relative grid w-full grid-flow-col gap-0.5 bg-surface py-0.5"
                    style={{ gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${LATENCY_DOT_ROWS}, auto)` }}
                  >
                    {Array.from({ length: steps * LATENCY_DOT_ROWS }, (_, cell) => {
                      const step = Math.floor(cell / LATENCY_DOT_ROWS);
                      return <MeterDot key={cell} solid={shown && step < filled} tone={tone} delay={index * 90 + latencyFillDelay(step)} />;
                    })}
                  </div>
                  <span className={cn("absolute left-full ml-2 bg-surface px-1 font-data text-body-sm leading-none font-medium tabular-nums sm:text-body", tone.label)}>{seconds.toFixed(1)}s</span>
                  <MarkTip className="bottom-full left-0 mb-1">
                    {provider.name}: {seconds.toFixed(1)}s median
                  </MarkTip>
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative mr-14 ml-26 h-4 sm:ml-34">
          {ticks.map((tick) => (
            <span key={tick} className={cn(AXIS, "absolute -translate-x-1/2 normal-case")} style={{ left: `${(tick / max) * 100}%` }}>
              {tick}s
            </span>
          ))}
        </div>
      </div>
    </AxisFrame>
  );
}

// Log scale for cost, so 50 cents and 5 dollars sit comfortably on one axis.
const COST_TICKS = [0.5, 1, 2, 5, 10];
const costToX = (cost: number) => (Math.log(cost / COST_TICKS[0]) / Math.log(COST_TICKS[COST_TICKS.length - 1] / COST_TICKS[0])) * 100;
const successToY = (success: number) => ((success - 50) / 50) * 100;

/** Each provider's logo placed by success rate against cost. */
function CostChart({ providers, data }: { providers: BenchmarkProvider[]; data: BenchmarkData["costVsSuccess"] }) {
  const { ref, shown } = useGrowIn();
  return (
    <AxisFrame y="Success rate (%)" x="Cost per 1,000 pages (USD, log scale)" xInset="ml-8">
      <div ref={ref} className="flex flex-col gap-2">
        <div className="relative mt-4 ml-8 h-64 sm:h-80">
          <ChartRings />
          {[50, 60, 70, 80, 90, 100].map((tick) => (
            <span key={tick} className={cn("absolute -left-8 translate-y-1/2", AXIS)} style={{ bottom: `${successToY(tick)}%` }}>
              {tick}%
            </span>
          ))}
          <div className="absolute inset-x-0 -bottom-px z-10 border-t border-node" />
          <div className="absolute inset-y-0 left-0 border-l border-node" />
          {providers.map((provider, index) => {
            const point = data[provider.key];
            if (!point) return null;
            const x = costToX(point.cost);
            const labelLeft = x > 62;
            return (
              <div
                key={provider.key}
                tabIndex={0}
                aria-label={`${provider.name}: ${point.success}% success at $${point.cost.toFixed(2)} per 1,000 pages`}
                data-chart-mark
                className="group/mark absolute flex -translate-x-1/2 translate-y-1/2 items-center outline-none transition-[opacity,scale] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none"
                style={{ left: `${x}%`, bottom: `${successToY(point.success)}%`, opacity: shown ? 1 : 0, scale: shown ? "1" : "0.9", transitionDelay: `${index * 90}ms` }}
              >
                <span className={cn("flex size-8 items-center justify-center rounded-card bg-surface shadow-key", provider.highlight ? "ring-2 ring-brand" : "ring-1 ring-hairline")}>
                  <Logo provider={provider} className="size-4.5" />
                </span>
                <span className={cn("absolute top-1/2 flex -translate-y-1/2 flex-col bg-surface/85 px-1 text-axis leading-tight whitespace-nowrap", MONO, labelLeft ? "right-full mr-2 items-end" : "left-full ml-2 items-start", provider.highlight ? "text-fg-brand" : "text-fg")}>
                  <span>{provider.name}</span>
                  <span className="text-fg-faint tabular-nums">
                    {point.success}% / ${point.cost.toFixed(2)}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative ml-8 h-4">
          {COST_TICKS.map((tick) => (
            <span key={tick} className={cn("absolute -translate-x-1/2", AXIS)} style={{ left: `${costToX(tick)}%` }}>
              ${tick < 1 ? tick.toFixed(2) : tick}
            </span>
          ))}
        </div>
      </div>
    </AxisFrame>
  );
}

function BenchmarkLegend({ providers }: { providers: BenchmarkProvider[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {providers.map((provider) => (
        <li key={provider.key} className={cn("flex items-center gap-1.5 text-axis", MONO, provider.highlight ? "text-fg-brand" : "text-fg-secondary")}>
          <Logo provider={provider} />
          {provider.name}
        </li>
      ))}
    </ul>
  );
}

const TABS = [
  { id: "success", label: "Success rate" },
  { id: "latency", label: "Latency" },
  { id: "cost", label: "Cost vs success" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** The ring that fills while a tab runs; every tab keeps the track, so tabs hold their width as the active one moves. */
function CycleRing({ active, running, cycleMs, restartKey }: { active: boolean; running: boolean; cycleMs: number; restartKey: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 -rotate-90 motion-reduce:hidden">
      <circle cx="8" cy="8" r="6" fill="none" strokeWidth="2.5" className="stroke-wash-pill transition-[stroke] duration-150 ease-out group-hover/tab:stroke-brand/40 motion-reduce:transition-none" />
      {active && (
        // The chart line's draw-in, retimed to the cycle and linear, as progress is: it fills at the pace the timer runs
        // and pauses along with it.
        <circle
          key={restartKey}
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2.5"
          pathLength={1}
          strokeDasharray="1"
          className="animate-chart-line stroke-fg-nav"
          style={{ animationDuration: `${cycleMs}ms`, animationTimingFunction: "linear", animationFillMode: "forwards", animationPlayState: running ? "running" : "paused" }}
        />
      )}
    </svg>
  );
}

function BenchmarkPanel({ providers, data, link, cycleMs = 6000, className }: { providers: BenchmarkProvider[]; data: BenchmarkData; /** Sits at the right of the tab row (below the card on phones). */ link?: React.ReactNode; /** 0 turns the cycling off. */ cycleMs?: number; className?: string }) {
  const [tab, setTab] = React.useState<TabId>("success");
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.4 });
  const reduced = useReducedMotion();
  const [paused, setPaused] = React.useState(false);
  const cycles = cycleMs > 0 && !reduced;
  const running = cycles && inView && !paused;
  // Bumped on every pick, even of the tab already showing, so the timer and ring start over.
  const [pick, setPick] = React.useState(0);
  // How long the tab has shown so far, so a pause resumes where it left off, in step with the ring.
  const shownFor = React.useRef({ tab, pick: 0, ms: 0 });

  React.useEffect(() => {
    if (!running) return;
    if (shownFor.current.tab !== tab || shownFor.current.pick !== pick) shownFor.current = { tab, pick, ms: 0 };
    const shown = shownFor.current;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => {
      const index = TABS.findIndex((t) => t.id === tab);
      setTab(TABS[(index + 1) % TABS.length].id);
    }, cycleMs - shown.ms);
    return () => {
      window.clearTimeout(timer);
      shown.ms += performance.now() - startedAt;
    };
  }, [tab, running, pick, cycleMs]);

  // Pauses only while a mark is hovered or focused (its tooltip is being read), not whenever the pointer rests on the card.
  const isMark = (target: EventTarget | null) => target instanceof Element && !!target.closest("[data-chart-mark]");

  return (
    <div
      ref={panelRef}
      data-slot="benchmark-panel"
      onPointerOver={(event) => setPaused(isMark(event.target))}
      onPointerLeave={() => setPaused(false)}
      onFocus={(event) => setPaused(isMark(event.target))}
      onBlur={(event) => {
        if (!isMark(event.relatedTarget)) setPaused(false);
      }}
      className={cn("rounded-card border border-line bg-surface", className)}
    >
      <Tabs
        value={tab}
        onValueChange={(next) => {
          setTab(next as TabId);
          setPick((count) => count + 1);
        }}
        className="gap-0"
      >
        <div className="flex items-end gap-4 rounded-t-card border-b border-line bg-subtle px-2 sm:px-4">
          <div aria-hidden="true" className="hidden shrink-0 items-center gap-1.5 self-center sm:flex">
            <span className="size-2.5 rounded-pill border border-line-strong" />
            <span className="size-2.5 rounded-pill border border-line-strong" />
            <span className="size-2.5 rounded-pill border border-line-strong" />
          </div>
          {/* The open tab is one white folder (a hairline on three sides, open into the card) that glides to the picked tab
              on the tabs' spring. On phones the tabs scroll sideways, the last one fading out to say so. */}
          <TabsList
            aria-label="Benchmark"
            pillClassName="rounded-none rounded-t-card border border-b-0 border-line bg-surface"
            className="-mb-px min-w-0 flex-1 gap-0 overflow-x-auto [mask-image:linear-gradient(to_right,var(--ds-color-black)_calc(100%-var(--ds-space-10)),transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className={cn(
                  "group/tab relative h-auto shrink-0 gap-2 overflow-hidden rounded-none rounded-t-card border border-b-0 border-transparent px-2.5 py-2.5 font-mono text-axis text-fg-subtle transition-[color] duration-150 ease-out hover:text-fg-brand focus-visible:outline-offset-[calc(var(--ds-space-0-5)*-1)] data-[state=active]:bg-transparent data-[state=active]:text-fg data-[state=active]:hover:text-fg sm:px-4 sm:text-caption",
                  // Inactive tabs answer a hover with a soft blue wash inside the tab.
                  "before:absolute before:inset-1 before:-z-10 before:rounded-control before:bg-brand/10 before:opacity-0 before:transition-opacity before:duration-150 before:ease-out hover:before:opacity-100 data-[state=active]:before:hidden motion-reduce:before:transition-none",
                )}
              >
                {cycles && <CycleRing active={t.id === tab} running={running} cycleMs={cycleMs} restartKey={`${tab}-${pick}`} />}
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {link && <div className="hidden shrink-0 self-center md:block">{link}</div>}
        </div>
        <div className="p-3 sm:p-6">
          {/* The glass ring: a wrapper 8px wider than the card, so its outer edge shares the card's radius. */}
          <div className="-m-2 rounded-card bg-ring-tint p-2">
            <div className="flex min-w-0 flex-col gap-5 rounded-card bg-surface p-4 ring-1 ring-hairline sm:gap-6 sm:p-8">
              {/* A fixed height, so switching charts never shifts the tabs, legend, or anything below the card. */}
              <div className="h-88 sm:h-104">
                <TabsContent value="success">
                  <SuccessChart providers={providers} data={data.successRate} />
                </TabsContent>
                <TabsContent value="latency">
                  <LatencyChart providers={providers} data={data.latency} />
                </TabsContent>
                <TabsContent value="cost">
                  <CostChart providers={providers} data={data.costVsSuccess} />
                </TabsContent>
              </div>
              <div className="flex justify-center">
                <BenchmarkLegend providers={providers} />
              </div>
            </div>
          </div>
          {link && <div className="mt-4 flex justify-center md:hidden">{link}</div>}
        </div>
      </Tabs>
    </div>
  );
}

export { BenchmarkPanel, SuccessChart, LatencyChart, CostChart, BenchmarkLegend };
