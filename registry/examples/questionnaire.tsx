"use client";

import * as React from "react";

import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

const ITEMS = [
  { name: "building", required: true, choices: [{ value: "agent" }, { value: "monitor" }, { value: "search" }] },
  { name: "apis", multiple: true, choices: [{ value: "scrape" }, { value: "crawl" }, { value: "search" }, { value: "parse" }] },
  { name: "volume", required: true, choices: [{ value: "under-10k" }, { value: "under-250k" }, { value: "more" }] },
] as const;

function Onboarding({ onSaved }: { onSaved: (summary: string) => void }) {
  return (
    <Questionnaire
      items={ITEMS}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSaved(`Building: ${data.get("building")}. APIs: ${data.getAll("apis").join(", ") || "not sure yet"}. Volume: ${data.get("volume")}.`);
      }}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="building" required>
        <QuestionnaireTitle>What are you building?</QuestionnaireTitle>
        <QuestionnaireDescription>We will set up your first request around it.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="agent">
            An agent that reads the web
            <QuestionnaireChoiceDescription>Pages and search results as markdown for a model</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="monitor">
            A change monitor
            <QuestionnaireChoiceDescription>Prices, docs or policies, checked on a schedule</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="search">
            Search over fresh results
            <QuestionnaireChoiceDescription>Grounding for answers and research</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireInput aria-label="Something else" placeholder="Something else" />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="apis" multiple>
        <QuestionnaireTitle>Which APIs will you call?</QuestionnaireTitle>
        <QuestionnaireDescription>Choose any. You can use every API on every plan.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="scrape">Scrape</QuestionnaireChoice>
          <QuestionnaireChoice value="crawl">Crawl</QuestionnaireChoice>
          <QuestionnaireChoice value="search">Search</QuestionnaireChoice>
          <QuestionnaireChoice value="parse">Parse</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="volume" required>
        <QuestionnaireTitle>How many calls a month?</QuestionnaireTitle>
        <QuestionnaireDescription>A rough number is enough.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="under-10k">Up to 10,000</QuestionnaireChoice>
          <QuestionnaireChoice value="under-250k">Up to 250,000</QuestionnaireChoice>
          <QuestionnaireChoice value="more">More than 250,000</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Finish</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

function Saved({ summary, onReset }: { summary: string; onReset: () => void }) {
  return (
    <div role="status" className="grid gap-2 rounded-card border border-line bg-blue-10 px-4 py-3 text-body-sm text-fg">
      <p>Saved. {summary}</p>
      <button type="button" onClick={onReset} className="w-fit text-fg-brand underline underline-offset-4">
        Start again
      </button>
    </div>
  );
}

export function Site() {
  const [saved, setSaved] = React.useState<string>();
  return <div className="mx-auto w-full max-w-md">{saved ? <Saved summary={saved} onReset={() => setSaved(undefined)} /> : <Onboarding onSaved={setSaved} />}</div>;
}

export function Product() {
  const [saved, setSaved] = React.useState<string>();
  return (
    <div className="mx-auto w-full max-w-md rounded-card bg-surface p-5 shadow-card">
      {saved ? <Saved summary={saved} onReset={() => setSaved(undefined)} /> : <Onboarding onSaved={setSaved} />}
    </div>
  );
}

export function Disabled() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Questionnaire items={[{ name: "plan", required: true }]} shortcuts="letters">
        <QuestionnaireItem name="plan" required>
          <QuestionnaireTitle>Which plan fits?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="starter">Starter</QuestionnaireChoice>
            <QuestionnaireChoice value="growth">Growth</QuestionnaireChoice>
            <QuestionnaireChoice value="scale" disabled>
              Scale
              <QuestionnaireChoiceDescription>Talk to us first</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>
    </div>
  );
}
