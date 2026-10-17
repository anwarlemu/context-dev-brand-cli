import { cn } from "@/lib/utils";

// The brand's mark (the square and the circle), as the site draws it; it takes the text color.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 772.32 531.2" aria-hidden="true" className={cn("h-5 w-auto text-fg-brand", className)}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M287.56,0H745.26A27.06,27.06,0,0,1,772.32,27.06V484.77A27.06,27.06,0,0,1,745.26,511.83H284.51A24.01,24.01,0,0,1,260.5,487.82V27.06A27.06,27.06,0,0,1,287.56,0ZM260.5,358.28a153.55,153.55,0,1,0,307.1,0a153.55,153.55,0,1,0,-307.1,0Z"
      />
      <circle cx="153.55" cy="377.64" r="153.55" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-1.5 text-h5 leading-none font-medium tracking-tight whitespace-nowrap", className)}>
      {name}
      <span className="font-mono text-caption font-normal tracking-normal text-fg-subtle">ds</span>
    </span>
  );
}
