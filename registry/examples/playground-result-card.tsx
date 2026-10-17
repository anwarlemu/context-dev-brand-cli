"use client";

import * as React from "react";
import { Clock, Sparkles } from "lucide-react";

import { JsonViewer } from "@/components/product/json-viewer";
import { type PlaygroundResultView, PlaygroundReadyState, PlaygroundResultCard, PlaygroundRunningState } from "@/components/product/playground-result-card";

const RESPONSE = { success: true, url: "https://acme.com", title: "Acme | Build faster", markdown: "# Acme\n\nBuild faster with Acme.", links: 42 };

export function Product() {
  const [view, setView] = React.useState<PlaygroundResultView>("preview");
  const [state, setState] = React.useState<"ready" | "running" | "done">("done");
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
      stats={[
        { icon: Sparkles, value: 1, label: "Credit" },
        { icon: Clock, value: "1.2s", label: "Time" },
      ]}
      footnote="Run in the playground"
      onBack={() => setState("ready")}
      ready={<PlaygroundReadyState action="Scrape" examples={["https://acme.com", "https://example.com/blog", "https://news.ycombinator.com"]} onExample={run} onRun={run} creditLabel="1 credit" />}
      history={<p className="p-6 text-body-sm text-fg-muted">Your last calls show up here.</p>}
    >
      {view === "json" ? (
        <JsonViewer value={RESPONSE} className="min-h-0 flex-1" />
      ) : (
        <div className="p-4 text-body-sm text-fg">
          <p className="text-h5">Acme</p>
          <p className="mt-2 text-fg-muted">Build faster with Acme.</p>
        </div>
      )}
    </PlaygroundResultCard>
  );
}
