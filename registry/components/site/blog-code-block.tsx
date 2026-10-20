"use client";

import * as React from "react";

import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

// The article's code block, as the site's posts draw it: a white card in the soft blue ring, a bar with three blue
// window dots (the first solid), the language and a blue "copy" pill, then the code in the site's light syntax colors,
// wrapping rather than scrolling, with no line numbers. The highlighting is a small tokenizer in the spirit of the
// site's Prism theme (keywords, strings, functions, properties and flags, numbers, comments, punctuation).

const TOKEN = /(\/\/.*|\/\*.*?\*\/|#.*|'(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`(?:[^`\\]|\\.)*`?|\$\{?\w+\}?|--?[A-Za-z][\w-]*|\d+(?:\.\d+)?|[A-Za-z_$][\w$]*|[{}()[\],:;=<>+*/!&|?.%-]|\s+|.)/g;
const KEYWORDS = new Set(
  "const let var function return import from export default as await async if else elif for while do new class def in of try catch finally throw yield with pass lambda interface extends implements public private static void package func defer struct".split(" "),
);
const CONSTANTS = new Set("true false null undefined None True False nil".split(" "));
const SHELL = new Set(["bash", "sh", "shell", "zsh", "console", "curl"]);
const SHELL_BUILTINS = new Set("export local readonly declare unset".split(" "));

function classify(token: string, before: string, after: string, firstWord: boolean, shell: boolean) {
  const prev = before.at(-1) ?? "";
  if (token.startsWith("//") || token.startsWith("/*") || (token.startsWith("#") && (prev === "" || /\s/.test(prev)))) return "text-code-light-comment";
  if (/^['"`]/.test(token)) return "text-code-light-string";
  if (token.startsWith("$")) return "text-code-light-property";
  if (/^--?[A-Za-z]/.test(token)) return prev === "" || /\s/.test(prev) ? "text-code-light-property" : "text-code-light-punctuation";
  if (/^\d/.test(token) || CONSTANTS.has(token)) return "text-code-light-number";
  if (/^[A-Za-z_$]/.test(token)) {
    // In a shell, export and its kin read as builtins and an assigned name as a variable, as the site's theme colors them.
    if (shell && SHELL_BUILTINS.has(token)) return "text-code-light-number";
    if (shell && after.startsWith("=")) return "text-code-light-property";
    if (KEYWORDS.has(token)) return "text-code-light-keyword";
    if (/^\s*\(/.test(after)) return "text-code-light-function";
    if (/^\s*:(?!:)/.test(after) || prev === ".") return "text-code-light-property";
    if (shell && firstWord) return "text-code-light-function";
    return undefined;
  }
  if (/^[{}()[\],:;=<>+*/!&|?.%\\-]$/.test(token)) return "text-code-light-punctuation";
  return undefined;
}

function LightCode({ code, shell }: { code: string; shell: boolean }) {
  return (
    <code>
      {code.split("\n").map((line, i) => {
        const tokens = line.match(TOKEN) ?? [];
        let offset = 0;
        let sawWord = false;
        return (
          <span key={i} className="block min-h-[1lh]">
            {tokens.map((token, j) => {
              const before = line.slice(0, offset);
              offset += token.length;
              const tokenClass = /\S/.test(token) ? classify(token, before, line.slice(offset), !sawWord, shell) : undefined;
              if (/^[A-Za-z_$]/.test(token)) sawWord = true;
              return (
                <span key={j} className={tokenClass}>
                  {token}
                </span>
              );
            })}
          </span>
        );
      })}
    </code>
  );
}

/**
 * A code sample inside an article: light, in the soft blue ring, with a "copy" pill. `label` is the language as shown
 * ("TypeScript"; leave it out for plain text) and `language` the one to highlight as ("bash" colors each line's command).
 */
function BlogCodeBlock({ code, label, language, className }: { code: string; label?: React.ReactNode; language?: string; className?: string }) {
  const { hasCopied, copy } = useCopy();
  return (
    <div data-slot="blog-code-block" className={cn("not-prose my-6 w-full min-w-0 rounded-shell bg-tint p-1.5 text-left", className)}>
      <div className="min-w-0 overflow-hidden rounded-card border border-wash-pill bg-surface">
        <div className="flex min-h-11.5 items-center gap-3.5 border-b border-line px-4 py-2">
          <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
            <span className="size-2 rounded-pill bg-brand" />
            <span className="size-2 rounded-pill border border-brand" />
            <span className="size-2 rounded-pill border border-brand" />
          </span>
          {label && <span className="min-w-0 truncate text-body-sm leading-snug text-black/50">{label}</span>}
          <button
            type="button"
            onClick={() => copy(code)}
            aria-label={hasCopied ? "Copied" : "Copy code"}
            className="ml-auto inline-flex shrink-0 items-center rounded-pill border border-brand bg-surface px-3 py-1 text-pill-sm leading-snug font-normal text-fg-brand outline-none transition-[background-color] duration-150 ease-out hover:bg-blue-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
          >
            {hasCopied ? "copied" : "copy"}
          </button>
        </div>
        <pre data-slot="blog-code" className="m-0 p-5 font-mono text-body-sm leading-code-card whitespace-pre-wrap text-code-light-text [overflow-wrap:anywhere] [tab-size:4]">
          <LightCode code={code} shell={SHELL.has((language ?? "").toLowerCase())} />
        </pre>
      </div>
    </div>
  );
}

export { BlogCodeBlock };
