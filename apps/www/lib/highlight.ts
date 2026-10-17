import { codeToHtml } from "shiki";

export function highlight(code: string, lang: "tsx" | "bash" = "tsx") {
  return codeToHtml(code.trim(), { lang, theme: "github-light" });
}
