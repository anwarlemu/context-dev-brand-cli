import { loadConfig } from '../../lib/config.js';
import type { Rule } from '../context.js';
import type { RawFinding } from '../types.js';
import { COLOR_PREFIXES, CSS_NAMED_COLORS, RAW_COLOR_RE, TAILWIND_PALETTE, expandHex, parseClass } from '../vocab.js';

const SKIP_ATTRS = new Set(['href', 'to', 'id', 'key', 'src', 'htmlFor', 'name', 'type', 'd', 'viewBox', 'points']);
const COLOR_STYLE_KEY = /color|background|fill|stroke|border|outline|shadow/i;
const COLOR_CSS_PROP = /^(color|background|background-color|border(-[a-z]+)?-color|border|outline(-color)?|fill|stroke|box-shadow|text-decoration-color|caret-color|accent-color)$/;

const NON_COLOR: Record<string, RegExp> = {
	text: /^(left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|xs|sm|base|lg|xl|\d?xl)$/,
	bg: /^(fixed|local|scroll|clip-.+|origin-.+|bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top|repeat|no-repeat|repeat-.+|auto|cover|contain|none|blend-.+|linear-.+|radial.*|conic.*|gradient-.+|size-.+|position-.+|top-.+|bottom-.+)$/,
	border: /^(x|y|t|r|b|l|s|e|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing-.+|[xytrblse]-\d+)$/,
	'border-x': /^(solid|dashed|dotted|double|none)$/, 'border-y': /^(solid|dashed|dotted|double|none)$/, 'border-t': /^(solid|dashed|dotted|double|none)$/, 'border-r': /^(solid|dashed|dotted|double|none)$/, 'border-b': /^(solid|dashed|dotted|double|none)$/, 'border-l': /^(solid|dashed|dotted|double|none)$/,
	ring: /^(inset|offset-.+)$/,
	'ring-offset': /^$/,
	outline: /^(none|hidden|dashed|dotted|double|solid|offset-.+)$/,
	fill: /^(none)$/,
	stroke: /^(none)$/,
	shadow: /^(2xs|xs|sm|md|lg|xl|2xl|none|inner)$/,
	'inset-shadow': /^(2xs|xs|sm|none)$/,
	'inset-ring': /^$/,
	decoration: /^(solid|double|dotted|dashed|wavy|auto|from-font|clone|slice)$/,
	divide: /^(x|y|x-reverse|y-reverse|solid|dashed|dotted|double|none)$/,
	accent: /^(auto)$/,
	caret: /^$/, placeholder: /^$/, from: /^$/, via: /^$/, to: /^$/,
};

function isNonColorValue(prefix: string, value: string, textSizes: Set<string>) {
	if (/^-?[\d.]+%?$/.test(value) || value === 'px' || value === '') return true;
	if (prefix === 'text' && textSizes.has(value)) return true;
	return NON_COLOR[prefix]?.test(value) ?? false;
}

function colorPrefix(utility: string) {
	return [...COLOR_PREFIXES].sort((a, b) => b.length - a.length).find((p) => utility.startsWith(`${p}-`));
}

