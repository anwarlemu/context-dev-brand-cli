import { BRITISH_TO_AMERICAN } from '../../lib/voice.js';
import type { Rule } from '../context.js';
import { elementText } from '../jsx.js';
import { elementName, literalAttr, type Node } from '../source.js';
import type { RawFinding } from '../types.js';

type Kind = 'headline' | 'sub' | 'button' | 'body';
const HEADLINE_TAGS = new Set(['h1', 'h2']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const BUTTON_TAGS = new Set(['button', 'Button']);
const ATTR_KIND: Record<string, Kind> = { headline: 'headline', title: 'headline', heading: 'headline', sub: 'sub', subheadline: 'sub', description: 'sub', lede: 'sub', label: 'body', cta: 'button', ctaLabel: 'button', eyebrow: 'body', body: 'body', quote: 'body', placeholder: 'body', alt: 'body', caption: 'body', highlight: 'body' };
const OBJECT_KEY_KIND: Record<string, Kind> = { label: 'button', title: 'headline', headline: 'headline', description: 'sub', sub: 'sub', body: 'body', question: 'body', answer: 'body', quote: 'body', name: 'body' };

const words = (text: string) => text.replace(/\u0000/g, ' ').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const copyRules: Rule = {
	id: 'copy-rules',
	description: 'Copy follows voice.md: banned words and characters, word limits, casing, spelling, product name.',
	run({ file, voice }) {
		const out: RawFinding[] = [];
		const banned = voice.banned_words.map((w) => ({ word: w, re: new RegExp(`(?<![\\p{L}\\p{N}-])${escape(w)}(?![\\p{L}\\p{N}-])`, 'giu') }));
		const proper = new Set(voice.proper_nouns.flatMap((p) => p.split(' ')));
		const limits: Record<Kind, number | undefined> = { headline: voice.headline_max_words, sub: voice.sub_max_words, button: voice.button_max_words, body: undefined };

		const content = (text: string, offset: number, where: string) => {
			for (const ch of voice.banned_chars) {
				let idx = text.indexOf(ch);
				while (idx >= 0) {
					const spaced = text[idx - 1] === ' ' && text[idx + 1] === ' ';
					out.push({ rule: 'copy-rules', message: `Banned character ${ch === '\u2014' ? 'em dash' : `\`${ch}\``} in ${where}`, hint: 'Use a comma, colon or full stop', offset: offset + idx, length: 1, fix: ch === '\u2014' ? { start: offset + idx - (spaced ? 1 : 0), end: offset + idx + 1 + (spaced ? 1 : 0), text: spaced ? ', ' : ', ' } : undefined });
					idx = text.indexOf(ch, idx + 1);
				}
			}
			for (const { word, re } of banned) for (const m of text.matchAll(re)) out.push({ rule: 'copy-rules', message: `Banned word "${m[0]}" in ${where}`, hint: `voice.md bans "${word}". Say what it does in plain verbs.`, offset: offset + (m.index ?? 0), length: m[0].length });
			for (const wrong of voice.product_name_wrong) for (const m of text.matchAll(new RegExp(`(?<![\\w.])${escape(wrong)}(?![\\w])`, 'g'))) out.push({ rule: 'copy-rules', message: `Product name written "${m[0]}"`, hint: `Write "${voice.product_name}"`, offset: offset + (m.index ?? 0), length: m[0].length, fix: { start: offset + (m.index ?? 0), end: offset + (m.index ?? 0) + m[0].length, text: voice.product_name } });
			if (voice.spelling === 'american') {
				for (const m of text.matchAll(/[\p{L}]+/gu)) {
					const us = BRITISH_TO_AMERICAN[m[0].toLowerCase()];
					if (us) out.push({ rule: 'copy-rules', message: `British spelling "${m[0]}"`, hint: `Write "${us}"`, offset: offset + (m.index ?? 0), length: m[0].length });
				}
			}
			if (voice.announcement_label && /^(New feature:|NEW\b|New!|New -)/.test(text.trim()) && !text.trim().startsWith(voice.announcement_label)) {
				out.push({ rule: 'copy-rules', message: `Announcement label "${text.trim().split(/\s+/)[0]}"`, hint: `Start announcements with "${voice.announcement_label}"`, offset, length: text.length });
			}
		};

		const shape = (text: string, offset: number, kind: Kind | 'heading', where: string) => {
			const limit = kind === 'heading' ? undefined : limits[kind];
			const count = words(text).length;
			if (limit && count > limit) out.push({ rule: 'copy-rules', message: `${kind === 'button' ? 'Button label' : kind === 'sub' ? 'Subheadline' : 'Headline'} in ${where} is ${count} words, limit ${limit}`, hint: 'Cut it. One idea, plain verbs.', offset, length: 1 });
			if ((kind === 'headline' || kind === 'heading' || kind === 'button') && voice.heading_case === 'sentence') {
				const ws = text.replace(/\u0000/g, ' ').split(/\s+/).filter(Boolean);
				const offenders = ws.slice(1).filter((w, i) => {
					const clean = w.replace(/^[^\p{L}]+|[^\p{L}\p{N}.]+$/gu, '').replace(/\.$/, '');
					if (!clean || !/^\p{Lu}/u.test(clean) || proper.has(clean) || proper.has(clean.split('-')[0]) || /^\p{Lu}{2,}/u.test(clean) || /\.\p{L}/u.test(clean)) return false;
					return !/[.:!?]$/.test(ws[i]);
				});
				if (offenders.length) out.push({ rule: 'copy-rules', message: `Title Case in ${where}: ${offenders.slice(0, 3).map((w) => `"${w}"`).join(', ')}`, hint: 'Sentence case: capitalize only the first word and proper nouns (voice.md proper_nouns)', offset, length: 1 });
			}
		};

		for (const el of file.jsxElements) {
			const name = elementName(el);
			const dataCopy = literalAttr(el, 'data-copy');
			let kind: Kind | 'heading' | undefined = dataCopy === 'headline' || dataCopy === 'sub' || dataCopy === 'button' ? dataCopy : undefined;
			if (!kind && HEADLINE_TAGS.has(name)) kind = 'headline';
			else if (!kind && BUTTON_TAGS.has(name)) kind = 'button';
			else if (!kind && HEADING_TAGS.has(name)) kind = 'heading';
			if (!kind) continue;
			const text = elementText(el);
			if (!text.replace(/\u0000/g, '').trim()) continue;
			const firstText = (el.children ?? []).find((c: Node) => c.type === 'JSXText' && c.value.trim());
			const offset = firstText ? firstText.start + (firstText.value.length - firstText.value.trimStart().length) : el.start;
			shape(text, offset, kind, `<${name}>`);
		}

		for (const s of file.strings) {
			if (s.context === 'jsx-text') {
				content(s.value, s.offset, 'text');
				continue;
			}
			if (s.context === 'jsx-attr') {
				if (!s.attr || s.attr === 'className' || s.attr.startsWith('data-') || ['href', 'id', 'variant', 'src', 'key', 'size', 'type', 'name', 'as', 'target', 'rel'].includes(s.attr)) continue;
				const kind = (s.styleKey ? OBJECT_KEY_KIND[s.styleKey] : undefined) ?? ATTR_KIND[s.attr] ?? (s.attr.startsWith('aria-') ? 'body' : undefined);
				if (!kind) continue;
				const where = s.styleKey ? `${s.attr}.${s.styleKey}` : s.attr;
				content(s.value, s.offset, where);
				if (kind !== 'body') shape(s.value, s.offset, kind, where);
				continue;
			}
			if (s.context === 'code' && / /.test(s.value) && /\p{L}{2,}/u.test(s.value) && !/^[./@]|\b(import|from|https?:)/.test(s.value)) content(s.value, s.offset, 'string');
		}

		if (file.kind === 'markdown') {
			let inFence = false;
			let inFront = file.text.startsWith('---');
			let offset = 0;
			file.text.split('\n').forEach((line, i) => {
				const trimmed = line.trim();
				if (i > 0 && inFront && trimmed === '---') inFront = false;
				else if (trimmed.startsWith('```')) inFence = !inFence;
				else if (!inFence && !inFront && trimmed) {
					const heading = line.match(/^(#{1,2})\s+(.*)$/);
					if (heading) {
						content(heading[2], offset + line.indexOf(heading[2]), 'heading');
						shape(heading[2], offset + line.indexOf(heading[2]), 'headline', 'heading');
					}
					else content(line.replace(/`[^`]*`/g, (m) => ' '.repeat(m.length)), offset, 'text');
				}
				offset += line.length + 1;
			});
		}
		return out;
	},
};
