'use client';

import { Check, ChevronDown, Copy } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { AppBlock } from '@/components/ds/ui/app-block';
import { useCopy } from '@/components/ds/ui/app-copy-button';
import { SelectMenu } from '@/components/ds/ui/app-menu';
import { AppTooltip } from '@/components/ds/ui/app-tooltip';
import { cx } from '@/components/ds/ui/cx';

const TOKEN = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(--?[a-zA-Z][\w-]*|\b(?:curl|const|let|await|async|import|from|export|return|new|function|def|print)\b)|(\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)/g;

/** Strings in brand, flags and keywords in navy, numbers and booleans in a lighter blue; the rest stays fg. */
function highlight(line: string): ReactNode[] {
	const out: ReactNode[] = [];
	let last = 0;
	for (const m of line.matchAll(TOKEN)) {
		if (m.index > last) out.push(line.slice(last, m.index));
		out.push(<span key={m.index} className={m[1] ? 'text-accent' : m[2] ? 'text-navy-60' : 'text-blue-70'}>{m[0]}</span>);
		last = m.index + m[0].length;
	}
	out.push(line.slice(last));
	return out;
}

function AgentMark({ agent, code }: { agent: string; code: string }) {
	const { hasCopied, copy } = useCopy();
	return (
		<AppTooltip label={hasCopied ? `Copied, paste it into ${agent}` : `Copy for ${agent}`} side="top">
			<button type="button" aria-label={`Copy for ${agent}`} onClick={() => copy(code)} className="grid size-6 place-items-center rounded-control-sm outline-none transition-colors duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover">
				<span aria-hidden className="grid size-3.5 place-items-center rounded-sm bg-fg text-micro leading-none text-surface">{agent[0]}</span>
			</button>
		</AppTooltip>
	);
}

export type AppCodeCardProps = {
	/** One snippet per language, keyed by its label ("cURL", "TypeScript", "Python"). The first is shown first. */
	snippets: Record<string, string>;
	/** Lines shown while folded. Longer code folds with a fade and a "Show all N lines" toggle. */
	foldLines?: number;
	/** Agents the code can be copied for, shown as marks after "Open in". */
	agents?: string[];
	className?: string;
};

export function AppCodeCard({ snippets, foldLines = 5, agents = [], className }: AppCodeCardProps) {
	const languages = Object.keys(snippets);
	const [language, setLanguage] = useState(languages[0]);
	const [expanded, setExpanded] = useState(false);
	const { hasCopied, copy } = useCopy();
	const code = snippets[language] ?? '';
	const lines = code.split('\n');
	const folds = lines.length > foldLines;
	const folded = folds && !expanded;

	return (
		<AppBlock block="app-code-card" className={cx('@container flex min-h-0 flex-col rounded-window bg-surface text-fg shadow-card', className)}>
			<div className="relative min-h-0 flex-1">
				<pre className={cx('py-4 pr-12 pl-5 font-mono text-caption leading-relaxed', folded && 'max-h-32 overflow-hidden')}>
					{lines.map((line, index) => (
						<span key={index} className="block min-h-5 wrap-anywhere whitespace-pre-wrap">
							{highlight(line)}
						</span>
					))}
				</pre>
				{folded && <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-surface to-transparent" />}
				<AppTooltip label={hasCopied ? 'Copied' : 'Copy code'} side="top" className="absolute top-2.5 right-2.5">
					<button type="button" aria-label="Copy code" onClick={() => copy(code)} className={cx('grid size-8 place-items-center rounded-control outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-wash/4 focus-visible:shadow-ring-hover active:scale-97 motion-reduce:active:scale-100', hasCopied ? 'text-success' : 'text-fg-subtle hover:text-fg')}>
						{hasCopied ? <Check className="size-3.5" strokeWidth={1.75} /> : <Copy className="size-3.5" strokeWidth={1.5} />}
					</button>
				</AppTooltip>
			</div>
			<div className="flex h-11 shrink-0 items-center gap-3 border-t border-line-subtle pr-3 pl-2 text-caption whitespace-nowrap text-fg-subtle">
				{languages.length > 1 ? <SelectMenu label="Language" appearance="chip" gap="lg" opens="up" value={language} onChange={setLanguage} options={languages.map((l) => ({ value: l, label: l }))} /> : <span className="pl-2">{language}</span>}
				{folds && (
					<button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 rounded-control-sm outline-none transition-colors duration-150 ease-out hover:text-fg focus-visible:shadow-ring-hover">
						<ChevronDown className={cx('size-3.5 transition-transform duration-200 ease-emphasized', expanded && 'rotate-180')} strokeWidth={1.5} />
						{expanded ? 'Show less' : `Show all ${lines.length} lines`}
					</button>
				)}
				{agents.length > 0 && (
					<div className="ml-auto flex items-center gap-1">
						<span className="mr-1 hidden @md:inline">Open in</span>
						{agents.map((agent) => (
							<AgentMark key={agent} agent={agent} code={code} />
						))}
					</div>
				)}
			</div>
		</AppBlock>
	);
}
