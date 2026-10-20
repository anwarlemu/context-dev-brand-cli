"use client";

import { BookOpen, Bot, Terminal } from "lucide-react";

import { windowButtonClass } from "@/components/site/code-window";
import type { UseCaseSample } from "@/components/site/use-case-how-it-works";
import { UseCases, UseCaseTryIn } from "@/components/site/use-cases";
import { PersonaGlyph } from "@/components/visuals/persona-glyph";

import { HOME_USE_CASES, type HomeUseCase } from "./use-case-samples";

const prompt = (useCase: HomeUseCase, sample: UseCaseSample) =>
  `Please create a ${useCase.title.toLowerCase()} implementation using the Context.dev API like this:\n\n${sample.code}\n\nAPI reference: ${useCase.docsUrl}`;

// The agents' own logos go in the "Try in" chip; these icons stand in for them. The prompt carries the code showing.
const tryIn = (useCase: HomeUseCase) => (sample: UseCaseSample) => (
  <>
    <UseCaseTryIn>
      <button type="button" aria-label="Try in Claude" onClick={() => window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt(useCase, sample))}`, "_blank", "noopener,noreferrer")} className={windowButtonClass}>
        <Bot />
      </button>
      <button type="button" aria-label="Try in Cursor" onClick={() => window.open(`https://cursor.com/link/prompt?text=${encodeURIComponent(prompt(useCase, sample))}`, "_blank", "noopener,noreferrer")} className={windowButtonClass}>
        <Terminal />
      </button>
    </UseCaseTryIn>
    <a href={useCase.docsUrl} target="_blank" rel="noopener noreferrer" aria-label="View documentation" className={windowButtonClass}>
      <BookOpen />
    </a>
  </>
);

export function Site() {
  return (
    <UseCases
      className="w-full"
      items={HOME_USE_CASES.map((useCase, index) => ({
        id: useCase.id,
        title: useCase.title,
        description: useCase.description,
        glyph: <PersonaGlyph name={useCase.glyph} index={index} className="size-7 rounded-control p-1.5" />,
        samples: useCase.samples,
        actions: tryIn(useCase),
      }))}
    />
  );
}
