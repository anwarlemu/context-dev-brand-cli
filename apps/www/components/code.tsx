import { highlight } from "@www/lib/highlight";

export async function Code({ code, lang = "tsx", title }: { code: string; lang?: "tsx" | "bash"; title?: string }) {
  const html = await highlight(code, lang);
  return (
    <div className="overflow-hidden rounded-card border border-line bg-subtle">
      {title && <div className="border-b border-line-subtle px-4 py-2 font-mono text-caption text-fg-subtle">{title}</div>}
      <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
