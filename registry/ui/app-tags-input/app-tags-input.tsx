'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { cx } from '@/components/ds/ui/cx';

const TAG_VALID = 'bg-blue-10 text-accent';
const TAG_INVALID = 'bg-danger/8 text-danger';

export type AppTagsInputProps = {
	id: string;
	tags: string[];
	onChange: (tags: string[]) => void;
	placeholder: string;
	isTagInvalid?: (tag: string) => boolean;
	/** Drops the field's own border, for a tags input set inside a container that draws one. */
	bare?: boolean;
};

/** A field that turns what is typed into tags: comma or Enter commits, a pasted list splits, Backspace removes the last. */
export function AppTagsInput({ id, tags, onChange, placeholder, isTagInvalid, bare = false }: AppTagsInputProps) {
	const [draft, setDraft] = useState('');

	function commit(value: string) {
		const tag = value.trim().replace(/,$/, '');
		if (tag && !tags.includes(tag)) onChange([...tags, tag]);
		setDraft('');
	}

	return (
		<div
			className={cx(
				'flex min-h-10 w-full flex-wrap items-center gap-1.5 px-2 py-1.5',
				!bare && 'rounded-control border border-line bg-surface transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-brand hover:border-line-strong',
			)}
		>
			{tags.map((tag) => (
				<span
					key={tag}
					className={cx('flex h-6 items-center gap-1 rounded-control-sm pr-1 pl-2.5 text-caption', isTagInvalid?.(tag) ? TAG_INVALID : TAG_VALID)}
				>
					{tag}
					<button
						type="button"
						aria-label={`Remove ${tag}`}
						onClick={() => onChange(tags.filter((existing) => existing !== tag))}
						className="grid size-4 place-items-center rounded-sm outline-none transition-colors duration-150 ease-out hover:bg-brand hover:text-on-brand focus-visible:shadow-ring-hover"
					>
						<X className="size-3" strokeWidth={1.75} />
					</button>
				</span>
			))}
			<input
				id={id}
				value={draft}
				onChange={(event) => {
					if (event.target.value.endsWith(',')) commit(event.target.value);
					else setDraft(event.target.value);
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						commit(draft);
					}
					if (event.key === 'Backspace' && !draft && tags.length > 0) onChange(tags.slice(0, -1));
				}}
				onPaste={(event) => {
					const pasted = event.clipboardData.getData('text').split(/[,\s]+/).map((part) => part.trim()).filter(Boolean);
					if (pasted.length < 2) return;
					event.preventDefault();
					onChange(Array.from(new Set([...tags, ...pasted])));
					setDraft('');
				}}
				onBlur={() => draft && commit(draft)}
				placeholder={tags.length === 0 ? placeholder : ''}
				className="h-7 min-w-24 flex-1 bg-transparent px-1.5 text-body-sm text-fg outline-none placeholder:text-fg-subtle"
			/>
		</div>
	);
}
