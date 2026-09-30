import type { ReactNode } from 'react';

export type AccordionProps = { items: { question: string; answer: ReactNode }[] };

export function Accordion({ items }: AccordionProps) {
	return (
		<div className="flex flex-col gap-2">
			{items.map((item) => (
				<div key={item.question} className="rounded-window bg-tint p-1">
					<details className="group rounded-card bg-surface">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-body font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
							{item.question}
							<span aria-hidden className="size-2.5 shrink-0 rounded-full border border-brand group-open:bg-brand" />
						</summary>
						<div className="px-5 pb-5 text-body text-fg-muted">{item.answer}</div>
					</details>
				</div>
			))}
		</div>
	);
}
