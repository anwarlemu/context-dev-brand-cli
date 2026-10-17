import { CodeBlock, CodeWindow, WindowCopyButton } from "@/components/site/code-window";
import { cn } from "@/lib/utils";

// Code in the brand's own window: near black in the soft blue ring, the brand's light highlighting (never a full syntax
// theme), a copy button in the chrome. Long files scroll inside a fixed height.
export function Code({ code, title, tall = false, className }: { code: string; title?: string; tall?: boolean; className?: string }) {
  const text = code.trim();
  return (
    <CodeWindow label={title} actions={<WindowCopyButton value={text} />} className={className}>
      <div className={cn("overflow-auto [scrollbar-color:var(--ds-color-neutral-70)_transparent]", tall ? "max-h-140" : "max-h-96")}>
        <CodeBlock code={text} className="w-max min-w-full" />
      </div>
    </CodeWindow>
  );
}
