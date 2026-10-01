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
				out.push({ rule: 'font-family-from-tokens', message: `Large figure "${text}" is not in Doto`, hint: 'Figures shown large use Doto: <Stat value=... label=... />, <CreditsDotNumber value=... />, or font-data.', offset: el.start });
			}
		}
		for (const s of file.strings) {
			if (s.context === 'style' && s.styleKey && /^font(Family|Size|Weight)$|^letterSpacing$/.test(s.styleKey) && !/var\(--ds-/.test(s.value)) {
				out.push({ rule: 'font-family-from-tokens', message: `Inline ${s.styleKey} \`${s.value}\``, hint: `Use ${families}, ${sizes}, ${weights}`, offset: s.offset, length: s.value.length });
			}
		}
		if (file.kind === 'css') {
			for (const m of file.text.matchAll(/(font-family|font-size|font-weight|font)\s*:\s*([^;{}]+);/g)) {
				if (/var\(--ds-|inherit|^\s*(var\(--font|--text)/.test(m[2])) continue;
				out.push({ rule: 'font-family-from-tokens', message: `Raw \`${m[1]}: ${m[2].trim()}\``, hint: 'Use var(--ds-font-*) or the text-* utilities', offset: m.index ?? 0 });
			}
		}
		return out;
	},
};
