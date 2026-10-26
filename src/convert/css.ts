import { nearest, scales } from '../lib/brand.js';
import { COLOR_IN_VALUE, type RGBA, hsl, parseColor } from './color.js';
import { type Palette, familyOf, resolveColor, themed } from './palette.js';
import { cssColor, mapColor, onColor } from './roles.js';
import { walkCss } from './walk.js';

// Converts a stylesheet to the brand declaration by declaration, keeping every selector, rule and element. Colors map
// by role; type, radius, spacing and motion snap to the nearest brand token; shadows become the brand's.

export type Stats = { colors: number; fonts: number; type: number; radius: number; spacing: number; motion: number; shadows: number };
export const newStats = (): Stats => ({ colors: 0, fonts: 0, type: 0, radius: 0, spacing: 0, motion: 0, shadows: 0 });

const toPx = (n: string, unit: string) => Number(n) * (unit === 'rem' || unit === 'em' ? 16 : 1);

function mapLengths(value: string, list: [string, number][], { pill = false } = {}) {
	return value.replace(/(-?)(\d*\.?\d+)(px|rem)\b/g, (all, sign: string, n: string, unit: string) => {
		const px = toPx(n, unit);
		if (px === 0) return '0';
		if (pill && px >= 100) return 'var(--ds-radius-pill)';
		const name = nearest(list, px);
		return sign ? `calc(-1 * var(${name}))` : `var(${name})`;
	});
}

