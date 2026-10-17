"use client";

import { useState } from "react";

import { CardLink } from "@/components/product/glyph-card";
import { TryApi } from "@/components/product/try-api";

const TABS = [
  { value: "scrape" as const, label: "Scrape", glyph: ["22222", "2...2", "22222", "2...2", "22222"], inputKind: "url" as const, inputLabel: "URL to scrape", examples: ["https://stripe.com/pricing", "https://linear.app/changelog"], runLabel: "Scrape, 1 credit" },
  { value: "search" as const, label: "Search", glyph: [".222.", "2...2", "2...2", ".222.", "....2"], inputLabel: "Search query", examples: ["best vector databases 2026"], runLabel: "Search, 1 credit" },
  { value: "answers" as const, label: "Answers", glyph: ["22222", "2...2", "2...2", "22222", "2...."], inputLabel: "Question", examples: ["Who leads the latest Series B rounds in dev tools?"], runLabel: "Ask, 5 credits" },
];

export function Product() {
  const [api, setApi] = useState<(typeof TABS)[number]["value"]>("scrape");
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  return (
    <div className="w-full max-w-2xl">
      <TryApi
        tabs={TABS}
        value={api}
        onValueChange={setApi}
        input={input}
        onInputChange={setInput}
        running={running}
        onRun={() => {
          setRunning(true);
          setTimeout(() => setRunning(false), 1200);
        }}
        aside={<CardLink href="#">API Playground</CardLink>}
      />
    </div>
  );
}
