"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

// Code to read and copy, in the brand's two code looks. `default` is the dashboard's (json-viewer.tsx, code-card.tsx):
// a white card with its hairline in the shadow, a 44px head over a light rule with the file or language in muted
// caption and the copy button in its corner, then mono caption on the code card's line, numbered in the subtle gray,
// keys and keywords navy, strings brand blue, numbers a lighter blue; lines wrap rather than scroll sideways.
// `terminal` is the site's code window (code-window.tsx): the soft blue ring, a near-black window with three window
// dots and a label chip in its 44px chrome bar, and the code in the site's GitHub-dark colors, scrolling sideways.

type Variant = "default" | "terminal";
const VariantContext = React.createContext<Variant>("default");

function CodeBlock({ variant = "default", className, children, ...props }: React.ComponentProps<"figure"> & { variant?: Variant }) {
  return (
    <VariantContext.Provider value={variant}>
      <figure
        data-slot="code-block"
        data-variant={variant}
        className={cn("group/code-block m-0 flex w-full min-w-0 flex-col", variant === "terminal" ? "rounded-card bg-ring-tint p-2" : "rounded-card bg-surface text-fg shadow-card", className)}
        {...props}
      >
        {variant === "terminal" ? <div className="flex min-w-0 flex-col overflow-hidden rounded-card bg-code text-white">{children}</div> : children}
      </figure>
    </VariantContext.Provider>
  );
}

function CodeBlockHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const variant = React.useContext(VariantContext);
  if (variant === "terminal")
    return (
      <div data-slot="code-block-header" className={cn("flex min-h-11 min-w-0 shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2", className)} {...props}>
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-close" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-minimize" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-zoom" />
        {children}
      </div>
    );
  return (
    <div data-slot="code-block-header" className={cn("flex h-11 min-w-0 shrink-0 items-center gap-2 border-b border-line-subtle pr-2 pl-4", className)} {...props}>
      {children}
    </div>
  );
}

