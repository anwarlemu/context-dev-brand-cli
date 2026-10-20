"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { useCopy } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

// The site's code window: a near-black terminal with three window dots, an optional label chip and actions in its
// 44px chrome bar, set in the soft blue ring every card and frame on the site sits in. The code takes the site's
// GitHub-dark syntax theme (src/lib/code-syntax-theme.ts through terminal-code-theme.ts), which the site runs through
// Shiki: keywords violet, calls green, properties and keys blue, strings pale blue, numbers and constants orange,
// punctuation and comments gray. The highlighter below is a small port of what Shiki's grammars give the site's samples
// in TypeScript, Python, Ruby, PHP, Go and shell, so the colors land on the same words without shipping a grammar.

type SyntaxKind = "text" | "comment" | "punctuation" | "keyword" | "string" | "function" | "number" | "property";
type Lang = "ts" | "python" | "ruby" | "php" | "go" | "shell";
type Token = { text: string; kind: SyntaxKind };

const LANGUAGES: Record<string, Lang> = {
  typescript: "ts", ts: "ts", tsx: "ts", javascript: "ts", js: "ts", jsx: "ts", node: "ts",
  python: "python", py: "python",
  ruby: "ruby", rb: "ruby",
  php: "php",
  go: "go", golang: "go",
  curl: "shell", shell: "shell", shellscript: "shell", bash: "shell", sh: "shell", zsh: "shell", terminal: "shell",
};

const words = (list: string) => new Set(list.split(" "));
const KEYWORDS: Record<Lang, Set<string>> = {
  ts: words("import export from as default const let var function return await async if else for while do of in switch case break continue try catch finally throw class extends implements interface type enum yield static readonly public private protected declare namespace module abstract satisfies"),
  python: words("from import as def return if elif else for in while with class try except finally raise lambda pass yield global nonlocal break continue del assert async await"),
  ruby: words("require require_relative def end do if elsif else unless while until for in return class module begin rescue ensure raise yield then case when new"),
  php: words("require require_once include include_once use namespace new function fn return if else elseif foreach for while as class public private protected static echo try catch throw"),
  go: words("package import func return var const type struct interface map chan if else for range switch case default break continue go defer select"),
  shell: words("if then else elif fi for in do done while case esac function export"),
};
// Words the grammars file as operators (keyword.operator), which the theme draws as punctuation.
const OPERATOR_WORDS: Partial<Record<Lang, Set<string>>> = { ts: words("new typeof instanceof delete void keyof of"), python: words("and or not is") };
const CONSTANTS = words("true false null undefined NaN Infinity None True False nil iota");
// Built-in classes the grammar names as support classes, drawn as plain text even when called.
const JS_CLASSES = words("Promise Map Set Date Error URL Array Object JSON Math Number String Boolean RegExp");
const TS_TYPES = words("string number boolean any unknown never object bigint symbol");
const GO_TYPES = words("string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64 bool byte rune error any");
const PY_BUILTINS = words("print len range open dict list str int float bool set tuple type isinstance enumerate zip sorted sum min max any all map filter repr");
const RUBY_FUNCTIONS = words("puts print p pp require_relative");

/** The opening quote a line leaves unclosed, so the string carries to the next line (shell JSON bodies, template literals). */
type State = { open?: string; continued?: boolean };

