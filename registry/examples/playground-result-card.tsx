"use client";

import * as React from "react";
import { Clock, Sparkles } from "lucide-react";

import { JsonViewer } from "@/components/product/json-viewer";
import { type PlaygroundResultView, PlaygroundReadyState, PlaygroundResultCard, PlaygroundRunningState } from "@/components/product/playground-result-card";

const RESPONSE = {
  success: true,
  url: "https://acme.com",
  title: "Acme | Build faster",
  markdown: "# Build faster with Acme\n\nAcme ships the tools teams use to launch in days, not months.\n\n## Products\n\n- Acme Deploy\n- Acme Edge\n- Acme Analytics",
  links: 42,
};

const STATS = [
  { icon: Sparkles, value: 1, label: "Credit" },
  { icon: Clock, value: "1.2s", label: "Time" },
];

function ScrapedPage() {
  return (
    <div className="flex flex-col gap-3 p-5 text-body-sm text-fg-muted">
      <p className="text-h5 text-fg">Build faster with Acme</p>
      <p>Acme ships the tools teams use to launch in days, not months.</p>
      <p className="mt-2 text-body font-medium text-fg">Products</p>
      <ul className="grid list-disc gap-1 pl-5">
        <li>Acme Deploy</li>
        <li>Acme Edge</li>
        <li>Acme Analytics</li>
      </ul>
    </div>
  );
}

// After a call: the view tabs and status above the card, the stats strip, and the response in its inset panel.
function ResultExample({ initial = "done" }: { initial?: "ready" | "running" | "done" }) {
  const [view, setView] = React.useState<PlaygroundResultView>("preview");
  const [state, setState] = React.useState<"ready" | "running" | "done">(initial);
  const run = () => {
    setState("running");
    setTimeout(() => setState("done"), 1200);
  };
  return (
    <PlaygroundResultCard
      className="w-full max-w-xl"
      view={view}
      onViewChange={setView}
      statusCode={state === "done" ? 200 : null}
      loading={state === "running" ? <PlaygroundRunningState label="Scraping acme.com" /> : undefined}
      stats={STATS}
      footnote="Run in the playground"
      onBack={() => setState("ready")}
      ready={<PlaygroundReadyState action="Scrape" examples={["https://acme.com", "https://example.com/blog", "https://news.ycombinator.com"]} onExample={run} onRun={run} creditLabel="1 credit" />}
      history={<p className="p-6 text-body-sm text-fg-muted">Your last calls show up here.</p>}
    >
      {state === "done" ? (view === "json" ? <JsonViewer value={RESPONSE} className="min-h-0 flex-1" /> : <ScrapedPage />) : undefined}
    </PlaygroundResultCard>
  );
}

export function Product() { return <ResultExample />; }

export function Ready() { return <ResultExample initial="ready" />; }

// While a call runs: pulsing dots naming what it's calling.
export function Running() {
  const [view, setView] = React.useState<PlaygroundResultView>("preview");
  return <PlaygroundResultCard className="w-full max-w-xl" view={view} onViewChange={setView} statusCode={null} loading={<PlaygroundRunningState label="Scraping acme.com" />} />;
}
