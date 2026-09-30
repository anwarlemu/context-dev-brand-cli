import type { Rule } from '../context.js';
import type { RawFinding } from '../types.js';
import { SPACING_PREFIXES, parseClass } from '../vocab.js';

const SPACING_STYLE = /^(padding|margin|gap|rowGap|columnGap|inset|top|right|bottom|left)(Top|Right|Bottom|Left|Inline|Block|InlineStart|InlineEnd|BlockStart|BlockEnd)?$/;
const SPACING_CSS = /^(padding|margin|gap|row-gap|column-gap|inset)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$/;
const toPx = (value: string) => {
	const m = value.trim().match(/^(-?[\d.]+)(px|rem)?$/);
	if (!m) return undefined;
	return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
};

function spacingPrefix(utility: string) {
	return [...SPACING_PREFIXES].sort((a, b) => b.length - a.length).find((p) => utility.startsWith(`${p}-`));
}

function nearestStep(px: number, spacing: Map<string, number>) {
	let best: [string, number] | undefined;
	for (const [step, value] of spacing) if (!best || Math.abs(value - px) < Math.abs(best[1] - px)) best = [step, value];
	return best;
}

export const noArbitrarySpacing: Rule = {
	id: 'no-arbitrary-spacing',
	description: 'Spacing uses the token scale. No arbitrary values, off-scale steps or inline spacing.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const scaleList = [...vocab.spacing.keys()].join(', ');
		for (const token of file.classTokens) {
			const parsed = parseClass(token.value);
			const prefix = spacingPrefix(parsed.utility);
			if (!prefix) continue;
			const value = parsed.utility.slice(prefix.length + 1);
			if (parsed.arbitrary !== undefined) {
				if (/^var\(--ds-space-/.test(parsed.arbitrary) || /^calc\(/.test(parsed.arbitrary)) continue;
				const px = toPx(parsed.arbitrary);
				const near = px !== undefined ? nearestStep(Math.abs(px), vocab.spacing) : undefined;
				const fixable = near && px !== undefined && Math.abs(near[1] - Math.abs(px)) <= 2;
				const replacement = fixable ? `${parsed.variants}${parsed.negative || (px ?? 0) < 0 ? '-' : ''}${prefix}-${near![0]}` : undefined;
				out.push({ rule: 'no-arbitrary-spacing', message: `Arbitrary spacing \`${token.value}\``, hint: replacement ? `Use \`${replacement}\`` : `Use a scale step: ${scaleList}`, offset: token.offset, length: token.value.length, fix: replacement ? { start: token.offset, end: token.offset + token.value.length, text: replacement } : undefined });
				continue;
			}
			if (['px', 'auto', 'full', 'screen'].includes(value) || /^\d+\/\d+$/.test(value)) continue;
			if (!/^[\d.]+$/.test(value)) continue;
			if (vocab.spacing.has(value)) continue;
			const near = nearestStep(parseFloat(value) * 4, vocab.spacing);
			out.push({ rule: 'no-arbitrary-spacing', message: `Off-scale spacing \`${token.value}\` (${parseFloat(value) * 4}px)`, hint: `Nearest scale step: \`${prefix}-${near?.[0]}\`. Scale: ${scaleList}`, offset: token.offset, length: token.value.length });
		}
		for (const s of file.strings) {
			if (s.context === 'style' && s.styleKey && SPACING_STYLE.test(s.styleKey) && !/var\(--ds-space/.test(s.value) && s.value.trim() !== '0') {
				out.push({ rule: 'no-arbitrary-spacing', message: `Inline spacing \`${s.styleKey}: ${s.value}\``, hint: 'Use spacing classes from the scale (p-4, gap-6) or var(--ds-space-*)', offset: s.offset, length: s.value.length });
			}
		}
		for (const el of file.jsxElements) {
			const style = el.openingElement?.attributes?.find((a: any) => a.name?.name === 'style');
			const props = style?.value?.expression?.properties ?? [];
			for (const p of props) {
				const key = p.key?.name ?? p.key?.value;
				if (key && SPACING_STYLE.test(key) && p.value?.type === 'NumericLiteral' && p.value.value !== 0) {
					out.push({ rule: 'no-arbitrary-spacing', message: `Inline spacing \`${key}: ${p.value.value}\``, hint: 'Use spacing classes from the scale (p-4, gap-6)', offset: p.start });
				}
			}
		}
		if (file.kind === 'css') {
			for (const m of file.text.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
				if (!SPACING_CSS.test(m[1]) || /var\(--ds-space/.test(m[2])) continue;
				if (m[2].split(/\s+/).every((v) => v === '0' || v === 'auto' || v === '0px')) continue;
				out.push({ rule: 'no-arbitrary-spacing', message: `Raw spacing \`${m[1]}: ${m[2].trim()}\``, hint: 'Use var(--ds-space-*)', offset: (m.index ?? 0) });
			}
		}
		return out;
	},
};

const RADIUS_SIDES = ['t', 'r', 'b', 'l', 'tl', 'tr', 'br', 'bl', 's', 'e', 'ss', 'se', 'es', 'ee'];

export const noOffScaleRadius: Rule = {
	id: 'no-off-scale-radius',
	description: 'Radius uses the token scale: none, sm, card, window, pill, full.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const allowed = new Set(['none', 'full', ...vocab.radii]);
		const list = [...allowed].map((r) => `rounded-${r}`).join(', ');
		for (const token of file.classTokens) {
			const parsed = parseClass(token.value);
			if (!/^rounded(-|$)/.test(parsed.utility)) continue;
			const parts = parsed.utility.split('-').slice(1);
			if (parts.length && RADIUS_SIDES.includes(parts[0])) parts.shift();
			const value = parts.join('-');
			if (parsed.arbitrary !== undefined ? /^var\(--ds-radius-/.test(parsed.arbitrary) : allowed.has(value)) continue;
			out.push({ rule: 'no-off-scale-radius', message: `Off-scale radius \`${token.value}\``, hint: `Use ${list}. Cards use rounded-card, buttons and chips rounded-pill.`, offset: token.offset, length: token.value.length });
		}
		for (const s of file.strings) {
			if (s.context === 'style' && s.styleKey && /radius/i.test(s.styleKey) && !/var\(--ds-radius/.test(s.value)) {
				out.push({ rule: 'no-off-scale-radius', message: `Inline radius \`${s.value}\``, hint: 'Use rounded-card, rounded-pill or var(--ds-radius-*)', offset: s.offset, length: s.value.length });
			}
		}
		if (file.kind === 'css') {
			for (const m of file.text.matchAll(/(border(?:-[a-z]+)*-radius)\s*:\s*([^;{}]+);/g)) {
				if (/var\(--ds-radius/.test(m[2]) || /^\s*0(px)?\s*$/.test(m[2])) continue;
				out.push({ rule: 'no-off-scale-radius', message: `Raw radius \`${m[1]}: ${m[2].trim()}\``, hint: 'Use var(--ds-radius-*)', offset: m.index ?? 0 });
			}
		}
		return out;
	},
};

export const noOffScaleMotion: Rule = {
	id: 'no-off-scale-motion',
	description: 'Durations and easings come from the motion tokens.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const durations = [...vocab.durations].filter((d) => d !== '0').map((d) => `duration-${d}`).join(', ');
		for (const token of file.classTokens) {
			const parsed = parseClass(token.value);
			if (parsed.utility.startsWith('duration-')) {
				const value = parsed.utility.slice(9);
				if (parsed.arbitrary === undefined && vocab.durations.has(value)) continue;
				out.push({ rule: 'no-off-scale-motion', message: `Off-scale duration \`${token.value}\``, hint: `Use ${durations}`, offset: token.offset, length: token.value.length });
			} else if (parsed.utility.startsWith('ease-')) {
				const value = parsed.utility.slice(5);
				if (parsed.arbitrary === undefined && vocab.easings.has(value)) continue;
				out.push({ rule: 'no-off-scale-motion', message: `Off-scale easing \`${token.value}\``, hint: `Use ${[...vocab.easings].map((e) => `ease-${e}`).join(', ')}`, offset: token.offset, length: token.value.length });
			}
		}
		const allowedMs = new Set([...vocab.durations].map(Number));
		const scan = (value: string, offset: number) => {
			for (const m of value.matchAll(/(\d*\.?\d+)(ms|s)\b/g)) {
				const ms = m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
				if (!allowedMs.has(ms)) out.push({ rule: 'no-off-scale-motion', message: `Off-scale duration \`${m[0]}\``, hint: `Use var(--ds-duration-*) or ${durations}`, offset: offset + (m.index ?? 0), length: m[0].length });
			}
			for (const m of value.matchAll(/cubic-bezier\([^)]*\)/g)) out.push({ rule: 'no-off-scale-motion', message: `Raw easing \`${m[0]}\``, hint: 'Use var(--ds-easing-*)', offset: offset + (m.index ?? 0), length: m[0].length });
		};
		for (const s of file.strings) if (s.context === 'style' && s.styleKey && /transition|animation|duration/i.test(s.styleKey)) scan(s.value, s.offset);
		if (file.kind === 'css') for (const m of file.text.matchAll(/((?:transition|animation)(?:-[a-z-]+)?)\s*:\s*([^;{}]+);/g)) if (!/var\(--ds-(duration|easing)/.test(m[2])) scan(m[2], (m.index ?? 0) + m[0].indexOf(m[2]));
		return out;
	},
};