const SCAN = /\s+|\/\/.*|\/\*.*?(?:\*\/|$)|#.*|"""|'''|"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|`(?:\\.|[^`\\])*`?|\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?|[A-Za-z_$][\w$]*|\.\.\.|::|->|=>|:=|\?\?|\?\.|[^\s\w]/gy;
// A shell word: anything up to a space, quote or operator.
const SHELL_WORD = /[^\s'"`|&;<>()\\]+/y;

function isComment(token: string, lang: Lang, line: string, at: number) {
  if (token.startsWith("//") || token.startsWith("/*")) return lang === "ts" || lang === "php" || lang === "go";
  if (token.startsWith("#")) return lang === "python" || lang === "ruby" || lang === "php" || (lang === "shell" && (at === 0 || /\s/.test(line[at - 1])));
  return false;
}

function tokenizeLine(line: string, lang: Lang, state: State): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  if (state.open) {
    const close = line.indexOf(state.open);
    if (close === -1) return [{ text: line, kind: "string" }];
    i = close + state.open.length;
    tokens.push({ text: line.slice(0, i), kind: "string" });
    state.open = undefined;
  }
  // Shell: the first word of a command is the command; a line after a trailing backslash continues the last one.
  let commandNext = lang === "shell" && !state.continued;
  const significant = () => tokens.filter((t) => !/^\s+$/.test(t.text));
  while (i < line.length) {
    SCAN.lastIndex = i;
    const match = SCAN.exec(line);
    let text = match ? match[0] : line[i];
    if (lang === "shell" && !/^(\s|["'`#\\|&;<>()])/.test(line[i])) {
      SHELL_WORD.lastIndex = i;
      text = SHELL_WORD.exec(line)?.[0] ?? text;
    }
    let kind: SyntaxKind = "text";
    const at = i;
    if (/^\s+$/.test(text)) kind = "text";
    else if ((text.startsWith("//") || text.startsWith("/*") || text.startsWith("#")) && isComment(text, lang, line, at)) kind = "comment";
    else if ((text.startsWith("//") || text.startsWith("/*") || text.startsWith("#")) && text.length > 1) {
      text = text[0];
      kind = "punctuation";
    } else if (text === '"""' || text === "'''") {
      const close = line.indexOf(text, at + 3);
      if (lang === "python" && close === -1) state.open = text;
      text = close === -1 ? line.slice(at) : line.slice(at, close + 3);
      kind = "string";
    } else if (/^["'`]/.test(text)) {
      const quote = text[0];
      const closed = text.length > 1 && text.endsWith(quote) && !text.endsWith(`\\${quote}`);
      if (!closed && (lang === "shell" || quote === "`")) state.open = quote;
      kind = "string";
    } else if (/^\d/.test(text)) kind = "number";
    else if (text === "=>" && lang === "ts") kind = "keyword";
    else if (/^[A-Za-z_$]/.test(text) || (lang === "shell" && !/^[|&;<>()\\]/.test(text))) kind = classifyWord(text, lang, line, at + text.length, significant(), commandNext);
    else kind = text === "\\" && lang === "shell" ? "text" : "punctuation";
    // After a pipe, `&&` or `;` the next word is a command again.
    if (lang === "shell" && kind !== "text" && kind !== "comment") commandNext = kind === "punctuation" && /^[&|;]$/.test(text);
    if (lang === "php" && text.startsWith("$") && text.length > 1) {
      tokens.push({ text: "$", kind: "punctuation" }, { text: text.slice(1), kind: "text" });
    } else tokens.push({ text, kind });
    i = at + text.length;
  }
  state.continued = lang === "shell" && /\\\s*$/.test(line);
  return tokens;
}

function classifyWord(word: string, lang: Lang, line: string, end: number, before: Token[], commandNext: boolean): SyntaxKind {
  const rest = line.slice(end);
  const next = rest.trimStart()[0] ?? "";
  const prev = before[before.length - 1]?.text ?? "";
  const prevWord = before[before.length - 1]?.kind === "keyword" ? prev : "";
  if (lang === "shell") {
    if (KEYWORDS.shell.has(word)) return "keyword";
    if (commandNext) return "function";
    // Bare arguments (flags, URLs, paths) read as strings, the way the shell grammar scopes them.
    return word.startsWith("$") ? "text" : "string";
  }
  if (OPERATOR_WORDS[lang]?.has(word)) return "punctuation";
  if (lang === "ruby" && prev === "." && word === "new") return "keyword";
  const isKey = rest.startsWith(":") && !rest.startsWith("::") && !rest.startsWith(":=");
  if (KEYWORDS[lang].has(word) && prev !== "." && prev !== "->" && prev !== "?." && !(lang === "ts" && isKey) && !(lang === "go" && isKey)) return "keyword";
  if (CONSTANTS.has(word)) return "number";
  switch (lang) {
    case "ts": {
      if (prevWord === "class" || prevWord === "interface" || prevWord === "type" || prevWord === "enum" || prevWord === "extends" || prevWord === "implements") return "number";
      if (prevWord === "function" || (next === "(" && !JS_CLASSES.has(word))) return "function";
      if (prev === ":" && TS_TYPES.has(word)) return "number";
      // The last link of a member chain is a property (`page.markdown.data`); `length` is the grammar's own support name.
      if ((prev === "." || prev === "?.") && !/^(?:\?\.[A-Za-z_$(]|[.(])/.test(rest) && word !== "length") return "property";
      return "text";
    }
    case "python":
      if (prevWord === "def") return "function";
      if (prevWord === "class") return "number";
      if (next === "(" && PY_BUILTINS.has(word) && prev !== ".") return "function";
      return "text";
    case "ruby":
      // Hash keys and symbols are constants in the Ruby grammar.
      if (rest.startsWith(":") && !rest.startsWith("::")) return "number";
      if (line[end - word.length - 1] === ":" && line[end - word.length - 2] !== ":") return "number";
      if (prev === ".") return "function";
      if (prevWord === "def") return "function";
      if (RUBY_FUNCTIONS.has(word)) return "function";
      return "text";
    case "php":
      if (prev === "(" && next === ")" && /^(string|int|float|bool|array|object)$/.test(word)) return "keyword";
      if (prev === "->" || prev === "::") return next === "(" ? "function" : "property";
      if (prevWord === "new" || prevWord === "use" || prevWord === "namespace") return "text";
      if (next === "(" && !word.startsWith("$")) return "function";
      return "text";
    case "go":
      if (prevWord === "package" || prevWord === "type") return "number";
      if (isKey) return "property";
      if (next === "(") return "function";
      // A qualified composite type, such as contextdev.WebScrapeParams{...}: both halves are the type.
      if (/^\.[A-Za-z_]\w*\s*\{/.test(rest) || (prev === "." && next === "{")) return "number";
      if (GO_TYPES.has(word) && prev !== ".") return prev === "[" && before[before.length - 2]?.text === "map" ? "keyword" : "number";
      return "text";
  }
  return "text";
}

function highlightCode(code: string, language?: string): Token[][] {
  const lang = (language && LANGUAGES[language.toLowerCase()]) || guessLanguage(code);
  const state: State = {};
  return code.split("\n").map((line) => tokenizeLine(line, lang, state));
}

function guessLanguage(code: string): Lang {
  if (/^\s*(\$\s|curl\s|npm\s|npx\s|pip\s|brew\s|git\s|#\s)/m.test(code) && !/^\s*(import|const|from)\s/m.test(code)) return "shell";
  if (/^\s*(from\s+\S+\s+import|def\s|print\()/m.test(code)) return "python";
  if (/^<\?php/.test(code)) return "php";
  if (/^package\s/m.test(code)) return "go";
  return "ts";
}

const SYNTAX_CLASS: Record<SyntaxKind, string | undefined> = {
  text: undefined,
  comment: "text-code-comment",
  punctuation: "text-code-punctuation",
  keyword: "text-code-keyword",
  string: "text-code-string",
  function: "text-code-function",
  number: "text-code-number",
  property: "text-code-property",
};

/** Code in the window's mono type (body-sm on a 22px line) in the site's syntax colors. `language` is the sample's
 * (typescript, python, ruby, php, go, curl or shell); without it the language is guessed from the code. */
function CodeBlock({ code, language, className }: { code: string; language?: string; className?: string }) {
  const lines = highlightCode(code, language);
  return (
    <pre data-slot="code-block" className={cn("p-5 font-mono text-body-sm leading-terminal text-code-text [tab-size:4]", className)}>
      <code>
        {lines.map((tokens, i) => (
          <span key={i} className="block min-h-lh whitespace-pre">
            {tokens.map((token, j) => (
              <span key={j} className={SYNTAX_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  );
}

// The chrome bar's small square buttons (the agent window's copy, open in): faint white, a soft white wash on hover.
const windowButtonClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-card text-white/45 outline-none transition-[background-color,color] duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 motion-reduce:transition-none [&_svg]:size-3.5";

// The code tabs' copy button: round, a step larger and brighter.
const roundWindowButtonClass =
  "flex size-8 shrink-0 items-center justify-center rounded-pill text-white/60 outline-none transition-[background-color,color] duration-150 ease-out hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none [&_svg]:size-4";

/** Copies a value from inside the dark window; the icon turns to a check for a moment. `round` is the code tabs' button. */
function WindowCopyButton({ value, label = "Copy code", round = false, className }: { value: string; label?: string; round?: boolean; className?: string }) {
  const { hasCopied, copy } = useCopy();
  return (
    <button type="button" onClick={() => copy(value)} aria-label={hasCopied ? "Copied" : label} className={cn(round ? roundWindowButtonClass : windowButtonClass, className)}>
      {hasCopied ? <Check aria-hidden="true" strokeWidth={1.75} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
    </button>
  );
}

type TerminalWindowProps = { label?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string };

/** The dark window alone, for places that draw their own ring (or none). */
function TerminalWindow({ label, actions, children, className }: TerminalWindowProps) {
  return (
    <div data-slot="terminal-window" className={cn("min-w-0 overflow-hidden rounded-card bg-code text-left text-white", className)}>
      <div className="flex min-h-11 items-center gap-2 border-b border-white/10 px-4 py-2">
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-close" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-minimize" />
        <span aria-hidden="true" className="size-3 shrink-0 rounded-pill bg-window-zoom" />
        {label && <span className="ml-2 inline-flex min-w-0 items-center gap-1.5 truncate rounded-card bg-white/10 px-2.5 py-1 font-mono text-caption font-medium text-white">{label}</span>}
        {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/** The dark window in the soft blue ring. The ring's radius repeats the window's, so both corners share one curve. */
function CodeWindow({ className, windowClassName, ...props }: TerminalWindowProps & { windowClassName?: string }) {
  return (
    <div data-slot="code-window" className={cn("min-w-0 rounded-card bg-ring-tint p-2", className)}>
      <TerminalWindow className={windowClassName} {...props} />
    </div>
  );
}

export type CodeTabSample = {
  language: string;
  label?: string;
  code: string;
  filename?: string;
  /** The package install command for this language, for an InstallCommand beside the window; null when none is needed. */
  install?: string | null;
  /** Pre-highlighted markup (from the app's highlighter) shown in place of the built-in highlighting. */
  content?: React.ReactNode;
};

/**
 * The window with a row of language tabs under the chrome bar: the label shows the file, the round copy button copies
 * the tab that is showing. The code area holds a fixed 22rem and scrolls inside, so switching never resizes the window;
 * from lg up it grows to fill its column. Pass `language` and `onLanguageChange` to share one pick across windows (the
 * site keeps it for every code sample on the page).
 */
function CodeTabs({
  samples,
  defaultLanguage,
  language: languageProp,
  onLanguageChange,
  className,
}: {
  samples: CodeTabSample[];
  defaultLanguage?: string;
  language?: string;
  onLanguageChange?: (language: string) => void;
  className?: string;
}) {
  const baseId = React.useId();
  const [ownLanguage, setOwnLanguage] = React.useState(defaultLanguage ?? samples[0]?.language);
  const language = languageProp ?? ownLanguage;
  const active = samples.find((s) => s.language === language) ?? samples[0];
  const tabs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  if (!active) return null;

  const select = (next: string) => {
    setOwnLanguage(next);
    onLanguageChange?.(next);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = samples[(samples.indexOf(active) + step + samples.length) % samples.length];
    select(next.language);
    tabs.current[next.language]?.focus();
  };

  return (
    <CodeWindow
      className={cn("flex flex-col", className)}
      windowClassName="flex flex-1 flex-col"
      label={active.filename}
      actions={<WindowCopyButton round value={active.code} label={`Copy ${active.label ?? active.language} code`} />}
    >
      {samples.length > 1 && (
        <div role="tablist" aria-label="Code language" onKeyDown={onKeyDown} className="flex min-w-0 gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 [scrollbar-width:none]">
          {samples.map((sample) => {
            const selected = sample === active;
            return (
              <button
                key={sample.language}
                ref={(node) => {
                  tabs.current[sample.language] = node;
                }}
                id={`${baseId}-tab-${sample.language}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${sample.language}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(sample.language)}
                className={cn(
                  "shrink-0 rounded-pill px-3 py-1.5 text-body-sm leading-snug outline-none transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white motion-reduce:transition-none",
                  selected ? "bg-white/10 text-white" : "text-white/55 hover:text-white",
                )}
              >
                {sample.label ?? sample.language}
              </button>
            );
          })}
        </div>
      )}
      <div className="relative h-88 lg:h-auto lg:min-h-88 lg:flex-1">
        {samples.map((sample) => (
          <div
            key={sample.language}
            id={`${baseId}-panel-${sample.language}`}
            role={samples.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={samples.length > 1 ? `${baseId}-tab-${sample.language}` : undefined}
            tabIndex={0}
            hidden={sample !== active}
            className="absolute inset-0 overflow-auto outline-none [scrollbar-color:color-mix(in_srgb,var(--ds-color-white)_20%,transparent)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand [&_pre]:bg-transparent"
          >
            {sample.content ? <div className="p-5 font-mono text-body-sm leading-terminal text-code-text">{sample.content}</div> : <CodeBlock code={sample.code} language={sample.language} />}
          </div>
        ))}
      </div>
    </CodeWindow>
  );
}

/**
 * The install command beside a code window, as a hairline pill on white: a faded `$`, the command scrolling inside,
 * and a round copy button that turns blue on hover. With no command it says the REST API needs none.
 */
function InstallCommand({ command, label = "install command", className }: { command?: string | null; label?: string; className?: string }) {
  const { hasCopied, copy } = useCopy();
  if (!command) {
    return <p className={cn("w-fit max-w-full rounded-pill px-4 py-2 text-body-sm text-fg/65 ring-1 ring-black/10 ring-inset", className)}>No install needed. Call the REST API directly.</p>;
  }
  return (
    <div data-slot="install-command" className={cn("flex w-fit max-w-full items-center gap-2 rounded-pill py-1 pr-1 pl-4 ring-1 ring-black/10 ring-inset", className)}>
      <code className="min-w-0 overflow-x-auto font-mono text-body-sm leading-5 whitespace-nowrap text-fg/70 [scrollbar-width:none]">
        <span aria-hidden="true" className="text-fg/35">
          ${" "}
        </span>
        {command}
      </code>
      <button
        type="button"
        onClick={() => copy(command)}
        aria-label={hasCopied ? `${label} copied` : `Copy ${label}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-pill text-fg/45 outline-none transition-colors duration-150 ease-out hover:bg-blue-10 hover:text-fg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring motion-reduce:transition-none"
      >
        {hasCopied ? <Check aria-hidden="true" className="size-4 text-fg-brand" /> : <Copy aria-hidden="true" className="size-4" />}
      </button>
    </div>
  );
}

export { CodeWindow, TerminalWindow, CodeBlock, CodeTabs, InstallCommand, WindowCopyButton, windowButtonClass };
