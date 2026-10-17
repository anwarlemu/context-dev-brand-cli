// Docs text from the registry's frontmatter: `backticked` names become inline code.
export function Prose({ text }: { text: string }) {
  return (
    <>
      {Array.from(text.matchAll(/`[^`]+`|[^`]+|`/g), (match) =>
        match[0].length > 1 && match[0].startsWith("`") && match[0].endsWith("`") ? (
          <code key={`code:${match.index}`} className="rounded-sm bg-subtle px-1 py-px font-mono text-[0.9em] text-fg">
            {match[0].slice(1, -1)}
          </code>
        ) : (
          match[0]
        ),
      )}
    </>
  );
}