/** A drop shadow becomes the brand's: a lift is the card hairline, a large blur the floating shadow. Rings keep shape. */
function mapShadow(value: string) {
	if (/var\(--ds-shadow-|^\s*none\s*$/.test(value)) return undefined;
	const layers = value.split(/,(?![^(]*\))/).map((l) => l.trim());
	const numbers = (l: string) =>
		l.replace(/color-mix\((?:[^()]|\([^()]*\))*\)|var\((?:[^()]|\([^()]*\))*\)|(?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]+/gi, '').trim().split(/\s+/).filter((t) => /^-?\d*\.?\d+(px)?$/.test(t)).map(Number.parseFloat);
	const drops = layers.filter((l) => {
		const [x = 0, y = 0, blur = 0, spread = 0] = numbers(l);
		return !/\binset\b/.test(l) && !(x === 0 && y === 0 && blur === 0 && spread > 0);
	});
	if (!drops.length) return undefined;
	return Math.max(...drops.map((l) => numbers(l)[2] ?? 0)) > 24 ? 'var(--ds-shadow-floating)' : 'var(--ds-shadow-card)';
}

const SCALED = /^(font-size|border(-[a-z]+)*-radius|padding(-[a-z]+)*|margin(-[a-z]+)*|gap|row-gap|column-gap|transition(-duration|-delay)?|animation(-duration|-delay)?)$/;
const SCRIM = /(backdrop|overlay|scrim|modal|lightbox|dimmer|mask)/i;
const SERIES_NAME = /(series|chart|graph|plot|dataset|legend|swatch)/i;

/**
 * Site variables in a size, replaced by their own values (through chains and fallbacks); colors stay as vars. A
 * variable whose value varies (redefined at a breakpoint or in a theme) or is fluid (vw, clamp, calc of other
 * variables) stays a reference: inlining its first value would freeze a responsive layout.
 */
function resolveSiteVars(value: string, vars: Map<string, string>, varying?: Set<string>, depth = 0): string {
	if (depth > 5) return value;
	return value.replace(/var\((--(?!ds-)[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (all, name: string, fallback?: string) => {
		if (varying?.has(name)) return all;
		const raw = vars.get(name) ?? fallback?.trim();
		if (!raw || /var\(--ds-|#|rgb|hsl|oklch/.test(raw) || /\b(clamp|min|max)\(|v[whib]|dv[hw]|sv[hw]|lv[hw]|%/.test(raw)) return all;
		return resolveSiteVars(raw, vars, varying, depth + 1);
	});
}

/** Rebrands a stylesheet or a style attribute. Rules for the project's other theme are read against that theme. */
// A container is a width of 900px or more; narrower widths are measures (a text column, a form) and stay.
const CONTAINER_VAR = /(max-?w|container|content-?w|wrap|site-?w|page-?w|layout-?w|column-?w|max-?width)/;
const isWide = (value: string) => {
	const m = value.trim().match(/^(\d*\.?\d+)(px|rem)$/);
	return !!m && toPx(m[1], m[2]) >= 900;
};

export function convertCss(css: string, palette: Palette, stats: Stats) {
	palette.series ??= new Map();
	// A descendant's text sits on its ancestor's panel even when the declarations live in separate rules. Only
	// infer simple, unambiguous selectors; differing responsive backgrounds and complex selectors need no guess.
	const backgrounds = new Map<string, Map<string, RGBA | undefined>>();
	walkCss(css, (decls, ctx) => {
		const own = declaredBackground(decls, palette);
		if (!own) return decls;
		const mode = ctx.mode ?? palette.mode;
		const rules = backgrounds.get(mode) ?? new Map<string, RGBA | undefined>();
		for (const selector of ctx.selector.split(',').map((s) => s.trim().replace(/\s+/g, ' '))) {
			if (!/^[\w.#-]+(?:\s+(?:>\s*)?[\w.#-]+)*$/.test(selector) || /^(html|body)$/.test(selector)) continue;
			const color = rules.has(selector) && JSON.stringify(rules.get(selector)) !== JSON.stringify(own.color) ? undefined : own.color;
			rules.set(selector, color);
		}
		backgrounds.set(mode, rules);
		return decls;
	});
	return walkCss(css, (decls, ctx) => {
		if (ctx.fontFace) return decls;
		const rules = backgrounds.get(ctx.mode ?? palette.mode);
		const inherited = ctx.selector.split(',').map((s) => {
			const selector = s.trim().replace(/\s+/g, ' ');
			const matches = [...(rules ?? [])].filter(([parent]) => selector === parent || (selector.startsWith(`${parent} `) && !/^[+~]/.test(selector.slice(parent.length).trim()))).sort(([a], [b]) => b.length - a.length);
			return matches[0]?.[1];
		});
		const background = inherited.every((color) => JSON.stringify(color) === JSON.stringify(inherited[0])) ? inherited[0] : undefined;
		return convertDecls(decls, themed(palette, ctx.mode), stats, ctx.selector, background);
	});
}

function declaredBackground(css: string, palette: Palette): { color?: RGBA } | undefined {
	const value = [...css.matchAll(/(?:^|[;{\s])background(?:-color)?\s*:\s*([^;}]+)/g)].at(-1)?.[1]?.replace(/\s*!important\b/gi, '').trim();
	return value === undefined ? undefined : { color: resolveColor(value, palette.vars ?? new Map()) };
}

function convertDecls(css: string, palette: Palette, stats: Stats, selector: string, inheritedBackground?: RGBA) {
	const own = declaredBackground(css, palette);
	const background = own ? own.color : inheritedBackground;
	const decl = palette.lines ? /(^|[{;\s])(--[\w-]+|[a-z-]+)(\s*:\s*)([^;{}\n]+?)(\s*)(?=;|\}|$)/gm : /(^|[{;\s])(--[\w-]+|[a-z-]+)(\s*:\s*)([^;{}]+?)(\s*)(?=;|\}|$)/g;
	return css.replace(decl, (all, lead: string, prop: string, sep: string, value: string, trail: string) => {
		if (prop.startsWith('--ds-') || /^(src|content|grid-template|grid-area|font-feature|unicode-range|size-adjust|ascent|descent|line-gap)/.test(prop) || (/url\(/.test(value) && !/gradient/.test(value))) return all;
		const p = prop.toLowerCase();
		const isVar = p.startsWith('--');
		const pal = isVar && palette.modes?.get(p) ? themed(palette, palette.modes.get(p)) : palette;
		let next = !isVar && SCALED.test(p) && palette.vars ? resolveSiteVars(value, palette.vars, palette.varying) : value;
		if (palette.vars && !palette.preserveColors)
			next = next.replace(/\b(rgba?)\(\s*var\((--[\w-]+)\)\s*(?:[/,]\s*([\d.]+%?)\s*)?\)/g, (m, fn: string, name: string, alpha?: string) => {
				const channels = palette.vars?.get(name)?.match(/^(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})$/);
				if (!channels) return m;
				const a = alpha ? (alpha.endsWith('%') ? Number(alpha.slice(0, -1)) / 100 : Number(alpha)) : 1;
				return `rgba(${channels[1]}, ${channels[2]}, ${channels[3]}, ${a})`;
			});
		if (!palette.preserveColors && (!/var\(--ds-/.test(next) || /,/.test(next))) {
			const series = SERIES_NAME.test(isVar ? p : selector) ? (isVar ? p : selector) : undefined;
			next = next.replace(COLOR_IN_VALUE, (c) => {
				const rgba = parseColor(c);
				if (!rgba) return c;
				stats.colors++;
				const family = (isVar && palette.usage?.get(p)) || familyOf(prop);
				if (family === 'surface' && rgba[3] >= 0.3 && rgba[3] < 0.995 && hsl(rgba).l < 0.2 && SCRIM.test(selector)) return 'var(--ds-color-bg-scrim)';
				const on = isVar ? undefined : onColor(rgba, family, background, pal);
				return on ? cssColor(on) : mapColor(rgba, family, pal, series, isVar ? p : `${selector} ${p}`);
			});
		}
		if (!palette.preserveColors && (p === 'box-shadow' || (isVar && /shadow/.test(p))) && /px/.test(next)) {
			const shadow = mapShadow(next);
			if (shadow) {
				stats.shadows++;
				next = shadow;
			}
		}
		const fontStack = /^font-family$/.test(p) || (isVar && /(font|family|typeface)/.test(p) && /["',]|serif|sans|mono/.test(next));
		if (fontStack && !/var\(--ds-font/.test(next)) {
			stats.fonts++;
			next = /mono|code|courier|consolas|menlo/i.test(next) ? 'var(--ds-font-mono)' : 'var(--ds-font-sans)';
		} else if (p === 'font-weight' && /^(\d{3}|bold|bolder|semibold|normal|lighter)$/.test(next.trim())) {
			stats.type++;
			// Headings are never bold in the brand: size carries them. Elsewhere a heavier weight becomes medium.
			const heading = /(^|[\s,>+~])h[1-6]\b|title|heading|headline|display|hero/i.test(selector);
			next = !heading && (/^(bold|bolder|semibold)$/.test(next) || Number(next) >= 500) ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)';
		} else if (p === 'text-transform' && /^uppercase(?:\s*!important)?$/i.test(next.trim())) {
			stats.type++;
			next = next.replace(/uppercase/i, 'none');
		} else if (p === 'letter-spacing' && !/^(0|normal|0em|0px|inherit)$/.test(next.trim())) {
			stats.type++;
			// Large headings keep the brand's tight tracking; everything else is set normally.
			next = /^-/.test(next.trim()) && /\bh[1-3]\b|title|heading|display|hero/i.test(selector) ? 'var(--ds-tracking-tight)' : 'normal';
		} else if (p === 'font-size' && /\d(px|rem)/.test(next)) {
			stats.type++;
			// A fluid size (clamp, min, max, vw) stays fluid with each end on the brand scale, so headlines still shrink.
			next = /clamp\(|min\(|max\(|v[wh]\b|calc\(/.test(next)
				? next.replace(/(\d*\.?\d+)(px|rem)\b/g, (m, n: string, unit: string) => `var(${nearest(scales().text, toPx(n, unit))})`)
				: `var(${nearest(scales().text, Math.max(...[...next.matchAll(/(\d*\.?\d+)(px|rem)/g)].map((m) => toPx(m[1], m[2]))))})`;
		} else if (/^border(-[a-z]+)*-radius$/.test(p) && /\d(px|rem)/.test(next)) {
			stats.radius++;
			next = mapLengths(next, scales().radius, { pill: true });
		} else if (/^border(-[a-z]+)*-radius$/.test(p) && /^\s*50%\s*$/.test(next)) {
			stats.radius++;
			next = 'var(--ds-radius-pill)';
		} else if (palette.column && (p === 'max-width' || (isVar && CONTAINER_VAR.test(p))) && isWide(next)) {
			stats.spacing++;
			next = 'var(--ds-frame-column)';
		} else if (/^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)*$/.test(p) && /\d(px|rem)/.test(next) && !/calc|clamp|min\(|max\(/.test(next)) {
			stats.spacing++;
			next = mapLengths(next, scales().space);
		} else if (!palette.preserveColors && /^(-webkit-)?filter$/.test(p) && palette.mode === 'dark' && palette.target !== 'dark' && /\binvert\((1|100%)?\)/.test(next)) {
			// Logos whitened for the dark page are drawn dark on the light one.
			stats.colors++;
			next = next.replace(/\binvert\((1|100%)?\)/g, 'invert(0)');
		} else if (/^(transition|animation)(-duration|-timing-function|-delay)?$/.test(p)) {
			const before = next;
			next = next
				// A looping or long animation (a marquee, a spinner) keeps its own timing; interface motion moves to the brand's.
				.replace(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g, (m, n: string, unit: string) => {
					const ms = Number(n) * (unit === 's' ? 1000 : 1);
					return p.startsWith('animation') && (ms > 1000 || /\binfinite\b/.test(value)) ? m : `var(${nearest(scales().duration, ms)})`;
				})
				.replace(/\bcubic-bezier\([^)]*\)|\bease-in-out\b|\bease-in\b|\bease-out\b|(?<![\w-])ease(?![\w-])/g, (e) => (e === 'ease-in-out' ? 'var(--ds-easing-in-out)' : 'var(--ds-easing-out)'))
				.replace(/(?<![\w-])all(?![\w-])/g, 'color, background-color, border-color, box-shadow, opacity, transform');
			if (next !== before) stats.motion++;
		}
		return next === value ? all : `${lead}${prop}${sep}${next}${trail}`;
	});
}