/** The file name or language: muted caption in the product, a white chip in the site's window. */
function CodeBlockTitle({ className, ...props }: React.ComponentProps<"figcaption">) {
  const variant = React.useContext(VariantContext);
  return (
    <figcaption
      data-slot="code-block-title"
      className={cn(
        "flex min-w-0 items-center gap-1.5 truncate [&_svg]:size-3.5 [&_svg]:shrink-0",
        variant === "terminal" ? "ml-2 rounded-card bg-white/10 px-2.5 py-1 font-mono text-caption font-medium text-white" : "text-caption text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

function CodeBlockActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="code-block-actions" className={cn("ml-auto flex shrink-0 items-center gap-1", className)} {...props} />;
}

/** Copies the code; the glyph turns to a check for a moment, and a live region says so. */
function CodeBlockCopyButton({ value, label = "Copy code", className, ...props }: Omit<React.ComponentProps<"button">, "value" | "children"> & { value: string; label?: string }) {
  const variant = React.useContext(VariantContext);
  const { hasCopied, copy } = useCopy();
  return (
    <>
      <button
        type="button"
        data-slot="code-block-copy-button"
        data-copied={hasCopied || undefined}
        aria-label={hasCopied ? "Copied" : label}
        onClick={() => copy(value)}
        className={cn(
          "inline-flex shrink-0 items-center justify-center outline-none transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-3.5",
          variant === "terminal"
            ? "size-7 rounded-card text-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            : "size-8 rounded-control text-fg-subtle hover:bg-wash-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-focus-ring",
          hasCopied && variant === "default" && "text-success hover:text-success",
          className,
        )}
        {...props}
      >
        {hasCopied ? <Check aria-hidden strokeWidth={1.75} /> : <Copy aria-hidden strokeWidth={1.5} />}
      </button>
      <span aria-live="polite" className="sr-only">
        {hasCopied ? "Copied" : ""}
      </span>
    </>
  );
}

type Kind = "text" | "comment" | "punctuation" | "keyword" | "string" | "function" | "number" | "property";

// The dashboard's light highlighting (json-viewer, code-card) and the site's dark theme (code-window), by kind.
const COLORS: Record<Variant, Record<Kind, string | undefined>> = {
  default: { text: undefined, comment: "text-fg-subtle", punctuation: "text-fg-muted", keyword: "text-navy-60", string: "text-fg-brand", function: undefined, number: "text-blue-70", property: "text-navy-60" },
  terminal: { text: undefined, comment: "text-code-comment", punctuation: "text-code-punctuation", keyword: "text-code-keyword", string: "text-code-string", function: "text-code-function", number: "text-code-number", property: "text-code-property" },
};

const KEYWORDS = /^(?:import|from|export|default|function|return|const|let|var|if|else|for|of|in|new|type|interface|extends|as|async|await|class|this|throw|try|catch|def|curl|package|use|require)$/;
const LITERALS = /^(?:true|false|null|undefined|None|True|False|nil)$/;

/** Splits code into colored runs. JSON keys are properties; in scripts strings, keywords, calls and numbers; in shell the command and its flags. */
function tokenize(code: string, language: string): { kind: Kind; text: string }[] {
  const out: { kind: Kind; text: string }[] = [];
  const push = (kind: Kind, text: string) => (text ? out.push({ kind, text }) : undefined);
  if (language === "json") {
    for (const m of code.matchAll(/("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|([{}[\],:])|(\s+|[^"{}[\],:\d\s-]+|[\s\S])/g)) {
      if (m[1]) {
        push(m[2] ? "property" : "string", m[1]);
        if (m[2]) push("punctuation", m[2]);
      } else if (m[3]) push("number", m[3]);
      else if (m[4]) push("number", m[4]);
      else if (m[5]) push("punctuation", m[5]);
      else push("text", m[0]);
    }
    return out;
  }
  if (language === "bash" || language === "sh" || language === "shell" || language === "curl") {
    for (const line of code.split(/(\n)/)) {
      if (line === "\n") push("text", line);
      else if (/^\s*#/.test(line)) push("comment", line);
      else {
        let first = true;
        for (const m of line.matchAll(/("[^"]*"|'[^']*')|(\s--?[\w-]+)|(\s+)|(\S+)/g)) {
          if (m[1]) push("string", m[1]);
          else if (m[2]) push("keyword", m[2]);
          else if (m[3]) push("text", m[3]);
          else {
            push(first ? "function" : m[4] === "\\" ? "punctuation" : "text", m[4]);
            first = false;
          }
        }
      }
    }
    return out;
  }
  const pattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)(?=\s*:)|([A-Za-z_$][\w$]*)|([{}()[\];,.<>=+\-*/!?&|:])|(\s+|[\s\S])/g;
  for (const m of code.matchAll(pattern)) {
    if (m[1]) push(language === "python" || !m[1].startsWith("#") ? "comment" : "text", m[1]);
    else if (m[2]) push("string", m[2]);
    else if (m[3]) push("number", m[3]);
    else if (m[4]) push(KEYWORDS.test(m[4]) ? "keyword" : "function", m[4]);
    else if (m[5]) push(KEYWORDS.test(m[5]) ? "keyword" : "property", m[5]);
    else if (m[6]) push(KEYWORDS.test(m[6]) ? "keyword" : LITERALS.test(m[6]) ? "number" : "text", m[6]);
    else if (m[7]) push("punctuation", m[7]);
    else push("text", m[8]);
  }
  return out;
}

/**
 * The code. Pass the text as `code` and its `language` (json, ts, tsx, js, python, bash, curl). Line numbers show in
 * the product's look by default; lines wrap there and scroll in the site's window, unless `wrap` says otherwise.
 * `maxHeight` lets a long file scroll inside the block.
 */
function CodeBlockContent({ code, language = "ts", lineNumbers, wrap, className, ...props }: Omit<React.ComponentProps<"pre">, "children"> & { code: string; language?: string; lineNumbers?: boolean; wrap?: boolean }) {
  const variant = React.useContext(VariantContext);
  const terminal = variant === "terminal";
  const numbered = lineNumbers ?? !terminal;
  const wraps = wrap ?? !terminal;
  const colors = COLORS[variant];
  const lines = React.useMemo(() => {
    const rows: { kind: Kind; text: string }[][] = [[]];
    for (const token of tokenize(code.replace(/\n$/, ""), language)) {
      token.text.split("\n").forEach((part, i) => {
        if (i > 0) rows.push([]);
        if (part) rows[rows.length - 1].push({ kind: token.kind, text: part });
      });
    }
    return rows;
  }, [code, language]);
  return (
    <pre
      data-slot="code-block-content"
      tabIndex={0}
      className={cn(
        "ds-scrollbar m-0 min-w-0 overflow-auto font-mono outline-none [tab-size:2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid",
        terminal ? "p-5 text-body-sm leading-terminal text-code-text focus-visible:outline-white/60" : "py-3 text-caption leading-code-card text-fg focus-visible:outline-focus-ring",
        className,
      )}
      {...props}
    >
      <code className={cn("grid", wraps ? "grid-cols-[minmax(0,1fr)]" : "min-w-max")}>
        {lines.map((line, i) => (
          <span key={i} className={cn("grid", numbered ? "grid-cols-[2.5rem_minmax(0,1fr)]" : "grid-cols-[minmax(0,1fr)]", !terminal && !numbered && "pl-5", !terminal && "hover:bg-neutral-5/60")}>
            {numbered && (
              <span aria-hidden className={cn("pr-3 text-right tabular-nums select-none", terminal ? "text-code-comment" : "text-fg-subtle")}>
                {i + 1}
              </span>
            )}
            <span className={cn(!terminal && "pr-5", wraps ? "whitespace-pre-wrap [overflow-wrap:anywhere]" : "whitespace-pre")}>
              {line.length
                ? line.map((t, j) => (
                    <span key={j} className={colors[t.kind]}>
                      {t.text}
                    </span>
                  ))
                : "\u200b"}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle };
