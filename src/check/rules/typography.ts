import { readFileSync } from 'node:fs';
import { pkgPath } from '../../lib/paths.js';
import type { Rule } from '../context.js';
import { elementText } from '../jsx.js';
import { elementName } from '../source.js';
import type { RawFinding } from '../types.js';
import { TAILWIND_TEXT_SIZES, TAILWIND_WEIGHTS, parseClass } from '../vocab.js';

export const fontFamilyFromTokens: Rule = {
	id: 'font-family-from-tokens',
	description: 'Font family, weight and size come from the type tokens.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const sizes = [...vocab.textSizes].map((s) => `text-${s}`).join(', ');
		const weights = [...vocab.fontWeights].map((w) => `font-${w}`).join(', ');
		const families = [...vocab.fontFamilies].map((f) => `font-${f}`).join(', ');
		for (const token of file.classTokens) {
			const parsed = parseClass(token.value);
			const u = parsed.utility;
			if (u.startsWith('font-')) {
				const value = u.slice(5);
				if (parsed.arbitrary !== undefined) {
					if (/^var\(--ds-font/.test(parsed.arbitrary)) continue;
					out.push({ rule: 'font-family-from-tokens', message: `Arbitrary font \`${token.value}\``, hint: `Use ${families} and ${weights}`, offset: token.offset, length: token.value.length });
				} else if (TAILWIND_WEIGHTS.has(value) && !vocab.fontWeights.has(value)) {
					out.push({ rule: 'font-family-from-tokens', message: `Weight \`${token.value}\` is not in the type tokens`, hint: `Use ${weights}. Headers are medium (500), body regular (400). Emphasis is color, not weight.`, offset: token.offset, length: token.value.length });
				} else if (!TAILWIND_WEIGHTS.has(value) && !vocab.fontWeights.has(value) && !vocab.fontFamilies.has(value) && /^[a-z]+$/.test(value)) {
					out.push({ rule: 'font-family-from-tokens', message: `Font \`${token.value}\` is not in the type tokens`, hint: `Use ${families}`, offset: token.offset, length: token.value.length });
				}
			} else if (u.startsWith('text-')) {
				const value = u.slice(5).split('/')[0];
				if (parsed.arbitrary !== undefined) {
					if (/^-?[\d.]+(px|rem|em)$/.test(parsed.arbitrary) || /^(length|size):/.test(parsed.arbitrary)) out.push({ rule: 'font-family-from-tokens', message: `Arbitrary text size \`${token.value}\``, hint: `Use ${sizes}`, offset: token.offset, length: token.value.length });
				} else if (TAILWIND_TEXT_SIZES.has(value)) {
					out.push({ rule: 'font-family-from-tokens', message: `Text size \`${token.value}\` is not in the type scale`, hint: `Use ${sizes}`, offset: token.offset, length: token.value.length });
				}
			} else if (u.startsWith('tracking-') && u !== 'tracking-normal') {
				out.push({ rule: 'font-family-from-tokens', message: `Letter spacing \`${token.value}\``, hint: 'The brand sets letter-spacing to 0 everywhere. Remove it.', offset: token.offset, length: token.value.length });
			}
		}
		const FIGURE = /^[\s$€£+~<>≈#-]*\d[\d.,:%$+\-x×/\s]*(?:[a-zA-Z]{1,2}|%)?\+?$/;
		const LARGE = new Set(['display-xl', 'display', 'h1', 'h2', 'stat']);
		const NO_DOTO_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'Button', 'a', 'label', 'p', 'li']);
		for (const el of file.jsxElements) {
			const tokens = file.classTokens.filter((t) => t.element === el).map((t) => t.value.split(':').pop() ?? '');
			const hasDoto = tokens.includes('font-data');
			const text = elementText(el).replace(/\u0000/g, '').trim();
			if (!text) continue;
			const name = elementName(el);
			if (hasDoto && (/[A-Za-z]{3,}/.test(text) || (NO_DOTO_TAGS.has(name) && !FIGURE.test(text)))) {
				out.push({ rule: 'font-family-from-tokens', message: `Doto on words: "${text.slice(0, 40)}"`, hint: 'Doto is only for figures (stats, counts, step numbers, chart values). Use font-sans for words.', offset: el.start });
			}
			const large = tokens.some((t) => LARGE.has(t.replace(/^text-/, '')) && t.startsWith('text-'));
			if (!hasDoto && large && FIGURE.test(text) && text.length <= 14) {
				out.push({ rule: 'font-family-from-tokens', message: `Large figure "${text}" is not in Doto`, hint: 'Figures shown large use Doto: give the element font-data (var(--ds-font-data)). Registry pages can use <Stat> or <CreditsDotNumber>.', offset: el.start });
			}
		}
		for (const s of file.strings) {
			if (s.context === 'style' && s.styleKey && /^font(Family|Size|Weight)$|^letterSpacing$/.test(s.styleKey) && !/var\(--ds-/.test(s.value)) {
				out.push({ rule: 'font-family-from-tokens', message: `Inline ${s.styleKey} \`${s.value}\``, hint: `Use ${families}, ${sizes}, ${weights}`, offset: s.offset, length: s.value.length });
			}
		}
		if (file.kind === 'css') {
			// The brand sets no tracking (Tailwind's tracking-normal): letter-spacing other than 0 or normal is off-brand.
			for (const m of file.text.matchAll(/letter-spacing\s*:\s*([^;{}]+);/g)) {
				if (/^(0|0em|0px|normal|inherit)$|var\(--ds-/.test(m[1].trim())) continue;
				out.push({ rule: 'font-family-from-tokens', message: `Raw \`letter-spacing: ${m[1].trim()}\``, hint: 'The brand uses no tracking: remove it (letter-spacing: normal)', offset: m.index ?? 0 });
			}
			for (const m of file.text.matchAll(/(font-family|font-size|font-weight|font)\s*:\s*([^;{}]+);/g)) {
				if (/var\(--ds-|inherit|^\s*(var\(--font|--text)/.test(m[2])) continue;
				out.push({ rule: 'font-family-from-tokens', message: `Raw \`${m[1]}: ${m[2].trim()}\``, hint: cssFontHint(m[1], m[2].trim()), offset: m.index ?? 0 });
			}
		}
		return out;
	},
};

let textSizes: [string, number][] | undefined;
/** The brand's type sizes in rem, read from the built tokens: [var name, rem]. */
function brandTextSizes() {
	if (!textSizes) {
		const css = readFileSync(pkgPath('build', 'tokens.css'), 'utf8').split(/\n\}/)[0];
		textSizes = [...css.matchAll(/(--ds-text-[a-z0-9-]+):\s*([\d.]+)rem;/g)].map((m) => [m[1], Number(m[2])]);
	}
	return textSizes;
}

/** Names the one token to use for a raw font value, so the fix needs no lookup. */
export function cssFontHint(prop: string, value: string) {
	if (prop === 'font-size') {
		const px = value.match(/^([\d.]+)(px|rem|em)$/);
		const rem = px ? Number(px[1]) / (px[2] === 'px' ? 16 : 1) : undefined;
		const nearest = rem === undefined ? undefined : brandTextSizes().reduce((a, b) => (Math.abs(b[1] - rem) < Math.abs(a[1] - rem) ? b : a));
		return nearest ? `Use \`font-size: var(${nearest[0]})\` (${nearest[1]}rem), the nearest brand size, with \`line-height: var(${nearest[0]}-line-height)\`` : 'Use a brand size: font-size: var(--ds-text-<h1|h2|h3|h4|h5|body-lg|body|body-sm>)';
	}
	if (prop === 'font-weight') return Number(value) >= 500 || value === 'bold' ? 'Use `font-weight: var(--ds-font-weight-medium)` (500; the brand has no bold)' : 'Use `font-weight: var(--ds-font-weight-regular)`';
	return /mono|code/i.test(value) ? 'Use `font-family: var(--ds-font-mono)`' : 'Use `font-family: var(--ds-font-sans)` (Rethink Sans)';
}