export const noRawColor: Rule = {
	id: 'no-raw-color',
	description: 'Colors come from tokens. No hex, rgb(), hsl(), named colors or Tailwind palette classes.',
	run({ file, vocab }) {
		const out: RawFinding[] = [];
		const hint = `Use a token: bg-surface, bg-brand, text-fg, text-fg-muted, border-line. See \`${loadConfig().cli} tokens --search color\`.`;
		for (const token of file.classTokens) {
			const parsed = parseClass(token.value);
			const prefix = colorPrefix(parsed.utility);
			if (!prefix) continue;
			const rest = parsed.utility.slice(prefix.length + 1);
			if (parsed.arbitrary !== undefined) {
				const arb = parsed.arbitrary;
				if (/^(length|size|percentage|number):/.test(arb) || /^-?[\d.]+(px|rem|em|%)?$/.test(arb) || /^var\(--ds-(space|radius)/.test(arb)) continue;
				if (/^var\(--ds-color-/.test(arb) || /^--ds-color-/.test(arb)) continue;
				const hex = arb.match(/^#[0-9a-fA-F]{3,8}$/) ? expandHex(arb) : undefined;
				const cls = hex ? vocab.hexToClass.get(hex) : undefined;
				out.push({
					rule: 'no-raw-color',
					message: `Arbitrary color \`${token.value}\``,
					hint: cls ? `Use \`${parsed.variants}${prefix}-${cls}\`` : hint,
					offset: token.offset,
					length: token.value.length,
					fix: cls ? { start: token.offset, end: token.offset + token.value.length, text: `${parsed.variants}${parsed.important ? '!' : ''}${prefix}-${cls}` } : undefined,
				});
				continue;
			}
			const name = rest.split('/')[0];
			if (!vocab.colors.has(name) && !isNonColorValue(prefix, name, vocab.textSizes)) {
				const paletteLike = /^([a-z]+)-(\d{2,3})$/.exec(name);
				if (!(paletteLike && TAILWIND_PALETTE.has(paletteLike[1])) && !TAILWIND_PALETTE.has(name)) {
					out.push({ rule: 'no-raw-color', message: `Unknown color token \`${token.value}\``, hint: `Not a brand token, so it renders nothing. ${hint}`, offset: token.offset, length: token.value.length });
					continue;
				}
			}
			const paletteMatch = name.match(/^([a-z]+)-(\d{2,3})$/);
			const isPalette = (paletteMatch && TAILWIND_PALETTE.has(paletteMatch[1]) && !vocab.colors.has(name)) || (TAILWIND_PALETTE.has(name) && !vocab.colors.has(name));
			if (isPalette) out.push({ rule: 'no-raw-color', message: `Tailwind palette color \`${token.value}\` is not a brand token`, hint, offset: token.offset, length: token.value.length });
		}
		for (const s of file.strings) {
			if (s.context === 'className') continue;
			if (s.context === 'jsx-attr' && (SKIP_ATTRS.has(s.attr ?? '') || s.attr?.startsWith('data-') || s.attr?.startsWith('aria-'))) continue;
			if (s.context === 'jsx-text') continue;
			for (const m of s.value.matchAll(RAW_COLOR_RE)) {
				const before = s.value[(m.index ?? 0) - 1];
				if (m[0].startsWith('#') && (before === '/' || before === '&' || /[\w-]/.test(before ?? ''))) continue;
				const offset = s.offset + (m.index ?? 0);
				const hex = m[0].startsWith('#') ? expandHex(m[0]) : undefined;
				const cssVar = hex ? vocab.hexToVar.get(hex) : undefined;
				out.push({
					rule: 'no-raw-color',
					message: `Raw color \`${m[0]}\``,
					hint: cssVar ? `Use \`var(${cssVar})\`` : hint,
					offset,
					length: m[0].length,
					fix: cssVar && m[0].length !== 9 ? { start: offset, end: offset + m[0].length, text: `var(${cssVar})` } : undefined,
				});
			}
			if (s.context === 'style' && s.styleKey && COLOR_STYLE_KEY.test(s.styleKey) && CSS_NAMED_COLORS.has(s.value.trim().toLowerCase())) {
				out.push({ rule: 'no-raw-color', message: `Named color \`${s.value}\` in style`, hint, offset: s.offset, length: s.value.length });
			}
			if (s.context === 'jsx-attr' && (s.attr === 'fill' || s.attr === 'stroke' || s.attr === 'color') && CSS_NAMED_COLORS.has(s.value.trim().toLowerCase())) {
				out.push({ rule: 'no-raw-color', message: `Named color \`${s.value}\` in ${s.attr}`, hint: 'Use currentColor with a text-* token class, or var(--ds-color-...)', offset: s.offset, length: s.value.length });
			}
		}
		if (file.kind === 'css') {
			for (const m of file.text.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
				const [, prop, value] = m;
				if (prop.startsWith('--ds-')) continue;
				const valueOffset = (m.index ?? 0) + m[0].indexOf(value);
				for (const c of value.matchAll(RAW_COLOR_RE)) {
					const hex = c[0].startsWith('#') ? expandHex(c[0]) : undefined;
					const cssVar = hex ? vocab.hexToVar.get(hex) : undefined;
					const offset = valueOffset + (c.index ?? 0);
					out.push({ rule: 'no-raw-color', message: `Raw color \`${c[0]}\` in \`${prop}\``, hint: cssVar ? `Use \`var(${cssVar})\`` : hint, offset, length: c[0].length, fix: cssVar && c[0].length !== 9 ? { start: offset, end: offset + c[0].length, text: `var(${cssVar})` } : undefined });
				}
				if (COLOR_CSS_PROP.test(prop)) {
					for (const word of value.matchAll(/\b[a-z]+\b/g)) {
						if (CSS_NAMED_COLORS.has(word[0]) && !/var\(/.test(value)) out.push({ rule: 'no-raw-color', message: `Named color \`${word[0]}\` in \`${prop}\``, hint, offset: valueOffset + (word.index ?? 0), length: word[0].length });
					}
				}
			}
		}
		return out;
	},
};
